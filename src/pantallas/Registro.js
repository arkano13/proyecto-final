import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import styles from '../estilos/RegistroStyles';

export default function Registro({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [clave, setClave] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [rol, setRol] = useState('inquilino');
  const [error, setError] = useState('');

  const manejarRegistro = () => {
    if (!nombre.trim() || !email.trim() || !clave.trim() || !confirmar.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (clave !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError('');
    if (rol === 'arrendador') {
      navigation.replace('AdminDashboard');
    } else {
      navigation.replace('InquilinoTabs');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.titulo}>Crear cuenta</Text>
        <Text style={styles.sub}>Únete a RentaFácil hoy</Text>

        {error ? <Text style={styles.errorTexto}>{error}</Text> : null}

        <Text style={styles.label}>¿Cómo usarás la app?</Text>
        <View style={styles.rolContainer}>
          <TouchableOpacity
            style={[styles.rolBtn, rol === 'inquilino' && styles.rolActivo]}
            onPress={() => setRol('inquilino')}
          >
            <Text style={styles.rolIcon}>🔍</Text>
            <Text style={[styles.rolTexto, rol === 'inquilino' && styles.rolTextoActivo]}>Inquilino</Text>
            <Text style={styles.rolDesc}>Busco propiedades</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rolBtn, rol === 'arrendador' && styles.rolActivo]}
            onPress={() => setRol('arrendador')}
          >
            <Text style={styles.rolIcon}>🏠</Text>
            <Text style={[styles.rolTexto, rol === 'arrendador' && styles.rolTextoActivo]}>Arrendador</Text>
            <Text style={styles.rolDesc}>Publico propiedades</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="Nombre completo" placeholderTextColor="#94a3b8" value={nombre} onChangeText={setNombre} />
        <TextInput style={styles.input} placeholder="Correo electrónico" placeholderTextColor="#94a3b8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Teléfono" placeholderTextColor="#94a3b8" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="#94a3b8" value={clave} onChangeText={setClave} secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirmar contraseña" placeholderTextColor="#94a3b8" value={confirmar} onChangeText={setConfirmar} secureTextEntry />

        <TouchableOpacity style={styles.btn} onPress={manejarRegistro}>
          <Text style={styles.btnTexto}>Registrarme</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.linkTexto}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}