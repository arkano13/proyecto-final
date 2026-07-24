import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import styles from '../estilos/AdminDashboardStyles';

const STATS = [
  { icono: '🏠', numero: 5, label: 'Propiedades' },
  { icono: '📋', numero: 3, label: 'Solicitudes' },
  { icono: '📝', numero: 4, label: 'Contratos activos' },
  { icono: '💰', numero: 2, label: 'Pagos pendientes' },
];

const MENU = [
  { icono: '🏠', titulo: 'Mis Propiedades', sub: 'Gestiona tu inventario', pantalla: 'MisPropiedades' },
  { icono: '📋', titulo: 'Solicitudes', sub: 'Aprueba o rechaza solicitudes', pantalla: 'Solicitudes' },
  { icono: '📝', titulo: 'Contratos', sub: 'Ver contratos activos', pantalla: 'ContratosAdmin' },
  { icono: '💰', titulo: 'Pagos', sub: 'Pagos recibidos y pendientes', pantalla: 'PagosAdmin' },
  { icono: '📊', titulo: 'Reportes', sub: 'Estadísticas e ingresos', pantalla: 'Reportes' },
  { icono: '👤', titulo: 'Mi Perfil', sub: 'Edita tu información', pantalla: 'Perfil' },
];

export default function AdminDashboard({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSaludo}>Bienvenido de nuevo 👋</Text>
        <Text style={styles.headerNombre}>Carlos Mendoza</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeTexto}>🏠 Arrendador</Text>
        </View>
      </View>

      <View style={styles.tarjetasContainer}>
        {STATS.map((s, i) => (
          <View key={i} style={styles.tarjeta}>
            <Text style={styles.tarjetaIcono}>{s.icono}</Text>
            <Text style={styles.tarjetaNumero}>{s.numero}</Text>
            <Text style={styles.tarjetaLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.seccionTitulo}>¿Qué deseas hacer?</Text>
      <View style={styles.menuContainer}>
        {MENU.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.menuBtn}
            onPress={() => navigation.navigate(item.pantalla)}
          >
            <View style={styles.menuIconoContainer}>
              <Text style={styles.menuIcono}>{item.icono}</Text>
            </View>
            <View style={styles.menuTextoContainer}>
              <Text style={styles.menuTitulo}>{item.titulo}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Text style={styles.menuFlecha}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.cerrarBtn} onPress={() => navigation.replace('Login')}>
        <Text style={styles.cerrarTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}