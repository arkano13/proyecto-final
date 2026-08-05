import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import styles from '../estilos/LoginStyles';
import { API_URLS } from '../config/config';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async () => {
    if (!email.trim() || !clave.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setError('');
    setCargando(true);

    try {
      const respuesta = await fetch(API_URLS.LOGIN, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          usuario_nombre: email.trim(),
          usuario_clave: clave,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.exito) {
        setError(
          datos.mensaje ||
          'Usuario o contraseña incorrectos.'
        );

        return;
      }

      const usuario = datos.usuario;

      if (usuario.rol === 'arrendador') {
        navigation.replace('AdminDashboard', {
          usuario,
        });
      } else {
        navigation.replace('InquilinoTabs', {
          usuario,
        });
      }
    } catch (errorPeticion) {
      console.error('Error de login:', errorPeticion);

      setError(
        'No se pudo conectar con el servidor.'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCirculo}>
            <Text style={styles.logoIcon}>🏠</Text>
          </View>

          <Text style={styles.logoTexto}>
            RentaFácil
          </Text>

          <Text style={styles.logoSub}>
            Tu hogar, un clic más cerca
          </Text>
        </View>

        {error ? (
          <Text style={styles.errorTexto}>
            {error}
          </Text>
        ) : null}

        <TextInput
          style={styles.inputContainer}
          placeholder="Correo electrónico"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!cargando}
        />

        <TextInput
          style={styles.inputContainer}
          placeholder="Contraseña"
          placeholderTextColor="#94a3b8"
          value={clave}
          onChangeText={setClave}
          secureTextEntry
          editable={!cargando}
        />

        <TouchableOpacity
          style={styles.btn}
          onPress={manejarLogin}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.btnTexto}>
              Iniciar sesión
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {}}
          disabled={cargando}
        >
          <Text style={styles.olvidaste}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLinea} />

          <Text style={styles.dividerTexto}>
            ¿Nuevo aquí?
          </Text>

          <View style={styles.dividerLinea} />
        </View>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Registro')
          }
          disabled={cargando}
        >
          <Text style={styles.linkTexto}>
            Crear una cuenta gratis →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}