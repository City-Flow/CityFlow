// src/components/IntegratedTab.jsx
import { useState } from "react";
import { CityMap } from "./CityMap";

export function IntegratedTab() {
  const [integratedData] = useState([
    { id: 1, name: "Ciutat Vella", tourismPressure: "Muy Alta (92%)", waterAnomaly: "+24.5% (Crítico)", airQuality: "Deficiente (NO2 alto)", riskLevel: "Crítico" },
    { id: 2, name: "Eixample", tourismPressure: "Alta (88%)", waterAnomaly: "+15.2% (Alerta)", airQuality: "Moderado (NO2 medio)", riskLevel: "Alto" },
    { id: 3, name: "Gràcia", tourismPressure: "Media-Alta (81%)", waterAnomaly: "+4.1% (Normal)", airQuality: "Buena", riskLevel: "Moderado" },
    { id: 4, name: "Sant Martí", tourismPressure: "Media (75%)", waterAnomaly: "+1.2% (Normal)", airQuality: "Buena", riskLevel: "Bajo" },
    { id: 5, name: "Sants-Montjuïc", tourismPressure: "Media (70%)", waterAnomaly: "-2.0% (Normal)", airQuality: "Buena", riskLevel: "Bajo" },
  ]);

  const [simulationScenario, setSimulationScenario] = useState("evento_masivo");

  return (
    <>
      <div className="lg:col-span-8 flex flex-col gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col gap-1">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Matriz de Decisión Urbana — Correlación de Impacto
          </h3>
          <p className="text-xs text-slate-400">
            Cruza la afluencia turística no residente con los patrones de consumo de agua (ML) y las concentraciones de contaminantes (NO2/PM10).
          </p>
        </div>

        <div className="h-90 w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-2 relative">
          <CityMap
            mode="integrated"
            districts={integratedData}
            onSelectDistrict={(id) => {
              console.log("Distrito seleccionado:", id);
            }}
          />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md flex-1 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Distrito</th>
                <th className="pb-3 font-semibold">Presión Turística</th>
                <th className="pb-3 font-semibold">Desviación Agua</th>
                <th className="pb-3 font-semibold">Calidad del Aire</th>
                <th className="pb-3 font-semibold text-right">Nivel de Riesgo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {integratedData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-bold text-slate-200">{row.name}</td>
                  <td className="py-3 text-cyan-400 font-medium">{row.tourismPressure}</td>
                  <td className="py-3 text-slate-300">{row.waterAnomaly}</td>
                  <td className="py-3 text-slate-300">{row.airQuality}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        row.riskLevel === "Crítico"
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                          : row.riskLevel === "Alto"
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      }`}
                    >
                      {row.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      <div className="lg:col-span-4 flex flex-col gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Simulador de Escenarios Urbanos
          </h3>
          <p className="text-[11px] text-slate-500">
            Evalúa el impacto preventivo ante medidas de gestión municipal.
          </p>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => setSimulationScenario("evento_masivo")}
              className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                simulationScenario === "evento_masivo"
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              🎉 Evento Masivo en Eixample / Ciutat Vella
              <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Incremento del 30% en afluencia turística</span>
            </button>

            <button
              onClick={() => setSimulationScenario("restriccion_trafico")}
              className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                simulationScenario === "restriccion_trafico"
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              🚗 Restricción de Tráfico por Episodio NO2
              <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Reducción obligatoria del 40% en vías rápidas</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🤖</span> Recomendaciones de Acción
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-950/70 border border-amber-500/30 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase">Alerta de Sintonía</span>
                <p className="text-slate-300 text-[11px]">
                  Ciutat Vella muestra alta saturación hídrica y de aire simultánea. Se sugiere emitir aviso preventivo a hoteles.
                </p>
              </div>
              <div className="p-2.5 bg-slate-950/70 border border-cyan-500/30 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase">Optimización</span>
                <p className="text-slate-300 text-[11px]">
                  El modelo ML predice un pico de consumo a las 11:00. Activar protocolo de presión en redes secundarias.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert("Reporte ejecutivo generado con éxito para los servicios de gestión urbana.")}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg"
          >
            📥 Exportar Informe Ejecutivo
          </button>
        </div>

      </div>
    </>
  );
}