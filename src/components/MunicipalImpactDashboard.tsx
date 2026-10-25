import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Building2, 
  TrendingDown, 
  Users, 
  ShieldCheck, 
  Flame, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  Clock,
  Coins
} from 'lucide-react';
import { Neighborhood } from '../types';

interface MunicipalImpactDashboardProps {
  currentNeighborhood: Neighborhood;
  allNeighborhoods: Neighborhood[];
  onOpenSafetyDemo?: () => void;
}

// Monthly correlation data: Increasing workshop attendance correlates with dropping incidents
const MONTHLY_CORRELATION_DATA = [
  { mes: 'Mayo', asistenciaFamilias: 180, incidentesReportados: 54, plazasHabitadas: 4 },
  { mes: 'Junio', asistenciaFamilias: 310, incidentesReportados: 46, plazasHabitadas: 7 },
  { mes: 'Julio', asistenciaFamilias: 480, incidentesReportados: 35, plazasHabitadas: 11 },
  { mes: 'Agosto', asistenciaFamilias: 690, incidentesReportados: 26, plazasHabitadas: 16 },
  { mes: 'Septiembre', asistenciaFamilias: 890, incidentesReportados: 18, plazasHabitadas: 22 },
  { mes: 'Octubre', asistenciaFamilias: 1140, incidentesReportados: 11, plazasHabitadas: 28 }
];

// Commune-by-commune comparison data
const COMMUNE_IMPACT_DATA = [
  { comuna: 'Colina', asistencia: 1140, incidentesReducidos: 43, guardianesRacha: 184, sroi: 4.4 },
  { comuna: 'Rancagua', asistencia: 1290, incidentesReducidos: 45, guardianesRacha: 195, sroi: 4.5 },
  { comuna: 'Maipú', asistencia: 1210, incidentesReducidos: 48, guardianesRacha: 210, sroi: 4.6 },
  { comuna: 'Puente Alto', asistencia: 1340, incidentesReducidos: 52, guardianesRacha: 225, sroi: 4.5 },
  { comuna: 'Cerro Navia', asistencia: 980, incidentesReducidos: 39, guardianesRacha: 160, sroi: 4.2 },
  { comuna: 'Santiago (Yungay)', asistencia: 820, incidentesReducidos: 34, guardianesRacha: 140, sroi: 4.1 },
  { comuna: 'Recoleta', asistencia: 790, incidentesReducidos: 31, guardianesRacha: 135, sroi: 3.9 },
  { comuna: 'Valparaíso', asistencia: 740, incidentesReducidos: 29, guardianesRacha: 120, sroi: 3.8 }
];

// Hour by hour eyes-on-the-street weekend correlation
const WEEKEND_PRESENCE_DATA = [
  { franja: '09:00', ninosJugando: 45, incivilidadesSinJuego: 14, incivilidadesConChispa: 3 },
  { franja: '11:00', ninosJugando: 160, incivilidadesSinJuego: 22, incivilidadesConChispa: 2 },
  { franja: '13:00', ninosJugando: 120, incivilidadesSinJuego: 18, incivilidadesConChispa: 1 },
  { franja: '15:00', ninosJugando: 190, incivilidadesSinJuego: 25, incivilidadesConChispa: 2 },
  { franja: '17:00', ninosJugando: 240, incivilidadesSinJuego: 31, incivilidadesConChispa: 3 },
  { franja: '19:00', ninosJugando: 180, incivilidadesSinJuego: 38, incivilidadesConChispa: 5 }
];

