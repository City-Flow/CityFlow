import { useState } from 'react';
import { MapView } from '../components/MapView';
import { WaterChart } from '../components/WaterChart';

const INITIAL_DISTRICTS = [
  { id: 1, district_name: "Ciutat Vella", latitude: 41.3800, longitude: 2.1730, current_consumption_m3: 1420.0, status: "normal", variance: "+2.5%" },
  { id: 2, district_name: "Eixample", latitude: 41.3887, longitude: 2.1589, current_consumption_m3: 1250.5, status: "warning", variance: "+17.6%" },
  { id: 3, district_name: "Sants-Montjuïc", latitude: 41.3721, longitude: 2.1352, current_consumption_m3: 1050.0, status: "normal", variance: "+4.3%" },
  { id: 4, district_name: "Gràcia", latitude: 41.4025, longitude: 2.1567, current_consumption_m3: 610.8, status: "warning", variance: "+17.7%" },
  { id: 5, district_name: "Poblenou (Sant Martí)", latitude: 41.3948, longitude: 2.2025, current_consumption_m3: 890.2, status: "normal", variance: "+1.2%" }
];

export function Dashboard() {
  const [districts] = useState(INITIAL_DISTRICTS);
  const [selectedDistrictData, setSelectedDistrictData] = useState(null);
  const [threshold, setThreshold] = useState(15);

  const handleSelectDistrict = (id) => {
    const district = districts.find(d => d.id === id);
    const mockMetrics = {
      district_id: id,
      district_name: district?.district_name || "Desconocido",
      historical_data: [
        { time: "12:00", consumption: 1100.0 },
        { time: "14:00", consumption: 1180.2 },
        { time: "16:00", consumption: 1210.0 },
        { time: "18:00", consumption: district?.current_consumption_m3 || 1250.5 }
      ],
      predictions: [
        { time: "18:00", predicted_consumption: 1250.5 },
        { time: "20:00", predicted_consumption: 1290.0 },
        { time: "22:00", predicted_consumption: 1150.0 },
        { time: "00:00", predicted_consumption: 980.0 }
      ]
    };
    setSelectedDistrictData(mockMetrics);
  };

  return (
    <div className="min-h-screen w-full p-4 flex flex-col gap-4 bg-slate-950 text-slate-100">
      
      {/* Barra superior de estado */}
      <header className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Gestión del Agua en Barcelona
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-slate-300">
          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/50">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>WebSocket: Conectado</span>
          </div>
          <div className="text-slate-400">🌡️ 28.5 °C &nbsp;|&nbsp; 🌧️ 0.0 mm</div>
        </div>
      </header>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        
        {/* Panel izquierdo: Mapa y Gráfica (7 columnas) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="h-[450px] w-full">
            <MapView districts={districts} onSelectDistrict={handleSelectDistrict} />
          </div>
          <div className="h-[280px] w-full">
            <WaterChart data={selectedDistrictData} />
          </div>
        </div>

        {/* Panel derecho: Contadores, Sliders y Lista de Distritos (5 columnas) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Tarjetas de Estado */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center shadow-md">
              <div className="text-xs text-slate-400 mb-1">🟢 Normal</div>
              <div className="text-2xl font-bold text-emerald-400">8</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center shadow-md">
              <div className="text-xs text-slate-400 mb-1">🟡 Atención</div>
              <div className="text-2xl font-bold text-amber-400">2</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center shadow-md">
              <div className="text-xs text-slate-400 mb-1">🔴 Crítico</div>
              <div className="text-2xl font-bold text-rose-400">0</div>
            </div>
          </div>

          {/* Control de Umbral (Slider) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-300">Umbral de anomalía personalizado</span>
              <span className="text-cyan-400 font-bold">+{threshold}%</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Desviación sobre la predicción de ML a partir de la cual se activa la alerta.</p>
            <input 
              type="range" 
              min="0" 
              max="50" 
              value={threshold} 
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Lista de Barrios Monitorizados */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md flex-1 overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-200 mb-3">Barrios monitorizados</h3>
            <div className="space-y-2">
              {districts.map((d) => (
                <div 
                  key={d.id}
                  onClick={() => handleSelectDistrict(d.id)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700/30"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${d.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                    <span className="text-sm font-medium text-slate-200">{d.district_name}</span>
                  </div>
                  <span className={`text-xs font-semibold ${d.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {d.variance}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}