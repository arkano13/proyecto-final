import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORES, SOMBRA, RADIO } from '../estilos/globales';

const CONTRATOS_MOCK = [
  { id: 1, inquilino: 'Ana García', propiedad: 'Casa Familiar', inicio: '2025-01-01', fin: '2025-12-31', monto: 8000, estado: 'activo' },
  { id: 2, inquilino: 'Pedro Soto', propiedad: 'Apartamento Centro', inicio: '2024-06-01', fin: '2025-05-31', monto: 5500, estado: 'activo' },
  { id: 3, inquilino: 'Laura Reyes', propiedad: 'Local Comercial', inicio: '2023-03-01', fin: '2024-02-28', monto: 12000, estado: 'vencido' },
];

export default function ContratosAdmin() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORES.fondo }}>
      <View style={s.header}>
        <Text style={s.headerTitulo}>📝 Contratos</Text>
        <Text style={s.headerSub}>{CONTRATOS_MOCK.filter(c => c.estado === 'activo').length} contratos activos</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {CONTRATOS_MOCK.map(c => (
          <View key={c.id} style={s.tarjeta}>
            <View style={s.tarjetaTop}>
              <Text style={s.inquilino}>👤 {c.inquilino}</Text>
              <View style={[s.badge, { backgroundColor: c.estado === 'activo' ? COLORES.exito : COLORES.textoClaro }]}>
                <Text style={s.badgeTexto}>{c.estado}</Text>
              </View>
            </View>
            <Text style={s.propiedad}>🏠 {c.propiedad}</Text>
            <View style={s.infoRow}>
              <View style={s.infoItem}>
                <Text style={s.infoLabel}>Inicio</Text>
                <Text style={s.infoValor}>{c.inicio}</Text>
              </View>
              <View style={s.infoItem}>
                <Text style={s.infoLabel}>Fin</Text>
                <Text style={s.infoValor}>{c.fin}</Text>
              </View>
              <View style={s.infoItem}>
                <Text style={s.infoLabel}>Monto/mes</Text>
                <Text style={[s.infoValor, { color: COLORES.primario, fontWeight: 'bold' }]}>L. {c.monto.toLocaleString()}</Text>
              </View>
            </View>
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
  tarjetaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  inquilino: { fontSize: 16, fontWeight: 'bold', color: COLORES.textoPrincipal },
  propiedad: { fontSize: 13, color: COLORES.textoSecundario, marginBottom: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTexto: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORES.fondo, borderRadius: RADIO.sm, padding: 12 },
  infoItem: { alignItems: 'center' },
  infoLabel: { fontSize: 11, color: COLORES.textoClaro, marginBottom: 4 },
  infoValor: { fontSize: 14, color: COLORES.textoPrincipal, fontWeight: '600' },
});