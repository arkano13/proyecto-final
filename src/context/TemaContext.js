import React, {
  createContext,
  useContext,
  useState,
} from "react";

import {
  API_URLS,
} from "../config/config";

const TemaContext =
  createContext(null);

const coloresClaros = {
  oscuro: false,

  primario: "#2563eb",
  primarioClaro: "#dbeafe",
  primarioTexto: "#ffffff",

  fondo: "#f8fafc",
  tarjeta: "#ffffff",
  campo: "#f8fafc",

  textoPrincipal: "#0f172a",
  textoSecundario: "#64748b",
  textoClaro: "#ffffff",

  borde: "#e2e8f0",

  exito: "#16a34a",
  exitoClaro: "#dcfce7",

  peligro: "#dc2626",
  peligroClaro: "#fee2e2",

  advertencia: "#d97706",
  advertenciaClaro: "#fef3c7",

  encabezado: "#ffffff",
  barraEstado: "#2563eb",
};

const coloresOscuros = {
  oscuro: true,

  primario: "#60a5fa",
  primarioClaro: "#1e3a5f",
  primarioTexto: "#ffffff",

  fondo: "#0f172a",
  tarjeta: "#1e293b",
  campo: "#0f172a",

  textoPrincipal: "#f8fafc",
  textoSecundario: "#94a3b8",
  textoClaro: "#ffffff",

  borde: "#334155",

  exito: "#4ade80",
  exitoClaro: "#14532d",

  peligro: "#f87171",
  peligroClaro: "#7f1d1d",

  advertencia: "#fbbf24",
  advertenciaClaro: "#78350f",

  encabezado: "#1e293b",
  barraEstado: "#0f172a",
};

export function TemaProvider({
  children,
}) {
  /*
   * Antes de iniciar sesión siempre
   * utilizamos el tema claro.
   */
  const [
    temaOscuro,
    setTemaOscuro,
  ] = useState(false);

  /*
   * Identifica al usuario que tiene
   * la sesión abierta.
   */
  const [
    usuarioId,
    setUsuarioId,
  ] = useState(null);

  /*
   * Se ejecuta después de iniciar
   * sesión y recibe los datos del
   * usuario enviados por login.php.
   */
  const cargarTemaUsuario = (
    usuario
  ) => {
    const id = Number(
      usuario?.id ||
        usuario?.usuario_id ||
        0
    );

    const tema = String(
      usuario?.tema ||
        usuario?.usuario_tema ||
        "claro"
    ).toLowerCase();

    setUsuarioId(id || null);

    setTemaOscuro(
      tema === "oscuro"
    );
  };

  /*
   * Se ejecutará al cerrar sesión.
   * Regresa la aplicación al tema
   * claro y elimina el usuario activo.
   */
  const limpiarTemaUsuario =
    () => {
      setUsuarioId(null);
      setTemaOscuro(false);
    };

  /*
   * Cambia el tema en la pantalla
   * y lo guarda en MySQL.
   */
  const establecerTema =
    async (valor) => {
      const temaAnterior =
        temaOscuro;

      const nuevoValor =
        Boolean(valor);

      const nuevoTema =
        nuevoValor
          ? "oscuro"
          : "claro";

      /*
       * Cambiar inmediatamente para
       * que el interruptor responda.
       */
      setTemaOscuro(
        nuevoValor
      );

      /*
       * Si aún no hay sesión solamente
       * cambiamos el estado local.
       */
      if (!usuarioId) {
        return true;
      }

      try {
        const respuesta =
          await fetch(
            API_URLS.ACTUALIZAR_TEMA,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body: JSON.stringify({
                usuario_id:
                  usuarioId,

                tema: nuevoTema,
              }),
            }
          );

        const texto =
          await respuesta.text();

        let datos;

        try {
          datos =
            JSON.parse(texto);
        } catch (errorJson) {
          throw new Error(
            "El servidor respondió incorrectamente."
          );
        }

        if (
          !respuesta.ok ||
          (!datos.exito &&
            !datos.success)
        ) {
          throw new Error(
            datos.mensaje ||
              "No se pudo guardar el tema."
          );
        }

        return true;
      } catch (error) {
        /*
         * Si el servidor falla,
         * regresamos al tema anterior.
         */
        setTemaOscuro(
          temaAnterior
        );

        console.error(
          "Error al guardar el tema:",
          error
        );

        return false;
      }
    };

  /*
   * Recibe directamente el valor
   * enviado por el componente Switch.
   */
  const cambiarTema =
    async (valor) => {
      const nuevoValor =
        typeof valor ===
        "boolean"
          ? valor
          : !temaOscuro;

      return establecerTema(
        nuevoValor
      );
    };

  const colores =
    temaOscuro
      ? coloresOscuros
      : coloresClaros;

  return (
    <TemaContext.Provider
      value={{
        temaOscuro,
        colores,
        cambiarTema,
        establecerTema,
        cargarTemaUsuario,
        limpiarTemaUsuario,
      }}
    >
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  const contexto =
    useContext(TemaContext);

  if (!contexto) {
    throw new Error(
      "useTema debe utilizarse dentro de TemaProvider."
    );
  }

  return contexto;
}