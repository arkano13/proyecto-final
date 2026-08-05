import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import styles from '../estilos/AdminDashboardStyles';

const STATS = [
  {
    icono: '🏠',
    numero: 0,
    label: 'Propiedades',
  },
  {
    icono: '📋',
    numero: 0,
    label: 'Solicitudes',
  },
  {
    icono: '📝',
    numero: 0,
    label: 'Contratos activos',
  },
  {
    icono: '💰',
    numero: 0,
    label: 'Pagos pendientes',
  },
];

const MENU = [
  {
    icono: '🏠',
    titulo: 'Mis Propiedades',
    sub: 'Gestiona tus propiedades',
    pantalla: 'MisPropiedades',
  },
  {
    icono: '📋',
    titulo: 'Solicitudes',
    sub: 'Aprueba o rechaza solicitudes',
    pantalla: 'Solicitudes',
  },
  {
    icono: '📝',
    titulo: 'Contratos',
    sub: 'Ver contratos activos',
    pantalla: 'ContratosAdmin',
  },
  {
    icono: '💰',
    titulo: 'Pagos',
    sub: 'Pagos recibidos y pendientes',
    pantalla: 'PagosAdmin',
  },
  {
    icono: '📊',
    titulo: 'Reportes',
    sub: 'Estadísticas e ingresos',
    pantalla: 'Reportes',
  },
  {
    icono: '👤',
    titulo: 'Mi Perfil',
    sub: 'Edita tu información',
    pantalla: 'Perfil',
  },
];

export default function AdminDashboard({
  navigation,
  route,
}) {
  /*
   * Este es el usuario que recibimos desde Login.js.
   */
  const usuario = route.params?.usuario;

  const nombreUsuario =
    usuario?.nombre_completo ||
    usuario?.usuario ||
    'Arrendador';

  const abrirPantalla = (pantalla) => {
    navigation.navigate(pantalla, {
      usuario,
    });
  };

  const cerrarSesion = () => {
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSaludo}>
          Bienvenido de nuevo 👋
        </Text>

        <Text style={styles.headerNombre}>
          {nombreUsuario}
        </Text>

        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeTexto}>
            🏠 Arrendador
          </Text>
        </View>
      </View>

      <View style={styles.tarjetasContainer}>
        {STATS.map((estadistica, indice) => (
          <View
            key={indice}
            style={styles.tarjeta}
          >
            <Text style={styles.tarjetaIcono}>
              {estadistica.icono}
            </Text>

            <Text style={styles.tarjetaNumero}>
              {estadistica.numero}
            </Text>

            <Text style={styles.tarjetaLabel}>
              {estadistica.label}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.seccionTitulo}>
        ¿Qué deseas hacer?
      </Text>

      <View style={styles.menuContainer}>
        {MENU.map((item, indice) => (
          <TouchableOpacity
            key={indice}
            style={styles.menuBtn}
            onPress={() =>
              abrirPantalla(item.pantalla)
            }
          >
            <View
              style={styles.menuIconoContainer}
            >
              <Text style={styles.menuIcono}>
                {item.icono}
              </Text>
            </View>

            <View
              style={styles.menuTextoContainer}
            >
              <Text style={styles.menuTitulo}>
                {item.titulo}
              </Text>

              <Text style={styles.menuSub}>
                {item.sub}
              </Text>
            </View>

            <Text style={styles.menuFlecha}>
              ›
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.cerrarBtn}
        onPress={cerrarSesion}
      >
        <Text style={styles.cerrarTexto}>
          Cerrar sesión
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}