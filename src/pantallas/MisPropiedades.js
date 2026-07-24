import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import styles from '../estilos/MisPropiedadesStyles';

const PROPIEDADES_MOCK = [
  { id: 1, titulo: 'Apartamento Centro', direccion: 'Col. Centro, Bloque 4', precio: 5500, tipo: 'Apartamento', estado: 'disponible', emoji: '🏢' },
  { id: 2, titulo: 'Casa Familiar', direccion: 'Res. Las Palmas, Casa 12', precio: 8000, tipo: 'Casa', estado: 'ocupada', emoji: '🏡' },
  { id: 3, titulo: 'Local Comercial', direccion: 'Av. Principal #45', precio: 12000, tipo: 'Local', estado: 'disponible', emoji: '🏪' },
];

export default function MisPropiedades({ navigation }) {
  const [propiedades, setPropiedades] = useState(PROPIEDADES_MOCK);

  const eliminar = (id) => {
    Alert.alert('Eliminar', '¿Seguro que deseas eliminar esta propiedad?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => setPropiedades(p => p.filter(x => x.id !== id)) },
    ]);
  };

  return (
    <View style={styles.container}>
   <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Text style={{ color: '#fff', fontSize: 22, marginRight: 10 }}>←</Text>
  </TouchableOpacity>
  <Text style={styles.headerTitulo}>🏠 Mis Propiedades</Text>
  <TouchableOpacity style={styles.btnAgregar} onPress={() => navigation.navigate('FormPropiedad', { propiedad: null })}>
    <Text style={styles.btnAgregarTexto}>+ Agregar</Text>
  </TouchableOpacity>
</View>

      {propiedades.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioIcono}>🏚️</Text>
          <Text style={styles.vacioTexto}>Sin propiedades</Text>
          <Text style={styles.vacioSub}>Agrega tu primera propiedad</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {propiedades.map(p => (
            <View key={p.id} style={styles.tarjeta}>
              <View style={styles.tarjetaImagen}>
                <Text style={styles.tarjetaImagenEmoji}>{p.emoji}</Text>
                <View style={[styles.tarjetaBadge, p.estado === 'disponible' ? styles.badgeDisponible : styles.badgeOcupada]}>
                  <Text style={styles.badgeTexto}>{p.estado === 'disponible' ? '✓ Disponible' : '• Ocupada'}</Text>
                </View>
              </View>
              <View style={styles.tarjetaBody}>
                <Text style={styles.tarjetaTitulo}>{p.titulo}</Text>
                <Text style={styles.tarjetaDireccion}>📍 {p.direccion}</Text>
                <Text style={styles.tarjetaPrecio}>L. {p.precio.toLocaleString()} <Text style={styles.tarjetaPrecioSub}>/mes</Text></Text>
                <View style={styles.tarjetaAcciones}>
                  <TouchableOpacity style={styles.btnEditar} onPress={() => navigation.navigate('FormPropiedad', { propiedad: p })}>
                    <Text style={styles.btnEditarTexto}>✏️ Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminar(p.id)}>
                    <Text style={styles.btnEliminarTexto}>🗑️ Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}