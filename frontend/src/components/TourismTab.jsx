// src/components/TourismTab.jsx
import { useState, useEffect } from "react";
import { CityMap } from "./CityMap";
import api from "../services/api";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function TourismTab() {
  const [tourismDistricts, setTourismDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    api.get("/tourism/districts/")
      .then((res) => {
        setTourismDistricts(res.data);
        if (res.data.length > 0) setSelectedDistrict(res.data[0]);
      })
      .catch((err) => console.error("Error API turismo:", err));
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      api.get(`/tourism/metrics/?district_id=${selectedDistrict.id}`)
        .then((res) => setChartData(res.data.historical_data || []))
        .catch((err) => console.error("Error métricas turismo:", err));
    }
  }, [selectedDistrict]);

  const tourismCounts = {
    normal: tourismDistricts.filter((d) => d.status === "normal").length,
    warning: tourismDistricts.filter((d) => d.status === "warning").length,
    critical: tourismDistricts.filter((d) => d.status === "critical").length,
  };

  if (!selectedDistrict) return <div className="text-center text-slate-400 p-10">Cargando datos de turismo...</div>;

  return (
    <>
      <div className="lg:col-span-8 flex flex-col gap-4">
        {/* Mapa */}
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

        {/* Gráfico: Un solo eje Y para comparar ambas series */}
        <div className="h-65 w-full bg-slate-900/80 p-4 rounded-xl border border-slate-700 shadow-lg flex flex-col">
          <h3 className="text-lg font-bold text-slate-100 mb-2">
            Evolución de HUTs en {selectedDistrict.district_name}
          </h3>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" /> {/* Un solo eje Y */}
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
                <Legend />
                
                {/* Barras: Nuevas HUTs del año (mismo eje Y) */}
                <Bar dataKey="new_huts" fill="#f59e0b" name="Nuevas HUTs (año)" barSize={20} />
                
                {/* Línea: Total Acumulado (mismo eje Y) */}
                <Line type="monotone" dataKey="total_huts" stroke="#a78bfa" strokeWidth={3} name="Total Acumulado" dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Contadores */}
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

        {/* Lista de Distritos */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md flex-1 overflow-y-auto min-h-55">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Distritos ({tourismDistricts.length})
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
                      d.status === "critical" ? "bg-rose-500" : d.status === "warning" ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  ></span>
                  <span className="font-medium text-slate-200">{d.district_name}</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold text-cyan-400">{d.hut_count} HUTs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}