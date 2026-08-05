import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { API_URLS } from '../config/config';
import { registrarBitacora } from '../utils/bitacora';
import { COLORES, RADIO, SOMBRA } from '../estilos/globales';

export default function Perfil() {
  const { usuario, actualizarFoto } = useAuth();
  const [subiendo, setSubiendo] = useState(false);

  const elegirOrigen = () => {
    Alert.alert(
      'Foto de perfil',
      '¿Cómo quieres elegir tu foto?',
      [
        { text: '📷 Tomar foto', onPress: tomarFoto },
        { text: '🖼️ Elegir de galería', onPress: elegirDeGaleria },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const tomarFoto = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a la cámara para tomar tu foto de perfil.');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (resultado.canceled) return;
    subirFoto(resultado.assets[0]);
  };

  const elegirDeGaleria = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tus fotos para elegir una imagen de perfil.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (resultado.canceled) return;
    subirFoto(resultado.assets[0]);
  };

  const subirFoto = async (foto) => {
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append('tableName', 'tbl_usuario_img_final');
      formData.append('fieldID', 'usuario_id');
      formData.append('fieldRuta', 'usuario_img_ruta');
      formData.append('recordId', String(usuario.id));
      formData.append('image', {
        uri: foto.uri,
        name: `perfil_${usuario.id}.jpg`,
        type: 'image/jpeg',
      });

      const respuesta = await fetch(API_URLS.UPLOAD_PHOTO, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = await respuesta.json();

      if (!data.success) {
        Alert.alert('Error', data.message || 'No se pudo subir la foto.');
        registrarBitacora(usuario.id, 'ACTUALIZAR_FOTO_PERFIL', 'tbl_usuario_img_final', usuario.id, 'FALLIDO');
        return;
      }

      actualizarFoto(data.imageUrl);
      registrarBitacora(usuario.id, 'ACTUALIZAR_FOTO_PERFIL', 'tbl_usuario_img_final', usuario.id, 'EXITOSO');

    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
      registrarBitacora(usuario.id, 'ACTUALIZAR_FOTO_PERFIL', 'tbl_usuario_img_final', usuario.id, 'FALLIDO');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={elegirOrigen} disabled={subiendo} style={styles.avatarWrap}>
        {subiendo ? (
          <View style={styles.avatarPlaceholder}>
            <ActivityIndicator color={COLORES.primario} />
          </View>
        ) : usuario?.foto ? (
          <Image source={{ uri: usuario.foto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={{ fontSize: 40 }}>👤</Text>
          </View>
        )}
        <View style={styles.camaraBadge}>
          <Text style={{ fontSize: 16 }}>📷</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.nombre}>{usuario?.nombre_completo || 'Usuario'}</Text>
      <Text style={styles.correo}>{usuario?.correo}</Text>

      <TouchableOpacity style={styles.btn} onPress={elegirOrigen} disabled={subiendo}>
        <Text style={styles.btnTexto}>
          {subiendo ? 'Subiendo...' : (usuario?.foto ? 'Cambiar foto' : 'Elegir foto de perfil')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo,
    alignItems: 'center',
    paddingTop: 60,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORES.borde,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORES.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camaraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORES.primario,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  nombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORES.textoPrincipal,
    marginTop: 16,
  },
  correo: {
    fontSize: 14,
    color: COLORES.textoSecundario,
    marginTop: 2,
  },
  btn: {
    backgroundColor: COLORES.primario,
    borderRadius: RADIO.md,
    paddingVertical: 14,
    paddingHorizontal: 30,
    marginTop: 24,
    ...SOMBRA,
  },
  btnTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});