import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORES, SOMBRA, RADIO } from '../estilos/globales';

const PAGOS_MOCK = [
  { id: 1, inquilino: 'Ana García', propiedad: 'Casa Familiar', monto: 8000, vencimiento: '2025-01-31', estado: 'pendiente' },
  { id: 2, inquilino: 'Pedro Soto', propiedad: 'Apartamento Centro', monto: 5500, vencimiento: '2025-01-31', estado: 'pagado', fechaPago: '2025-01-15' },
  { id: 3, inquilino: 'Ana García', propiedad: 'Casa Familiar', monto: 8000, vencimiento: '2024-12-31', estado: 'pagado', fechaPago: '2024-12-20' },
  { id: 4, inquilino: 'Pedro Soto', propiedad: 'Apartamento Centro', monto: 5500, vencimiento: '2024-12-31', estado: 'vencido' },
];

export default function PagosAdmin() {
  const [pagos, setPagos] = useState(PAGOS_MOCK);
  const [filtro, setFiltro] = useState('todos');

  const marcarPagado = (id) => {
    Alert.alert('Confirmar', '¿Marcar este pago como recibido?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: '✅ Confirmar', onPress: () => setPagos(p => p.map(x => x.id === id ? { ...x, estado: 'pagado', fechaPago: new Date().toISOString().split('T')[0] } : x)) },
    ]);
  };

  const getBadge = (estado) => {
    if (estado === 'pagado') return { bg: COLORES.exito, texto: '✓ Pagado' };
    if (estado === 'vencido') return { bg: COLORES.peligro, texto: '⚠ Vencido' };
    return { bg: COLORES.acento, texto: '⏳ Pendiente' };
  };

  const filtrados = filtro === 'todos' ? pagos : pagos.filter(p => p.estado === filtro);

  return (
    <View style={{ flex: 1, backgroundColor: COLORES.fondo }}>
      <View style={s.header}>
        <Text style={s.headerTitulo}>💰 Pagos</Text>
        <Text style={s.headerSub}>Total pendiente: L. {pagos.filter(p => p.estado === 'pendiente').reduce((a, b) => a + b.monto, 0).toLocaleString()}</Text>
      </View>

      <View style={s.filtros}>
        {['todos', 'pendiente', 'pagado', 'vencido'].map(f => (
          <TouchableOpacity key={f} style={[s.filtroBtn, filtro === f && s.filtroActivo]} onPress={() => setFiltro(f)}>
            <Text style={[s.filtroTexto, filtro === f && s.filtroTextoActivo]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {filtrados.map(p => {
          const badge = getBadge(p.estado);
          return (
            <View key={p.id} style={s.tarjeta}>
              <View style={s.tarjetaTop}>
                <View>
                  <Text style={s.inquilino}>👤 {p.inquilino}</Text>
                  <Text style={s.propiedad}>🏠 {p.propiedad}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: badge.bg }]}>
                  <Text style={s.badgeTexto}>{badge.texto}</Text>
                </View>
              </View>
              <View style={s.montoRow}>
                <Text style={s.monto}>L. {p.monto.toLocaleString()}</Text>
                <Text style={s.vencimiento}>Vence: {p.vencimiento}</Text>
              </View>
              {p.fechaPago && <Text style={s.fechaPago}>✓ Pagado el {p.fechaPago}</Text>}
              {p.estado === 'pendiente' && (
                <TouchableOpacity style={s.btnMarcar} onPress={() => marcarPagado(p.id)}>
                  <Text style={s.btnMarcarTexto}>✅ Marcar como pagado</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
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
  filtros: { flexDirection: 'row', padding: 16, gap: 8 },
  filtroBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORES.fondoTarjeta, borderWidth: 1, borderColor: COLORES.borde },
  filtroActivo: { backgroundColor: COLORES.primario, borderColor: COLORES.primario },
  filtroTexto: { fontSize: 13, color: COLORES.textoSecundario, fontWeight: '600', textTransform: 'capitalize' },
  filtroTextoActivo: { color: '#fff' },
  tarjeta: { backgroundColor: COLORES.fondoTarjeta, borderRadius: RADIO.lg, padding: 18, ...SOMBRA },
  tarjetaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  inquilino: { fontSize: 15, fontWeight: 'bold', color: COLORES.textoPrincipal },
  propiedad: { fontSize: 13, color: COLORES.textoSecundario, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTexto: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  montoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monto: { fontSize: 22, fontWeight: 'bold', color: COLORES.primario },
  vencimiento: { fontSize: 13, color: COLORES.textoSecundario },
  fechaPago: { fontSize: 13, color: COLORES.exito, marginTop: 6, fontWeight: '600' },
  btnMarcar: { backgroundColor: COLORES.exitoClaro, padding: 12, borderRadius: RADIO.sm, alignItems: 'center', marginTop: 12 },
  btnMarcarTexto: { color: COLORES.exito, fontWeight: 'bold', fontSize: 14 },
});