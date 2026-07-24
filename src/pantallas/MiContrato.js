import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORES, SOMBRA, RADIO } from '../estilos/globales';

const CONTRATO_MOCK = {
  id: 1,
  propiedad: 'Casa con Jardín',
  direccion: 'Col. Los Pinos, Casa 8',
  emoji: '🏠',
  arrendador: 'Ana Flores',
  fechaInicio: '2025-02-01',
  fechaFin: '2026-01-31',
  montoMensual: 9500,
  estado: 'activo',
  diasRestantes: 320,
};

export default function MiContrato({ navigation }) {
  const progreso = ((365 - CONTRATO_MOCK.diasRestantes) / 365) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: COLORES.fondo }}>
      <View style={s.header}>
        <Text style={s.headerTitulo}>📝 Mi Contrato</Text>
        <Text style={s.headerSub}>Contrato activo</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>

        {/* Propiedad */}
        <View style={s.seccion}>
          <View style={s.propiedadTop}>
            <View style={s.emojiContainer}>
              <Text style={s.emoji}>{CONTRATO_MOCK.emoji}</Text>
            </View>
            <View style={s.propiedadInfo}>
              <Text style={s.propiedadTitulo}>{CONTRATO_MOCK.propiedad}</Text>
              <Text style={s.propiedadDireccion}>📍 {CONTRATO_MOCK.direccion}</Text>
              <View style={s.activoBadge}>
                <Text style={s.activoBadgeTexto}>✓ Contrato activo</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fechas */}
        <View style={s.seccion}>
          <Text style={s.seccionTitulo}>📅 Vigencia del contrato</Text>
          <View style={s.fechasRow}>
            <View style={s.fechaItem}>
              <Text style={s.fechaLabel}>Inicio</Text>
              <Text style={s.fechaValor}>{CONTRATO_MOCK.fechaInicio}</Text>
            </View>
            <View style={s.fechaSeparador}>
              <Text style={{ color: COLORES.textoClaro }}>→</Text>
            </View>
            <View style={s.fechaItem}>
              <Text style={s.fechaLabel}>Fin</Text>
              <Text style={s.fechaValor}>{CONTRATO_MOCK.fechaFin}</Text>
            </View>
          </View>
          {/* Barra de progreso */}
          <View style={s.progresoContainer}>
            <View style={s.progresoBar}>
              <View style={[s.progresoFill, { width: `${progreso}%` }]} />
            </View>
            <Text style={s.progresoTexto}>{CONTRATO_MOCK.diasRestantes} días restantes</Text>
          </View>
        </View>

        {/* Monto */}
        <View style={s.seccion}>
          <Text style={s.seccionTitulo}>💰 Monto mensual</Text>
          <Text style={s.montoGrande}>L. {CONTRATO_MOCK.montoMensual.toLocaleString()}</Text>
          <Text style={s.montoPor}>por mes</Text>
        </View>

        {/* Arrendador */}
        <View style={s.seccion}>
          <Text style={s.seccionTitulo}>👤 Arrendador</Text>
          <View style={s.arrendadorRow}>
            <View style={s.avatarCircle}>
              <Text style={{ fontSize: 22 }}>👤</Text>
            </View>
            <View>
              <Text style={s.arrendadorNombre}>{CONTRATO_MOCK.arrendador}</Text>
              <Text style={s.arrendadorVerificado}>Propietario verificado ✓</Text>
            </View>
          </View>
        </View>

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
  seccion: { backgroundColor: COLORES.fondoTarjeta, borderRadius: RADIO.lg, padding: 18, ...SOMBRA },
  seccionTitulo: { fontSize: 15, fontWeight: 'bold', color: COLORES.primario, marginBottom: 14 },
  propiedadTop: { flexDirection: 'row', gap: 14 },
  emojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORES.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 34 },
  propiedadInfo: { flex: 1 },
  propiedadTitulo: { fontSize: 17, fontWeight: 'bold', color: COLORES.textoPrincipal },
  propiedadDireccion: { fontSize: 13, color: COLORES.textoSecundario, marginTop: 4 },
  activoBadge: {
    backgroundColor: COLORES.exitoClaro,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  activoBadgeTexto: { color: COLORES.exito, fontSize: 12, fontWeight: 'bold' },
  fechasRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  fechaItem: { alignItems: 'center' },
  fechaLabel: { fontSize: 12, color: COLORES.textoClaro, marginBottom: 4 },
  fechaValor: { fontSize: 15, fontWeight: 'bold', color: COLORES.textoPrincipal },
  fechaSeparador: { flex: 1, alignItems: 'center' },
  progresoContainer: { gap: 8 },
  progresoBar: { height: 8, backgroundColor: COLORES.borde, borderRadius: 4, overflow: 'hidden' },
  progresoFill: { height: '100%', backgroundColor: COLORES.primario, borderRadius: 4 },
  progresoTexto: { fontSize: 13, color: COLORES.textoSecundario, textAlign: 'right' },
  montoGrande: { fontSize: 36, fontWeight: 'bold', color: COLORES.primario },
  montoPor: { fontSize: 14, color: COLORES.textoSecundario, marginTop: 2 },
  arrendadorRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORES.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrendadorNombre: { fontSize: 16, fontWeight: 'bold', color: COLORES.textoPrincipal },
  arrendadorVerificado: { fontSize: 13, color: COLORES.exito, marginTop: 2 },
});