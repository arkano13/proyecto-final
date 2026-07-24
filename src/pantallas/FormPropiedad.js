import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import styles from '../estilos/FormPropiedadStyles';

const TIPOS = ['Casa', 'Apartamento', 'Local', 'Oficina', 'Bodega', 'Terreno'];

export default function FormPropiedad({ navigation, route }) {
  const propExistente = route.params?.propiedad;
  const [titulo, setTitulo] = useState(propExistente?.titulo || '');
  const [descripcion, setDescripcion] = useState(propExistente?.descripcion || '');
  const [direccion, setDireccion] = useState(propExistente?.direccion || '');
  const [precio, setPrecio] = useState(propExistente?.precio?.toString() || '');
  const [tipo, setTipo] = useState(propExistente?.tipo || 'Casa');
  const [foto, setFoto] = useState(null);
  const [ubicacion, setUbicacion] = useState(null);

  const tomarFoto = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setFoto(result.assets[0].uri);
      Alert.alert('✅ Foto tomada', 'La foto se adjuntó correctamente.');
    }
  };

  const obtenerUbicacion = async () => {
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu ubicación.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setUbicacion(loc.coords);
    Alert.alert('📍 Ubicación obtenida', `Lat: ${loc.coords.latitude.toFixed(4)}, Lon: ${loc.coords.longitude.toFixed(4)}`);
  };

  const guardar = () => {
    if (!titulo.trim() || !precio.trim() || !direccion.trim()) {
      Alert.alert('Campos requeridos', 'Título, dirección y precio son obligatorios.');
      return;
    }
    Alert.alert('✅ Guardado', `Propiedad "${titulo}" guardada correctamente.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>{propExistente ? '✏️ Editar Propiedad' : '➕ Nueva Propiedad'}</Text>
        <Text style={styles.headerSub}>Completa la información</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Info básica */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>📋 Información básica</Text>
          <Text style={styles.label}>Título</Text>
          <TextInput style={styles.input} placeholder="Ej: Apartamento céntrico" placeholderTextColor="#94a3b8" value={titulo} onChangeText={setTitulo} />
          <Text style={styles.label}>Descripción</Text>
          <TextInput style={[styles.input, styles.inputMultiline]} placeholder="Describe la propiedad..." placeholderTextColor="#94a3b8" value={descripcion} onChangeText={setDescripcion} multiline />
          <Text style={styles.label}>Tipo de propiedad</Text>
          <View style={styles.tiposContainer}>
            {TIPOS.map(t => (
              <TouchableOpacity key={t} style={[styles.tipoBtn, tipo === t && styles.tipoActivo]} onPress={() => setTipo(t)}>
                <Text style={[styles.tipoTexto, tipo === t && styles.tipoTextoActivo]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Precio mensual (L.)</Text>
          <TextInput style={styles.input} placeholder="Ej: 8000" placeholderTextColor="#94a3b8" value={precio} onChangeText={setPrecio} keyboardType="numeric" />
          <Text style={styles.label}>Dirección</Text>
          <TextInput style={styles.input} placeholder="Ej: Col. Las Palmas, Casa 12" placeholderTextColor="#94a3b8" value={direccion} onChangeText={setDireccion} />
        </View>

        {/* Foto */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>📷 Foto de la propiedad</Text>
          <TouchableOpacity style={styles.fotoBtn} onPress={tomarFoto}>
            <Text style={styles.fotoBtnIcono}>{foto ? '✅' : '📷'}</Text>
            <Text style={styles.fotoBtnTexto}>{foto ? 'Foto tomada' : 'Tomar foto'}</Text>
            <Text style={styles.fotoBtnSub}>{foto ? 'Toca para cambiarla' : 'Abre la cámara del dispositivo'}</Text>
          </TouchableOpacity>
        </View>

        {/* Ubicación */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>📍 Ubicación GPS</Text>
          <TouchableOpacity style={styles.mapaPlaceholder} onPress={obtenerUbicacion}>
            <Text style={styles.mapaIcono}>{ubicacion ? '✅' : '🗺️'}</Text>
            <Text style={styles.mapaTexto}>{ubicacion ? 'Ubicación guardada' : 'Obtener ubicación actual'}</Text>
            <Text style={styles.mapaSub}>Toca para usar el GPS</Text>
          </TouchableOpacity>
          {ubicacion && (
            <Text style={styles.coordTexto}>
              📍 {ubicacion.latitude.toFixed(5)}, {ubicacion.longitude.toFixed(5)}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.btnGuardar} onPress={guardar}>
          <Text style={styles.btnGuardarTexto}>💾 Guardar propiedad</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}