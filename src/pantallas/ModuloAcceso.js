import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Switch, ActivityIndicator, TouchableOpacity
} from 'react-native';
import styles from '../estilos/ModuloAccesoStyles';
import { COLORES } from '../estilos/globales';
import { API_URLS } from '../config/config';
import { useAuth } from '../context/AuthContext';
import { registrarBitacora } from '../utils/bitacora';

export default function ModuloAcceso({ navigation }) {
  const { usuario: usuarioSesion, actualizarModulos } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [cargandoModulos, setCargandoModulos] = useState(false);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const resp = await fetch(API_URLS.LISTAR_USUARIOS);
        const data = await resp.json();
        if (data.exito) {
          setUsuarios(data.usuarios);
        }
      } catch (e) {
        // silencioso: si falla, la lista queda vacía y se ve el mensaje de "no hay usuarios"
      } finally {
        setCargandoUsuarios(false);
      }
    };
    cargarUsuarios();
  }, []);

  const cargarModulos = useCallback(async (usuario_id) => {
    setCargandoModulos(true);
    try {
      const resp = await fetch(API_URLS.CONSULTAR_ACCESOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id }),
      });
      const data = await resp.json();
      if (data.exito) {
        setModulos(data.modulos);
      }
    } catch (e) {
      setModulos([]);
    } finally {
      setCargandoModulos(false);
    }
  }, []);

  const seleccionarUsuario = (u) => {
    setUsuarioSeleccionado(u);
    cargarModulos(u.usuario_id);
  };

  const toggleAcceso = async (modulo, nuevoValor) => {
    // Actualización optimista: cambia en pantalla antes de esperar al servidor
    setModulos((prev) =>
      prev.map((m) =>
        m.modulo_codigo === modulo.modulo_codigo
          ? { ...m, acceso_estado: nuevoValor ? 1 : 0 }
          : m
      )
    );

    try {
      const resp = await fetch(API_URLS.GUARDAR_ACCESO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuarioSeleccionado.usuario_id,
          modulo_codigo: modulo.modulo_codigo,
          acceso_estado: nuevoValor ? 1 : 0,
        }),
      });
      const data = await resp.json();

      if (!data.exito) {
        // Si falla en el servidor, revertimos el cambio visual
        setModulos((prev) =>
          prev.map((m) =>
            m.modulo_codigo === modulo.modulo_codigo
              ? { ...m, acceso_estado: nuevoValor ? 0 : 1 }
              : m
          )
        );
        registrarBitacora(
          usuarioSesion?.id,
          nuevoValor ? 'CONCEDER_ACCESO' : 'QUITAR_ACCESO',
          'tbl_acceso_final',
          `${usuarioSeleccionado.usuario_id}-${modulo.modulo_codigo}`,
          'FALLIDO'
        );
        return;
      }

      // Solo se registra como EXITOSO si el servidor confirmó el guardado
      registrarBitacora(
        usuarioSesion?.id,
        nuevoValor ? 'CONCEDER_ACCESO' : 'QUITAR_ACCESO',
        'tbl_acceso_final',
        `${usuarioSeleccionado.usuario_id}-${modulo.modulo_codigo}`,
        'EXITOSO'
      );

      // Si el admin se está editando accesos a sí mismo, refresca su sesión al instante
      if (usuarioSesion && usuarioSeleccionado.usuario_id === usuarioSesion.id) {
        const modulosActualizados = modulos.map((m) =>
          m.modulo_codigo === modulo.modulo_codigo
            ? { ...m, acceso_estado: nuevoValor ? 1 : 0 }
            : m
        );
        actualizarModulos(modulosActualizados.filter((m) => m.acceso_estado === 1));
      }
    } catch (e) {
      setModulos((prev) =>
        prev.map((m) =>
          m.modulo_codigo === modulo.modulo_codigo
            ? { ...m, acceso_estado: nuevoValor ? 0 : 1 }
            : m
        )
      );
      registrarBitacora(
        usuarioSesion?.id,
        nuevoValor ? 'CONCEDER_ACCESO' : 'QUITAR_ACCESO',
        'tbl_acceso_final',
        `${usuarioSeleccionado.usuario_id}-${modulo.modulo_codigo}`,
        'FALLIDO'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>🔐 Módulo de Acceso</Text>
        <Text style={styles.headerSub}>Concede o quita acceso por usuario</Text>
      </View>

      <Text style={styles.seccionTitulo}>Selecciona un usuario</Text>

      {cargandoUsuarios ? (
        <ActivityIndicator style={{ marginTop: 10 }} color={COLORES.primario} />
      ) : usuarios.length === 0 ? (
        <Text style={styles.vacioTexto}>No hay usuarios registrados todavía.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ maxHeight: 60 }}
          contentContainerStyle={styles.usuariosScroll}
        >
          {usuarios.map((u) => {
            const activo = usuarioSeleccionado?.usuario_id === u.usuario_id;
            return (
              <TouchableOpacity
                key={u.usuario_id}
                style={[styles.usuarioChip, activo && styles.usuarioChipActivo]}
                onPress={() => seleccionarUsuario(u)}
              >
                <Text style={[styles.usuarioChipTexto, activo && styles.usuarioChipTextoActivo]}>
                  {u.usuario_nombrecomp || u.usuario_nombre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {usuarioSeleccionado && (
        <>
          <Text style={styles.seccionTitulo}>
            Módulos de {usuarioSeleccionado.usuario_nombrecomp || usuarioSeleccionado.usuario_nombre}
          </Text>

          {cargandoModulos ? (
            <View style={styles.centrado}>
              <ActivityIndicator color={COLORES.primario} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.moduloContainer}>
              {modulos.map((m) => (
                <View key={m.modulo_codigo} style={styles.moduloItem}>
                  <View>
                    <Text style={styles.moduloNombre}>{m.modulo_nombre}</Text>
                    <Text style={styles.moduloCodigo}>{m.modulo_codigo}</Text>
                  </View>
                  <Switch
                    value={!!m.acceso_estado}
                    onValueChange={(valor) => toggleAcceso(m, valor)}
                    trackColor={{ false: COLORES.borde, true: COLORES.primarioClaro }}
                    thumbColor={m.acceso_estado ? COLORES.primario : '#f4f3f4'}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}