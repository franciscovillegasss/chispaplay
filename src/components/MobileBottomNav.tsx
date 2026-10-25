import React from 'react';
import { Home, Calendar, Ticket, Shield } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  reservedCount?: number;
  hasNewWorkshops?: boolean;
  onOpenSecurity?: () => void;
  onOpenPase?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab = 'inicio',
  onTabChange,
  reservedCount = 0,
  hasNewWorkshops = true,
  onOpenSecurity,
  onOpenPase,
}) => {
  return (
    <nav 
      aria-label="Navegación inferior móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
    >
      <div className="grid grid-cols-4 h-14 max-w-md mx-auto items-center px-1">
        
        {/* 1. Inicio */}
        <button
          type="button"
          onClick={() => onTabChange?.('inicio')}
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer group ${
            activeTab === 'inicio' ? 'text-neutral-950 font-bold' : 'text-neutral-400 hover:text-neutral-700 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform group-active:scale-90 ${activeTab === 'inicio' ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Inicio</span>
        </button>

        {/* 2. Cartelera (Con Punto Rojo de Nuevos Talleres) */}
        <button
          type="button"
          onClick={() => onTabChange?.('cartelera')}
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer group relative ${
            activeTab === 'cartelera' ? 'text-neutral-950 font-bold' : 'text-neutral-400 hover:text-neutral-700 font-medium'
          }`}
        >
          <div className="relative inline-flex items-center justify-center leading-none">
            <Calendar className={`w-5 h-5 transition-transform group-active:scale-90 ${activeTab === 'cartelera' ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
            {hasNewWorkshops && (
              <span 
                className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E11D48] rounded-full ring-2 ring-white animate-pulse"
                title="Nuevos talleres disponibles"
              />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Cartelera</span>
        </button>

        {/* 3. Mi Pase */}
        <button
          type="button"
          onClick={() => {
            onTabChange?.('pase');
            onOpenPase?.();
          }}
          className={`flex flex-col items-center justify-center h-full transition-colors relative cursor-pointer group ${
            activeTab === 'pase' ? 'text-neutral-950 font-bold' : 'text-neutral-400 hover:text-neutral-700 font-medium'
          }`}
        >
          <div className="relative inline-flex items-center justify-center leading-none">
            <Ticket className={`w-5 h-5 transition-transform group-active:scale-90 ${activeTab === 'pase' ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
            {reservedCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#E11D48] text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {reservedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Mi Pase</span>
        </button>

        {/* 4. Seguridad */}
        <button
          type="button"
          onClick={() => onOpenSecurity?.()}
          className="flex flex-col items-center justify-center h-full transition-colors cursor-pointer group text-neutral-400 hover:text-neutral-700 font-medium"
        >
          <Shield className="w-5 h-5 transition-transform group-active:scale-90 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight mt-0.5">Seguridad</span>
        </button>

      </div>
    </nav>
  );
};
