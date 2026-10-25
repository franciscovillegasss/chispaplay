import { useState } from 'react';
import { BIG_DATA_TELEMETRY, CHILE_NEIGHBORHOODS } from '../data/mockData';
import { Neighborhood } from '../types';
import { 
  Terminal, 
  BarChart3, 
  Database, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  Sparkles,
  Flame,
  Activity
} from 'lucide-react';

interface DeveloperBigDataSectionProps {
  currentNeighborhood: Neighborhood;
}

export function DeveloperBigDataSection({ currentNeighborhood }: DeveloperBigDataSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'metrics' | 'api' | 'cohorts'>('metrics');

  const telemetry = BIG_DATA_TELEMETRY;

  const sampleApiPayload = {
    platform: "ChispaPlay Big Data Telemetry",
    schemaVersion: "2.4.0",
    generatedAt: new Date().toISOString(),
    queryContext: {
      activeCommuneId: currentNeighborhood.id,
      activeCommuneName: currentNeighborhood.name,
      legalJjvvCode: currentNeighborhood.legalJjvvCode
    },
    aggregatedMetrics: {
      activeFamiliesNetwork: telemetry.totalRegisteredFamilies,
      weeklyRetentionRatePct: telemetry.weeklyActiveEngagementRate,
      verifiedPhysicalPresencePct: telemetry.physicalCheckInConversionRate,
      meanStreakDurationWeeks: telemetry.averageStreakWeeks,
      socialRoiEstimatedCLP: telemetry.socialReturnOnInvestmentCLP,
      incidentResolutionLatencyHours: telemetry.incidentMeanTimeToResolutionHours
    },
    communeComparison: telemetry.communeComparison,
    categoryDemandBreakdown: telemetry.categoryDemandShare
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleApiPayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  return (
    <section className="mt-12 rounded-3xl border-2 border-stone-800 bg-stone-950 text-white overflow-hidden shadow-xl transition-all">
      {/* Developer Bar Toggle Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 bg-stone-900 border-b border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-850 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-mono text-xs font-bold">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                MODO DESARROLLADOR & BIG DATA ANALYTICS
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full">
                TELEMETRÍA B2B ACTIVA
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Métricas de impacto territorial, asistencia y retención para compradores (Municipalidades, DIDECO y Patrocinadores)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-400 hidden sm:inline font-mono">
            {isOpen ? 'Ocultar consola' : 'Desplegar métricas'}
          </span>
          <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-stone-300">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
          {/* Sub Navigation */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-stone-900 rounded-xl text-xs font-mono">
              <button
                onClick={() => setSelectedTab('metrics')}
                className={`py-1.5 px-3 rounded-lg transition-all ${
                  selectedTab === 'metrics'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                KPIs Clave de Impacto
              </button>
              <button
                onClick={() => setSelectedTab('cohorts')}
                className={`py-1.5 px-3 rounded-lg transition-all ${
                  selectedTab === 'cohorts'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Cohortes & Demanda Territorial
              </button>
              <button
                onClick={() => setSelectedTab('api')}
                className={`py-1.5 px-3 rounded-lg transition-all ${
                  selectedTab === 'api'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Exportación JSON / API CRM
              </button>
            </div>

            <div className="text-xs text-stone-400 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Conectado al clúster de telemetría de {currentNeighborhood.name}</span>
            </div>
          </div>

          {/* TAB 1: METRICS */}
          {selectedTab === 'metrics' && (
            <div className="space-y-6">
              {/* Top Big Data KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
                  <div className="text-stone-400 text-xs font-mono flex items-center justify-between">
                    <span>Familias Activas en Red</span>
                    <Users className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {telemetry.totalRegisteredFamilies.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono">
                    +18.4% vs mes anterior
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
                  <div className="text-stone-400 text-xs font-mono flex items-center justify-between">
                    <span>Conversión Asistencia Física</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {telemetry.physicalCheckInConversionRate}%
                  </div>
                  <div className="text-[11px] text-stone-400 font-mono">
                    Validada por PIN/QR en sala
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
                  <div className="text-stone-400 text-xs font-mono flex items-center justify-between">
                    <span>Retención por Rachas</span>
                    <Flame className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-orange-400">
                    {telemetry.weeklyActiveEngagementRate}%
                  </div>
                  <div className="text-[11px] text-stone-400 font-mono">
                    Promedio {telemetry.averageStreakWeeks} semanas seguidas
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
                  <div className="text-stone-400 text-xs font-mono flex items-center justify-between">
                    <span>SROI Retorno Social</span>
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-sky-400 truncate">
                    {telemetry.socialReturnOnInvestmentCLP}
                  </div>
                  <div className="text-[11px] text-stone-400 font-mono">
                    Eficiencia fondos FNDR/DIDECO
                  </div>
                </div>
              </div>

              {/* Inter-Commune Comparative Telemetry Table */}
              <div className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-900/50">
                <div className="px-4 py-3 bg-stone-900 border-b border-stone-800 text-xs font-mono font-bold text-stone-300 flex items-center justify-between">
                  <span>TELEMETRÍA COMPARATIVA INTER-COMUNAS (DATA EN TIEMPO REAL)</span>
                  <span className="text-stone-500">Benchmark territorial</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-stone-900/80 text-stone-400 text-[11px] border-b border-stone-800">
                      <tr>
                        <th className="py-2.5 px-4">Comuna</th>
                        <th className="py-2.5 px-4">Familias Monitoreadas</th>
                        <th className="py-2.5 px-4">Tasa de Asistencia Efectiva</th>
                        <th className="py-2.5 px-4">Reportes de Cuidado Resueltos</th>
                        <th className="py-2.5 px-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 text-stone-300">
                      {telemetry.communeComparison.map((row, idx) => (
                        <tr key={idx} className="hover:bg-stone-800/40 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-white flex items-center gap-2">
                            {row.commune === currentNeighborhood.name && (
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                            )}
                            <span>{row.commune}</span>
                          </td>
                          <td className="py-2.5 px-4">{row.familiesCount.toLocaleString()} familias</td>
                          <td className="py-2.5 px-4 text-emerald-400 font-bold">{row.attendanceRate}%</td>
                          <td className="py-2.5 px-4 text-amber-300">{row.safetyIncidentsResolved} mejoras ejecutadas</td>
                          <td className="py-2.5 px-4">
                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px]">
                              OPTIMIZADO
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COHORTS & DEMAND */}
          {selectedTab === 'cohorts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Demographic Cohorts */}
              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
                <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>DISTRIBUCIÓN DE USUARIOS POR COHORTE DE EDAD</span>
                </div>
                <div className="space-y-3">
                  {telemetry.topDemographicCohorts.map((c, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-stone-300">
                        <span>{c.label}</span>
                        <span className="font-bold text-white">{c.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full" 
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demand Share by Category */}
              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
                <div className="text-xs font-mono font-bold text-orange-400 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>SHARE DE DEMANDA COMUNITARIA POR TEMÁTICA</span>
                </div>
                <div className="space-y-3">
                  {telemetry.categoryDemandShare.map((c, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-stone-300">
                        <span>{c.category}</span>
                        <span className="font-bold text-orange-400">{c.demandPercentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full" 
                          style={{ width: `${c.demandPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: API & JSON PAYLOAD */}
          {selectedTab === 'api' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-stone-400 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>PAYLOAD REST API / CRM MUNICIPAL (FORMATO GEO-JSON / BIG DATA)</span>
                </div>
                <button
                  onClick={handleCopyJson}
                  className="py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">JSON Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar JSON</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 font-mono text-[11px] text-emerald-400 max-h-72 overflow-y-auto leading-relaxed select-all">
                <pre>{JSON.stringify(sampleApiPayload, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