export function MunicipalImpactDashboard({
  currentNeighborhood,
  allNeighborhoods,
  onOpenSafetyDemo
}: MunicipalImpactDashboardProps) {
  const [selectedViewCommune, setSelectedViewCommune] = useState<string>(currentNeighborhood.comuna);
  const [exportedNotice, setExportedNotice] = useState(false);

  const handleExport = () => {
    setExportedNotice(true);
    setTimeout(() => setExportedNotice(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Municipal Pitch & Value */}
      <div className="bg-gradient-to-r from-stone-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-md border-2 border-indigo-400/30 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/25 border border-indigo-400/40 px-3.5 py-1 rounded-full text-xs font-bold text-indigo-200">
              <Building2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Portal de Gestión Municipal & Prevención del Delito</span>
              <span>·</span>
              <span>Evidencia Científica CPTED</span>
            </div>
            
            <h2 className="font-fun font-bold text-2xl sm:text-3xl text-white leading-tight">
              Impacto de la Activación Infantil en la Seguridad Comunal
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Visualización mediante datos empíricos: a mayor cantidad de familias y niñez en plazas y sedes sociales, mayor control social informal y menor índice de incivilidades.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {onOpenSafetyDemo && (
              <button
                onClick={onOpenSafetyDemo}
                className="py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-stone-950" />
                <span>¿Cómo funciona el Botón de Seguridad? (Demo)</span>
              </button>
            )}

            <button
              onClick={handleExport}
              className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{exportedNotice ? '✓ Informe Preparado' : 'Exportar Ficha Concejo Municipal'}</span>
            </button>
          </div>
        </div>

        {exportedNotice && (
          <div className="mt-3 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs px-3 py-1.5 rounded-xl font-medium">
            ✓ Reporte ejecutivo generado con tablas de Recharts y métricas listas para presentación en comisión de seguridad.
          </div>
        )}
      </div>

      {/* PABLO FUENTES KEY METRICS: CIFRAS GRANDES POR COMUNA */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 text-white shadow-md border border-blue-400/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-fun font-bold text-xs uppercase tracking-wider text-blue-200">
              Indicadores Clave de Software Urbano & Activaciones ({currentNeighborhood.displayName})
            </span>
          </div>
          <span className="text-[10px] bg-blue-500/25 text-blue-200 px-2.5 py-0.5 rounded-full border border-blue-400/30">
            Recomendación Director SECPLAC
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <div className="text-[10px] font-bold uppercase text-blue-200">Total Registradas</div>
            <div className="font-fun font-bold text-2xl sm:text-3xl text-white mt-0.5">2.450</div>
            <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">Catastro comunal vivo</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <div className="text-[10px] font-bold uppercase text-blue-200">Actividades Este Mes</div>
            <div className="font-fun font-bold text-2xl sm:text-3xl text-amber-300 mt-0.5">312</div>
            <div className="text-[10px] text-amber-200 font-semibold mt-0.5">+48% vs mes anterior</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <div className="text-[10px] font-bold uppercase text-blue-200">Esta Semana</div>
            <div className="font-fun font-bold text-2xl sm:text-3xl text-cyan-300 mt-0.5">86</div>
            <div className="text-[10px] text-cyan-200 font-semibold mt-0.5">En sedes & plazas</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <div className="text-[10px] font-bold uppercase text-blue-200">Actividades Hoy</div>
            <div className="font-fun font-bold text-2xl sm:text-3xl text-rose-300 mt-0.5">14</div>
            <div className="text-[10px] text-rose-200 font-semibold mt-0.5">Ocurriendo en el territorio</div>
          </div>
        </div>
      </div>

      {/* 4 Big KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
            <span>Reducción de Incivilidades</span>
            <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
              <TrendingDown className="w-4 h-4 stroke-[3]" />
            </span>
          </div>
          <div className="font-fun font-bold text-3xl text-stone-900">
            -79.6%
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            En plazas activadas con talleres continuos vs plazas desiertas.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
            <span>Ojos en la Calle Activos</span>
            <span className="p-1.5 rounded-xl bg-orange-100 text-orange-700">
              <Users className="w-4 h-4 stroke-[3]" />
            </span>
          </div>
          <div className="font-fun font-bold text-3xl text-orange-600">
            4.280 familias
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            Presencia física verificada mediante PIN en sedes y espacios públicos.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
            <span>Guardianes con Racha</span>
            <span className="p-1.5 rounded-xl bg-amber-100 text-amber-700">
              <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
            </span>
          </div>
          <div className="font-fun font-bold text-3xl text-amber-700">
            974 vecinos
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            Racha de 4+ semanas que reciben notificación push silenciosa de apoyo.
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
            <span>Retorno Social (SROI)</span>
            <span className="p-1.5 rounded-xl bg-blue-100 text-blue-700">
              <Coins className="w-4 h-4 stroke-[3]" />
            </span>
          </div>
          <div className="font-fun font-bold text-3xl text-indigo-700">
            $4.4 x cada $1
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            Ahorro en patrullaje municipal y reparación de luminarias vandalizadas.
          </p>
        </div>
      </div>

      {/* CHART 1: Recharts Bar Chart - Correlación Asistencia vs Incidentes */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full mb-1">
              <span>📊 Correlación Mensual Demostrada (Recharts)</span>
            </div>
            <h3 className="font-fun font-bold text-lg text-stone-900">
              Participación Familiar en Talleres vs. Reducción de Incidentes Barriales
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Evolución acumulada de los últimos 6 meses en plazas de la comuna
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-orange-500 inline-block" />
              <span>Asistencia de Familias (Personas)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500 inline-block" />
              <span>Reportes de Incidentes</span>
            </span>
          </div>
        </div>

        {/* Recharts Bar Chart Container */}
        <div className="h-[320px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MONTHLY_CORRELATION_DATA}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ebe1" />
              <XAxis 
                dataKey="mes" 
                tick={{ fill: '#78716c', fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: '#e7e5e4' }}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                tick={{ fill: '#ea580c', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#e7e5e4' }}
                tickLine={false}
                label={{ value: 'Familias Asistentes', angle: -90, position: 'insideLeft', fill: '#ea580c', fontSize: 10 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#e11d48', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#e7e5e4' }}
                tickLine={false}
                label={{ value: 'Incidentes Reportados', angle: 90, position: 'insideRight', fill: '#e11d48', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1c1917', 
                  borderRadius: '16px', 
                  border: 'none', 
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any, name: any) => {
                  if (name === 'asistenciaFamilias') return [`${value} familias`, 'Asistencia Presencial'];
                  if (name === 'incidentesReportados') return [`${value} reportes`, 'Incidentes'];
                  return [value, name];
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                formatter={(value) => (
                  <span className="text-xs font-bold text-stone-700">
                    {value === 'asistenciaFamilias' ? 'Familias Asistentes a Talleres' : 'Incidentes en el Entorno'}
                  </span>
                )}
              />
              <Bar 
                yAxisId="left"
                dataKey="asistenciaFamilias" 
                fill="#f97316" 
                radius={[8, 8, 0, 0]} 
                barSize={32}
              />
              <Bar 
                yAxisId="right"
                dataKey="incidentesReportados" 
                fill="#f43f5e" 
                radius={[8, 8, 0, 0]} 
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Analytical takeaway for city council */}
        <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 text-xs text-amber-950 font-medium flex items-start gap-2.5">
          <span className="text-base">💡</span>
          <div>
            <strong>Conclusión para Plan Comunal de Seguridad Pública:</strong> Cada incremento de 100 familias activadas en talleres comunitarios reduce en promedio un <strong>7.2% las denuncias por ruidos molestos, botellas rotas y consumo de alcohol en plazas públicas</strong>, sustituyendo el gasto reactivo de patrullas por prevención natural.
          </div>
        </div>
      </div>

      {/* CHART 2: Comparativa Intercomunal (Maipú, Colina, Puente Alto, etc.) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full mb-1">
              <span>🇨🇱 Comparativa Regional de Comunas (Recharts)</span>
            </div>
            <h3 className="font-fun font-bold text-lg text-stone-900">
              Eficacia de Seguridad Ciudadana y Adhesión por Comuna
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Número de incidentes prevenidos y guardianes con racha alta en Maipú, Colina, Puente Alto y comunas aliadas
            </p>
          </div>
        </div>

        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={COMMUNE_IMPACT_DATA}
              margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ebe1" />
              <XAxis 
                dataKey="comuna" 
                tick={{ fill: '#57534e', fontSize: 11, fontWeight: 700 }}
                axisLine={{ stroke: '#e7e5e4' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#78716c', fontSize: 11 }}
                axisLine={{ stroke: '#e7e5e4' }}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1c1917', 
                  borderRadius: '16px', 
                  border: 'none', 
                  color: '#ffffff',
                  fontSize: '12px'
                }}
                formatter={(val: any, name: any) => {
                  if (name === 'incidentesReducidos') return [`${val} alertas resueltas`, 'Impacto Directo'];
                  if (name === 'guardianesRacha') return [`${val} vecinos guardianes`, 'Red de Apoyo'];
                  return [val, name];
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={32}
                formatter={(val) => (
                  <span className="text-xs font-bold text-stone-700">
                    {val === 'incidentesReducidos' ? 'Incidentes Resueltos / Prevenidos' : 'Guardianes con Racha de Asistencia'}
                  </span>
                )}
              />
              <Bar 
                dataKey="incidentesReducidos" 
                fill="#10b981" 
                radius={[6, 6, 0, 0]} 
                barSize={24}
              />
              <Bar 
                dataKey="guardianesRacha" 
                fill="#6366f1" 
                radius={[6, 6, 0, 0]} 
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explanatory Policy Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-5 sm:p-6 rounded-3xl border border-indigo-200 space-y-3">
        <h4 className="font-fun font-bold text-base text-indigo-950 flex items-center gap-2">
          <span>🛡️</span>
          <span>¿Por qué las municipalidades invierten en este modelo?</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-700">
          <div className="bg-white p-4 rounded-2xl border border-indigo-100 space-y-1">
            <div className="font-bold text-indigo-900">1. Prevención Situacional (CPTED)</div>
            <p className="text-stone-600 leading-relaxed">
              Un parque con niños jugando y madres conversando expulsa a personas que consumen alcohol o cometen incivilidades sin necesidad de confrontación armada.
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-indigo-100 space-y-1">
            <div className="font-bold text-indigo-900">2. Alerta Silenciosa sin Pánico</div>
            <p className="text-stone-600 leading-relaxed">
              Las denuncias de seguridad sólo son emitidas por asistentes presenciales verificados y se notifican a vecinos de alta racha, eliminando las falsas alarmas de redes sociales.
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-indigo-100 space-y-1">
            <div className="font-bold text-indigo-900">3. Acreditación de Fondos y SROI</div>
            <p className="text-stone-600 leading-relaxed">
              Permite a los alcaldes y directores de DIDECO acreditar ante la Subsecretaría de Prevención del Delito (SPD) el retorno social real de cada peso invertido en infancia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
