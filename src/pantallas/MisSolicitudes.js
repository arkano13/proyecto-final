import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORES, SOMBRA, RADIO } from '../estilos/globales';

const SOLICITUDES_MOCK = [
  { id: 1, propiedad: 'Apartamento Centro', direccion: 'Col. Centro, Bloque 4', precio: 5500, emoji: '🏢', fecha: '2025-01-10', estado: 'pendiente' },
  { id: 2, propiedad: 'Casa con Jardín', direccion: 'Col. Los Pinos, Casa 8', precio: 9500, emoji: '🏠', fecha: '2025-01-08', estado: 'aprobada' },
  { id: 3, propiedad: 'Oficina Ejecutiva', direccion: 'Torre Empresarial, Piso 3', precio: 7500, emoji: '🏢', fecha: '2025-01-05', estado: 'rechazada' },
];

const getBadge = (estado) => {
  if (estado === 'aprobada') return { bg: COLORES.exito, texto: '✅ Aprobada' };
  if (estado === 'rechazada') return { bg: COLORES.peligro, texto: '❌ Rechazada' };
  return { bg: COLORES.acento, texto: '⏳ Pendiente' };
};

export default function MisSolicitudes({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: COLORES.fondo }}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.volver}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitulo}>📋 Mis Solicitudes</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {SOLICITUDES_MOCK.map(sol => {
          const badge = getBadge(sol.estado);
          return (
            <View key={sol.id} style={s.tarjeta}>
              <View style={s.tarjetaTop}>
                <View style={s.emojiContainer}>
                  <Text style={s.emoji}>{sol.emoji}</Text>
                </View>
                <View style={s.info}>
                  <Text style={s.propiedadTitulo}>{sol.propiedad}</Text>
                  <Text style={s.direccion}>📍 {sol.direccion}</Text>
                  <Text style={s.fecha}>📅 Enviada: {sol.fecha}</Text>
                </View>
              </View>
              <View style={s.footer}>
                <Text style={s.precio}>L. {sol.precio.toLocaleString()}/mes</Text>
                <View style={[s.badge, { backgroundColor: badge.bg }]}>
                  <Text style={s.badgeTexto}>{badge.texto}</Text>
                </View>
              </View>
              {sol.estado === 'aprobada' && (
                <View style={s.aprobadaAlert}>
                  <Text style={s.aprobadaTexto}>🎉 ¡Tu solicitud fue aprobada! Revisa tu contrato.</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

import { TouchableOpacity } from 'react-native';

const s = StyleSheet.create({
  header: {
    backgroundColor: COLORES.primario,
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  volver: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerTitulo: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  tarjeta: { backgroundColor: COLORES.fondoTarjeta, borderRadius: RADIO.lg, padding: 18, ...SOMBRA },
  tarjetaTop: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORES.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 30 },
  info: { flex: 1 },
  propiedadTitulo: { fontSize: 16, fontWeight: 'bold', color: COLORES.textoPrincipal },
  direccion: { fontSize: 13, color: COLORES.textoSecundario, marginTop: 3 },
  fecha: { fontSize: 12, color: COLORES.textoClaro, marginTop: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  precio: { fontSize: 16, fontWeight: 'bold', color: COLORES.primario },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeTexto: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  aprobadaAlert: {
    backgroundColor: COLORES.exitoClaro,
    borderRadius: RADIO.sm,
    padding: 10,
    marginTop: 12,
  },
  aprobadaTexto: { color: COLORES.exito, fontSize: 13, fontWeight: '600' },
});