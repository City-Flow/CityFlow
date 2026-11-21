import { Link } from "react-router-dom";
import {
  ArrowRight,
  Droplets,
  Wind,
  Building2,
  Layers,
  Radio,
  Database,
  Gauge,
  BellRing,
  CloudDownload,
  LineChart,
  MonitorDot,
} from "lucide-react";

const MODULES = [
  {
    icon: Droplets,
    tone: "text-sky-400",
    ring: "bg-sky-500/10 ring-sky-400/30",
    title: "Agua",
    desc: "Consumo histórico y por distrito, detección de anomalías nocturnas y sostenibilidad del recurso hídrico.",
  },
  {
    icon: Wind,
    tone: "text-emerald-400",
    ring: "bg-emerald-500/10 ring-emerald-400/30",
    title: "Calidad del Aire",
    desc: "Seguimiento de NO₂ y PM10, evaluación de umbrales ICA y alertas en tiempo real.",
  },
  {
    icon: Building2,
    tone: "text-amber-400",
    ring: "bg-amber-500/10 ring-amber-400/30",
    title: "Turismo",
    desc: "Densidad de viviendas de uso turístico (HUT) y presión de visitantes por barrio.",
  },
  {
    icon: Layers,
    tone: "text-cyan-400",
    ring: "bg-cyan-500/10 ring-cyan-400/30",
    title: "Vista Integrada",
    desc: "Correlación entre dominios urbanos y visión holística de cada distrito.",
  },
];

const PIPELINE = [
  {
    icon: Radio,
    title: "Telemetría e Ingesta WebSocket",
    desc: "Actualización instantánea mediante conectores ASGI.",
    stat: "< 1 s",
    label: "latencia",
  },
  {
    icon: Database,
    title: "Open Data BCN",
    desc: "Conjuntos oficiales históricos sincronizados automáticamente.",
    stat: "14",
    label: "fuentes activas",
  },
  {
    icon: Gauge,
    title: "Umbrales automáticos",
    desc: "Reglas ICA y de consumo evaluadas en cada lectura.",
    stat: "24/7",
    label: "evaluación",
  },
  {
    icon: BellRing,
    title: "Alertas en tiempo real",
    desc: "Notificación inmediata al equipo responsable.",
    stat: "10",
    label: "distritos",
  },
];

const STEPS = [
  {
    icon: CloudDownload,
    title: "Ingesta de Datos Abiertos",
    desc: "Recogemos datos de Open Data BCN y sensores urbanos de forma continua.",
  },
  {
    icon: LineChart,
    title: "Análisis y Umbrales",
    desc: "Normalizamos series, comparamos con el histórico y evaluamos umbrales.",
  },
  {
    icon: MonitorDot,
    title: "Alertas y Visualización",
    desc: "El monitor muestra mapas, índices e incidencias al instante.",
  },
];

const LIVE = [
  { d: "Ciutat Vella", v: "NO₂ 41 µg/m³", tone: "bg-amber-400", w: "78%" },
  { d: "Eixample", v: "NO₂ 38 µg/m³", tone: "bg-emerald-400", w: "64%" },
  { d: "Gràcia", v: "Agua +28%", tone: "bg-sky-400", w: "88%" },
  { d: "Sant Martí", v: "HUT 3,1%", tone: "bg-emerald-400", w: "42%" },
];

function SectionTitle({ eyebrow, title, sub }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-slate-400">{sub}</p>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="scroll-smooth text-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden py-10 lg:py-16">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              Red de Sensores · Barcelona
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Los recursos urbanos de Barcelona,{" "}
              <span className="text-cyan-400">en tiempo real</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-400">
              Agua, calidad del aire y presión turística en los 10 distritos.
              Datos de Open Data BCN, telemetría histórica y en vivo, y alertas
              instantáneas vía WebSocket.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_32px_-8px_rgba(34,211,238,0.8)] transition hover:bg-cyan-400"
              >
                Abrir Monitor <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#modulos"
                className="rounded-md border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                Explorar Módulos
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-100">
                Estado de la ciudad
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                En vivo
              </span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ["Índice", "72", "text-cyan-400"],
                ["NO₂ medio", "36,8", "text-emerald-400"],
                ["Pérdida agua", "4,8%", "text-sky-400"],
              ].map(([label, value, tone]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"
                >
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">
                    {label}
                  </p>
                  <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              {LIVE.map((r) => (
                <div key={r.d}>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200">{r.d}</span>
                    <span className="text-slate-400">{r.v}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${r.tone}`}
                      style={{ width: r.w }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              Alerta · Flujo nocturno anómalo en Gràcia Nord (hace 12 min)
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modulos" className="scroll-mt-20 border-t border-slate-800 py-20">
        <SectionTitle
          eyebrow="Módulos"
          title="Cuatro pilares de la ciudad resiliente"
          sub="Cada dominio con su propio análisis, conectado en una única vista."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-colors hover:border-cyan-400/40"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${m.ring}`}
                >
                  <Icon className={`h-5 w-5 ${m.tone}`} />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-100">
                  {m.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture */}
      <section
        id="arquitectura"
        className="scroll-mt-20 border-t border-slate-800 bg-slate-900/30 py-20"
      >
        <SectionTitle
          eyebrow="Arquitectura"
          title="Un pipeline de datos en tiempo real"
          sub="Procesamiento continuo de métricas urbanas, desde la fuente hasta tu pantalla."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6"
              >
                <Icon className="h-6 w-6 text-cyan-400" />
                <p className="mt-5 text-3xl font-bold text-cyan-400">{p.stat}</p>
                <p className="text-xs uppercase tracking-wider text-slate-400">
                  {p.label}
                </p>
                <h3 className="mt-4 font-semibold text-slate-100">{p.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="scroll-mt-20 border-t border-slate-800 py-20">
        <SectionTitle
          eyebrow="Cómo funciona"
          title="De los datos abiertos a la decisión"
          sub="Tres pasos, sin intervención manual."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
              >
                <span className="text-sm font-bold text-cyan-400">
                  0{i + 1}
                </span>
                <Icon className="mt-3 h-6 w-6 text-slate-100" />
                <h3 className="mt-4 text-lg font-semibold text-slate-100">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400">{s.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-6 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-8 sm:flex-row">
          <div>
            <h3 className="text-2xl font-bold text-slate-100">
              Empieza a monitorizar Barcelona hoy
            </h3>
            <p className="mt-1 text-slate-400">
              Accede al monitor en vivo o crea una cuenta para tu equipo.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/dashboard"
              className="rounded-md bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Abrir Monitor
            </Link>
            <Link
              to="/register"
              className="rounded-md border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="flex flex-col gap-4 py-8 text-sm text-slate-400 sm:flex-row sm:items-center">
          <span className="font-semibold text-cyan-400">CityFlow</span>
          <nav className="flex gap-5">
            <Link to="/dashboard" className="hover:text-slate-100">
              Monitor
            </Link>
            <Link to="/login" className="hover:text-slate-100">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="hover:text-slate-100">
              Registrarse
            </Link>
          </nav>
          <span className="sm:ml-auto">
            Datos: Open Data BCN · Ajuntament de Barcelona
          </span>
        </div>
      </footer>
    </div>
  );
}