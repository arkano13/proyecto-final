import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { COLORES, SOMBRA, RADIO } from '../estilos/globales';

const SOLICITUDES_MOCK = [
  { id: 1, inquilino: 'María López', propiedad: 'Apartamento Centro', fecha: '2025-01-10', mensaje: 'Estoy interesada en rentar el apartamento para mí y mi hijo.', estado: 'pendiente' },
  { id: 2, inquilino: 'José Martínez', propiedad: 'Local Comercial', fecha: '2025-01-09', mensaje: 'Necesito el local para una tienda de ropa.', estado: 'pendiente' },
  { id: 3, inquilino: 'Ana García', propiedad: 'Casa Familiar', fecha: '2025-01-08', mensaje: 'Familia de 4 personas busca casa tranquila.', estado: 'aprobada' },
];

export default function Solicitudes({ navigation }) {
  const [solicitudes, setSolicitudes] = useState(SOLICITUDES_MOCK);

  const cambiarEstado = (id, nuevoEstado) => {
    const accion = nuevoEstado === 'aprobada' ? 'aprobar' : 'rechazar';
    Alert.alert(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)}?`, `¿Deseas ${accion} esta solicitud?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: nuevoEstado === 'aprobada' ? '✅ Aprobar' : '❌ Rechazar',
        onPress: () => setSolicitudes(s => s.map(x => x.id === id ? { ...x, estado: nuevoEstado } : x)),
      },
    ]);
  };

  const getBadgeColor = (estado) => {
    if (estado === 'aprobada') return COLORES.exito;
    if (estado === 'rechazada') return COLORES.peligro;
    return COLORES.acento;
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORES.fondo }}>
      <View style={s.header}>
        <Text style={s.headerTitulo}>📋 Solicitudes</Text>
        <Text style={s.headerSub}>{solicitudes.filter(x => x.estado === 'pendiente').length} pendientes</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {solicitudes.map(sol => (
          <View key={sol.id} style={s.tarjeta}>
            <View style={s.tarjetaHeader}>
              <View>
                <Text style={s.inquilinoNombre}>👤 {sol.inquilino}</Text>
                <Text style={s.propiedadTexto}>🏠 {sol.propiedad}</Text>
                <Text style={s.fechaTexto}>📅 {sol.fecha}</Text>
              </View>
              <View style={[s.badge, { backgroundColor: getBadgeColor(sol.estado) }]}>
                <Text style={s.badgeTexto}>{sol.estado}</Text>
              </View>
            </View>

            <Text style={s.mensajeTexto}>"{sol.mensaje}"</Text>

            {sol.estado === 'pendiente' && (
              <View style={s.acciones}>
                <TouchableOpacity style={s.btnAprobar} onPress={() => cambiarEstado(sol.id, 'aprobada')}>
                  <Text style={s.btnAprobarTexto}>✅ Aprobar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.btnRechazar} onPress={() => cambiarEstado(sol.id, 'rechazada')}>
                  <Text style={s.btnRechazarTexto}>❌ Rechazar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: COLORES.primario,
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitulo: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: COLORES.primarioClaro, fontSize: 13, marginTop: 4 },
  tarjeta: { backgroundColor: COLORES.fondoTarjeta, borderRadius: RADIO.lg, padding: 18, ...SOMBRA },
  tarjetaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  inquilinoNombre: { fontSize: 16, fontWeight: 'bold', color: COLORES.textoPrincipal },
  propiedadTexto: { fontSize: 13, color: COLORES.textoSecundario, marginTop: 3 },
  fechaTexto: { fontSize: 12, color: COLORES.textoClaro, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTexto: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  mensajeTexto: { fontSize: 14, color: COLORES.textoSecundario, fontStyle: 'italic', marginBottom: 14, lineHeight: 20 },
  acciones: { flexDirection: 'row', gap: 10 },
  btnAprobar: { flex: 1, backgroundColor: COLORES.exitoClaro, padding: 11, borderRadius: RADIO.sm, alignItems: 'center' },
  btnAprobarTexto: { color: COLORES.exito, fontWeight: 'bold' },
  btnRechazar: { flex: 1, backgroundColor: COLORES.peligroClaro, padding: 11, borderRadius: RADIO.sm, alignItems: 'center' },
  btnRechazarTexto: { color: COLORES.peligro, fontWeight: 'bold' },
});