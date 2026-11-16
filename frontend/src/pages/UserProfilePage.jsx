import { useState } from 'react';
import { useAuth } from '../context/UseAuth';
import { useNavigate } from 'react-router-dom';

export function UserProfilePage() {
  const { user: authUser, updateProfile, deleteAccount, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Estados para el modo de edición
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(authUser?.name || '');
  const [email, setEmail] = useState(authUser?.email || '');
  const [password, setPassword] = useState(''); // Opcional: solo si desea cambiar la contraseña

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');

    // Preparamos los datos a enviar (solo enviamos la contraseña si se ha escrito algo)
    const updateData = { name, email };
    if (password && password.trim() !== '') {
      if (password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.');
        return;
      }
      updateData.password = password;
    }

    try {
      await updateProfile(updateData);
      setSuccess('Perfil actualizado correctamente.');
      setIsEditing(false);
      setPassword(''); // Limpiamos el campo de contraseña
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);
      setError('Error al actualizar el perfil. Es posible que el correo ya esté en uso.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás segura de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      try {
        await deleteAccount();
        navigate('/login');
      } catch (err) {
        console.error("Error al eliminar la cuenta:", err);
        setError('Error al eliminar la cuenta.');
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-400">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto w-full my-8 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl text-slate-100">
      
      <h2 className="text-xl font-bold mb-4 text-cyan-400">Mi Perfil</h2>

      {error && <div className="bg-rose-500/20 border border-rose-500 text-rose-300 p-3 rounded-lg mb-4 text-sm">{error}</div>}
      {success && <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-3 rounded-lg mb-4 text-sm">{success}</div>}

      {!isEditing ? (
        <>
          {/* Header del Perfil */}
          <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-800">
            <div className="w-16 h-16 rounded-full bg-linear-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-slate-950 shadow-md">
              {authUser?.name ? authUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">{authUser?.name || 'Usuario'}</h3>
              <p className="text-sm text-slate-400">{authUser?.email}</p>
            </div>
          </div>

          {/* Detalles del Usuario */}
          <div className="space-y-4 mb-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Información de la cuenta
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
                <span className="block text-xs text-slate-400 mb-1">Rol de Usuario</span>
                <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                  {authUser?.role || 'Estándar'}
                </span>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
                <span className="block text-xs text-slate-400 mb-1">Estado</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {authUser?.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/30 sm:col-span-2">
                <span className="block text-xs text-slate-400 mb-1">Fecha de Registro</span>
                <span className="text-sm font-medium text-slate-200">
                  {authUser?.created_at ? new Date(authUser.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4 pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                setName(authUser?.name || '');
                setEmail(authUser?.email || '');
                setPassword('');
                setIsEditing(true);
              }}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-sm transition-all"
            >
              Editar Perfil
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold rounded-lg text-sm transition-all border border-rose-500/30"
            >
              Eliminar Cuenta
            </button>
          </div>
        </>
      ) : (
        /* Formulario de Edición Ampliado */
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-4 py-2.5 text-slate-100 outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-4 py-2.5 text-slate-100 outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nueva Contraseña <span className="text-slate-500 font-normal">(Opcional, déjalo en blanco si no deseas cambiarla)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-4 py-2.5 text-slate-100 outline-none text-sm"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-sm transition-all"
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-sm transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

    </div>
  );
}