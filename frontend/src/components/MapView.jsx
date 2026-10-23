import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Nota: A veces los iconos por defecto de Leaflet en React se desconfiguran, 
// pero esta estructura básica funcionará para renderizar las coordenadas.

export function MapView({ districts = [], onSelectDistrict }) {
  // Coordenadas centrales de Barcelona
  const barcelonaPosition = [41.3851, 2.1734];

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-lg border border-slate-700">
      <MapContainer 
        center={barcelonaPosition} 
        zoom={13} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        {/* Capa de diseño oscuro */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Iterar sobre los distritos de la API para poner marcadores */}
        {districts.map((district) => (
          <Marker 
            key={district.id} 
            position={[district.latitude, district.longitude]}
            eventHandlers={{
              click: () => {
                if (onSelectDistrict) {
                  onSelectDistrict(district.id);
                }
              }
            }}
          >
            <Popup>
              <div className="p-2 text-slate-900">
                <h3 className="font-bold text-base">{district.district_name}</h3>
                <p className="text-sm">Consumo: <strong>{district.current_consumption_m3} m³</strong></p>
                <p className="text-sm">Estado: <span className="uppercase font-semibold">{district.status}</span></p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}