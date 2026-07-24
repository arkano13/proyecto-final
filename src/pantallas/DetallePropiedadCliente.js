import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, StyleSheet
} from 'react-native';
import { COLORES, SOMBRA, RADIO } from '../estilos/globales';

export default function DetallePropiedadCliente({ navigation, route }) {
  const { propiedad } = route.params;
  const [mensaje, setMensaje] = useState('');
  const [enviado, setEnviado] = useState(false);

  const enviarSolicitud = () => {
    if (!mensaje.trim()) {
      Alert.alert('Campo requerido', 'Por favor escribe un mensaje al arrendador.');
      return;
    }
    Alert.alert(
      '✅ Solicitud enviada',
      'Tu solicitud fue enviada al arrendador. Te notificaremos cuando responda.',
      [{ text: 'OK', onPress: () => { setEnviado(true); } }]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORES.fondo }}>
      <ScrollView>
        {/* Imagen header */}
        <View style={s.imagenContainer}>
          <Text style={s.imagenEmoji}>{propiedad.emoji}</Text>
          <TouchableOpacity style={s.btnVolver} onPress={() => navigation.goBack()}>
            <Text style={s.btnVolverTexto}>← Volver</Text>
          </TouchableOpacity>
          <View style={s.tipoBadge}>
            <Text style={s.tipoBadgeTexto}>{propiedad.tipo}</Text>
          </View>
        </View>

        <View style={s.contenido}>
          {/* Info principal */}
          <View style={s.seccion}>
            <Text style={s.titulo}>{propiedad.titulo}</Text>
            <Text style={s.direccion}>📍 {propiedad.direccion}</Text>
            <Text style={s.precio}>L. {propiedad.precio.toLocaleString()}<Text style={s.precioSub}> /mes</Text></Text>
          </View>

          {/* Detalles */}
          {propiedad.habitaciones > 0 && (
            <View style={s.seccion}>
              <Text style={s.seccionTitulo}>📋 Características</Text>
              <View style={s.caracteristicas}>
                <View style={s.caracteristicaItem}>
                  <Text style={s.caracteristicaIcono}>🛏</Text>
                  <Text style={s.caracteristicaValor}>{propiedad.habitaciones}</Text>
                  <Text style={s.caracteristicaLabel}>Habitaciones</Text>
                </View>
                <View style={s.caracteristicaItem}>
                  <Text style={s.caracteristicaIcono}>🚿</Text>
                  <Text style={s.caracteristicaValor}>{propiedad.baños}</Text>
                  <Text style={s.caracteristicaLabel}>Baños</Text>
                </View>
                <View style={s.caracteristicaItem}>
                  <Text style={s.caracteristicaIcono}>📅</Text>
                  <Text style={s.caracteristicaValor}>Inmediata</Text>
                  <Text style={s.caracteristicaLabel}>Disponibilidad</Text>
                </View>
              </View>
            </View>
          )}

          {/* Arrendador */}
          <View style={s.seccion}>
            <Text style={s.seccionTitulo}>👤 Arrendador</Text>
            <View style={s.arrendadorCard}>
              <View style={s.arrendadorAvatar}>
                <Text style={{ fontSize: 24 }}>👤</Text>
              </View>
              <View>
                <Text style={s.arrendadorNombre}>{propiedad.arrendador}</Text>
                <Text style={s.arrendadorSub}>Propietario verificado ✓</Text>
              </View>
            </View>
          </View>

          {/* Ubicación */}
          <View style={s.seccion}>
            <Text style={s.seccionTitulo}>📍 Ubicación</Text>
            <View style={s.mapaPlaceholder}>
              <Text style={{ fontSize: 40 }}>🗺️</Text>
              <Text style={s.mapaTexto}>{propiedad.direccion}</Text>
            </View>
          </View>

          {/* Solicitud */}
          <View style={s.seccion}>
            <Text style={s.seccionTitulo}>📨 Enviar solicitud</Text>
            {enviado ? (
              <View style={s.enviadoContainer}>
                <Text style={s.enviadoIcono}>✅</Text>
                <Text style={s.enviadoTexto}>Solicitud enviada</Text>
                <Text style={s.enviadoSub}>El arrendador revisará tu solicitud pronto</Text>
              </View>
            ) : (
              <>
                <TextInput
                  style={s.mensajeInput}
                  placeholder="Preséntate y explica por qué te interesa esta propiedad..."
                  placeholderTextColor="#94a3b8"
                  value={mensaje}
                  onChangeText={setMensaje}
                  multiline
                  numberOfLines={4}
                />
                <TouchableOpacity style={s.btnSolicitar} onPress={enviarSolicitud}>
                  <Text style={s.btnSolicitarTexto}>📨 Enviar solicitud</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  imagenContainer: {
    height: 220,
    backgroundColor: COLORES.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagenEmoji: { fontSize: 80 },
  btnVolver: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  btnVolverTexto: { color: '#fff', fontWeight: '600' },
  tipoBadge: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: COLORES.primario,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tipoBadgeTexto: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  contenido: { padding: 20, gap: 16 },
  seccion: { backgroundColor: COLORES.fondoTarjeta, borderRadius: RADIO.lg, padding: 18, ...SOMBRA },
  titulo: { fontSize: 22, fontWeight: 'bold', color: COLORES.textoPrincipal },
  direccion: { fontSize: 14, color: COLORES.textoSecundario, marginTop: 6 },
  precio: { fontSize: 26, fontWeight: 'bold', color: COLORES.primario, marginTop: 10 },
  precioSub: { fontSize: 15, fontWeight: 'normal', color: COLORES.textoSecundario },
  seccionTitulo: { fontSize: 15, fontWeight: 'bold', color: COLORES.primario, marginBottom: 14 },
  caracteristicas: { flexDirection: 'row', justifyContent: 'space-around' },
  caracteristicaItem: { alignItems: 'center' },
  caracteristicaIcono: { fontSize: 28, marginBottom: 6 },
  caracteristicaValor: { fontSize: 16, fontWeight: 'bold', color: COLORES.textoPrincipal },
  caracteristicaLabel: { fontSize: 12, color: COLORES.textoSecundario, marginTop: 2 },
  arrendadorCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  arrendadorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORES.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrendadorNombre: { fontSize: 16, fontWeight: 'bold', color: COLORES.textoPrincipal },
  arrendadorSub: { fontSize: 13, color: COLORES.exito, marginTop: 2 },
  mapaPlaceholder: {
    backgroundColor: COLORES.fondo,
    borderRadius: RADIO.md,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  mapaTexto: { color: COLORES.textoSecundario, fontSize: 13, marginTop: 6, textAlign: 'center' },
  mensajeInput: {
    backgroundColor: COLORES.fondo,
    borderWidth: 1.5,
    borderColor: COLORES.borde,
    borderRadius: RADIO.md,
    padding: 14,
    fontSize: 15,
    color: COLORES.textoPrincipal,
    height: 110,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  btnSolicitar: {
    backgroundColor: COLORES.primario,
    padding: 16,
    borderRadius: RADIO.md,
    alignItems: 'center',
    ...SOMBRA,
  },
  btnSolicitarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  enviadoContainer: { alignItems: 'center', paddingVertical: 20 },
  enviadoIcono: { fontSize: 48, marginBottom: 10 },
  enviadoTexto: { fontSize: 18, fontWeight: 'bold', color: COLORES.exito },
  enviadoSub: { fontSize: 14, color: COLORES.textoSecundario, marginTop: 6, textAlign: 'center' },
});