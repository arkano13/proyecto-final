import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';

import {
  API_BASE_URL,
  API_URLS,
} from '../config/config';

import {
  RADIO,
} from '../estilos/globales';

import {
  useTema,
} from '../context/TemaContext';

export default function Perfil({
  route,
  navigation,
}) {
  const {
    temaOscuro,
    colores,
    cambiarTema,
  } = useTema();

  const styles = crearStyles(colores);

  const usuarioRecibido =
    route?.params?.usuario;

  const usuarioId = Number(
    usuarioRecibido?.id ||
      usuarioRecibido?.usuario_id ||
      0
  );

  const [perfil, setPerfil] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [editando, setEditando] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [
    subiendoFoto,
    setSubiendoFoto,
  ] = useState(false);

  const [
    mostrarClave,
    setMostrarClave,
  ] = useState(false);

  const [usuario, setUsuario] =
    useState('');

  const [
    nombreCompleto,
    setNombreCompleto,
  ] = useState('');

  const [correo, setCorreo] =
    useState('');

  const [telefono, setTelefono] =
    useState('');

  const [
    claveActual,
    setClaveActual,
  ] = useState('');

  const [
    claveNueva,
    setClaveNueva,
  ] = useState('');

  const [
    confirmarClave,
    setConfirmarClave,
  ] = useState('');

  const [
    verClaveActual,
    setVerClaveActual,
  ] = useState(false);

  const [
    verClaveNueva,
    setVerClaveNueva,
  ] = useState(false);

  const [
    verConfirmacion,
    setVerConfirmacion,
  ] = useState(false);

  const [error, setError] =
    useState('');

  const abrirCodigoQR = () => {
    /*
     * Conservamos el token que llegó
     * desde el inicio de sesión.
     *
     * La consulta del perfil podría no
     * devolver todavía usuario_qr_token.
     */
    const usuarioParaQR = {
      ...usuarioRecibido,
      ...perfil,

      qr_token:
        perfil?.qr_token ||
        perfil?.usuario_qr_token ||
        usuarioRecibido?.qr_token ||
        usuarioRecibido?.usuario_qr_token ||
        '',
    };

    navigation.navigate(
      'MiCodigoQR',
      {
        usuario: usuarioParaQR,
      }
    );
  };

  const asignarDatos = (
    datosUsuario
  ) => {
    setPerfil(datosUsuario);

    setUsuario(
      datosUsuario?.usuario ||
        datosUsuario?.usuario_nombre ||
        ''
    );

    setNombreCompleto(
      datosUsuario?.nombre_completo ||
        datosUsuario?.usuario_nombrecomp ||
        ''
    );

    setCorreo(
      datosUsuario?.correo ||
        datosUsuario?.usuario_correo ||
        ''
    );

    setTelefono(
      datosUsuario?.telefono ||
        datosUsuario?.usuario_telefono ||
        ''
    );
  };

  const cargarPerfil =
    useCallback(async () => {
      if (!usuarioId) {
        setError(
          'No se pudo identificar al usuario.'
        );

        setCargando(false);

        return;
      }

      try {
        setCargando(true);
        setError('');

        const respuesta = await fetch(
          API_URLS.CONSULTAR_PERFIL,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json',
            },

            body: JSON.stringify({
              usuario_id: usuarioId,
            }),
          }
        );

        const textoRespuesta =
          await respuesta.text();

        let datos;

        try {
          datos = JSON.parse(
            textoRespuesta
          );
        } catch (errorJson) {
          console.log(
            'Respuesta al consultar perfil:',
            textoRespuesta
          );

          throw new Error(
            'El servidor no devolvió una respuesta válida.'
          );
        }

        if (
          !respuesta.ok ||
          datos.exito === false ||
          datos.success === false
        ) {
          throw new Error(
            datos.mensaje ||
              datos.message ||
              'No se pudo cargar el perfil.'
          );
        }

        const datosUsuario =
          datos.usuario ||
          datos.perfil ||
          datos.data;

        if (!datosUsuario) {
          throw new Error(
            'No se recibieron los datos del usuario.'
          );
        }

        /*
         * No perdemos el token QR que
         * llegó desde el login.
         */
        asignarDatos({
          ...usuarioRecibido,
          ...datosUsuario,

          qr_token:
            datosUsuario?.qr_token ||
            datosUsuario
              ?.usuario_qr_token ||
            usuarioRecibido?.qr_token ||
            usuarioRecibido
              ?.usuario_qr_token ||
            '',
        });
      } catch (errorPeticion) {
        console.error(
          'Error al consultar perfil:',
          errorPeticion
        );

        setError(
          errorPeticion.message ||
            'No se pudo cargar el perfil.'
        );
      } finally {
        setCargando(false);
      }
    }, [
      usuarioId,
      usuarioRecibido,
    ]);

  useFocusEffect(
    useCallback(() => {
      cargarPerfil();
    }, [cargarPerfil])
  );

  const mostrarMensaje = (
    titulo,
    mensaje
  ) => {
    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined'
    ) {
      window.alert(mensaje);
      return;
    }

    Alert.alert(titulo, mensaje);
  };

  const obtenerFoto = () => {
    const ruta =
      perfil?.foto_ruta ||
      perfil?.usuario_img_ruta ||
      '';

    if (!ruta) {
      return null;
    }

    if (
      String(ruta).startsWith(
        'http://'
      ) ||
      String(ruta).startsWith(
        'https://'
      )
    ) {
      return String(ruta);
    }

    const rutaLimpia =
      String(ruta).replace(
        /^\/+/,
        ''
      );

    return `${API_BASE_URL}/${rutaLimpia}`;
  };

  const iniciarEdicion = () => {
    if (perfil) {
      asignarDatos(perfil);
    }

    setError('');
    setEditando(true);
  };

  const cancelarEdicion = () => {
    if (perfil) {
      asignarDatos(perfil);
    }

    setError('');
    setEditando(false);
  };

  const actualizarPerfil =
    async () => {
      const usuarioLimpio =
        usuario.trim();

      const nombreLimpio =
        nombreCompleto.trim();

      const correoLimpio =
        correo.trim();

      const telefonoLimpio =
        telefono.trim();

      if (
        usuarioLimpio === '' ||
        nombreLimpio === '' ||
        correoLimpio === '' ||
        telefonoLimpio === ''
      ) {
        mostrarMensaje(
          'Error',
          'Todos los campos son obligatorios.'
        );

        return;
      }

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          correoLimpio
        )
      ) {
        mostrarMensaje(
          'Error',
          'El correo electrónico no es válido.'
        );

        return;
      }

      if (
        !/^\d+$/.test(
          telefonoLimpio
        )
      ) {
        mostrarMensaje(
          'Error',
          'El teléfono solo debe contener números.'
        );

        return;
      }

      try {
        setGuardando(true);
        setError('');

        const respuesta = await fetch(
          API_URLS.ACTUALIZAR_PERFIL,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json',
            },

            body: JSON.stringify({
              usuario_id: usuarioId,
              usuario: usuarioLimpio,
              nombre_completo:
                nombreLimpio,
              correo: correoLimpio,
              telefono:
                telefonoLimpio,
            }),
          }
        );

        const textoRespuesta =
          await respuesta.text();

        let datos;

        try {
          datos = JSON.parse(
            textoRespuesta
          );
        } catch (errorJson) {
          console.log(
            'Respuesta al actualizar perfil:',
            textoRespuesta
          );

          throw new Error(
            'El servidor no devolvió una respuesta válida.'
          );
        }

        const fueExitoso =
          datos.exito === true ||
          datos.success === true;

        if (
          !respuesta.ok ||
          !fueExitoso
        ) {
          throw new Error(
            datos.mensaje ||
              datos.message ||
              'No se pudo actualizar el perfil.'
          );
        }

        const usuarioActualizado =
          datos.usuario ||
          datos.perfil ||
          datos.data;

        if (usuarioActualizado) {
          asignarDatos({
            ...perfil,
            ...usuarioActualizado,

            qr_token:
              usuarioActualizado
                ?.qr_token ||
              usuarioActualizado
                ?.usuario_qr_token ||
              perfil?.qr_token ||
              perfil
                ?.usuario_qr_token ||
              usuarioRecibido
                ?.qr_token ||
              usuarioRecibido
                ?.usuario_qr_token ||
              '',
          });
        } else {
          await cargarPerfil();
        }

        setEditando(false);

        mostrarMensaje(
          'Perfil actualizado',
          'Tus datos se actualizaron correctamente.'
        );
      } catch (errorPeticion) {
        console.error(
          'Error al actualizar perfil:',
          errorPeticion
        );

        setError(
          errorPeticion.message ||
            'No se pudo actualizar el perfil.'
        );

        mostrarMensaje(
          'Error',
          errorPeticion.message ||
            'No se pudo actualizar el perfil.'
        );
      } finally {
        setGuardando(false);
      }
    };

  const elegirImagen =
    async (origen) => {
      try {
        let resultado;

        if (origen === 'camara') {
          const permiso =
            await ImagePicker
              .requestCameraPermissionsAsync();

          if (!permiso.granted) {
            mostrarMensaje(
              'Permiso requerido',
              'Debes permitir el acceso a la cámara.'
            );

            return;
          }

          resultado =
            await ImagePicker
              .launchCameraAsync({
                mediaTypes:
                  ImagePicker
                    .MediaTypeOptions
                    .Images,

                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
        } else {
          const permiso =
            await ImagePicker
              .requestMediaLibraryPermissionsAsync();

          if (
            Platform.OS !== 'web' &&
            !permiso.granted
          ) {
            mostrarMensaje(
              'Permiso requerido',
              'Debes permitir el acceso a tus fotografías.'
            );

            return;
          }

          resultado =
            await ImagePicker
              .launchImageLibraryAsync({
                mediaTypes:
                  ImagePicker
                    .MediaTypeOptions
                    .Images,

                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
        }

        if (
          resultado.canceled ||
          !resultado.assets ||
          resultado.assets.length === 0
        ) {
          return;
        }

        await subirFotografia(
          resultado.assets[0]
        );
      } catch (errorImagen) {
        console.error(
          'Error al seleccionar fotografía:',
          errorImagen
        );

        mostrarMensaje(
          'Error',
          'No se pudo seleccionar la fotografía.'
        );
      }
    };

  const subirFotografia =
    async (imagen) => {
      if (
        !usuarioId ||
        !imagen?.uri
      ) {
        mostrarMensaje(
          'Error',
          'No se encontró una fotografía válida.'
        );

        return;
      }

      try {
        setSubiendoFoto(true);

        const formulario =
          new FormData();

        formulario.append(
          'tableName',
          'tbl_usuario_img_final'
        );

        formulario.append(
          'fieldID',
          'usuario_id'
        );

        formulario.append(
          'fieldRuta',
          'usuario_img_ruta'
        );

        formulario.append(
          'recordId',
          String(usuarioId)
        );

        if (
          Platform.OS === 'web'
        ) {
          const respuestaArchivo =
            await fetch(imagen.uri);

          const archivoBlob =
            await respuestaArchivo
              .blob();

          const nombreArchivo =
            imagen.fileName ||
            `perfil_${usuarioId}_${Date.now()}.jpg`;

          formulario.append(
            'image',
            archivoBlob,
            nombreArchivo
          );
        } else {
          formulario.append(
            'image',
            {
              uri: imagen.uri,

              name:
                imagen.fileName ||
                `perfil_${usuarioId}_${Date.now()}.jpg`,

              type:
                imagen.mimeType ||
                'image/jpeg',
            }
          );
        }

        const respuesta =
          await fetch(
            API_URLS.SUBIR_FOTO,
            {
              method: 'POST',
              body: formulario,
            }
          );

        const textoRespuesta =
          await respuesta.text();

        let datos;

        try {
          datos = JSON.parse(
            textoRespuesta
          );
        } catch (errorJson) {
          console.log(
            'Respuesta al subir foto:',
            textoRespuesta
          );

          throw new Error(
            'El servidor no devolvió una respuesta válida.'
          );
        }

        if (
          !respuesta.ok ||
          datos.exito === false ||
          datos.success === false
        ) {
          throw new Error(
            datos.mensaje ||
              datos.message ||
              'No se pudo subir la fotografía.'
          );
        }

        await cargarPerfil();

        mostrarMensaje(
          'Fotografía actualizada',
          'La fotografía de perfil se actualizó correctamente.'
        );
      } catch (errorSubida) {
        console.error(
          'Error al subir fotografía:',
          errorSubida
        );

        mostrarMensaje(
          'Error',
          errorSubida.message ||
            'No se pudo subir la fotografía.'
        );
      } finally {
        setSubiendoFoto(false);
      }
    };

  const cambiarClave =
    async () => {
      if (
        claveActual === '' ||
        claveNueva === '' ||
        confirmarClave === ''
      ) {
        mostrarMensaje(
          'Error',
          'Completa todos los campos de contraseña.'
        );

        return;
      }

      if (
        claveNueva.length < 6
      ) {
        mostrarMensaje(
          'Error',
          'La nueva clave debe tener al menos 6 caracteres.'
        );

        return;
      }

      if (
        claveNueva !==
        confirmarClave
      ) {
        mostrarMensaje(
          'Error',
          'Las nuevas claves no coinciden.'
        );

        return;
      }

      try {
        setGuardando(true);
        setError('');

        const respuesta =
          await fetch(
            API_URLS.CAMBIAR_CLAVE,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',

                Accept:
                  'application/json',
              },

              body: JSON.stringify({
                usuario_id:
                  usuarioId,

                clave_actual:
                  claveActual,

                clave_nueva:
                  claveNueva,

                confirmar_clave:
                  confirmarClave,
              }),
            }
          );

        const textoRespuesta =
          await respuesta.text();

        let datos;

        try {
          datos = JSON.parse(
            textoRespuesta
          );
        } catch (errorJson) {
          console.log(
            'Respuesta al cambiar clave:',
            textoRespuesta
          );

          throw new Error(
            'El servidor no devolvió una respuesta válida.'
          );
        }

        const fueExitoso =
          datos.exito === true ||
          datos.success === true;

        if (
          !respuesta.ok ||
          !fueExitoso
        ) {
          throw new Error(
            datos.mensaje ||
              datos.message ||
              'No se pudo cambiar la clave.'
          );
        }

        setClaveActual('');
        setClaveNueva('');
        setConfirmarClave('');
        setMostrarClave(false);

        mostrarMensaje(
          'Clave actualizada',
          'La contraseña se cambió correctamente.'
        );
      } catch (errorClave) {
        console.error(
          'Error al cambiar clave:',
          errorClave
        );

        mostrarMensaje(
          'Error',
          errorClave.message ||
            'No se pudo cambiar la clave.'
        );
      } finally {
        setGuardando(false);
      }
    };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator
          size="large"
          color={colores.primario}
        />

        <Text
          style={styles.textoCargando}
        >
          Cargando perfil...
        </Text>
      </View>
    );
  }

  if (
    error !== '' &&
    !perfil
  ) {
    return (
      <View style={styles.centro}>
        <Ionicons
          name="alert-circle-outline"
          size={55}
          color={colores.peligro}
        />

        <Text
          style={styles.errorPrincipal}
        >
          {error}
        </Text>

        <TouchableOpacity
          style={
            styles.botonReintentar
          }
          onPress={cargarPerfil}
        >
          <Text
            style={styles.textoBoton}
          >
            Volver a intentar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const foto = obtenerFoto();

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.contenido
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.perfilSuperior
          }
        >
          <View
            style={
              styles.fotoContenedor
            }
          >
            {foto ? (
              <Image
                source={{ uri: foto }}
                style={styles.foto}
              />
            ) : (
              <View
                style={styles.sinFoto}
              >
                <Ionicons
                  name="person"
                  size={54}
                  color={
                    colores.primario
                  }
                />
              </View>
            )}

            {subiendoFoto && (
              <View
                style={
                  styles.cargandoFoto
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#ffffff"
                />
              </View>
            )}
          </View>

          <Text
            style={
              styles.nombrePerfil
            }
          >
            {perfil
              ?.nombre_completo ||
              perfil
                ?.usuario_nombrecomp}
          </Text>

          <Text
            style={
              styles.usuarioPerfil
            }
          >
            @{perfil?.usuario ||
              perfil
                ?.usuario_nombre}
          </Text>

          <View style={styles.rol}>
            <Ionicons
              name={
                String(
                  perfil?.rol ||
                    perfil
                      ?.usuario_rol
                ).toLowerCase() ===
                'arrendador'
                  ? 'business-outline'
                  : 'home-outline'
              }
              size={16}
              color={colores.primario}
            />

            <Text
              style={styles.rolTexto}
            >
              {String(
                perfil?.rol ||
                  perfil
                    ?.usuario_rol ||
                  'usuario'
              ).toUpperCase()}
            </Text>
          </View>

          <View
            style={
              styles.botonesFoto
            }
          >
            {Platform.OS !==
              'web' && (
              <TouchableOpacity
                style={
                  styles.botonFoto
                }
                onPress={() =>
                  elegirImagen(
                    'camara'
                  )
                }
                disabled={
                  subiendoFoto
                }
              >
                <Ionicons
                  name="camera-outline"
                  size={19}
                  color={
                    colores.primario
                  }
                />

                <Text
                  style={
                    styles.textoFoto
                  }
                >
                  Cámara
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={
                styles.botonFoto
              }
              onPress={() =>
                elegirImagen(
                  'galeria'
                )
              }
              disabled={
                subiendoFoto
              }
            >
              <Ionicons
                name="images-outline"
                size={19}
                color={
                  colores.primario
                }
              />

              <Text
                style={
                  styles.textoFoto
                }
              >
                Cambiar foto
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={
            styles.seccionTema
          }
        >
          <View
            style={
              styles.temaInformacion
            }
          >
            <View
              style={
                styles.iconoTema
              }
            >
              <Ionicons
                name={
                  temaOscuro
                    ? 'moon-outline'
                    : 'sunny-outline'
                }
                size={23}
                color={
                  colores.primario
                }
              />
            </View>

            <View
              style={
                styles.temaTextos
              }
            >
              <Text
                style={
                  styles.temaTitulo
                }
              >
                Modo oscuro
              </Text>

              <Text
                style={
                  styles
                    .temaDescripcion
                }
              >
                {temaOscuro
                  ? 'Activado'
                  : 'Desactivado'}
              </Text>
            </View>
          </View>

          <Switch
            value={temaOscuro}
            onValueChange={
              cambiarTema
            }
            trackColor={{
              false: '#cbd5e1',
              true:
                colores.primario,
            }}
            thumbColor="#ffffff"
          />
        </View>

        <TouchableOpacity
          style={styles.seccionQR}
          onPress={abrirCodigoQR}
          activeOpacity={0.8}
        >
          <View
            style={
              styles.qrInformacion
            }
          >
            <View
              style={styles.iconoQR}
            >
              <Ionicons
                name="qr-code-outline"
                size={25}
                color={
                  colores.primario
                }
              />
            </View>

            <View
              style={styles.qrTextos}
            >
              <Text
                style={styles.qrTitulo}
              >
                Mi código QR
              </Text>

              <Text
                style={
                  styles.qrDescripcion
                }
              >
                Úsalo para iniciar sesión
                con la cámara
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={
              colores.textoSecundario
            }
          />
        </TouchableOpacity>

        <View style={styles.seccion}>
          <View
            style={
              styles.seccionEncabezado
            }
          >
            <Text
              style={
                styles.seccionTitulo
              }
            >
              Información personal
            </Text>

            {!editando && (
              <TouchableOpacity
                style={
                  styles.botonEditar
                }
                onPress={
                  iniciarEdicion
                }
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={
                    colores.primario
                  }
                />

                <Text
                  style={
                    styles.textoEditar
                  }
                >
                  Editar
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text
            style={styles.etiqueta}
          >
            Nombre de usuario
          </Text>

          <View
            style={
              styles.inputContenedor
            }
          >
            <Ionicons
              name="at-outline"
              size={20}
              color={
                colores
                  .textoSecundario
              }
            />

            <TextInput
              placeholderTextColor={
                colores
                  .textoSecundario
              }
              style={styles.input}
              value={usuario}
              onChangeText={
                setUsuario
              }
              editable={
                editando &&
                !guardando
              }
              autoCapitalize="none"
              placeholder="Usuario"
            />
          </View>

          <Text
            style={styles.etiqueta}
          >
            Nombre completo
          </Text>

          <View
            style={
              styles.inputContenedor
            }
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={
                colores
                  .textoSecundario
              }
            />

            <TextInput
              placeholderTextColor={
                colores
                  .textoSecundario
              }
              style={styles.input}
              value={nombreCompleto}
              onChangeText={
                setNombreCompleto
              }
              editable={
                editando &&
                !guardando
              }
              placeholder="Nombre completo"
            />
          </View>

          <Text
            style={styles.etiqueta}
          >
            Correo electrónico
          </Text>

          <View
            style={
              styles.inputContenedor
            }
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={
                colores
                  .textoSecundario
              }
            />

            <TextInput
              placeholderTextColor={
                colores
                  .textoSecundario
              }
              style={styles.input}
              value={correo}
              onChangeText={setCorreo}
              editable={
                editando &&
                !guardando
              }
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Correo"
            />
          </View>

          <Text
            style={styles.etiqueta}
          >
            Teléfono
          </Text>

          <View
            style={
              styles.inputContenedor
            }
          >
            <Ionicons
              name="call-outline"
              size={20}
              color={
                colores
                  .textoSecundario
              }
            />

            <TextInput
              placeholderTextColor={
                colores
                  .textoSecundario
              }
              style={styles.input}
              value={telefono}
              onChangeText={
                setTelefono
              }
              editable={
                editando &&
                !guardando
              }
              keyboardType="phone-pad"
              placeholder="Teléfono"
            />
          </View>

          {editando && (
            <View
              style={
                styles.botonesEdicion
              }
            >
              <TouchableOpacity
                style={
                  styles.botonCancelar
                }
                onPress={
                  cancelarEdicion
                }
                disabled={guardando}
              >
                <Text
                  style={
                    styles.textoCancelar
                  }
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.botonGuardar
                }
                onPress={
                  actualizarPerfil
                }
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator
                    size="small"
                    color="#ffffff"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="save-outline"
                      size={19}
                      color="#ffffff"
                    />

                    <Text
                      style={
                        styles.textoBoton
                      }
                    >
                      Guardar
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.seccion}>
          <TouchableOpacity
            style={
              styles.claveEncabezado
            }
            onPress={() =>
              setMostrarClave(
                !mostrarClave
              )
            }
          >
            <View
              style={
                styles.claveTituloFila
              }
            >
              <View
                style={
                  styles.iconoClave
                }
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={
                    colores.primario
                  }
                />
              </View>

              <View>
                <Text
                  style={
                    styles.seccionTitulo
                  }
                >
                  Cambiar contraseña
                </Text>

                <Text
                  style={
                    styles
                      .claveDescripcion
                  }
                >
                  Actualiza tu clave de
                  acceso
                </Text>
              </View>
            </View>

            <Ionicons
              name={
                mostrarClave
                  ? 'chevron-up'
                  : 'chevron-down'
              }
              size={22}
              color={
                colores
                  .textoSecundario
              }
            />
          </TouchableOpacity>

          {mostrarClave && (
            <View
              style={
                styles.formularioClave
              }
            >
              <Text
                style={styles.etiqueta}
              >
                Clave actual
              </Text>

              <View
                style={
                  styles.inputContenedor
                }
              >
                <Ionicons
                  name="key-outline"
                  size={20}
                  color={
                    colores
                      .textoSecundario
                  }
                />

                <TextInput
                  placeholderTextColor={
                    colores
                      .textoSecundario
                  }
                  style={styles.input}
                  value={claveActual}
                  onChangeText={
                    setClaveActual
                  }
                  secureTextEntry={
                    !verClaveActual
                  }
                  placeholder="Clave actual"
                  editable={!guardando}
                />

                <TouchableOpacity
                  onPress={() =>
                    setVerClaveActual(
                      !verClaveActual
                    )
                  }
                >
                  <Ionicons
                    name={
                      verClaveActual
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={21}
                    color={
                      colores
                        .textoSecundario
                    }
                  />
                </TouchableOpacity>
              </View>

              <Text
                style={styles.etiqueta}
              >
                Nueva clave
              </Text>

              <View
                style={
                  styles.inputContenedor
                }
              >
                <Ionicons
                  name="lock-open-outline"
                  size={20}
                  color={
                    colores
                      .textoSecundario
                  }
                />

                <TextInput
                  placeholderTextColor={
                    colores
                      .textoSecundario
                  }
                  style={styles.input}
                  value={claveNueva}
                  onChangeText={
                    setClaveNueva
                  }
                  secureTextEntry={
                    !verClaveNueva
                  }
                  placeholder="Mínimo 6 caracteres"
                  editable={!guardando}
                />

                <TouchableOpacity
                  onPress={() =>
                    setVerClaveNueva(
                      !verClaveNueva
                    )
                  }
                >
                  <Ionicons
                    name={
                      verClaveNueva
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={21}
                    color={
                      colores
                        .textoSecundario
                    }
                  />
                </TouchableOpacity>
              </View>

              <Text
                style={styles.etiqueta}
              >
                Confirmar nueva clave
              </Text>

              <View
                style={
                  styles.inputContenedor
                }
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={
                    colores
                      .textoSecundario
                  }
                />

                <TextInput
                  placeholderTextColor={
                    colores
                      .textoSecundario
                  }
                  style={styles.input}
                  value={confirmarClave}
                  onChangeText={
                    setConfirmarClave
                  }
                  secureTextEntry={
                    !verConfirmacion
                  }
                  placeholder="Repite la nueva clave"
                  editable={!guardando}
                />

                <TouchableOpacity
                  onPress={() =>
                    setVerConfirmacion(
                      !verConfirmacion
                    )
                  }
                >
                  <Ionicons
                    name={
                      verConfirmacion
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={21}
                    color={
                      colores
                        .textoSecundario
                    }
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={
                  styles
                    .botonCambiarClave
                }
                onPress={cambiarClave}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator
                    size="small"
                    color="#ffffff"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color="#ffffff"
                    />

                    <Text
                      style={
                        styles.textoBoton
                      }
                    >
                      Cambiar contraseña
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const crearStyles = (
  colores
) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor:
        colores.fondo,
    },

    contenido: {
      padding: 17,
      paddingBottom: 40,
    },

    centro: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 25,
      backgroundColor:
        colores.fondo,
    },

    textoCargando: {
      marginTop: 12,
      color:
        colores.textoSecundario,
    },

    errorPrincipal: {
      marginTop: 12,
      marginBottom: 18,
      textAlign: 'center',
      color: colores.peligro,
    },

    botonReintentar: {
      minHeight: 46,
      paddingHorizontal: 20,
      borderRadius: RADIO.sm,
      backgroundColor:
        colores.primario,
      justifyContent: 'center',
      alignItems: 'center',
    },

    perfilSuperior: {
      alignItems: 'center',
      backgroundColor:
        colores.tarjeta,
      borderRadius: RADIO.lg,
      padding: 22,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colores.borde,
      boxShadow:
        '0px 2px 8px rgba(15, 23, 42, 0.08)',
      elevation: 2,
    },

    fotoContenedor: {
      width: 112,
      height: 112,
      borderRadius: 56,
      position: 'relative',
    },

    foto: {
      width: 112,
      height: 112,
      borderRadius: 56,
      backgroundColor:
        colores.borde,
    },

    sinFoto: {
      width: 112,
      height: 112,
      borderRadius: 56,
      backgroundColor:
        colores.primarioClaro,
      justifyContent: 'center',
      alignItems: 'center',
    },

    cargandoFoto: {
      ...StyleSheet
        .absoluteFillObject,
      borderRadius: 56,
      backgroundColor:
        'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    nombrePerfil: {
      marginTop: 13,
      fontSize: 21,
      fontWeight: 'bold',
      color:
        colores.textoPrincipal,
    },

    usuarioPerfil: {
      marginTop: 3,
      fontSize: 14,
      color:
        colores.textoSecundario,
    },

    rol: {
      marginTop: 9,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor:
        colores.primarioClaro,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    rolTexto: {
      fontSize: 11,
      fontWeight: 'bold',
      color: colores.primario,
    },

    botonesFoto: {
      marginTop: 15,
      flexDirection: 'row',
      gap: 9,
    },

    botonFoto: {
      minHeight: 41,
      paddingHorizontal: 14,
      borderRadius: RADIO.sm,
      borderWidth: 1,
      borderColor:
        colores.primario,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
    },

    textoFoto: {
      color: colores.primario,
      fontWeight: '600',
    },

    seccion: {
      backgroundColor:
        colores.tarjeta,
      borderRadius: RADIO.lg,
      padding: 17,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colores.borde,
      boxShadow:
        '0px 2px 8px rgba(15, 23, 42, 0.08)',
      elevation: 2,
    },

    seccionTema: {
      minHeight: 78,
      paddingHorizontal: 17,
      paddingVertical: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: RADIO.lg,
      backgroundColor:
        colores.tarjeta,
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      boxShadow:
        '0px 2px 8px rgba(15, 23, 42, 0.08)',
      elevation: 2,
    },

    seccionQR: {
      minHeight: 78,
      paddingHorizontal: 17,
      paddingVertical: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: RADIO.lg,
      backgroundColor:
        colores.tarjeta,
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      boxShadow:
        '0px 2px 8px rgba(15, 23, 42, 0.08)',
      elevation: 2,
    },

    qrInformacion: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },

    iconoQR: {
      width: 43,
      height: 43,
      borderRadius: 12,
      backgroundColor:
        colores.primarioClaro,
      justifyContent: 'center',
      alignItems: 'center',
    },

    qrTextos: {
      flex: 1,
      marginLeft: 11,
    },

    qrTitulo: {
      fontSize: 16,
      fontWeight: 'bold',
      color:
        colores.textoPrincipal,
    },

    qrDescripcion: {
      marginTop: 3,
      fontSize: 12,
      color:
        colores.textoSecundario,
    },

    temaInformacion: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },

    iconoTema: {
      width: 43,
      height: 43,
      borderRadius: 12,
      backgroundColor:
        colores.primarioClaro,
      justifyContent: 'center',
      alignItems: 'center',
    },

    temaTextos: {
      flex: 1,
      marginLeft: 11,
    },

    temaTitulo: {
      fontSize: 16,
      fontWeight: 'bold',
      color:
        colores.textoPrincipal,
    },

    temaDescripcion: {
      marginTop: 3,
      fontSize: 12,
      color:
        colores.textoSecundario,
    },

    seccionEncabezado: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    seccionTitulo: {
      fontSize: 17,
      fontWeight: 'bold',
      color:
        colores.textoPrincipal,
    },

    botonEditar: {
      minHeight: 37,
      paddingHorizontal: 11,
      borderRadius: RADIO.sm,
      backgroundColor:
        colores.primarioClaro,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    textoEditar: {
      color: colores.primario,
      fontWeight: 'bold',
    },

    etiqueta: {
      marginTop: 13,
      marginBottom: 7,
      fontSize: 13,
      fontWeight: '600',
      color:
        colores.textoPrincipal,
    },

    inputContenedor: {
      minHeight: 50,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: RADIO.sm,
      backgroundColor:
        colores.campo,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    input: {
      flex: 1,
      minHeight: 48,
      fontSize: 15,
      color:
        colores.textoPrincipal,
    },

    botonesEdicion: {
      marginTop: 17,
      flexDirection: 'row',
      gap: 10,
    },

    botonCancelar: {
      flex: 1,
      minHeight: 46,
      borderRadius: RADIO.sm,
      borderWidth: 1,
      borderColor: colores.borde,
      justifyContent: 'center',
      alignItems: 'center',
    },

    textoCancelar: {
      color:
        colores.textoSecundario,
      fontWeight: 'bold',
    },

    botonGuardar: {
      flex: 1,
      minHeight: 46,
      borderRadius: RADIO.sm,
      backgroundColor:
        colores.primario,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
    },

    textoBoton: {
      color: '#ffffff',
      fontWeight: 'bold',
    },

    claveEncabezado: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    claveTituloFila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
    },

    iconoClave: {
      width: 43,
      height: 43,
      borderRadius: 12,
      backgroundColor:
        colores.primarioClaro,
      justifyContent: 'center',
      alignItems: 'center',
    },

    claveDescripcion: {
      marginTop: 3,
      fontSize: 12,
      color:
        colores.textoSecundario,
    },

    formularioClave: {
      marginTop: 10,
    },

    botonCambiarClave: {
      minHeight: 48,
      marginTop: 17,
      borderRadius: RADIO.sm,
      backgroundColor:
        colores.primario,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 7,
    },
  });