import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Coordenadas centrales de Barcelona
const BCN_CENTER = [41.3851, 2.1734];

// Coordenadas fijas de referencia por distrito para evitar llamadas impuras en render
const DISTRICT_COORDS = {
  "Ciutat Vella": [41.3788, 2.1744],
  "Eixample": [41.3915, 2.1649],
  "Gràcia": [41.4036, 2.1553],
  "Sant Martí": [41.4124, 2.2013],
  "Sants-Montjuïc": [41.3727, 2.1511],
  "Nou Barris": [41.4428, 2.1774],
  "Les Corts": [41.3842, 2.1287],
  "Horta-Guinardó": [41.4243, 2.1622],
  "Sarrià-Sant Gervasi": [41.4011, 2.1341],
  "Sant Andreu": [41.4349, 2.1887]
};

function MapController({ center }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export function CityMap({ mode = "water", districts = [], onSelectDistrict }) {
  
  const getMarkerColor = (district, currentMode) => {
    if (currentMode === "water") {
      if (district.status === "critical") return "#f43f5e";
      if (district.status === "warning") return "#fbbf24";
      return "#34d399";
    }
    if (currentMode === "air") {
      if (district.status === "critical") return "#f43f5e";
      if (district.status === "warning") return "#fbbf24";
      return "#38bdf8";
    }
    if (currentMode === "tourism") {
      if (district.status === "critical") return "#f43f5e";
      if (district.status === "warning") return "#fbbf24";
      return "#a78bfa";
    }
    if (district.riskLevel === "Crítico") return "#f43f5e";
    if (district.riskLevel === "Alto") return "#fbbf24";
    return "#38bdf8";
  };

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-800 relative z-0">
      <MapContainer
        center={BCN_CENTER}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: "#020617" }}
      >
        <MapController center={BCN_CENTER} />
        
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />

        {districts.map((d, index) => {
          const districtName = d.name || d.district_name;
          // Obtener coordenadas fijas o usar una alternativa determinista basada en el índice
          const coords = d.coords || DISTRICT_COORDS[districtName] || [
            BCN_CENTER[0] + (index * 0.015 - 0.04),
            BCN_CENTER[1] + ((index % 3) * 0.015 - 0.02)
          ];
          
          const color = getMarkerColor(d, mode);

          return (
            <CircleMarker
              key={d.id || index}
              center={coords}
              radius={mode === "integrated" ? 14 : 10}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.6,
                weight: 2,
              }}
              eventHandlers={{
                click: () => {
                  if (onSelectDistrict) onSelectDistrict(d.id);
                },
              }}
            >
              <Popup>
                <div className="p-1 text-slate-900 font-sans">
                  <span className="font-bold text-sm block">{districtName}</span>
                  {mode === "water" && <span className="text-xs text-slate-600 block">Variación Agua: {d.variance || "+0.0%"}</span>}
                  {mode === "air" && <span className="text-xs text-slate-600 block">Calidad: {d.status}</span>}
                  {mode === "tourism" && <span className="text-xs text-slate-600 block">Ocupación: {d.occupancy}</span>}
                  {mode === "integrated" && <span className="text-xs text-slate-600 block">Riesgo Global: {d.riskLevel}</span>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-700/60 p-2 rounded-lg text-[10px] text-slate-300 z-400 backdrop-blur-sm shadow-lg">
        <span className="font-bold block mb-1 uppercase text-cyan-400">Capa: {mode.toUpperCase()}</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Normal / Óptimo
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Alerta
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Crítico
        </div>
      </div>
    </div>
  );
}