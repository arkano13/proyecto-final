import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import styles from '../estilos/BitacoraStyles';
import { COLORES } from '../estilos/globales';
import { API_URLS } from '../config/config';

function hace30DiasISO() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}
function hoyISO() {
  return new Date().toISOString().split('T')[0];
}

export default function BitacoraScreen() {
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
        <Text style={styles.headerTitulo}>📋 Bitácora</Text>
        <Text style={styles.headerSub}>Últimos 30 días</Text>
      </View>

      <Text style={styles.seccionTitulo}>Filtrar por usuario</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 50 }}
        contentContainerStyle={styles.usuariosScroll}
      >
        <TouchableOpacity
          style={[styles.usuarioChip, !usuarioSeleccionado && styles.usuarioChipActivo]}
          onPress={() => setUsuarioSeleccionado(null)}
        >
          <Text style={[styles.usuarioChipTexto, !usuarioSeleccionado && styles.usuarioChipTextoActivo]}>
            Todos
          </Text>
        </TouchableOpacity>
        {usuarios.map((u) => {
          const activo = usuarioSeleccionado?.usuario_id === u.usuario_id;
          return (
            <TouchableOpacity
              key={u.usuario_id}
              style={[styles.usuarioChip, activo && styles.usuarioChipActivo]}
              onPress={() => setUsuarioSeleccionado(u)}
            >
              <Text style={[styles.usuarioChipTexto, activo && styles.usuarioChipTextoActivo]}>
                {u.usuario_nombrecomp || u.usuario_nombre}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.seccionTitulo}>Acciones</Text>

      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator color={COLORES.primario} />
        </View>
      ) : error ? (
        <Text style={styles.vacioTexto}>{error}</Text>
      ) : registros.length === 0 ? (
        <Text style={styles.vacioTexto}>No hay registros todavía.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {registros.map((r) => {
            const nombreUsuario = r.usuario_nombrecomp || r.usuario_nombre || `Usuario #${r.usuario_id}`;
            return (
              <View key={r.bitacora_id} style={styles.fila}>
                <View>
                  <Text style={styles.accion}>{r.bitacora_accion}</Text>
                  <Text style={styles.nombreUsuario}>{nombreUsuario}</Text>
                </View>
                <Text style={styles.fecha}>{r.bitacora_fecha}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}