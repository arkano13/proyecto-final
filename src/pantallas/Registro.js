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
  StyleSheet,
} from 'react-native';

import { API_URLS } from '../config/config';
import { useTema } from '../context/TemaContext';

export default function Registro({ navigation }) {
  const { colores } = useTema();
  const styles = crearStyles(colores);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [clave, setClave] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [rol, setRol] = useState('inquilino');

  const [error, setError] = useState('');
  const [cargando, setCargando] =
    useState(false);

  const manejarRegistro = async () => {
    if (
      !nombre.trim() ||
      !email.trim() ||
      !telefono.trim() ||
      !clave.trim() ||
      !confirmar.trim()
    ) {
      setError(
        'Por favor completa todos los campos.'
      );
      return;
    }

    if (clave !== confirmar) {
      setError(
        'Las contraseñas no coinciden.'
      );
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
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
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

      if (
        Platform.OS === 'web' &&
        typeof window !== 'undefined'
      ) {
        window.alert(
          'Tu cuenta fue creada correctamente.'
        );
        navigation.replace('Login');
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
      style={styles.pantalla}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
          placeholderTextColor={
            colores.textoSecundario
          }
          value={nombre}
          onChangeText={setNombre}
          editable={!cargando}
        />

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor={
            colores.textoSecundario
          }
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!cargando}
        />

        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          placeholderTextColor={
            colores.textoSecundario
          }
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
          editable={!cargando}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={
            colores.textoSecundario
          }
          value={clave}
          onChangeText={setClave}
          secureTextEntry
          editable={!cargando}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          placeholderTextColor={
            colores.textoSecundario
          }
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
            <ActivityIndicator
              color={colores.primarioTexto}
            />
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

const crearStyles = (colores) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: colores.fondo,
    },

    container: {
      flexGrow: 1,
      backgroundColor: colores.fondo,
      paddingHorizontal: 28,
      paddingVertical: 50,
    },

    titulo: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colores.primario,
      textAlign: 'center',
    },

    sub: {
      fontSize: 15,
      color: colores.textoSecundario,
      textAlign: 'center',
      marginBottom: 28,
      marginTop: 4,
    },

    label: {
      fontSize: 15,
      fontWeight: '600',
      color: colores.textoPrincipal,
      marginBottom: 12,
    },

    rolContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },

    rolBtn: {
      flex: 1,
      backgroundColor: colores.tarjeta,
      borderWidth: 2,
      borderColor: colores.borde,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      boxShadow:
        '0px 2px 8px rgba(15, 23, 42, 0.08)',
      elevation: 2,
    },

    rolActivo: {
      borderColor: colores.primario,
      backgroundColor: colores.primarioClaro,
    },

    rolIcon: {
      fontSize: 32,
      marginBottom: 6,
    },

    rolTexto: {
      fontWeight: 'bold',
      color: colores.textoSecundario,
      fontSize: 15,
    },

    rolTextoActivo: {
      color: colores.primario,
    },

    rolDesc: {
      fontSize: 12,
      color: colores.textoSecundario,
      marginTop: 3,
      textAlign: 'center',
    },

    input: {
      backgroundColor: colores.campo,
      borderWidth: 1.5,
      borderColor: colores.borde,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      marginBottom: 14,
      color: colores.textoPrincipal,
      boxShadow:
        '0px 2px 8px rgba(15, 23, 42, 0.08)',
      elevation: 2,
    },

    btn: {
      backgroundColor: colores.primario,
      padding: 17,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 6,
      boxShadow:
        '0px 2px 8px rgba(15, 23, 42, 0.08)',
      elevation: 2,
    },

    btnTexto: {
      color: colores.primarioTexto,
      fontWeight: 'bold',
      fontSize: 17,
      letterSpacing: 0.5,
    },

    linkTexto: {
      textAlign: 'center',
      color: colores.primario,
      fontWeight: '600',
      marginTop: 22,
      fontSize: 15,
    },

    errorTexto: {
      color: colores.peligro,
      textAlign: 'center',
      marginBottom: 12,
      fontWeight: '600',
      backgroundColor: colores.peligroClaro,
      padding: 10,
      borderRadius: 8,
    },
  });