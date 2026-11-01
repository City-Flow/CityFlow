import { useEffect, useState } from 'react';
import api from '../services/api';

export function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/users/me/')
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar el perfil:", err);
        setError("No se pudo cargar la información del usuario.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-400">
        Cargando perfil...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-10 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto w-full my-8 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl text-slate-100">
      
      {/* Header del Perfil */}
      <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-800">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-slate-950 shadow-md">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">{user?.name || 'Usuario'}</h2>
          <p className="text-sm text-slate-400">{user?.email}</p>
        </div>
      </div>

      {/* Detalles del Usuario */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Información de la cuenta
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
            <span className="block text-xs text-slate-400 mb-1">Rol de Usuario</span>
            <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
              {user?.role || 'Estándar'}
            </span>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
            <span className="block text-xs text-slate-400 mb-1">Estado</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {user?.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/30 sm:col-span-2">
            <span className="block text-xs text-slate-400 mb-1">Fecha de Registro</span>
            <span className="text-sm font-medium text-slate-200">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : '-'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}