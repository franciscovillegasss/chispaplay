import { createServer } from 'node:http';

const { getLlama, LlamaChatSession, QwenChatWrapper } = await import(
  process.env.CHISPA_AI_MODULE || 'node-llama-cpp'
);
const modelPath = process.env.CHISPA_AI_MODEL_PATH;
if (!modelPath) throw new Error('Configura CHISPA_AI_MODEL_PATH con el archivo GGUF del modelo.');
const llama = await getLlama({ gpu: false, build: 'never' });
const model = await llama.loadModel({ modelPath });
const context = await model.createContext({ contextSize: 4096, sequences: 1, threads: 6 });
let busy = false;

function reply(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    reply(response, 200, { status: 'ready' });
    return;
  }
  if (request.method !== 'POST' || request.url !== '/v1/chat/completions' ||
      request.headers['content-type'] !== 'application/json') {
    reply(response, 404, { error: 'Ruta no disponible.' });
    return;
  }
  if (busy) {
    reply(response, 429, { error: 'Modelo ocupado.' });
    return;
  }
  busy = true;
  let session;
  let timer;
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 16000) throw new Error('Solicitud demasiado grande.');
      chunks.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!Array.isArray(body.messages) || body.messages.length !== 2 ||
        !body.messages.every(message => typeof message.content === 'string')) {
      throw new Error('Formato inválido.');
    }
    const grammar = await llama.createGrammarForJsonSchema(body.response_format.json_schema.schema);
    session = new LlamaChatSession({
      contextSequence: context.getSequence(),
      chatWrapper: new QwenChatWrapper({ thoughts: 'discourage' }),
      systemPrompt: body.messages[0].content
    });
    const controller = new AbortController();
    timer = setTimeout(() => controller.abort(), 80000);
    const output = await session.prompt(body.messages[1].content, {
      grammar,
      temperature: 0.2,
      maxTokens: 450,
      signal: controller.signal
    });
    grammar.parse(output);
    reply(response, 200, { choices: [{ message: { role: 'assistant', content: output } }] });
  } catch (error) {
    console.error('No se pudo generar la ficha:', error.message);
    reply(response, 503, { error: 'No se pudo generar la ficha.' });
  } finally {
    clearTimeout(timer);
    session?.dispose({ disposeSequence: true });
    busy = false;
  }
});
server.requestTimeout = 100000;
const port = Number(process.env.CHISPA_AI_PORT || 18747);
server.listen(port, '127.0.0.1', () => console.log('IA local lista en 127.0.0.1:' + port));
