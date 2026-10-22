import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/UseAuth';
import { AuthFormCard } from '../components/AuthFormCard';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/login');
    } catch (err) {
      console.error('Error en el registro:', err.response?.data || err);
      const serverErrors = err.response?.data;
      if (serverErrors && typeof serverErrors === 'object') {
        const messages = Object.entries(serverErrors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
          .join(' | ');
        setError(messages);
      } else {
        setError('No se pudo completar el registro. Intenta con otros datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <AuthFormCard
        title="Crear Cuenta"
        subtitle="Únete a la red de monitoreo urbano de Barcelona"
        onSubmit={handleSubmit}
        error={error}
        loading={loading}
      >
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Nombre Completo
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej. Dean Winchester"
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="usuario@cityflow.cat"
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Contraseña (Mínimo 8 caracteres)
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Confirmar Contraseña
          </label>
          <input
            type="password"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none transition-all text-sm"
          />
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </p>
      </AuthFormCard>
    </div>
  );
};