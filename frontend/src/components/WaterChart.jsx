import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function WaterChart({ data }) {
  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-700">
        <p>Selecciona un distrito en el mapa para ver los detalles</p>
      </div>
    );
  }

  // Combinar datos históricos y predicciones para el gráfico
  const chartData = [
    ...data.historical_data.map(item => ({ time: item.time, consumo: item.consumption, tipo: 'Histórico' })),
    ...data.predictions.map(item => ({ time: item.time, prediccion: item.predicted_consumption, tipo: 'Predicción' }))
  ];

  return (
    <div className="h-full bg-slate-900/80 p-4 rounded-xl border border-slate-700 shadow-lg flex flex-col">
      <h3 className="text-lg font-bold text-slate-100 mb-2">
        Consumo de Agua: <span className="text-cyan-400">{data.district_name}</span>
      </h3>
      
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
            />
            <Legend />
            <Line type="monotone" dataKey="consumo" stroke="#38bdf8" strokeWidth={2} name="Consumo Real (m³)" />
            <Line type="monotone" dataKey="prediccion" stroke="#c084fc" strokeWidth={2} strokeDasharray="5 5" name="Predicción (m³)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}