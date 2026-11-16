import { useState, useEffect } from "react";
import { WaterChart } from "./WaterChart";
import api from "../services/api";
import { CityMap } from "./CityMap";

export function WaterTab() {
  const [waterDistricts, setWaterDistricts] = useState([]);
  const [selectedWaterData, setSelectedWaterData] = useState(null);

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
          <CityMap mode="water" districts={waterDistricts} onSelectDistrict={handleSelectWater} />
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

        {/* Panel de Información del Distrito Seleccionado */}
        {selectedWaterData && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Detalles de {selectedWaterData.district_name}
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Último Consumo</span>
                <span className="text-sm font-bold text-cyan-400">
                  {selectedWaterData.historical_data.length > 0 
                    ? selectedWaterData.historical_data[selectedWaterData.historical_data.length - 1].consumption.toLocaleString() 
                    : "0"} m³
                </span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Periodo</span>
                <span className="text-sm font-bold text-slate-200">
                  {selectedWaterData.historical_data.length > 0 
                    ? selectedWaterData.historical_data[selectedWaterData.historical_data.length - 1].time 
                    : "-"}
                </span>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-500 italic">
              * Datos anuales de consumo doméstico (AMB). La predicción no está disponible para agua.
            </p>
          </div>
        )}

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