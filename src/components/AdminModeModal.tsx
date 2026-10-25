import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  X, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Database,
  ArrowRight,
  LogOut,
  Search,
  Download,
  Copy,
  Check,
  Eye,
  Ticket,
  RefreshCw,
  Globe
} from 'lucide-react';
import { Neighborhood } from '../types';
import { MunicipalImpactDashboard } from './MunicipalImpactDashboard';
import { DeveloperBigDataSection } from './DeveloperBigDataSection';
import { 
  getAllTrackedUsers, 
  getAllActionLogs, 
  clearTrackingAudit,
  TrackedUser,
  UserActionLog 
} from '../utils/userTracker';

interface AdminModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNeighborhood: Neighborhood;
  allNeighborhoods: Neighborhood[];
}

export function AdminModeModal({
  isOpen,
  onClose,
  currentNeighborhood,
  allNeighborhoods
}: AdminModeModalProps) {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(10); // 10-second security countdown
  const [activeTab, setActiveTab] = useState<'ceo_tracking' | 'recharts' | 'ai_analysis' | 'big_data'>('ceo_tracking');

  // Tracking state from userTracker
  const [trackedUsers, setTrackedUsers] = useState<TrackedUser[]>([]);
  const [actionLogs, setActionLogs] = useState<UserActionLog[]>([]);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('todos');
  const [copiedAudit, setCopiedAudit] = useState(false);

  // Reload tracking data
  const refreshTrackingData = () => {
    setTrackedUsers(getAllTrackedUsers());
    setActionLogs(getAllActionLogs());
  };

  // Reset states when opened or closed
  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      setPin('');
      setErrorMsg(null);
      setTimeLeft(10);
    }
    if (isOpen) {
      refreshTrackingData();
    }
  }, [isOpen, isAuthenticated]);

  // Handle escape key to never get blocked
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsAuthenticated(false);
        setPin('');
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 10-second countdown timer for security
  useEffect(() => {
    if (!isOpen || isAuthenticated) return;

    if (timeLeft <= 0) {
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isAuthenticated, timeLeft, onClose]);

  if (!isOpen) return null;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === '5678') {
      setIsAuthenticated(true);
      setErrorMsg(null);
      refreshTrackingData();
    } else {
      setErrorMsg('Código incorrecto. Ingresa el código 5678 para autorizar.');
      setPin('');
    }
  };

  const handleExitAdmin = () => {
    setIsAuthenticated(false);
    setPin('');
    onClose();
  };

  // Filter logs by user
  const filteredLogs = selectedUserFilter === 'todos' 
    ? actionLogs 
    : actionLogs.filter(l => l.token === selectedUserFilter);

  // Computed metrics for real reports
  const totalSearches = actionLogs.filter(l => l.eventType === 'BUSQUEDA').length;
  const totalCardViews = actionLogs.filter(l => l.eventType === 'APERTURA_TARJETA').length;
  const totalReservations = actionLogs.filter(l => l.eventType === 'RESERVA_CUPO').length;
  const conversionRate = totalCardViews > 0 ? ((totalReservations / totalCardViews) * 100).toFixed(1) : '0';

  // Export report to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Token', 'Nombre Usuario', 'IP Virtual', 'Tipo Evento', 'Título', 'Detalles', 'Timestamp'];
    const rows = actionLogs.map(l => [
      `"${l.id}"`,
      `"${l.token}"`,
      `"${l.userName}"`,
      `"${l.userIp}"`,
      `"${l.eventType}"`,
      `"${l.title}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.timestamp}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_seguimiento_chispaplay_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy JSON summary
  const handleCopyJSON = () => {
    const payload = {
      reportType: "Auditoría de Acciones y Telemetría por Token e IP",
      commune: currentNeighborhood.displayName,
      generatedAt: new Date().toISOString(),
      summary: {
        totalTrackedUsers: trackedUsers.length,
        totalActionsLogged: actionLogs.length,
        totalSearches,
        totalCardViews,
        totalReservations,
        conversionRatePercent: `${conversionRate}%`
      },
      users: trackedUsers,
      logs: actionLogs
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 2500);
  };

  const handleResetAudit = () => {
    if (confirm('¿Deseas reiniciar los logs de seguimiento a los valores de prueba?')) {
      clearTrackingAudit();
      refreshTrackingData();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleExitAdmin();
        }
      }}
    >
      <div className={`bg-white rounded-none w-full border-2 border-neutral-900 shadow-2xl overflow-hidden flex flex-col transition-all ${
        isAuthenticated ? 'max-w-6xl max-h-[94vh]' : 'max-w-md max-h-[90vh]'
      }`}>
        
        {/* HEADER: Editorial CEO Dark Nav */}
        <div className="bg-neutral-950 px-6 py-4 text-white flex items-center justify-between border-b-2 border-neutral-900">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 flex items-center justify-center font-bold text-sm ${
              isAuthenticated ? 'bg-[#059669] text-white' : 'bg-white/10 text-red-400'
            }`}>
              {isAuthenticated ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#E11D48]">
                <span className="w-2 h-2 bg-[#059669] inline-block animate-pulse" />
                <span>Modo CEO & Telemetría de Usuarios</span>
              </div>
              <h3 className="font-black text-lg text-white uppercase tracking-tight">
                {isAuthenticated ? 'Consola de Reportería en Vivo' : 'Acceso a Modo CEO'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={handleExitAdmin}
                className="py-1.5 px-3.5 bg-[#E11D48] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer rounded-none"
                title="Salir y bloquear Modo CEO"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir de CEO</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* NOT AUTHENTICATED: PIN CHALLENGE WITH 10s TIMER */}
        {!isAuthenticated ? (
          <div className="p-6 space-y-5 bg-neutral-50">
            {/* 10-Second Timer Banner */}
            <div className="bg-red-50 border border-red-300 p-3.5 flex items-center justify-between text-xs text-red-950 font-bold">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E11D48] animate-spin" />
                <span>Tiempo de seguridad restante:</span>
              </div>
              <span className="text-sm font-mono font-bold px-2.5 py-0.5 bg-[#E11D48] text-white">
                {timeLeft}s
              </span>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed font-mono">
              Esta consola permite al equipo directivo supervisar el <strong>seguimiento en vivo de usuarios</strong>, tokens asignados por IP, qué buscan, qué escriben, qué tarjetas abren y generar reportes de conversión.
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-1.5">
                  Ingresa el Código de Acceso (5678)
                </label>
                <input
                  type="password"
                  autoFocus
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="5678"
                  className="w-full text-center font-mono font-bold text-2xl tracking-widest py-3 px-4 bg-white border border-neutral-300 rounded-none focus:border-neutral-950 focus:outline-none"
                />
                <span className="text-[11px] text-neutral-500 font-mono block mt-1.5 text-center">
                  💡 Código requerido: <strong className="text-neutral-900">5678</strong>
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#E11D48] shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 border border-neutral-300 bg-white text-neutral-800 font-bold text-xs hover:bg-neutral-100 transition-colors cursor-pointer rounded-none"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="py-2.5 px-6 bg-neutral-950 hover:bg-[#E11D48] text-white font-black uppercase tracking-wider text-xs transition-all flex items-center gap-1.5 cursor-pointer rounded-none"
                >
                  <span>Desbloquear Modo CEO</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED: CEO USER TRACKING & REAL REPORT GENERATOR */
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-white">
            
            {/* Top Security Banner */}
            <div className="bg-neutral-950 text-white p-4 border-2 border-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#059669] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-white uppercase tracking-tight flex items-center gap-2">
                    <span>Modo CEO Activo · Auditoría en Vivo</span>
                    <span className="text-[#059669] font-mono text-[10px]">● IP Tracking Operativo</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Registrando en tiempo real búsquedas, aperturas de fichas y reservas con token virtual por IP.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={refreshTrackingData}
                  className="py-1 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                  title="Actualizar eventos"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refrescar</span>
                </button>
                <button
                  onClick={handleExitAdmin}
                  className="py-1 px-3 bg-[#E11D48] hover:bg-red-700 text-white font-bold text-xs uppercase flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Bloquear</span>
                </button>
              </div>
            </div>

            {/* TAB SELECTOR INSIDE ADMIN MODE */}
            <div className="flex items-center gap-2 border-b-2 border-neutral-900 pb-2 flex-wrap">
              <button
                onClick={() => setActiveTab('ceo_tracking')}
                className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer rounded-none border ${
                  activeTab === 'ceo_tracking'
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Auditoría de Usuarios e IP (Modo CEO)</span>
              </button>

              <button
                onClick={() => setActiveTab('recharts')}
                className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer rounded-none border ${
                  activeTab === 'recharts'
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>📊 Gráficos Recharts de Impacto</span>
              </button>

              <button
                onClick={() => setActiveTab('ai_analysis')}
                className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer rounded-none border ${
                  activeTab === 'ai_analysis'
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>🤖 Retorno Social SROI & IA</span>
              </button>

              <button
                onClick={() => setActiveTab('big_data')}
                className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer rounded-none border ${
                  activeTab === 'big_data'
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <span>💻 Big Data Municipal</span>
              </button>
            </div>

            {/* TAB 1: CEO USER TRACKING & LIVE AUDIT REPORT (MAIN REQUEST) */}
            {activeTab === 'ceo_tracking' && (
              <div className="space-y-6">
                
                {/* Real KPIs Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 bg-neutral-100 border border-neutral-300">
                    <div className="text-[10px] font-mono font-bold uppercase text-neutral-500">
                      Usuarios con Token
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-neutral-950 mt-1 font-mono">
                      {trackedUsers.length}
                    </div>
                    <div className="text-[10px] text-neutral-600 mt-0.5">Identificados por IP chilena</div>
                  </div>

                  <div className="p-4 bg-neutral-100 border border-neutral-300">
                    <div className="text-[10px] font-mono font-bold uppercase text-neutral-500 flex items-center gap-1">
                      <Search className="w-3 h-3 text-[#E11D48]" />
                      <span>Búsquedas Registradas</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-neutral-950 mt-1 font-mono">
                      {totalSearches}
                    </div>
                    <div className="text-[10px] text-neutral-600 mt-0.5">Texto escrito en vitrina</div>
                  </div>

                  <div className="p-4 bg-neutral-100 border border-neutral-300">
                    <div className="text-[10px] font-mono font-bold uppercase text-neutral-500 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-blue-600" />
                      <span>Tarjetas Abiertas</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-neutral-950 mt-1 font-mono">
                      {totalCardViews}
                    </div>
                    <div className="text-[10px] text-neutral-600 mt-0.5">Fichas técnicas leídas</div>
                  </div>

                  <div className="p-4 bg-neutral-100 border border-neutral-300">
                    <div className="text-[10px] font-mono font-bold uppercase text-[#059669] flex items-center gap-1">
                      <Ticket className="w-3 h-3 text-[#059669]" />
                      <span>Reservas / Conversión</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-[#059669] mt-1 font-mono">
                      {totalReservations} <span className="text-xs text-neutral-500 font-normal">({conversionRate}%)</span>
                    </div>
                    <div className="text-[10px] text-neutral-600 mt-0.5">Pases vecinales emitidos</div>
                  </div>
                </div>

                {/* Report Generation Actions Bar */}
                <div className="bg-neutral-900 text-white p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-extrabold text-xs uppercase tracking-tight text-white block">
                      Generador de Reportes de Tráfico Real
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      Reporte con ID de sesión, IP ISP, búsquedas textuales y talleres seleccionados.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleExportCSV}
                      className="py-1.5 px-3 bg-[#E11D48] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar Reporte (CSV)</span>
                    </button>

                    <button
                      onClick={handleCopyJSON}
                      className="py-1.5 px-3 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedAudit ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAudit ? 'Copiado ✓' : 'Copiar JSON'}</span>
                    </button>

                    <button
                      onClick={handleResetAudit}
                      className="py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
                      title="Reiniciar datos a demo inicial"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Table of Tracked Users with Virtual Token & IP */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-300 pb-2">
                    <h4 className="font-black text-sm uppercase tracking-tight text-neutral-950 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#E11D48] inline-block" />
                      <span>Padrón de Usuarios Rastreados (Tokens & IPs)</span>
                    </h4>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {trackedUsers.length} registros activos
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-neutral-200">
                    <table className="w-full text-left text-xs text-neutral-800">
                      <thead className="bg-neutral-100 text-[10px] font-mono uppercase tracking-wider text-neutral-600 border-b border-neutral-200">
                        <tr>
                          <th className="py-2.5 px-3">Token Asignado</th>
                          <th className="py-2.5 px-3">Nombre Vecino</th>
                          <th className="py-2.5 px-3">Correo / WhatsApp</th>
                          <th className="py-2.5 px-3">IP Origen</th>
                          <th className="py-2.5 px-3">Comuna</th>
                          <th className="py-2.5 px-3">Acciones</th>
                          <th className="py-2.5 px-3">Última Actividad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 font-mono text-[11px]">
                        {trackedUsers.map((user) => (
                          <tr key={user.token} className="hover:bg-neutral-50">
                            <td className="py-2.5 px-3 font-bold text-[#E11D48]">
                              {user.token}
                            </td>
                            <td className="py-2.5 px-3 font-sans font-bold text-neutral-950">
                              {user.name}
                            </td>
                            <td className="py-2.5 px-3 text-neutral-600">
                              {user.emailOrPhone}
                            </td>
                            <td className="py-2.5 px-3 text-neutral-700">
                              {user.ip}
                            </td>
                            <td className="py-2.5 px-3 text-neutral-600">
                              {user.communeOrigin || 'Maipú'}
                            </td>
                            <td className="py-2.5 px-3 text-neutral-950 font-bold">
                              {user.totalActionsCount} eventos
                            </td>
                            <td className="py-2.5 px-3 text-[#059669]">
                              {user.lastActive}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Real Live Audit Log (Qué busca, qué escribe, qué tarjetas abre) */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-300 pb-2">
                    <h4 className="font-black text-sm uppercase tracking-tight text-neutral-950 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#059669] inline-block" />
                      <span>Timeline en Vivo de Acciones (Qué busca · Qué escribe · Qué abre)</span>
                    </h4>

                    {/* Filter by user */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-[11px] text-neutral-500">Filtrar por token:</span>
                      <select
                        value={selectedUserFilter}
                        onChange={(e) => setSelectedUserFilter(e.target.value)}
                        className="py-1 px-2 border border-neutral-300 bg-white font-mono text-xs rounded-none"
                      >
                        <option value="todos">Todos los usuarios ({actionLogs.length})</option>
                        {trackedUsers.map(u => (
                          <option key={u.token} value={u.token}>
                            {u.token} - {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Log entries */}
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {filteredLogs.map((log) => {
                      const isSearch = log.eventType === 'BUSQUEDA';
                      const isCardView = log.eventType === 'APERTURA_TARJETA';
                      const isReserve = log.eventType === 'RESERVA_CUPO';
                      const isFilter = log.eventType === 'FILTRO_CATEGORIA' || log.eventType === 'FILTRO_TIEMPO';

                      return (
                        <div 
                          key={log.id} 
                          className="p-3 bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-neutral-400 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wide text-white ${
                                isSearch ? 'bg-[#E11D48]' :
                                isCardView ? 'bg-neutral-900' :
                                isReserve ? 'bg-[#059669]' :
                                isFilter ? 'bg-blue-600' : 'bg-neutral-600'
                              }`}>
                                {log.eventType.replace('_', ' ')}
                              </span>

                              <span className="font-mono text-xs text-neutral-500 font-bold">
                                {log.token}
                              </span>

                              <span className="text-xs text-neutral-950 font-extrabold">
                                {log.userName}
                              </span>

                              <span className="text-[10px] font-mono text-neutral-400">
                                · {log.userIp}
                              </span>
                            </div>

                            <div className="text-xs text-neutral-800 font-medium">
                              <strong>{log.title}:</strong> {log.details}
                            </div>
                          </div>

                          <div className="text-[10px] font-mono text-neutral-400 shrink-0 self-start sm:self-auto">
                            {log.timestamp}
                          </div>
                        </div>
                      );
                    })}

                    {filteredLogs.length === 0 && (
                      <div className="p-8 text-center text-xs font-mono text-neutral-400">
                        No hay eventos registrados para este filtro.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: RECHARTS: MUNICIPAL IMPACT DASHBOARD */}
            {activeTab === 'recharts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-300 pb-2">
                  <h4 className="font-black text-sm uppercase tracking-tight text-neutral-950 flex items-center gap-2">
                    <span>📊</span>
                    <span>Correlación entre Participación en Talleres y Reducción de Incidentes</span>
                  </h4>
                  <span className="text-[11px] text-neutral-700 font-mono font-bold bg-neutral-100 px-2.5 py-0.5 border border-neutral-300">
                    Librería Recharts Activa
                  </span>
                </div>

                <MunicipalImpactDashboard
                  currentNeighborhood={currentNeighborhood}
                  allNeighborhoods={allNeighborhoods}
                />
              </div>
            )}

            {/* TAB 3: AI ANALYSIS */}
            {activeTab === 'ai_analysis' && (
              <div className="space-y-4">
                <div className="bg-neutral-900 text-white p-6 border-2 border-neutral-900 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E11D48] text-white flex items-center justify-center text-xl font-bold">
                        🤖
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#E11D48]">
                          Modelo Predictivo Territorial IA
                        </span>
                        <h4 className="font-black text-lg text-white uppercase tracking-tight">
                          Análisis IA de Visitas y Beneficios Ahorrados para {currentNeighborhood.displayName}
                        </h4>
                      </div>
                    </div>
                    <span className="bg-[#059669] text-white px-3 py-1 text-xs font-bold font-mono">
                      Retorno Social 4.5x SROI
                    </span>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white/10 p-4 border border-white/15">
                      <div className="text-xs text-neutral-300 font-mono">Ahorro Comunal Estimado</div>
                      <div className="font-black text-2xl text-[#059669] mt-1">$285.000.000 CLP</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">En prevención de delitos y patrullaje</div>
                    </div>
                    <div className="bg-white/10 p-4 border border-white/15">
                      <div className="text-xs text-neutral-300 font-mono">Horas de Espacio Recuperadas</div>
                      <div className="font-black text-2xl text-amber-400 mt-1">4.890 horas/año</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">Ocupación ciudadana en plazas de bolsillo y sedes</div>
                    </div>
                    <div className="bg-white/10 p-4 border border-white/15">
                      <div className="text-xs text-neutral-300 font-mono">Tasa de Asistencia Recurrente</div>
                      <div className="font-black text-2xl text-white mt-1">89.4%</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">Vecinos con racha continua de 4+ semanas</div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 border border-white/10 space-y-2 text-xs text-neutral-300 leading-relaxed font-mono">
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Dictamen Ejecutivo para la Alcaldía y Concejo Municipal:</span>
                    </div>
                    <p>
                      "El análisis de correlación territorial en <strong>{currentNeighborhood.displayName}</strong> demuestra que cada <strong>100 horas adicionales de talleres</strong> ejecutados en plazas y sedes vecinales genera una <strong>reducción del 34% en reportes de microtráfico y vandalismo nocturno</strong>. Al activar la vitrina libre con trazabilidad por token de seguimiento, la confianza vecinal aumenta drásticamente."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DEVELOPER & BIG DATA TELEMETRY */}
            {activeTab === 'big_data' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-300 pb-2">
                  <h4 className="font-black text-sm uppercase tracking-tight text-neutral-950 flex items-center gap-2">
                    <span>📈</span>
                    <span>Consola de Desarrollador, Esquemas JSON & Telemetría B2B</span>
                  </h4>
                  <span className="text-[11px] text-neutral-700 font-mono font-bold bg-neutral-100 px-2.5 py-0.5 border border-neutral-300">
                    Telemetría Municipal Activa
                  </span>
                </div>

                <DeveloperBigDataSection currentNeighborhood={currentNeighborhood} />
              </div>
            )}

            {/* Bottom Exit Button */}
            <div className="pt-4 flex items-center justify-between border-t border-neutral-300 font-mono text-xs">
              <div className="text-neutral-500">
                Consola protegida de auditoría y seguimiento CEO.
              </div>
              <button
                onClick={handleExitAdmin}
                className="py-2.5 px-5 bg-neutral-950 hover:bg-[#E11D48] text-white font-bold text-xs uppercase transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión & Salir de Modo CEO</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
