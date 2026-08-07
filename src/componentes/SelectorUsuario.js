import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const iniciales = (nombre) => {
  const limpio = String(nombre || '').trim();
  if (!limpio) return '?';
  const partes = limpio.split(/\s+/);
  const primera = partes[0]?.[0] || '';
  const segunda = partes.length > 1 ? partes[1][0] : '';
  return (primera + segunda).toUpperCase();
};

export default function SelectorUsuario({
  colores,
  usuarios,
  usuarioSeleccionado,
  onSeleccionar,
  permitirTodos = false,
  placeholder = 'Selecciona un usuario',
}) {
  const [visible, setVisible] = useState(false);
  const styles = crearStyles(colores);

  const nombreMostrado = usuarioSeleccionado
    ? usuarioSeleccionado.usuario_nombrecomp || usuarioSeleccionado.usuario_nombre
    : permitirTodos
    ? 'Todos los usuarios'
    : placeholder;

  const elegir = (usuario) => {
    onSeleccionar(usuario);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.boton}
        onPress={() => setVisible(true)}
        activeOpacity={0.75}
      >
        <View style={styles.avatar}>
          {usuarioSeleccionado ? (
            <Text style={styles.avatarTexto}>
              {iniciales(usuarioSeleccionado.usuario_nombrecomp || usuarioSeleccionado.usuario_nombre)}
            </Text>
          ) : (
            <Ionicons name="people" size={16} color={colores.primario} />
          )}
        </View>

        <Text style={styles.textoBoton} numberOfLines={1}>
          {nombreMostrado}
        </Text>

        <Ionicons name="chevron-down" size={18} color={colores.textoSecundario} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContenido} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitulo}>{placeholder}</Text>

            <ScrollView style={styles.listaScroll}>
              {permitirTodos && (
                <TouchableOpacity
                  style={[
                    styles.opcion,
                    !usuarioSeleccionado && styles.opcionActiva,
                  ]}
                  onPress={() => elegir(null)}
                >
                  <View style={[styles.avatar, styles.avatarOpcion]}>
                    <Ionicons name="people" size={16} color={colores.primario} />
                  </View>
                  <Text
                    style={[
                      styles.opcionTexto,
                      !usuarioSeleccionado && styles.opcionTextoActivo,
                    ]}
                  >
                    Todos los usuarios
                  </Text>
                  {!usuarioSeleccionado && (
                    <Ionicons name="checkmark" size={18} color={colores.primario} />
                  )}
                </TouchableOpacity>
              )}

              {usuarios.map((u) => {
                const activo = usuarioSeleccionado?.usuario_id === u.usuario_id;
                return (
                  <TouchableOpacity
                    key={u.usuario_id}
                    style={[styles.opcion, activo && styles.opcionActiva]}
                    onPress={() => elegir(u)}
                  >
                    <View style={[styles.avatar, styles.avatarOpcion]}>
                      <Text style={styles.avatarTexto}>
                        {iniciales(u.usuario_nombrecomp || u.usuario_nombre)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.opcionTexto, activo && styles.opcionTextoActivo]}>
                        {u.usuario_nombrecomp || u.usuario_nombre}
                      </Text>
                      {!!u.usuario_correo && (
                        <Text style={styles.opcionSubtexto}>{u.usuario_correo}</Text>
                      )}
                    </View>
                    {activo && (
                      <Ionicons name="checkmark" size={18} color={colores.primario} />
                    )}
                  </TouchableOpacity>
                );
              })}

              {usuarios.length === 0 && (
                <Text style={styles.vacioTexto}>No hay usuarios registrados todavía.</Text>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const crearStyles = (colores) =>
  StyleSheet.create({
    boton: {
      marginHorizontal: 16,
      backgroundColor: colores.tarjeta,
      borderWidth: 1.5,
      borderColor: colores.borde,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 12,

      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    avatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colores.primarioClaro,
      justifyContent: 'center',
      alignItems: 'center',
    },

    avatarOpcion: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },

    avatarTexto: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colores.primario,
    },

    textoBoton: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colores.textoPrincipal,
    },

    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },

    modalContenido: {
      backgroundColor: colores.tarjeta,
      borderRadius: 18,
      paddingVertical: 18,
      maxHeight: '70%',
    },

    modalTitulo: {
      fontSize: 15,
      fontWeight: 'bold',
      color: colores.textoPrincipal,
      paddingHorizontal: 20,
      marginBottom: 10,
    },

    listaScroll: {
      paddingHorizontal: 10,
    },

    opcion: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 12,
    },

    opcionActiva: {
      backgroundColor: colores.primarioClaro,
    },

    opcionTexto: {
      fontSize: 14,
      fontWeight: '600',
      color: colores.textoPrincipal,
    },

    opcionTextoActivo: {
      color: colores.primario,
    },

    opcionSubtexto: {
      fontSize: 12,
      color: colores.textoSecundario,
      marginTop: 1,
    },

    vacioTexto: {
      textAlign: 'center',
      color: colores.textoSecundario,
      paddingVertical: 20,
      fontSize: 13,
    },
  });