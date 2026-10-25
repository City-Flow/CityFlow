// src/views/Dashboard.jsx
import { useState, useEffect } from 'react';
import { MapView } from '../components/MapView';
import { WaterChart } from '../components/WaterChart';
import { AirMapView } from '../components/AirMapView';
import { AirChart } from '../components/AirChart';
import api from '../services/api'; 

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('water'); // 'water' o 'air'
  
  // Estados para Agua
  const [waterDistricts, setWaterDistricts] = useState([]);
  const [selectedWaterData, setSelectedWaterData] = useState(null);
  
  // Estados para Aire
  const [airDistricts, setAirDistricts] = useState([]);
  const [selectedAirData, setSelectedAirData] = useState(null);
  
  const [threshold, setThreshold] = useState(15);

  // 1. Cargar datos de Agua
  useEffect(() => {
    api.get('/water/districts/')
      .then(res => setWaterDistricts(res.data))
      .catch(err => console.error("Error API agua:", err));
  }, []);

  // 2. Cargar datos de Aire
  useEffect(() => {
    api.get('/air/districts/')
      .then(res => setAirDistricts(res.data))
      .catch(err => console.error("Error API aire:", err));
  }, []);

  // Handlers
  const handleSelectWater = (id) => {
    api.get(`/water/metrics/?district_id=${id}`)
      .then(res => setSelectedWaterData(res.data));
  };

  const handleSelectAir = (id) => {
    api.get(`/air/metrics/?district_id=${id}`)
      .then(res => setSelectedAirData(res.data));
  };

  return (
    <div className="min-h-screen w-full p-4 flex flex-col gap-4 bg-slate-950 text-slate-100">
      
      {/* HEADER CON PESTAÑAS */}
      <header className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-6">
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Monitor Urbano
          </span>
          
          {/* BOTONES DE PESTAÑA */}
          <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setActiveTab('water')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'water' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              💧 Agua
            </button>
            <button
              onClick={() => setActiveTab('air')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'air' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌫️ Calidad del Aire
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-300">
          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/50">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>API Conectada</span>
          </div>
        </div>
      </header>

      {/* CONTENIDO SEGÚN PESTAÑA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        
        {/* ================= PESTAÑA: AGUA ================= */}
        {activeTab === 'water' && (
          <>
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="h-[450px] w-full">
                <MapView districts={waterDistricts} onSelectDistrict={handleSelectWater} />
              </div>
              <div className="h-[280px] w-full">
                <WaterChart data={selectedWaterData} />
              </div>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-4">
               {/* Lista de Agua (Igual que antes) */}
               <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md flex-1 overflow-y-auto">
                <h3 className="text-sm font-bold text-slate-200 mb-3">Distritos (Agua)</h3>
                <div className="space-y-2">
                  {waterDistricts.map((d) => (
                    <div key={d.id} onClick={() => handleSelectWater(d.id)} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700/30">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${d.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                        <span className="text-sm font-medium text-slate-200">{d.district_name}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">{d.variance}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= PESTAÑA: AIRE ================= */}
        {activeTab === 'air' && (
          <>
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="h-[450px] w-full">
                <AirMapView districts={airDistricts} onSelectDistrict={handleSelectAir} />
              </div>
              <div className="h-[280px] w-full">
                <AirChart data={selectedAirData} />
              </div>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Slider "What-If" para el Aire */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-300">Simulador: Reducción de Tráfico Aéreo</span>
                  <span className="text-cyan-400 font-bold">-{threshold}%</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Ajusta para ver el impacto estimado en la calidad del aire.</p>
                <input type="range" min="0" max="50" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-full accent-cyan-400 cursor-pointer" />
              </div>

              {/* Lista de Aire */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md flex-1 overflow-y-auto">
                <h3 className="text-sm font-bold text-slate-200 mb-3">Distritos (Calidad del Aire)</h3>
                <div className="space-y-2">
                  {airDistricts.map((d) => (
                    <div key={d.id} onClick={() => handleSelectAir(d.id)} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700/30">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${
                          d.status === 'critical' ? 'bg-rose-500' : 
                          d.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}></span>
                        <span className="text-sm font-medium text-slate-200">{d.district_name}</span>
                      </div>
                      <span className={`text-xs font-semibold ${
                          d.status === 'critical' ? 'text-rose-400' : 
                          d.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>{d.variance}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}