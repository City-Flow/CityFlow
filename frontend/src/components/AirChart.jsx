// src/components/AirChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export function AirChart({ data, reduction = 0 }) {
  if (!data || !data.historical_data || data.historical_data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-700">
        <p>Selecciona un distrito para ver la calidad del aire</p>
      </div>
    );
  }

  const factor = 1 - (reduction / 100);
  const predictions = data.predictions || [];

  const chartData = [
    ...data.historical_data.map(item => ({ time: item.time, no2: item.no2, pm10: item.pm10 })),
    ...predictions.map(item => ({ 
      time: item.time, 
      pred_no2: +(item.predicted_no2 * factor).toFixed(2), 
      pred_pm10: +(item.predicted_pm10 * factor).toFixed(2) 
    }))
  ];

  return (
    <div className="h-full bg-slate-900/80 p-4 rounded-xl border border-slate-700 shadow-lg flex flex-col">
      <h3 className="text-lg font-bold text-slate-100 mb-2">
        Calidad del Aire: <span className="text-cyan-400">{data.district_name}</span>
        {reduction > 0 && (
          <span className="ml-2 text-sm text-amber-400">(Simulación: -{reduction}%)</span>
        )}
      </h3>
      
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={60} />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
            <Legend />
            
            {/* 🆕 LÍNEAS DE LÍMITE LEGAL */}
            <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" ifOverflow="extendDomain" label={{ position: 'top', value: 'Límite NO2 (40)', fill: '#ef4444', fontSize: 10 }} />
            <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" ifOverflow="extendDomain" label={{ position: 'top', value: 'Límite PM10 (50)', fill: '#f59e0b', fontSize: 10 }} />

            <Line type="monotone" dataKey="no2" stroke="#ef4444" strokeWidth={2} name="NO₂ Real" dot={false} />
            <Line type="monotone" dataKey="pm10" stroke="#f59e0b" strokeWidth={2} name="PM10 Real" dot={false} />
            <Line type="monotone" dataKey="pred_no2" stroke="#ef4444" strokeDasharray="5 5" name="Predicción NO₂" dot={false} />
            <Line type="monotone" dataKey="pred_pm10" stroke="#f59e0b" strokeDasharray="5 5" name="Predicción PM10" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}