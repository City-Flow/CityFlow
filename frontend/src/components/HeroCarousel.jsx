import { useState, useEffect } from 'react';
import { Shield, Zap, Radio, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    icon: Shield,
    title: "Resiliencia Urbana en Tiempo Real",
    description: "Monitoreo integral de datos sensoriales y gestión preventiva de eventos climáticos para Barcelona.",
    badge: "Plataforma Activa"
  },
  {
    icon: Radio,
    title: "Telemetría e Ingesta WebSocket",
    description: "Procesamiento continuo de métricas urbanas con actualización instantánea mediante conectores ASGI.",
    badge: "Red de Sensores"
  },
  {
    icon: Zap,
    title: "Análisis de Movilidad y Tráfico",
    description: "Visualización geoespacial de flujos de transporte y alertas tempranas en infraestructura críticas.",
    badge: "Mapeo Geoespacial"
  }
];

export const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);

  const CurrentIcon = slides[current].icon;

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-8 overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto py-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 mb-6">
          {slides[current].badge}
        </span>

        <CurrentIcon className="w-16 h-16 text-cyan-400 mb-6 animate-bounce" />

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
          {slides[current].title}
        </h1>

        <p className="text-slate-400 text-lg leading-relaxed mb-8">
          {slides[current].description}
        </p>

        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === current ? "w-8 bg-cyan-400" : "w-2 bg-slate-700 hover:bg-slate-600"
              }`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 backdrop-blur-sm transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 backdrop-blur-sm transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};