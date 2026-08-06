import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

import { useTema } from '../context/TemaContext';
import { RADIO, SOMBRA } from '../estilos/globales';

export default function MiCodigoQR({
  route,
  navigation,
}) {
  const { colores } = useTema();
  const styles = crearStyles(colores);

  const usuario = route?.params?.usuario;

  const qrToken = String(
    usuario?.qr_token ||
      usuario?.usuario_qr_token ||
      ''
  ).trim();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.btnVolver}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colores.textoPrincipal}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitulo}>
          Mi código QR
        </Text>

        <View style={styles.espacioHeader} />
      </View>

      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconoCirculo}>
          <Ionicons
            name="qr-code-outline"
            size={44}
            color={colores.primario}
          />
        </View>

        <Text style={styles.titulo}>
          Código de acceso
        </Text>

        <Text style={styles.descripcion}>
          Escanea este código desde la pantalla de
          inicio de sesión para entrar a tu cuenta.
        </Text>

        {qrToken ? (
          <View style={styles.tarjetaQr}>
            <View style={styles.fondoQr}>
              <QRCode
                value={qrToken}
                size={230}
                color="#111827"
                backgroundColor="#ffffff"
              />
            </View>

            <View style={styles.usuarioFila}>
              <Ionicons
                name="person-circle-outline"
                size={22}
                color={colores.primario}
              />

              <Text style={styles.usuarioTexto}>
                {usuario?.nombre_completo ||
                  usuario?.usuario ||
                  'Usuario'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.tarjetaError}>
            <Ionicons
              name="alert-circle-outline"
              size={34}
              color={colores.advertencia}
            />

            <Text style={styles.errorTitulo}>
              Código no disponible
            </Text>

            <Text style={styles.errorTexto}>
              Cierra sesión e inicia nuevamente con
              tu correo y contraseña para generar el
              código QR.
            </Text>
          </View>
        )}

        <View style={styles.aviso}>
          <Ionicons
            name="shield-checkmark-outline"
            size={24}
            color={colores.advertencia}
          />

          <Text style={styles.avisoTexto}>
            Este código permite ingresar a tu cuenta.
            No lo compartas con otras personas.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btnCerrar}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnCerrarTexto}>
            Volver al perfil
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function crearStyles(colores) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colores.fondo,
    },

    header: {
      minHeight: 64,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colores.tarjeta,
      borderBottomWidth: 1,
      borderBottomColor: colores.borde,
    },

    btnVolver: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 21,
      backgroundColor: colores.campo,
    },

    headerTitulo: {
      fontSize: 19,
      fontWeight: '800',
      color: colores.textoPrincipal,
    },

    espacioHeader: {
      width: 42,
    },

    contenido: {
      flexGrow: 1,
      alignItems: 'center',
      paddingHorizontal: 22,
      paddingTop: 32,
      paddingBottom: 40,
    },

    iconoCirculo: {
      width: 78,
      height: 78,
      borderRadius: 39,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colores.primarioClaro,
      marginBottom: 16,
    },

    titulo: {
      fontSize: 25,
      fontWeight: '900',
      color: colores.textoPrincipal,
      textAlign: 'center',
    },

    descripcion: {
      maxWidth: 360,
      marginTop: 8,
      marginBottom: 24,
      fontSize: 15,
      lineHeight: 22,
      color: colores.textoSecundario,
      textAlign: 'center',
    },

    tarjetaQr: {
      width: '100%',
      maxWidth: 350,
      alignItems: 'center',
      padding: 22,
      borderRadius: RADIO,
      backgroundColor: colores.tarjeta,
      borderWidth: 1,
      borderColor: colores.borde,
      ...SOMBRA,
    },

    fondoQr: {
      padding: 14,
      borderRadius: 16,
      backgroundColor: '#ffffff',
    },

    usuarioFila: {
      marginTop: 18,
      flexDirection: 'row',
      alignItems: 'center',
    },

    usuarioTexto: {
      flexShrink: 1,
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '700',
      color: colores.textoPrincipal,
      textAlign: 'center',
    },

    tarjetaError: {
      width: '100%',
      maxWidth: 350,
      alignItems: 'center',
      padding: 24,
      borderRadius: RADIO,
      backgroundColor: colores.tarjeta,
      borderWidth: 1,
      borderColor: colores.borde,
    },

    errorTitulo: {
      marginTop: 10,
      fontSize: 18,
      fontWeight: '800',
      color: colores.textoPrincipal,
    },

    errorTexto: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 21,
      color: colores.textoSecundario,
      textAlign: 'center',
    },

    aviso: {
      width: '100%',
      maxWidth: 350,
      marginTop: 20,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: RADIO,
      backgroundColor: colores.advertenciaClaro,
    },

    avisoTexto: {
      flex: 1,
      marginLeft: 11,
      fontSize: 13,
      lineHeight: 19,
      color: colores.textoPrincipal,
    },

    btnCerrar: {
      width: '100%',
      maxWidth: 350,
      minHeight: 50,
      marginTop: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIO,
      backgroundColor: colores.primario,
    },

    btnCerrarTexto: {
      fontSize: 16,
      fontWeight: '800',
      color: '#ffffff',
    },
  });
}