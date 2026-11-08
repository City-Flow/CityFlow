import { useState, useEffect } from "react";
import { MapView } from "./MapView";
import { WaterChart } from "./WaterChart";
import api from "../services/api";

export function WaterTab() {
  const [waterDistricts, setWaterDistricts] = useState([]);
  const [selectedWaterData, setSelectedWaterData] = useState(null);
  const [waterThreshold, setWaterThreshold] = useState(15);
  
  const [waterLogs, setWaterLogs] = useState([
    { id: 1, type: "WATER_ALERT", district: "Nou Barris", message: "Anomalía de consumo detectada por el modelo ML", time: "18:43" },
    { id: 2, type: "WATER_ALERT", district: "Les Corts", message: "Pico de consumo detectado por el modelo ML", time: "18:43" }
  ]);

  // Cargar datos de Agua
  useEffect(() => {
    api
      .get("/water/districts/")
      .then((res) => setWaterDistricts(res.data))
      .catch((err) => console.error("Error API agua:", err));
  }, []);

  const handleSelectWater = (id) => {
    api
      .get(`/water/metrics/?district_id=${id}`)
      .then((res) => setSelectedWaterData(res.data));
  };

  const handleSimulateWaterAlert = () => {
    const newLog = {
      id: Date.now(),
      type: "WATER_ALERT",
      district: "Eixample",
      message: `Simulación: Anomalía detectada (+${waterThreshold}%)`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setWaterLogs((prev) => [newLog, ...prev]);
  };

  const waterCounts = {
    normal: waterDistricts.filter((d) => d.status === "normal" || !d.status).length,
    warning: waterDistricts.filter((d) => d.status === "warning").length,
    critical: waterDistricts.filter((d) => d.status === "critical").length,
  };

  return (
    <>
      {/* Izquierda: Mapa de Agua & Gráfico (8/12) */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="h-105 w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-2 relative">
          <MapView
            districts={waterDistricts}
            onSelectDistrict={handleSelectWater}
          />
        </div>
        <div className="h-65 w-full">
          <WaterChart data={selectedWaterData} />
        </div>
      </div>

      {/* Derecha: Paneles de Control de Agua (4/12) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        
        {/* Contadores de Estado */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
            <span className="block text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Normal</span>
            <span className="text-xl font-bold text-slate-100">{waterCounts.normal}</span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
            <span className="block text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Atención</span>
            <span className="text-xl font-bold text-slate-100">{waterCounts.warning}</span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
            <span className="block text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-1">Crítico</span>
            <span className="text-xl font-bold text-slate-100">{waterCounts.critical}</span>
          </div>
        </div>

        {/* Slider de Umbral */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">Umbral de anomalía personalizado</span>
            <span className="text-cyan-400 font-bold">+{waterThreshold}%</span>
          </div>
          <p className="text-[11px] text-slate-500">Desviación sobre la predicción del modelo ML</p>
          <input
            type="range"
            min="5"
            max="50"
            value={waterThreshold}
            onChange={(e) => setWaterThreshold(e.target.value)}
            className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Botón de simulación manual si se requiere dentro del panel */}
        <button
          onClick={handleSimulateWaterAlert}
          className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold transition-all"
        >
          ⚙️ Simular Anomalía de Agua
        </button>

        {/* Registro de Eventos / Alertas */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-md max-h-45 overflow-y-auto space-y-2">
          <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Registro de eventos en tiempo real
          </h3>
          {waterLogs.map((log) => (
            <div key={log.id} className="p-2 bg-slate-950/70 border border-rose-500/30 rounded-lg space-y-1 text-[11px]">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="text-rose-400 font-bold">{log.type}</span>
                <span>{log.time}</span>
              </div>
              <p className="text-slate-300 font-medium">{log.district}</p>
              <p className="text-slate-400 text-[10px]">{log.message}</p>
            </div>
          ))}
        </div>

        {/* Lista de Distritos */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md flex-1 overflow-y-auto min-h-50">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Distritos monitorizados ({waterDistricts.length})
          </h3>
          <div className="space-y-1.5">
            {waterDistricts.map((d) => (
              <div
                key={d.id}
                onClick={() => handleSelectWater(d.id)}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700/30 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      d.status === "warning" ? "bg-amber-400" : d.status === "critical" ? "bg-rose-500" : "bg-emerald-400"
                    }`}
                  ></span>
                  <span className="font-medium text-slate-200">
                    {d.district_name || d.name}
                  </span>
                </div>
                <span
                  className={`font-semibold ${
                    d.status === "critical" ? "text-rose-400" : d.status === "warning" ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {d.variance || "+0.0%"}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}