export const AuthFormCard = ({ title, subtitle, children, onSubmit, error, loading }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-lg">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white tracking-wide">{title}</h2>
        {subtitle && <p className="text-slate-400 text-sm mt-2">{subtitle}</p>}
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {children}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold py-2.5 rounded-lg shadow-lg shadow-cyan-500/20 transition-all duration-200 mt-2"
        >
          {loading ? 'Procesando...' : 'Continuar'}
        </button>
      </form>
    </div>
  );
};