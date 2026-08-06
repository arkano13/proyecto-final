import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

const TemaContext = createContext(null);

const CLAVE_TEMA = 'rentafacil_tema_oscuro';

const coloresClaros = {
  oscuro: false,

  primario: '#2563eb',
  primarioClaro: '#dbeafe',
  primarioTexto: '#ffffff',

  fondo: '#f8fafc',
  tarjeta: '#ffffff',
  campo: '#f8fafc',

  textoPrincipal: '#0f172a',
  textoSecundario: '#64748b',
  textoClaro: '#ffffff',

  borde: '#e2e8f0',

  exito: '#16a34a',
  exitoClaro: '#dcfce7',

  peligro: '#dc2626',
  peligroClaro: '#fee2e2',

  advertencia: '#d97706',
  advertenciaClaro: '#fef3c7',

  encabezado: '#ffffff',
  barraEstado: '#2563eb',
};

const coloresOscuros = {
  oscuro: true,

  primario: '#60a5fa',
  primarioClaro: '#1e3a5f',
  primarioTexto: '#ffffff',

  fondo: '#0f172a',
  tarjeta: '#1e293b',
  campo: '#0f172a',

  textoPrincipal: '#f8fafc',
  textoSecundario: '#94a3b8',
  textoClaro: '#ffffff',

  borde: '#334155',

  exito: '#4ade80',
  exitoClaro: '#14532d',

  peligro: '#f87171',
  peligroClaro: '#7f1d1d',

  advertencia: '#fbbf24',
  advertenciaClaro: '#78350f',

  encabezado: '#1e293b',
  barraEstado: '#0f172a',
};

export function TemaProvider({ children }) {
  const [temaOscuro, setTemaOscuro] =
    useState(false);

  useEffect(() => {
    cargarTemaGuardado();
  }, []);

  const cargarTemaGuardado = async () => {
    try {
      const temaGuardado =
        await AsyncStorage.getItem(CLAVE_TEMA);

      if (temaGuardado !== null) {
        setTemaOscuro(
          temaGuardado === 'true'
        );
      }
    } catch (error) {
      console.log(
        'Error al cargar el tema:',
        error
      );
    }
  };

  const establecerTema = async (valor) => {
    try {
      const nuevoValor = Boolean(valor);

      setTemaOscuro(nuevoValor);

      await AsyncStorage.setItem(
        CLAVE_TEMA,
        String(nuevoValor)
      );
    } catch (error) {
      console.log(
        'Error al guardar el tema:',
        error
      );
    }
  };

  const cambiarTema = async () => {
    const nuevoValor = !temaOscuro;
    await establecerTema(nuevoValor);
  };

  const colores = temaOscuro
    ? coloresOscuros
    : coloresClaros;

  return (
    <TemaContext.Provider
      value={{
        temaOscuro,
        colores,
        cambiarTema,
        establecerTema,
      }}
    >
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  const contexto = useContext(TemaContext);

  if (!contexto) {
    throw new Error(
      'useTema debe utilizarse dentro de TemaProvider.'
    );
  }

  return contexto;
}