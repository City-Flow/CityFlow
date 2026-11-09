import { useState, useEffect } from "react";
import { CityMap } from "./CityMap";
import { AirChart } from "./AirChart";
import api from "../services/api";

export function AirTab() {
  const [airDistricts, setAirDistricts] = useState([]);
  const [selectedAirData, setSelectedAirData] = useState(null);
  const [trafficReduction, setTrafficReduction] = useState(20);

  const [airLogs, setAirLogs] = useState([
    { id: 1, type: "AIR_QUALITY_ALERT", district: "Eixample", message: "Elevada concentración de NO2 detectada", time: "18:30" },
    { id: 2, type: "AIR_QUALITY_ALERT", district: "Ciutat Vella", message: "Nivel moderado de PM10 en la zona urbana", time: "17:15" }
  ]);

  // Cargar datos de Aire
  useEffect(() => {
    api
      .get("/air/districts/")
      .then((res) => setAirDistricts(res.data))
      .catch((err) => console.error("Error API aire:", err));
  }, []);

  const handleSelectAir = (id) => {
    api
      .get(`/air/metrics/?district_id=${id}`)
      .then((res) => setSelectedAirData(res.data));
  };

  const handleSimulateAirAlert = () => {
    const newLog = {
      id: Date.now(),
      type: "AIR_QUALITY_SIM",
      district: "Gràcia",
      message: `Simulación: Reducción de tráfico al ${trafficReduction}% aplicada`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAirLogs((prev) => [newLog, ...prev]);
  };

  const airCounts = {
    normal: airDistricts.filter((d) => d.status === "normal" || !d.status).length,
    warning: airDistricts.filter((d) => d.status === "warning").length,
    critical: airDistricts.filter((d) => d.status === "critical").length,
  };

  return (
    <>
      {/* Izquierda: Mapa de Aire & Gráfico (8/12) */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="h-105 w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-2 relative">
          <CityMap mode="air" districts={airDistricts} onSelectDistrict={handleSelectAir} />
        </div>
        <div className="h-65 w-full">
          <AirChart data={selectedAirData} />
        </div>
      </div>

      {/* Derecha: Paneles de Control de Calidad del Aire (4/12) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        
        {/* Contadores de Estado del Aire */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
            <span className="block text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Buena</span>
            <span className="text-xl font-bold text-slate-100">{airCounts.normal}</span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
            <span className="block text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Moderada</span>
            <span className="text-xl font-bold text-slate-100">{airCounts.warning}</span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
            <span className="block text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-1">Deficiente</span>
            <span className="text-xl font-bold text-slate-100">{airCounts.critical}</span>
          </div>
        </div>

        {/* Simulador: Reducción de Tráfico */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">Simulador: Reducción de Tráfico</span>
            <span className="text-cyan-400 font-bold">-{trafficReduction}%</span>
          </div>
          <p className="text-[11px] text-slate-500">Impacto estimado en las emisiones de NO2 y PM10</p>
          <input
            type="range"
            min="0"
            max="50"
            value={trafficReduction}
            onChange={(e) => setTrafficReduction(e.target.value)}
            className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Botón de simulación manual */}
        <button
          onClick={handleSimulateAirAlert}
          className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold transition-all"
        >
          ⚙️ Simular Reducción de Tráfico
        </button>

        {/* Registro de Eventos del Aire */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-md max-h-45 overflow-y-auto space-y-2">
          <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Alertas de Calidad del Aire
          </h3>
          {airLogs.map((log) => (
            <div key={log.id} className="p-2 bg-slate-950/70 border border-cyan-500/30 rounded-lg space-y-1 text-[11px]">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="text-cyan-400 font-bold">{log.type}</span>
                <span>{log.time}</span>
              </div>
              <p className="text-slate-300 font-medium">{log.district}</p>
              <p className="text-slate-400 text-[10px]">{log.message}</p>
            </div>
          ))}
        </div>

        {/* Lista de Distritos (Aire) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md flex-1 overflow-y-auto min-h-50">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Distritos (Calidad del Aire) ({airDistricts.length})
          </h3>
          <div className="space-y-1.5">
            {airDistricts.map((d) => (
              <div
                key={d.id}
                onClick={() => handleSelectAir(d.id)}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700/30 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      d.status === "critical"
                        ? "bg-rose-500"
                        : d.status === "warning"
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                    }`}
                  ></span>
                  <span className="font-medium text-slate-200">
                    {d.district_name || d.name}
                  </span>
                </div>
                <span
                  className={`font-semibold ${
                    d.status === "critical"
                      ? "text-rose-400"
                      : d.status === "warning"
                        ? "text-amber-400"
                        : "text-emerald-400"
                  }`}
                >
                  {d.variance || "0.0 AQI"}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}