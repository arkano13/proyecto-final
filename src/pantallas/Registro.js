import React, { useState } from 'react';

import {
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';

import styles from '../estilos/RegistroStyles';
import { API_URLS } from '../config/config';

export default function Registro({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [clave, setClave] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [rol, setRol] = useState('inquilino');

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarRegistro = async () => {
    if (
      !nombre.trim() ||
      !email.trim() ||
      !telefono.trim() ||
      !clave.trim() ||
      !confirmar.trim()
    ) {
      setError('Por favor completa todos los campos.');
      return;
    }

    if (clave !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (clave.length < 6) {
      setError(
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    if (!/^\d+$/.test(telefono.trim())) {
      setError(
        'El teléfono solamente debe contener números.'
      );
      return;
    }

    setError('');
    setCargando(true);

    try {
      const correoLimpio =
        email.trim().toLowerCase();

      const respuesta = await fetch(
        API_URLS.REGISTRAR_USUARIO,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            /*
             * Utilizamos el correo como nombre de usuario.
             * Así el usuario puede iniciar sesión con su correo.
             */
            usuario: correoLimpio,
            nombre_completo: nombre.trim(),
            correo: correoLimpio,
            telefono: telefono.trim(),
            clave,
            rol,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.exito) {
        setError(
          datos.mensaje ||
          'No se pudo registrar el usuario.'
        );

        return;
      }

      Alert.alert(
        '✅ Registro completado',
        'Tu cuenta fue creada correctamente.',
        [
          {
            text: 'Iniciar sesión',
            onPress: () =>
              navigation.replace('Login'),
          },
        ]
      );
    } catch (errorPeticion) {
      console.error(
        'Error al registrar usuario:',
        errorPeticion
      );

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
        <Text style={styles.titulo}>
          Crear cuenta
        </Text>

        <Text style={styles.sub}>
          Únete a RentaFácil hoy
        </Text>

        {error ? (
          <Text style={styles.errorTexto}>
            {error}
          </Text>
        ) : null}

        <Text style={styles.label}>
          ¿Cómo usarás la app?
        </Text>

        <View style={styles.rolContainer}>
          <TouchableOpacity
            style={[
              styles.rolBtn,
              rol === 'inquilino' &&
                styles.rolActivo,
            ]}
            onPress={() => setRol('inquilino')}
            disabled={cargando}
          >
            <Text style={styles.rolIcon}>🔍</Text>

            <Text
              style={[
                styles.rolTexto,
                rol === 'inquilino' &&
                  styles.rolTextoActivo,
              ]}
            >
              Inquilino
            </Text>

            <Text style={styles.rolDesc}>
              Busco propiedades
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.rolBtn,
              rol === 'arrendador' &&
                styles.rolActivo,
            ]}
            onPress={() => setRol('arrendador')}
            disabled={cargando}
          >
            <Text style={styles.rolIcon}>🏠</Text>

            <Text
              style={[
                styles.rolTexto,
                rol === 'arrendador' &&
                  styles.rolTextoActivo,
              ]}
            >
              Arrendador
            </Text>

            <Text style={styles.rolDesc}>
              Publico propiedades
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          placeholderTextColor="#94a3b8"
          value={nombre}
          onChangeText={setNombre}
          editable={!cargando}
        />

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!cargando}
        />

        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          placeholderTextColor="#94a3b8"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
          editable={!cargando}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#94a3b8"
          value={clave}
          onChangeText={setClave}
          secureTextEntry
          editable={!cargando}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          placeholderTextColor="#94a3b8"
          value={confirmar}
          onChangeText={setConfirmar}
          secureTextEntry
          editable={!cargando}
        />

        <TouchableOpacity
          style={styles.btn}
          onPress={manejarRegistro}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.btnTexto}>
              Registrarme
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={cargando}
        >
          <Text style={styles.linkTexto}>
            ¿Ya tienes cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}