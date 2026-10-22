import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/UseAuth';
import { AuthFormCard } from '../components/AuthFormCard';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error de inicio de sesión:', err.response?.data || err);
      const serverError = err.response?.data;
      if (serverError?.detail) {
        setError(serverError.detail);
      } else if (serverError && typeof serverError === 'object') {
        const messages = Object.entries(serverError)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
          .join(' | ');
        setError(messages);
      } else {
        setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <AuthFormCard
        title="Iniciar Sesión"
        subtitle="Accede a la plataforma de resiliencia urbana CityFlow"
        onSubmit={handleSubmit}
        error={error}
        loading={loading}
      >
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@cityflow.cat"
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Contraseña
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none transition-all text-sm"
          />
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-medium">
            Regístrate aquí
          </Link>
        </p>
      </AuthFormCard>
    </div>
  );
};