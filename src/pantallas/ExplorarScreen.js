import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet
} from 'react-native';
import { COLORES, SOMBRA, RADIO } from '../estilos/globales';

const PROPIEDADES_MOCK = [
  { id: 1, titulo: 'Apartamento Centro', direccion: 'Col. Centro, Bloque 4', precio: 5500, tipo: 'Apartamento', emoji: '🏢', habitaciones: 2, baños: 1, arrendador: 'Carlos Mendoza' },
  { id: 2, titulo: 'Casa Familiar Amplia', direccion: 'Res. Las Palmas, Casa 12', precio: 8000, tipo: 'Casa', emoji: '🏡', habitaciones: 3, baños: 2, arrendador: 'María Torres' },
  { id: 3, titulo: 'Local Comercial Av. Principal', direccion: 'Av. Principal #45', precio: 12000, tipo: 'Local', emoji: '🏪', habitaciones: 0, baños: 1, arrendador: 'Carlos Mendoza' },
  { id: 4, titulo: 'Oficina Ejecutiva', direccion: 'Torre Empresarial, Piso 3', precio: 7500, tipo: 'Oficina', emoji: '🏢', habitaciones: 0, baños: 1, arrendador: 'José Reyes' },
  { id: 5, titulo: 'Casa con Jardín', direccion: 'Col. Los Pinos, Casa 8', precio: 9500, tipo: 'Casa', emoji: '🏠', habitaciones: 4, baños: 2, arrendador: 'Ana Flores' },
];

const TIPOS = ['Todos', 'Casa', 'Apartamento', 'Local', 'Oficina'];

export default function ExplorarScreen({ navigation }) {
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('Todos');

  const filtradas = PROPIEDADES_MOCK.filter(p => {
    const coincideBusqueda = p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.direccion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = tipoFiltro === 'Todos' || p.tipo === tipoFiltro;
    return coincideBusqueda && coincideTipo;
  });

  return (
    <View style={{ flex: 1, backgroundColor: COLORES.fondo }}>
      <View style={s.header}>
        <Text style={s.headerTitulo}>🔍 Explorar</Text>
        <Text style={s.headerSub}>Encuentra tu próximo hogar</Text>
        <TextInput
          style={s.buscador}
          placeholder="Buscar por nombre o dirección..."
          placeholderTextColor="#94a3b8"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* Filtros de tipo */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtrosScroll} contentContainerStyle={s.filtrosContainer}>
        {TIPOS.map(t => (
          <TouchableOpacity
            key={t}
            style={[s.filtroBtn, tipoFiltro === t && s.filtroActivo]}
            onPress={() => setTipoFiltro(t)}
          >
            <Text style={[s.filtroTexto, tipoFiltro === t && s.filtroTextoActivo]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text style={s.resultados}>{filtradas.length} propiedades encontradas</Text>
        {filtradas.map(p => (
          <TouchableOpacity
            key={p.id}
            style={s.tarjeta}
            onPress={() => navigation.navigate('DetallePropiedadCliente', { propiedad: p })}
          >
            <View style={s.tarjetaImagen}>
              <Text style={s.tarjetaEmoji}>{p.emoji}</Text>
              <View style={s.tarjetaTipoBadge}>
                <Text style={s.tarjetaTipoBadgeTexto}>{p.tipo}</Text>
              </View>
            </View>
            <View style={s.tarjetaBody}>
              <Text style={s.tarjetaTitulo}>{p.titulo}</Text>
              <Text style={s.tarjetaDireccion}>📍 {p.direccion}</Text>
              {p.habitaciones > 0 && (
                <View style={s.tarjetaDetalles}>
                  <Text style={s.detalle}>🛏 {p.habitaciones} hab.</Text>
                  <Text style={s.detalle}>🚿 {p.baños} baño(s)</Text>
                </View>
              )}
              <View style={s.tarjetaFooter}>
                <Text style={s.precio}>L. {p.precio.toLocaleString()}<Text style={s.precioSub}>/mes</Text></Text>
                <TouchableOpacity
                  style={s.btnVer}
                  onPress={() => navigation.navigate('DetallePropiedadCliente', { propiedad: p })}
                >
                  <Text style={s.btnVerTexto}>Ver →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
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
  headerTitulo: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerSub: { color: COLORES.primarioClaro, fontSize: 13, marginTop: 2, marginBottom: 14 },
  buscador: {
    backgroundColor: '#fff',
    borderRadius: RADIO.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORES.textoPrincipal,
  },
  filtrosScroll: { maxHeight: 56 },
  filtrosContainer: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filtroBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORES.fondoTarjeta,
    borderWidth: 1.5,
    borderColor: COLORES.borde,
  },
  filtroActivo: { backgroundColor: COLORES.primario, borderColor: COLORES.primario },
  filtroTexto: { color: COLORES.textoSecundario, fontWeight: '600', fontSize: 13 },
  filtroTextoActivo: { color: '#fff' },
  resultados: { fontSize: 13, color: COLORES.textoSecundario, marginBottom: 4 },
  tarjeta: { backgroundColor: COLORES.fondoTarjeta, borderRadius: RADIO.lg, overflow: 'hidden', ...SOMBRA },
  tarjetaImagen: {
    height: 150,
    backgroundColor: COLORES.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tarjetaEmoji: { fontSize: 60 },
  tarjetaTipoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORES.primario,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tarjetaTipoBadgeTexto: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  tarjetaBody: { padding: 16 },
  tarjetaTitulo: { fontSize: 17, fontWeight: 'bold', color: COLORES.textoPrincipal },
  tarjetaDireccion: { fontSize: 13, color: COLORES.textoSecundario, marginTop: 4 },
  tarjetaDetalles: { flexDirection: 'row', gap: 12, marginTop: 8 },
  detalle: { fontSize: 13, color: COLORES.textoSecundario },
  tarjetaFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  precio: { fontSize: 20, fontWeight: 'bold', color: COLORES.primario },
  precioSub: { fontSize: 13, fontWeight: 'normal', color: COLORES.textoSecundario },
  btnVer: { backgroundColor: COLORES.primario, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIO.sm },
  btnVerTexto: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});