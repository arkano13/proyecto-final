import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import crearStyles from '../estilos/BitacoraStyles';
import SelectorUsuario from '../componentes/SelectorUsuario';
import { useTema } from '../context/TemaContext';
import { API_URLS } from '../config/config';

function hace30DiasISO() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}
function hoyISO() {
  return new Date().toISOString().split('T')[0];
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatearFecha(fechaTexto) {
  if (!fechaTexto) return { fecha: '', hora: '' };
  const partes = String(fechaTexto).split(/[ T]/);
  const fechaParte = partes[0] || '';
  const horaParte = (partes[1] || '').slice(0, 5);

  const [anio, mes, dia] = fechaParte.split('-');
  const nombreMes = MESES[Number(mes) - 1] || mes;

  return {
    fecha: dia && nombreMes ? `${dia} ${nombreMes} ${anio}` : fechaParte,
    hora: horaParte,
  };
}

function estiloAccion(accion) {
  const texto = String(accion || '').toUpperCase();

  if (
    texto.includes('FALLIDO') ||
    texto.includes('QUITAR') ||
    texto.includes('ERROR') ||
    texto.includes('RECHAZ')
  ) {
    return {
      fila: 'filaFallido',
      icono: 'filaIconoFallido',
      nombreIcono: 'close-circle',
      colorClave: 'peligro',
    };
  }

  if (
    texto.includes('CONCEDER') ||
    texto.includes('EXITOSO') ||
    texto.includes('APROB') ||
    texto.includes('CREAR') ||
    texto.includes('REGISTR')
  ) {
    return {
      fila: 'filaExito',
      icono: 'filaIconoExito',
      nombreIcono: 'checkmark-circle',
      colorClave: 'exito',
    };
  }

  return {
    fila: 'filaNeutral',
    icono: 'filaIconoNeutral',
    nombreIcono: 'information-circle',
    colorClave: 'primario',
  };
}

export default function BitacoraScreen() {
  const { colores } = useTema();
  const styles = crearStyles(colores);

  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null); // null = todos
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const resp = await fetch(API_URLS.LISTAR_USUARIOS);
        const data = await resp.json();
        if (data.exito) setUsuarios(data.usuarios);
      } catch (e) {
        // silencioso
      }
    };
    cargarUsuarios();
  }, []);

  const buscar = useCallback(async (usuario) => {
    setCargando(true);
    setError('');
    try {
      const resp = await fetch(API_URLS.FILTRAR_BITACORA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha_inicial: hace30DiasISO(),
          fecha_final: hoyISO(),
          usuario_id: usuario ? usuario.usuario_id : '',
        }),
      });
      const data = await resp.json();

      if (data.status === 'error') {
        setError(data.message);
        setRegistros([]);
      } else {
        setRegistros(data.data || []);
      }
    } catch (e) {
      setError('No se pudo conectar con el servidor.');
      setRegistros([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    buscar(usuarioSeleccionado);
  }, [usuarioSeleccionado]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIconoContainer}>
          <Ionicons name="time" size={24} color={colores.primarioTexto} />
        </View>
        <View style={styles.headerTextos}>
          <Text style={styles.headerTitulo}>Bitácora</Text>
          <Text style={styles.headerSub}>Últimos 30 días</Text>
        </View>
      </View>

      <Text style={styles.seccionTitulo}>Filtrar por usuario</Text>

      <SelectorUsuario
        colores={colores}
        usuarios={usuarios}
        usuarioSeleccionado={usuarioSeleccionado}
        onSeleccionar={setUsuarioSeleccionado}
        permitirTodos
        placeholder="Filtrar por usuario"
      />

      <Text style={styles.seccionTitulo}>Actividad</Text>

      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator color={colores.primario} />
        </View>
      ) : error ? (
        <View style={styles.vacioContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={colores.peligro} />
          <Text style={styles.vacioTexto}>{error}</Text>
        </View>
      ) : registros.length === 0 ? (
        <View style={styles.vacioContainer}>
          <Ionicons name="document-text-outline" size={40} color={colores.textoSecundario} />
          <Text style={styles.vacioTexto}>No hay registros todavía.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {registros.map((r) => {
            const nombreUsuario = r.usuario_nombrecomp || r.usuario_nombre || `Usuario #${r.usuario_id}`;
            const { fecha, hora } = formatearFecha(r.bitacora_fecha);
            const estilo = estiloAccion(r.bitacora_accion);

            return (
              <View key={r.bitacora_id} style={[styles.fila, styles[estilo.fila]]}>
                <View style={[styles.filaIconoContainer, styles[estilo.icono]]}>
                  <Ionicons
                    name={estilo.nombreIcono}
                    size={20}
                    color={colores[estilo.colorClave]}
                  />
                </View>

                <View style={styles.filaTextos}>
                  <Text style={styles.accion}>{r.bitacora_accion}</Text>
                  <Text style={styles.nombreUsuario}>{nombreUsuario}</Text>
                </View>

                <View style={styles.filaDerecha}>
                  <Text style={styles.fecha}>{fecha}</Text>
                  <Text style={styles.hora}>{hora}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}