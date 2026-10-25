import { useState } from 'react';
import { Workshop, ChatMessage } from '../types';
import { X, Send, MessageCircle, ExternalLink, ShieldCheck } from 'lucide-react';

interface DirectEventChatModalProps {
  workshop: Workshop | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DirectEventChatModal({
  workshop,
  isOpen,
  onClose
}: DirectEventChatModalProps) {
  if (!isOpen || !workshop) return null;

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      workshopId: workshop.id,
      senderName: workshop.instructorName,
      senderAvatar: workshop.organizer.avatar,
      isInstructor: true,
      text: `¡Hola! Soy ${workshop.instructorName}, monitor de este taller. Si tienes dudas sobre los materiales o la llegada a la sede, puedes escribirme directamente aquí o a mi WhatsApp.`,
      timestamp: 'Hoy, 10:15'
    },
    {
      id: 'm-2',
      workshopId: workshop.id,
      senderName: 'Camila Pizarro',
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      text: 'Hola tía, ¿los niños tienen que llevar delantal propio o tienen allá?',
      timestamp: 'Hoy, 11:30'
    },
    {
      id: 'm-3',
      workshopId: workshop.id,
      senderName: workshop.instructorName,
      senderAvatar: workshop.organizer.avatar,
      isInstructor: true,
      text: '¡Hola Camila! En la sede tenemos pecheras limpias para todos los niños, solo traigan ropa cómoda.',
      timestamp: 'Hoy, 11:34'
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      workshopId: workshop.id,
      senderName: 'Tú',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isMe: true,
      text: inputMessage.trim(),
      timestamp: 'Ahora'
    };

    setMessages([...messages, newMsg]);
    setInputMessage('');
  };

  const handleOpenDirectWhatsApp = () => {
    const text = `Hola ${workshop.instructorName}! 👋 Te escribo directamente desde ChispaPlay por el taller "${workshop.title}".`;
    const url = `https://wa.me/${workshop.directChat.whatsappDirectNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fffdfa] rounded-3xl max-w-lg w-full border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={workshop.organizer.avatar} 
              alt={workshop.instructorName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-fun font-bold text-base text-white leading-tight">
                  {workshop.instructorName}
                </h3>
                <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                  Monitor
                </span>
              </div>
              <p className="text-[11px] text-amber-100 font-medium truncate max-w-[200px]">
                {workshop.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp direct button */}
            <button
              onClick={handleOpenDirectWhatsApp}
              title="Abrir chat directo en WhatsApp"
              className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fdfbf7]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!msg.isMe && (
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-7 h-7 rounded-full object-cover mt-0.5"
                />
              )}
              <div className={`max-w-[75%] rounded-2xl p-3 text-xs ${
                msg.isMe
                  ? 'bg-orange-600 text-white rounded-br-xs'
                  : 'bg-white border border-amber-200 text-stone-900 shadow-2xs rounded-bl-xs'
              }`}>
                {!msg.isMe && (
                  <div className="font-bold text-[10px] text-stone-500 mb-0.5">
                    {msg.senderName} {msg.isInstructor && '· Monitor'}
                  </div>
                )}
                <p className="leading-relaxed font-medium">{msg.text}</p>
                <div className={`text-[9px] mt-1 text-right ${msg.isMe ? 'text-orange-200' : 'text-stone-400'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-amber-200 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe un mensaje directo al monitor..."
            className="flex-1 text-xs py-2.5 px-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:border-orange-500 focus:outline-none font-medium"
          />
          <button
            type="submit"
            className="p-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
