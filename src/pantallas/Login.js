import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import styles from '../estilos/LoginStyles';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');

  const manejarLogin = () => {
    if (!email.trim() || !clave.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setError('');
    if (email.includes('admin')) {
      navigation.replace('AdminDashboard');
    } else {
      navigation.replace('InquilinoTabs');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.logoContainer}>
          <View style={styles.logoCirculo}>
            <Text style={styles.logoIcon}>🏠</Text>
          </View>
          <Text style={styles.logoTexto}>RentaFácil</Text>
          <Text style={styles.logoSub}>Tu hogar, un clic más cerca</Text>
        </View>

        {error ? <Text style={styles.errorTexto}>{error}</Text> : null}

        <TextInput
          style={styles.inputContainer}
          placeholder="Correo electrónico"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.inputContainer}
          placeholder="Contraseña"
          placeholderTextColor="#94a3b8"
          value={clave}
          onChangeText={setClave}
          secureTextEntry
        />

        <TouchableOpacity style={styles.btn} onPress={manejarLogin}>
          <Text style={styles.btnTexto}>Iniciar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.olvidaste}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLinea} />
          <Text style={styles.dividerTexto}>¿Nuevo aquí?</Text>
          <View style={styles.dividerLinea} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
          <Text style={styles.linkTexto}>Crear una cuenta gratis →</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}