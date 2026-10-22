import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/UseAuth';
import { Activity, LogOut, User, ShieldAlert } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg backdrop-blur-md bg-opacity-90">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors">
        <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
        <span>CityFlow</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
          <ShieldAlert className="w-4 h-4" />
          <span>Monitor</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
            <Link to="/account" className="flex items-center gap-2 text-sm text-slate-200 hover:text-cyan-400 transition-colors">
              <User className="w-4 h-4 text-cyan-400" />
              <span>{user.username}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 border border-slate-700 hover:border-rose-800 text-slate-300 px-3 py-1.5 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
            <Link
              to="/login"
              className="text-sm text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-1.5 rounded-lg shadow-md shadow-cyan-500/20 transition-all"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};