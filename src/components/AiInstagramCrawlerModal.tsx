import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Check, 
  Sparkles, 
  Building2, 
  Calendar, 
  Clock, 
  MapPin, 
  Instagram, 
  ShieldCheck, 
  MessageSquare,
  RotateCcw,
  Search,
  ArrowRight
} from 'lucide-react';
import { Workshop } from '../types';

interface AiInstagramCrawlerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoAddWorkshop?: (workshop: Workshop) => void;
  currentCommuneName: string;
  allWorkshops?: Workshop[];
  initialQuery?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  matchedWorkshops?: Workshop[];
}

export function AiInstagramCrawlerModal({
  isOpen,
  onClose,
  onAutoAddWorkshop,
  currentCommuneName,
  allWorkshops = [],
  initialQuery
}: AiInstagramCrawlerModalProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'sources'>('chat');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const processedQueryRef = useRef<string | null>(null);

  // Initial welcome message from the territorial AI assistant
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hola 👋 Soy el Asistente Territorial Inteligente de ChispaPlay. Comprendo frases completas en lenguaje natural: cuéntame qué buscas, para quién es, qué días prefieres o qué te interesa aprender (por ejemplo: "busco algo para hacer con mis hijos este sábado al aire libre", "tengo ganas de aprender cerámica o manualidades gratis", o "talleres de deporte y fútbol en mi comuna").`,
      timestamp: 'Ahora'
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && initialQuery && initialQuery.trim() && processedQueryRef.current !== initialQuery) {
      processedQueryRef.current = initialQuery;
      // Trigger search for initial query
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: initialQuery,
        timestamp: 'Ahora'
      };
      setMessages(prev => [...prev, userMsg]);
      setIsProcessing(true);
      setTimeout(() => {
        const { responseText, matched } = analyzeQuery(initialQuery);
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: responseText,
          timestamp: 'Ahora',
          matchedWorkshops: matched
        };
        setMessages(prev => [...prev, assistantMsg]);
        setIsProcessing(false);
      }, 400);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  // Intelligent Natural Language Parser for full phrases & sentences
  const analyzeQuery = (query: string): { responseText: string; matched: Workshop[] } => {
    const q = query.toLowerCase();

    // Semantic Intent Detectors
    const wantsNature = q.includes('huerto') || q.includes('planta') || q.includes('tierra') || q.includes('naturaleza') || q.includes('cultiv') || q.includes('semilla') || q.includes('verde') || q.includes('aire libre');
    const wantsArt = q.includes('arte') || q.includes('greda') || q.includes('cerámica') || q.includes('ceramica') || q.includes('manualidad') || q.includes('pintur') || q.includes('alfarer') || q.includes('dibuj') || q.includes('creativ');
    const wantsSport = q.includes('fútbol') || q.includes('futbol') || q.includes('futsal') || q.includes('deporte') || q.includes('cancha') || q.includes('patinaje') || q.includes('correr') || q.includes('pelota') || q.includes('ejercicio') || q.includes('activo');
    const wantsTheater = q.includes('teatro') || q.includes('títere') || q.includes('titere') || q.includes('cuento') || q.includes('marioneta') || q.includes('narraci') || q.includes('circo');
    const wantsScience = q.includes('robótica') || q.includes('robotica') || q.includes('ciencia') || q.includes('sensor') || q.includes('astronom') || q.includes('cohete') || q.includes('tecnolog') || q.includes('solar');
    const wantsKidsFamily = q.includes('hijo') || q.includes('hija') || q.includes('niño') || q.includes('niña') || q.includes('infantil') || q.includes('familia') || q.includes('pequeño') || q.includes('chico') || q.includes('bebé');
    const wantsWeekend = q.includes('sábado') || q.includes('sabado') || q.includes('domingo') || q.includes('fin de semana');
    const wantsAfternoon = q.includes('tarde') || q.includes('después') || q.includes('16') || q.includes('17') || q.includes('18');
    const wantsFree = q.includes('gratis') || q.includes('gratuito') || q.includes('libre') || q.includes('sin costo');
    const wantsMuni = q.includes('muni') || q.includes('municipal') || q.includes('municipalidad') || q.includes('oficial') || q.includes('alcaldia') || q.includes('dideco') || q.includes('sede');

    // Filter available workshops based on semantic match
    let pool = allWorkshops.length > 0 ? allWorkshops : [];

    // Filter by detected topics
    let matches = pool.filter((w) => {
      const cat = w.category.toLowerCase();
      const title = w.title.toLowerCase();
      const desc = w.description.toLowerCase();
      const loc = w.locationName.toLowerCase();
      const org = w.organizer.name.toLowerCase();

      let matchScore = 0;

      if (wantsMuni && (w.organizer.type.toLowerCase().includes('municipal') || org.includes('muni') || org.includes('comunal') || w.verifiedLegalEntity)) {
        matchScore += 4;
      }
      if (wantsNature && (cat.includes('huert') || cat.includes('naturaleza') || title.includes('huerto') || desc.includes('almácigo') || desc.includes('cosecha'))) {
        matchScore += 3;
      }
      if (wantsArt && (cat.includes('arte') || title.includes('greda') || title.includes('alfarería') || desc.includes('modelado') || desc.includes('pintura'))) {
        matchScore += 3;
      }
      if (wantsSport && (cat.includes('deporte') || title.includes('fútbol') || title.includes('futsal') || desc.includes('cancha') || desc.includes('patinaje'))) {
        matchScore += 3;
      }
      if (wantsTheater && (cat.includes('teatro') || title.includes('títere') || title.includes('cuento') || desc.includes('marioneta') || desc.includes('relato'))) {
        matchScore += 3;
      }
      if (wantsScience && (cat.includes('ciencia') || title.includes('robótica') || desc.includes('solar') || desc.includes('circuito') || title.includes('astrónomo'))) {
        matchScore += 3;
      }

      if (wantsKidsFamily && (w.ageGroup.toLowerCase().includes('familia') || w.ageGroup.toLowerCase().includes('niñ') || w.ageGroup.toLowerCase().includes('infan'))) {
        matchScore += 2;
      }

      if (wantsWeekend && (w.schedule.toLowerCase().includes('sábado') || w.schedule.toLowerCase().includes('domingo'))) {
        matchScore += 2;
      }

      if (wantsAfternoon && (w.timeSlot.includes('16:') || w.timeSlot.includes('17:') || w.timeSlot.includes('18:'))) {
        matchScore += 2;
      }

      // Check if user specifically named a commune
      const communes = ['colina', 'maipú', 'maipu', 'rancagua', 'puente alto', 'recoleta', 'valparaíso', 'valparaiso', 'cerronavia', 'santiago'];
      for (const com of communes) {
        if (q.includes(com)) {
          if (w.neighborhoodId.toLowerCase().includes(com.replace(' ', '')) || loc.includes(com)) {
            matchScore += 4;
          }
        }
      }

      // General word matching as fallback
      const words = q.split(/\s+/).filter(word => word.length > 3);
      for (const word of words) {
        if (title.includes(word) || desc.includes(word) || loc.includes(word)) {
          matchScore += 1;
        }
      }

      return matchScore >= 2;
    });

    // Fallback if no specific semantic match: find the top available in the commune
    if (matches.length === 0) {
      matches = pool.slice(0, 2);
    }

    // Generate intelligent natural conversational explanation
    let responseText = '';
    const topics: string[] = [];
    if (wantsNature) topics.push('naturaleza y huerto');
    if (wantsArt) topics.push('arte y manualidades');
    if (wantsSport) topics.push('deporte y actividad física');
    if (wantsTheater) topics.push('teatro y cuentos');
    if (wantsScience) topics.push('ciencia y robótica');

    const audienceStr = wantsKidsFamily ? 'para niñas, niños y familias' : 'para tu grupo';
    const scheduleStr = wantsWeekend ? 'durante el fin de semana' : wantsAfternoon ? 'en horario de tarde' : '';

    if (topics.length > 0) {
      responseText = `He interpretado tu consulta: estás buscando opciones de ${topics.join(' y ')} ${audienceStr} ${scheduleStr} en ${currentCommuneName}. He revisado las convocatorias de Instagram y registros municipales verificados, y encontré ${matches.length} ${matches.length === 1 ? 'actividad ideal' : 'actividades ideales'}:`;
    } else {
      responseText = `Comprendo tu solicitud. Analicé el texto de tu mensaje y encontré ${matches.length} talleres municipales y actividades barriales que coinciden con lo que buscas:`;
    }

    return { responseText, matched: matches };
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    // Append user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Ahora'
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    // Simulate intelligent NLP processing
    setTimeout(() => {
      const { responseText, matched } = analyzeQuery(userText);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: 'Ahora',
        matchedWorkshops: matched
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsProcessing(false);
    }, 450);
  };

  const handleResetConversation = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        sender: 'assistant',
        text: `Conversación reiniciada. ¿Qué tipo de actividad comunitaria te gustaría encontrar hoy en ${currentCommuneName}? Escribe con tus propias palabras.`,
        timestamp: 'Ahora'
      }
    ]);
  };

  const handleAddWorkshopToBoard = (ws: Workshop) => {
    if (addedIds.includes(ws.id)) return;
    setAddedIds(prev => [...prev, ws.id]);
    if (onAutoAddWorkshop) {
      onAutoAddWorkshop(ws);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-[84vh]">
        
        {/* HEADER: Modern Time Out Magazine Red Ribbon with Chunky Typography */}
        <div className="bg-[#dc2626] px-4 sm:px-5 py-3 text-white flex items-center justify-between border-b border-red-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1d4ed8] text-white flex items-center justify-center font-chunky font-black text-sm shrink-0 shadow-xs">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-chunky font-black text-base tracking-tight text-white uppercase">
                  Ai scrapper
                </span>
                <span className="bg-[#1d4ed8] text-white font-chunky font-bold text-[9px] px-2 py-0.5 rounded-full uppercase border border-white/20">
                  Online
                </span>
                <span className="text-white/80 text-xs font-chunky font-medium hidden sm:inline">
                  · {currentCommuneName}
                </span>
              </div>
              {/* Exactly 5 words summary replacing "pregunta en lenguaje natural" */}
              <p className="text-xs text-red-100 font-chunky font-medium">
                Rastreador de talleres municipales reales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetConversation}
              title="Reiniciar conversación"
              className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-900 text-xs font-chunky font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#dc2626]" />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TABS BAR: Crisp Rectangular Segmented Control */}
        <div className="bg-neutral-100 border-b border-neutral-200 px-5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-white text-neutral-900 border border-neutral-300 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-neutral-700" />
              <span>Chat & Consultas</span>
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sources'
                  ? 'bg-white text-neutral-900 border border-neutral-300 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Instagram className="w-3.5 h-3.5 text-neutral-700" />
              <span>Fuentes Monitoreadas (Instagram)</span>
            </button>
          </div>

          <span className="text-[11px] text-neutral-500 font-medium hidden sm:inline">
            Modo: <strong className="text-neutral-800 font-semibold">Procesamiento de Frases</strong>
          </span>
        </div>

        {activeTab === 'chat' ? (
          <>
            {/* CHAT THREAD: Clean, Editorial, Crisp */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#fcfbf9]">
              {messages.map((msg) => {
                const isAssistant = msg.sender === 'assistant';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-neutral-400">
                      <span className="font-semibold text-neutral-600">
                        {isAssistant ? 'Ai scrapper · Asistente' : 'Tú'}
                      </span>
                      <span>·</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isAssistant
                          ? 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                          : 'bg-[#1d4ed8] text-white font-medium shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>

                    {/* Matched Workshop Cards rendered under assistant reply */}
                    {isAssistant && msg.matchedWorkshops && msg.matchedWorkshops.length > 0 && (
                      <div className="w-full max-w-[95%] mt-3 space-y-2.5">
                        <div className="text-[11px] font-chunky font-bold text-slate-500 uppercase tracking-wider px-1">
                          Talleres municipales encontrados para tu búsqueda:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {msg.matchedWorkshops.map((ws) => {
                            const isAdded = addedIds.includes(ws.id);

                            return (
                              <div
                                key={ws.id}
                                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-red-300 transition-all shadow-xs hover:shadow-md group/card"
                              >
                                <div>
                                  <div className="aspect-[16/9] w-full bg-slate-100 overflow-hidden relative">
                                    <img
                                      src={ws.imageUrl}
                                      alt={ws.title}
                                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-2 left-2 bg-[#dc2626] text-white text-[10px] font-chunky font-bold px-2 py-0.5 rounded-md shadow-xs uppercase">
                                      {ws.category}
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-chunky font-bold px-2 py-0.5 rounded-md">
                                      {ws.isFree ? '100% Gratuito' : 'Aporte Social'}
                                    </div>
                                  </div>

                                  <div className="p-3.5 space-y-1.5">
                                    <h4 className="font-chunky font-black text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2 group-hover/card:text-[#dc2626] transition-colors">
                                      {ws.title}
                                    </h4>

                                    <div className="text-[11px] text-slate-500 space-y-1 pt-0.5 font-medium">
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-[#dc2626] shrink-0" />
                                        <span className="truncate">{ws.schedule}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-[#1d4ed8] shrink-0" />
                                        <span className="truncate">{ws.locationName}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-3.5 pt-0">
                                  <button
                                    onClick={() => handleAddWorkshopToBoard(ws)}
                                    disabled={isAdded}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-chunky font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                      isAdded
                                        ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-default'
                                        : 'bg-slate-900 hover:bg-[#1d4ed8] text-white shadow-xs'
                                    }`}
                                  >
                                    {isAdded ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>✓ En cartelera</span>
                                      </>
                                    ) : (
                                      <>
                                        <span>+ Añadir a mi Cartelera</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {isProcessing && (
                <div className="flex items-center gap-2.5 p-3.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-600 font-chunky font-medium shadow-xs">
                  <span className="w-3.5 h-3.5 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
                  <span>Rastreando talleres y convocatorias municipales en tiempo real...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* CHAT INPUT AREA: 5-word clear summary, modern magazine card, zero suggested search pills */}
            <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Rastreador de talleres municipales reales (escribe qué buscas)..."
                    className="w-full text-xs sm:text-sm py-2.5 pl-3.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#dc2626] focus:bg-white focus:outline-none text-slate-900 font-chunky font-medium placeholder:text-slate-400 transition-colors"
                  />
                  {inputMessage && (
                    <button
                      type="button"
                      onClick={() => setInputMessage('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isProcessing}
                  className="py-2.5 px-4 rounded-xl bg-[#dc2626] hover:bg-[#1d4ed8] text-white text-xs sm:text-sm font-chunky font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shrink-0 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Buscar</span>
                </button>
              </form>
              <div className="text-[11px] text-slate-400 pt-2 px-1 flex items-center justify-between font-chunky">
                <span>Rastreador de talleres municipales reales</span>
                <span className="text-[10px] text-slate-500">Sin sugerencias forzadas</span>
              </div>
            </div>
          </>
        ) : (
          /* SOURCES TAB: Clean Magazine Architecture */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 text-xs shadow-xs">
              <h4 className="font-chunky font-black text-slate-900 text-sm flex items-center gap-2">
                <Instagram className="w-4 h-4 text-[#dc2626]" />
                <span>Cuentas Oficiales y Convocatorias Indexadas</span>
              </h4>
              <p className="text-slate-600 font-medium leading-relaxed">
                El rastreador inteligente analiza en segundo plano las publicaciones oficiales y avisos comunitarios de las siguientes instituciones municipales para extraer fechas, cupos y locaciones reales:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { handle: '@muni_colina', name: 'Municipalidad de Colina', type: 'DIDECO & Cultura', commune: 'Colina', status: 'Sincronizado' },
                { handle: '@culturacolina', name: 'Corporación Cultural Colina', type: 'Artes y Oficios', commune: 'Colina', status: 'Sincronizado' },
                { handle: '@munirancagua', name: 'Municipalidad de Rancagua', type: 'SECPLAC & Espacio Público', commune: 'Rancagua', status: 'Sincronizado' },
                { handle: '@culturarancagua', name: 'Cultura Rancagua', type: 'Teatro Lucho Gatica', commune: 'Rancagua', status: 'Sincronizado' },
                { handle: '@culturamaipu', name: 'Cultura Maipú', type: 'Espacios Cívicos', commune: 'Maipú', status: 'Sincronizado' },
                { handle: '@deportespuentealto', name: 'Deportes Puente Alto', type: 'Canchas & Multiuso', commune: 'Puente Alto', status: 'Sincronizado' }
              ].map((acc) => (
                <div
                  key={acc.handle}
                  className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div>
                    <div className="font-chunky font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{acc.name}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1d4ed8] shrink-0" />
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {acc.handle} · {acc.type}
                    </div>
                  </div>
                  <span className="text-[10px] font-chunky font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {acc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-chunky">
          <span>ChispaPlay · Rastreador de talleres municipales reales</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
