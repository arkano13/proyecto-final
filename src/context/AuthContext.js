import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [modulosPermitidos, setModulosPermitidos] = useState([]); // array de modulo_codigo

  const iniciarSesion = (datosUsuario, modulos) => {
    setUsuario(datosUsuario);
    setModulosPermitidos(modulos.map(m => m.modulo_codigo));
  };

  const actualizarModulos = (modulos) => {
    setModulosPermitidos(modulos.map(m => m.modulo_codigo));
  };

  const actualizarFoto = (urlFoto) => {
    setUsuario((prev) => (prev ? { ...prev, foto: urlFoto } : prev));
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setModulosPermitidos([]);
  };

  const tieneAcceso = (modulo_codigo) => modulosPermitidos.includes(modulo_codigo);

  return (
    <AuthContext.Provider value={{
      usuario, modulosPermitidos, iniciarSesion, actualizarModulos, actualizarFoto, cerrarSesion, tieneAcceso
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);