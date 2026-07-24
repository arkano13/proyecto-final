import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { COLORES, SOMBRA, RADIO } from '../estilos/globales';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PAGOS_MOCK = [
  { id: 1, mes: 'Febrero 2025', monto: 9500, vencimiento: '2025-02-28', estado: 'pendiente' },
  { id: 2, mes: 'Enero 2025', monto: 9500, vencimiento: '2025-01-31', estado: 'pagado', fechaPago: '2025-01-20' },
  { id: 3, mes: 'Diciembre 2024', monto: 9500, vencimiento: '2024-12-31', estado: 'pagado', fechaPago: '2024-12-18' },
];

export default function MisPagos({ navigation }) {
  const [permisoConcedido, setPermisoConcedido] = useState(false);

  useEffect(() => {
    solicitarPermisos();
  }, []);

  const solicitarPermisos = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermisoConcedido(status === 'granted');
  };

  const enviarRecordatorio = async () => {
    if (!permisoConcedido) {
      Alert.alert('Permiso requerido', 'Activa las notificaciones para recibir recordatorios.');
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💰 RentaFácil — Recordatorio de pago',
        body: 'Tu pago de L. 9,500 vence el 28 de febrero. ¡No lo olvides!',
        sound: true,
      },
      trigger: { seconds: 3 },
    });
    Alert.alert('🔔 Recordatorio activado', 'Recibirás una notificación en 3 segundos como demo.');
  };

  const getBadge = (estado) => {
    if (estado === 'pagado') return { bg: COLORES.exito, texto: '✓ Pagado' };
    return { bg: COLORES.acento, texto: '⏳ Pendiente' };
  };

  const pendiente = PAGOS_MOCK.find(p => p.estado === 'pendiente');

  return (
    <View style={{ flex: 1, backgroundColor: COLORES.fondo }}>
      <View style={s.header}>
        <Text style={s.headerTitulo}>💰 Mis Pagos</Text>
        <Text style={s.headerSub}>Casa con Jardín</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>

        {/* Próximo pago */}
        {pendiente && (
          <View style={s.proximoPago}>
            <View>
              <Text style={s.proximoLabel}>Próximo pago</Text>
              <Text style={s.proximoMonto}>L. {pendiente.monto.toLocaleString()}</Text>
              <Text style={s.proximoVence}>Vence: {pendiente.vencimiento}</Text>
            </View>
            <TouchableOpacity style={s.btnRecordatorio} onPress={enviarRecordatorio}>
              <Text style={s.btnRecordatorioIcono}>🔔</Text>
              <Text style={s.btnRecordatorioTexto}>Recordarme</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Historial */}
        <Text style={s.seccionTitulo}>Historial de pagos</Text>
        {PAGOS_MOCK.map(p => {
          const badge = getBadge(p.estado);
          return (
            <View key={p.id} style={s.tarjeta}>
              <View style={s.tarjetaTop}>
                <View>
                  <Text style={s.mes}>{p.mes}</Text>
                  <Text style={s.vencimiento}>Vence: {p.vencimiento}</Text>
                  {p.fechaPago && <Text style={s.fechaPago}>✓ Pagado: {p.fechaPago}</Text>}
                </View>
                <View>
                  <Text style={s.monto}>L. {p.monto.toLocaleString()}</Text>
                  <View style={[s.badge, { backgroundColor: badge.bg }]}>
                    <Text style={s.badgeTexto}>{badge.texto}</Text>
                  </View>
                </View>
              </View>
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
  proximoPago: {
    backgroundColor: COLORES.primario,
    borderRadius: RADIO.lg,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SOMBRA,
  },
  proximoLabel: { color: COLORES.primarioClaro, fontSize: 13 },
  proximoMonto: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  proximoVence: { color: COLORES.primarioClaro, fontSize: 13, marginTop: 4 },
  btnRecordatorio: {
    backgroundColor: COLORES.acento,
    padding: 14,
    borderRadius: RADIO.md,
    alignItems: 'center',
    minWidth: 90,
  },
  btnRecordatorioIcono: { fontSize: 24 },
  btnRecordatorioTexto: { color: '#fff', fontWeight: 'bold', fontSize: 12, marginTop: 4 },
  seccionTitulo: { fontSize: 16, fontWeight: 'bold', color: COLORES.textoPrincipal },
  tarjeta: { backgroundColor: COLORES.fondoTarjeta, borderRadius: RADIO.lg, padding: 18, ...SOMBRA },
  tarjetaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  mes: { fontSize: 16, fontWeight: 'bold', color: COLORES.textoPrincipal },
  vencimiento: { fontSize: 13, color: COLORES.textoSecundario, marginTop: 3 },
  fechaPago: { fontSize: 13, color: COLORES.exito, marginTop: 2, fontWeight: '600' },
  monto: { fontSize: 18, fontWeight: 'bold', color: COLORES.primario, textAlign: 'right' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 6, alignSelf: 'flex-end' },
  badgeTexto: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
});s