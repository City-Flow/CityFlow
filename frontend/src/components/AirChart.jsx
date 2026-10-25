// src/components/AirChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AirChart({ data }) {
  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-700">
        <p>Selecciona un distrito para ver la calidad del aire</p>
      </div>
    );
  }

  // Combinar histórico y predicciones para el gráfico
  const chartData = [
    ...data.historical_data.map(item => ({ time: item.time, no2: item.no2, pm10: item.pm10 })),
    ...data.predictions.map(item => ({ time: item.time, pred_no2: item.predicted_no2, pred_pm10: item.predicted_pm10 }))
  ];

  return (
    <div className="h-full bg-slate-900/80 p-4 rounded-xl border border-slate-700 shadow-lg flex flex-col">
      <h3 className="text-lg font-bold text-slate-100 mb-2">
        Calidad del Aire: <span className="text-cyan-400">{data.district_name}</span>
      </h3>
      
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
            <Legend />
            {/* Histórico (Líneas Sólidas) */}
            <Line type="monotone" dataKey="no2" stroke="#ef4444" strokeWidth={2} name="NO₂ Real" />
            <Line type="monotone" dataKey="pm10" stroke="#f59e0b" strokeWidth={2} name="PM10 Real" />
            
            {/* Predicción (Líneas Discontinuas) */}
            <Line type="monotone" dataKey="pred_no2" stroke="#ef4444" strokeDasharray="5 5" name="Predicción NO₂" />
            <Line type="monotone" dataKey="pred_pm10" stroke="#f59e0b" strokeDasharray="5 5" name="Predicción PM10" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}