import { useState } from "react";
import { WaterTab } from "../components/WaterTab";
import { AirTab } from "../components/AirTab";
import { TourismTab } from "../components/TourismTab";
import { IntegratedTab } from "../components/IntegratedTab";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("water"); // 'water', 'air', 'tourism', 'integrated'

  // Estado para datos meteorológicos (AEMET)
  const [weather] = useState({
    temp: 28.5,
    rainfall: 0.0,
    station: "AEMET Fabra",
  });

  const [selectedTime, setSelectedTime] = useState("09:00");

  return (
    <div className="min-h-screen w-full p-4 flex flex-col gap-4 bg-slate-950 text-slate-100 font-sans">
      
      {/* HEADER PRINCIPAL */}
      <header className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              CityFlow — Monitor Urbano
            </h1>
            <p className="text-xs text-slate-400">
              Monitoreo inteligente y plataforma de decisión para Barcelona
            </p>
          </div>

          {/* BOTONES DE PESTAÑA */}
          <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-700/50 flex-wrap gap-1">
            <button
              onClick={() => setActiveTab("water")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "water"
                  ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              💧 Agua
            </button>
            <button
              onClick={() => setActiveTab("air")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "air"
                  ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🌫️ Aire
            </button>
            <button
              onClick={() => setActiveTab("tourism")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "tourism" 
                  ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🏛️ Turismo
            </button>
            <button
              onClick={() => setActiveTab("integrated")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "integrated"
                  ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📊 Integrado
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Badge de Clima (AEMET) */}
          <div className="flex items-center gap-2.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="flex items-center gap-1 text-slate-200 font-medium">
              🌡️ {weather.temp} °C
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 text-cyan-400 font-medium">
              🌧️ {weather.rainfall} mm
            </span>
            <span className="text-[10px] text-slate-500 font-normal">
              ({weather.station})
            </span>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>API Conectada</span>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA ACTIVA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {activeTab === "water" && <WaterTab />}
        {activeTab === "air" && <AirTab />}
        
        {activeTab === "tourism" && <TourismTab />}

        {activeTab === "integrated" && <IntegratedTab />}
      </div>
    </div>
  );
}