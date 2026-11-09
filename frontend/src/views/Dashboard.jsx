// src/views/Dashboard.jsx
import { useState, useEffect } from "react";
import { MapView } from "../components/MapView";
import { WaterChart } from "../components/WaterChart";
import { AirMapView } from "../components/AirMapView";
import { AirChart } from "../components/AirChart";
import api from "../services/api";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("water"); // 'water' o 'air'

  // Estados para Agua
  const [waterDistricts, setWaterDistricts] = useState([]);
  const [selectedWaterData, setSelectedWaterData] = useState(null);

  // Estados para Aire
  const [airDistricts, setAirDistricts] = useState([]);
  const [selectedAirData, setSelectedAirData] = useState(null);

  // Estado para datos meteorológicos (AEMET)
  const [weather] = useState({
    temp: 28.5,
    rainfall: 0.0,
    station: "AEMET Fabra",
  });

  // Thresholds de simulación
  const [waterThreshold, setWaterThreshold] = useState(15);
  const [trafficReduction, setTrafficReduction] = useState(20);
  const [selectedTime, setSelectedTime] = useState("09:00");

  // Event Logs (Agua y Aire)
  const [waterLogs, setWaterLogs] = useState([
    { id: 1, type: "WATER_ALERT", district: "Nou Barris", message: "Anomalía de consumo detectada por el modelo ML", time: "18:43" },
    { id: 2, type: "WATER_ALERT", district: "Les Corts", message: "Pico de consumo detectado por el modelo ML", time: "18:43" }
  ]);

  const [airLogs, setAirLogs] = useState([
    { id: 1, type: "AIR_QUALITY_ALERT", district: "Eixample", message: "Elevada concentración de NO2 detectada", time: "18:30" },
    { id: 2, type: "AIR_QUALITY_ALERT", district: "Ciutat Vella", message: "Nivel moderado de PM10 en la zona urbana", time: "17:15" }
  ]);

  // 1. Cargar datos de Agua
  useEffect(() => {
    api
      .get("/water/districts/")
      .then((res) => setWaterDistricts(res.data))
      .catch((err) => console.error("Error API agua:", err));
  }, []);

  // 2. Cargar datos de Aire
  useEffect(() => {
    api
      .get("/air/districts/")
      .then((res) => setAirDistricts(res.data))
      .catch((err) => console.error("Error API aire:", err));
  }, []);

  // Handlers
  const handleSelectWater = (id) => {
    api
      .get(`/water/metrics/?district_id=${id}`)
      .then((res) => setSelectedWaterData(res.data));
  };

  const handleSelectAir = (id) => {
    api
      .get(`/air/metrics/?district_id=${id}`)
      .then((res) => setSelectedAirData(res.data));
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

  // Contadores de estado
  const waterCounts = {
    normal: waterDistricts.filter((d) => d.status === "normal" || !d.status).length,
    warning: waterDistricts.filter((d) => d.status === "warning").length,
    critical: waterDistricts.filter((d) => d.status === "critical").length,
  };

  const airCounts = {
    normal: airDistricts.filter((d) => d.status === "normal" || !d.status).length,
    warning: airDistricts.filter((d) => d.status === "warning").length,
    critical: airDistricts.filter((d) => d.status === "critical").length,
  };

  return (
    <div className="min-h-screen w-full p-4 flex flex-col gap-4 bg-slate-950 text-slate-100 font-sans">
      
      {/* HEADER CON PESTAÑAS */}
      <header className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              CityFlow — Monitor Urbano
            </h1>
            <p className="text-xs text-slate-400">
              Monitoreo inteligente y detección de anomalías en Barcelona
            </p>
          </div>

          {/* BOTONES DE PESTAÑA */}
          <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setActiveTab("water")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "water"
                  ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              💧 Agua
            </button>
            <button
              onClick={() => setActiveTab("air")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "air"
                  ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🌫️ Calidad del Aire
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

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">Franja horaria</span>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="bg-transparent text-cyan-400 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="08:00">08:00</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
            </select>
          </div>

          <button
            onClick={activeTab === "water" ? handleSimulateWaterAlert : handleSimulateAirAlert}
            className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold transition-all"
          >
            ⚙️ Simular Anomalía
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>API Conectada</span>
          </div>
        </div>
      </header>

      {/* CONTENIDO SEGÚN PESTAÑA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        
        {/* ================= PESTAÑA: AGUA ================= */}
        {activeTab === "water" && (
          <>
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
        )}

        {/* ================= PESTAÑA: AIRE ================= */}
        {activeTab === "air" && (
          <>
            {/* Izquierda: Mapa de Aire & Gráfico (8/12) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="h-105 w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-2 relative">
                <AirMapView
                  districts={airDistricts}
                  onSelectDistrict={handleSelectAir}
                />
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
        )}
      </div>
    </div>
  );
}