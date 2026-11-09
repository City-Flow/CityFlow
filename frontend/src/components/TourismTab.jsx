// src/components/TourismTab.jsx
import { useState, useEffect } from "react";
import { CityMap } from "./CityMap";
import api from "../services/api";

export function TourismTab() {
  const [tourismDistricts, setTourismDistricts] = useState([
    { id: 1, name: "Ciutat Vella", density: "Muy Alta", huts: 1450, occupancy: "92%", status: "critical" },
    { id: 2, name: "Eixample", density: "Alta", huts: 2100, occupancy: "88%", status: "warning" },
    { id: 3, name: "Gràcia", density: "Media-Alta", huts: 680, occupancy: "81%", status: "warning" },
    { id: 4, name: "Sant Martí", density: "Media", huts: 890, occupancy: "75%", status: "normal" },
    { id: 5, name: "Sants-Montjuïc", density: "Media", huts: 520, occupancy: "70%", status: "normal" },
  ]);

  const [selectedDistrict, setSelectedDistrict] = useState(tourismDistricts[0]);
  const [tourismSeasonFactor, setTourismSeasonFactor] = useState(1.2);

  useEffect(() => {
    api
      .get("/tourism/districts/")
      .then((res) => setTourismDistricts(res.data))
      .catch(() => {
        console.log("Cargando datos estáticos de turismo...");
      });
  }, []);

  const tourismCounts = {
    normal: tourismDistricts.filter((d) => d.status === "normal").length,
    warning: tourismDistricts.filter((d) => d.status === "warning").length,
    critical: tourismDistricts.filter((d) => d.status === "critical").length,
  };

  return (
    <>
      <div className="lg:col-span-8 flex flex-col gap-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Afluencia Estimada Hoy</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-cyan-400">+145,000</span>
              <span className="text-[10px] text-emerald-400 font-semibold">↑ 12% vs ayer</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Visitantes no residentes en BCN</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Ocupación Media (HUTs / Hoteles)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-100">85.4%</span>
              <span className="text-[10px] text-amber-400 font-semibold">Saturación Media</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Basado en licencias HUT activas</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Zona de Mayor Presión</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-bold text-rose-400">Ciutat Vella</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Densidad: 92% de capacidad sugerida</span>
          </div>
        </div>

        <div className="h-95 w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-2 relative">
          <CityMap
            mode="tourism"
            districts={tourismDistricts}
            onSelectDistrict={(id) => {
              const found = tourismDistricts.find((d) => d.id === id);
              if (found) setSelectedDistrict(found);
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 z-10 text-xs">
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Licencias HUTs</span>
            <span className="font-bold text-slate-200">{selectedDistrict.huts} unidades</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Ocupación estimada</span>
            <span className="font-bold text-cyan-400">{selectedDistrict.occupancy}</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Impacto en Servicios</span>
            <span className="font-bold text-amber-400">Alto (Agua / Movilidad)</span>
          </div>
        </div>

      </div>

      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
            <span className="block text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Baja</span>
            <span className="text-xl font-bold text-slate-100">{tourismCounts.normal}</span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
            <span className="block text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Moderada</span>
            <span className="text-xl font-bold text-slate-100">{tourismCounts.warning}</span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
            <span className="block text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-1">Saturada</span>
            <span className="text-xl font-bold text-slate-100">{tourismCounts.critical}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">Simulador: Factor de Afluencia</span>
            <span className="text-cyan-400 font-bold">x{tourismSeasonFactor}</span>
          </div>
          <p className="text-[11px] text-slate-500">Proyección de afluencia por eventos o temporada alta</p>
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.1"
            value={tourismSeasonFactor}
            onChange={(e) => setTourismSeasonFactor(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md flex-1 overflow-y-auto min-h-55">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Distritos y Aforo Turístico ({tourismDistricts.length})
          </h3>
          <div className="space-y-1.5">
            {tourismDistricts.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDistrict(d)}
                className={`flex items-center justify-between p-2.5 rounded-lg transition-colors cursor-pointer border text-xs ${
                  selectedDistrict.id === d.id
                    ? "bg-slate-800 border-cyan-500/50"
                    : "bg-slate-800/40 hover:bg-slate-800 border-slate-700/30"
                }`}
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
                  <span className="font-medium text-slate-200">{d.name}</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold text-cyan-400">{d.occupancy}</span>
                  <span className="text-[10px] text-slate-500">{d.huts} HUTs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}