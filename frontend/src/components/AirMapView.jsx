// src/components/AirMapView.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export function AirMapView({ districts = [], onSelectDistrict }) {
  const barcelonaPosition = [41.3851, 2.1734];

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-lg border border-slate-700">
      <MapContainer center={barcelonaPosition} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {districts.map((district) => (
          <Marker 
            key={district.id} 
            position={[district.latitude, district.longitude]}
            eventHandlers={{ click: () => { if (onSelectDistrict) onSelectDistrict(district.id); } }}
          >
            <Popup>
              <div className="p-2 text-slate-900">
                <h3 className="font-bold text-base">{district.district_name}</h3>
                <p className="text-sm">NO₂: <strong>{district.current_no2} µg/m³</strong></p>
                <p className="text-sm">PM10: <strong>{district.current_pm10} µg/m³</strong></p>
                <p className="text-sm">Estado: <span className="uppercase font-semibold">{district.status}</span></p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}