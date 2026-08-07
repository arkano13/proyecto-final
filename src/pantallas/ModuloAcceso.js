import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Switch, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import crearStyles from '../estilos/ModuloAccesoStyles';
import SelectorUsuario from '../componentes/SelectorUsuario';
import { useTema } from '../context/TemaContext';
import { API_URLS } from '../config/config';
import { registrarBitacora } from '../utils/bitacora';

export default function ModuloAcceso({ navigation, route }) {
  const { colores } = useTema();
  const styles = crearStyles(colores);

  const usuarioSesion = route?.params?.usuario;

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
          usuarioSesion?.id || usuarioSesion?.usuario_id,
          nuevoValor ? 'CONCEDER_ACCESO' : 'QUITAR_ACCESO',
          'tbl_acceso_final',
          `${usuarioSeleccionado.usuario_id}-${modulo.modulo_codigo}`,
          'FALLIDO'
        );
        return;
      }

      // Solo se registra como EXITOSO si el servidor confirmó el guardado
      registrarBitacora(
        usuarioSesion?.id || usuarioSesion?.usuario_id,
        nuevoValor ? 'CONCEDER_ACCESO' : 'QUITAR_ACCESO',
        'tbl_acceso_final',
        `${usuarioSeleccionado.usuario_id}-${modulo.modulo_codigo}`,
        'EXITOSO'
      );
    } catch (e) {
      setModulos((prev) =>
        prev.map((m) =>
          m.modulo_codigo === modulo.modulo_codigo
            ? { ...m, acceso_estado: nuevoValor ? 0 : 1 }
            : m
        )
      );
      registrarBitacora(
        usuarioSesion?.id || usuarioSesion?.usuario_id,
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
        <View style={styles.headerIconoContainer}>
          <Ionicons name="lock-closed" size={24} color={colores.primarioTexto} />
        </View>
        <View style={styles.headerTextos}>
          <Text style={styles.headerTitulo}>Módulo de Acceso</Text>
          <Text style={styles.headerSub}>Concede o quita acceso por usuario</Text>
        </View>
      </View>

      <Text style={styles.seccionTitulo}>Selecciona un usuario</Text>

      {cargandoUsuarios ? (
        <ActivityIndicator style={{ marginTop: 10 }} color={colores.primario} />
      ) : usuarios.length === 0 ? (
        <View style={styles.vacioContainer}>
          <Ionicons name="people-outline" size={40} color={colores.textoSecundario} />
          <Text style={styles.vacioTexto}>No hay usuarios registrados todavía.</Text>
        </View>
      ) : (
        <SelectorUsuario
          colores={colores}
          usuarios={usuarios}
          usuarioSeleccionado={usuarioSeleccionado}
          onSeleccionar={seleccionarUsuario}
          placeholder="Selecciona un usuario"
        />
      )}

      {usuarioSeleccionado && (
        <>
          <Text style={styles.seccionTitulo}>Módulos disponibles</Text>

          {cargandoModulos ? (
            <View style={styles.centrado}>
              <ActivityIndicator color={colores.primario} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.moduloContainer}>
              {modulos.map((m) => {
                const activo = !!m.acceso_estado;
                return (
                  <View key={m.modulo_codigo} style={styles.moduloItem}>
                    <View
                      style={[
                        styles.moduloIconoContainer,
                        activo ? styles.moduloIconoActivo : styles.moduloIconoInactivo,
                      ]}
                    >
                      <Ionicons
                        name={activo ? 'checkmark-circle' : 'lock-closed-outline'}
                        size={20}
                        color={activo ? colores.exito : colores.textoSecundario}
                      />
                    </View>

                    <View style={styles.moduloTextos}>
                      <Text style={styles.moduloNombre}>{m.modulo_nombre}</Text>
                      <Text style={styles.moduloCodigo}>{m.modulo_codigo}</Text>
                    </View>

                    <Switch
                      value={activo}
                      onValueChange={(valor) => toggleAcceso(m, valor)}
                      trackColor={{ false: colores.borde, true: colores.primarioClaro }}
                      thumbColor={activo ? colores.primario : '#f4f3f4'}
                    />
                  </View>
                );
              })}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}