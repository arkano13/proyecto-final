import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';

import { API_URLS } from '../config/config';
import { useTema } from '../context/TemaContext';

export default function RecuperarClave({
  navigation,
}) {
  const { colores } = useTema();
  const styles = crearStyles(colores);
  const localStyles =
    crearLocalStyles(colores);

  const [paso, setPaso] = useState(1);

  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaClave, setNuevaClave] =
    useState('');
  const [confirmarClave, setConfirmarClave] =
    useState('');

  const [error, setError] = useState('');
  const [cargando, setCargando] =
    useState(false);

  const [segundos, setSegundos] =
    useState(0);

  useEffect(() => {
    if (segundos <= 0) {
      return undefined;
    }

    const temporizador = setInterval(() => {
      setSegundos((valor) => {
        if (valor <= 1) {
          clearInterval(temporizador);
          return 0;
        }

        return valor - 1;
      });
    }, 1000);

    return () => {
      clearInterval(temporizador);
    };
  }, [segundos]);

  const leerRespuesta = async (
    respuesta
  ) => {
    const texto = await respuesta.text();

    try {
      return JSON.parse(texto);
    } catch (errorJson) {
      console.error(
        'Respuesta del servidor:',
        texto
      );

      throw new Error(
        'El servidor respondió incorrectamente.'
      );
    }
  };

  const solicitarCodigo = async () => {
    const correoLimpio =
      correo.trim().toLowerCase();

    if (!correoLimpio) {
      setError(
        'Escribe tu correo electrónico.'
      );
      return;
    }

    if (!correoLimpio.includes('@')) {
      setError(
        'Escribe un correo electrónico válido.'
      );
      return;
    }

    setError('');
    setCargando(true);

    try {
      const respuesta = await fetch(
        API_URLS
          .SOLICITAR_CODIGO_RECUPERACION,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            correo: correoLimpio,
          }),
        }
      );

      const datos = await leerRespuesta(
        respuesta
      );

      if (
        !respuesta.ok ||
        (!datos.exito && !datos.success)
      ) {
        throw new Error(
          datos.mensaje ||
            'No se pudo enviar el código.'
        );
      }

      setCorreo(correoLimpio);
      setPaso(2);
      setSegundos(60);

      if (Platform.OS === 'web') {
        window.alert(
          'Código enviado. Revisa tu correo.'
        );
      } else {
        Alert.alert(
          'Código enviado',
          'Revisa tu correo electrónico.'
        );
      }
    } catch (errorPeticion) {
      console.error(
        'Error al solicitar código:',
        errorPeticion
      );

      setError(errorPeticion.message);
    } finally {
      setCargando(false);
    }
  };

  const restablecerClave = async () => {
    const codigoLimpio = codigo.trim();

    if (!codigoLimpio) {
      setError(
        'Escribe el código recibido.'
      );
      return;
    }

    if (codigoLimpio.length !== 6) {
      setError(
        'El código debe tener 6 números.'
      );
      return;
    }

    if (!nuevaClave) {
      setError(
        'Escribe la nueva contraseña.'
      );
      return;
    }

    if (nuevaClave.length < 4) {
      setError(
        'La contraseña debe tener al menos 4 caracteres.'
      );
      return;
    }

    if (nuevaClave !== confirmarClave) {
      setError(
        'Las contraseñas no coinciden.'
      );
      return;
    }

    setError('');
    setCargando(true);

    try {
      const respuesta = await fetch(
        API_URLS.RESTABLECER_CLAVE,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            correo:
              correo.trim().toLowerCase(),

            codigo: codigoLimpio,

            nueva_clave: nuevaClave,

            confirmar_clave:
              confirmarClave,
          }),
        }
      );

      const datos = await leerRespuesta(
        respuesta
      );

      if (
        !respuesta.ok ||
        (!datos.exito && !datos.success)
      ) {
        throw new Error(
          datos.mensaje ||
            'No se pudo cambiar la contraseña.'
        );
      }

      if (Platform.OS === 'web') {
        window.alert(
          'La contraseña se actualizó correctamente.'
        );

        navigation.replace('Login');
        return;
      }

      Alert.alert(
        'Contraseña actualizada',
        'Ya puedes iniciar sesión con tu nueva contraseña.',
        [
          {
            text: 'Aceptar',
            onPress: () =>
              navigation.replace('Login'),
          },
        ]
      );
    } catch (errorPeticion) {
      console.error(
        'Error al restablecer contraseña:',
        errorPeticion
      );

      setError(errorPeticion.message);
    } finally {
      setCargando(false);
    }
  };

  const reenviarCodigo = async () => {
    if (
      segundos > 0 ||
      cargando
    ) {
      return;
    }

    await solicitarCodigo();
  };

  const volverLogin = () => {
    navigation.navigate('Login');
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
        contentContainerStyle={
          styles.container
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCirculo}>
            <Text style={styles.logoIcon}>
              🔑
            </Text>
          </View>

          <Text style={styles.logoTexto}>
            Recuperar contraseña
          </Text>

          <Text style={styles.logoSub}>
            {paso === 1
              ? 'Escribe tu correo registrado'
              : 'Escribe el código enviado a tu correo'}
          </Text>
        </View>

        {error ? (
          <Text style={styles.errorTexto}>
            {error}
          </Text>
        ) : null}

        {paso === 1 ? (
          <>
            <TextInput
              style={styles.inputContainer}
              placeholder="Correo electrónico"
              placeholderTextColor={colores.textoSecundario}
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!cargando}
            />

            <TouchableOpacity
              style={styles.btn}
              onPress={solicitarCodigo}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator
                  color={colores.primarioTexto}
                />
              ) : (
                <Text
                  style={styles.btnTexto}
                >
                  Enviar código
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={localStyles.correo}>
              Código enviado a {correo}
            </Text>

            <TextInput
              style={[
                styles.inputContainer,
                localStyles.codigo,
              ]}
              placeholder="Código de 6 números"
              placeholderTextColor={colores.textoSecundario}
              value={codigo}
              onChangeText={(texto) => {
                const soloNumeros =
                  texto.replace(
                    /[^0-9]/g,
                    ''
                  );

                setCodigo(
                  soloNumeros.slice(0, 6)
                );
              }}
              keyboardType="number-pad"
              maxLength={6}
              editable={!cargando}
            />

            <TextInput
              style={styles.inputContainer}
              placeholder="Nueva contraseña"
              placeholderTextColor={colores.textoSecundario}
              value={nuevaClave}
              onChangeText={setNuevaClave}
              secureTextEntry
              editable={!cargando}
            />

            <TextInput
              style={styles.inputContainer}
              placeholder="Confirmar contraseña"
              placeholderTextColor={colores.textoSecundario}
              value={confirmarClave}
              onChangeText={
                setConfirmarClave
              }
              secureTextEntry
              editable={!cargando}
            />

            <TouchableOpacity
              style={styles.btn}
              onPress={restablecerClave}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator
                  color={colores.primarioTexto}
                />
              ) : (
                <Text
                  style={styles.btnTexto}
                >
                  Cambiar contraseña
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={reenviarCodigo}
              disabled={
                segundos > 0 ||
                cargando
              }
            >
              <Text
                style={[
                  styles.olvidaste,
                  segundos > 0 &&
                    localStyles.deshabilitado,
                ]}
              >
                {segundos > 0
                  ? `Reenviar código en ${segundos}s`
                  : 'Reenviar código'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setPaso(1);
                setError('');
                setCodigo('');
              }}
              disabled={cargando}
            >
              <Text style={styles.linkTexto}>
                Cambiar correo
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={volverLogin}
          disabled={cargando}
        >
          <Text style={localStyles.volver}>
            ← Volver al inicio de sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const crearLocalStyles = (colores) =>
  StyleSheet.create({
  correo: {
    color: colores.textoSecundario,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },

  codigo: {
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 4,
  },

  deshabilitado: {
    color: colores.textoSecundario,
  },

  volver: {
    marginTop: 25,
    color: colores.textoSecundario,
    fontSize: 14,
    textAlign: 'center',
  },
  });

const crearStyles = (colores) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: colores.fondo,
    },

    container: {
      flexGrow: 1,
      backgroundColor: colores.fondo,
      justifyContent: 'center',
      paddingHorizontal: 28,
      paddingVertical: 40,
    },

    logoContainer: {
      alignItems: 'center',
      marginBottom: 35,
    },

    logoCirculo: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: colores.primarioClaro,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },

    logoIcon: {
      fontSize: 44,
    },

    logoTexto: {
      fontSize: 27,
      fontWeight: 'bold',
      color: colores.primario,
      textAlign: 'center',
    },

    logoSub: {
      fontSize: 14,
      lineHeight: 20,
      color: colores.textoSecundario,
      marginTop: 6,
      textAlign: 'center',
    },

    inputContainer: {
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
    },

    linkTexto: {
      textAlign: 'center',
      color: colores.primario,
      fontWeight: '600',
      marginTop: 20,
      fontSize: 15,
    },

    olvidaste: {
      textAlign: 'center',
      color: colores.textoSecundario,
      marginTop: 14,
      fontSize: 14,
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