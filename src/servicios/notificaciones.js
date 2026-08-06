import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { API_URLS } from '../config/config';

/*
 * Este identificador ya está en app.json.
 * No es una contraseña ni un dato secreto.
 */
const EXPO_PROJECT_ID =
  '1ca20c8a-ebfe-4e6f-bc8f-43593270fddb';

/*
 * Permite mostrar la notificación cuando
 * la aplicación está abierta.
 */
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const obtenerUsuarioId = (usuario) => {
  return Number(
    usuario?.id ||
      usuario?.usuario_id ||
      0
  );
};

const leerRespuesta = async (respuesta) => {
  const texto = await respuesta.text();

  try {
    return JSON.parse(texto);
  } catch (error) {
    console.log(
      'Respuesta de dispositivo:',
      texto
    );

    throw new Error(
      'El servidor respondió incorrectamente.'
    );
  }
};

export async function registrarNotificaciones(
  usuario
) {
  /*
   * Las notificaciones push no se registran
   * cuando se ejecuta la versión web.
   */
  if (Platform.OS === 'web') {
    console.log(
      'Las notificaciones push se registran únicamente en Android o iOS.'
    );

    return null;
  }

  const usuarioId =
    obtenerUsuarioId(usuario);

  if (!usuarioId) {
    console.log(
      'No se pudo identificar al usuario para registrar las notificaciones.'
    );

    return null;
  }

  try {
    /*
     * Crear el canal de notificaciones
     * requerido por Android.
     */
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        'rentafacil',
        {
          name: 'RentaFácil',
          description:
            'Notificaciones de solicitudes, contratos y pagos',
          importance:
            Notifications.AndroidImportance.MAX,
          vibrationPattern: [
            0,
            250,
            250,
            250,
          ],
          lightColor: '#0f766e',
          sound: 'default',
        }
      );
    }

    /*
     * Consultar el permiso actual.
     */
    const permisoActual =
      await Notifications.getPermissionsAsync();

    let estadoPermiso =
      permisoActual.status;

    /*
     * Solicitar permiso si todavía
     * no fue concedido.
     */
    if (estadoPermiso !== 'granted') {
      const nuevoPermiso =
        await Notifications.requestPermissionsAsync();

      estadoPermiso =
        nuevoPermiso.status;
    }

    if (estadoPermiso !== 'granted') {
      console.log(
        'El usuario no permitió las notificaciones.'
      );

      return null;
    }

    /*
     * Obtener el token Expo del teléfono.
     */
    const resultadoToken =
      await Notifications.getExpoPushTokenAsync({
        projectId: EXPO_PROJECT_ID,
      });

    const pushToken =
      resultadoToken.data;

    if (!pushToken) {
      throw new Error(
        'No se pudo obtener el token de notificaciones.'
      );
    }

    /*
     * Utilizamos el token como identificador
     * único del dispositivo.
     */
    const datosDispositivo = {
      dispo_unique_id: pushToken,
      usuario_id: usuarioId,
      dispo_push_token: pushToken,

      dispo_nombre_equipo:
        `RentaFácil ${Platform.OS}`,

      dispo_marca:
        Platform.OS === 'android'
          ? 'Android'
          : 'Apple',

      dispo_modelo: null,
      dispo_so: Platform.OS,

      dispo_so_version:
        String(Platform.Version),

      dispo_dir_mac: null,
    };

    const respuesta = await fetch(
      API_URLS.REGISTRAR_DISPOSITIVO,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
          Accept: 'application/json',
        },

        body: JSON.stringify(
          datosDispositivo
        ),
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
          'No se pudo registrar el dispositivo.'
      );
    }

    console.log(
      'Token de notificaciones registrado:',
      pushToken
    );

    return pushToken;
  } catch (error) {
    /*
     * Un error de notificaciones nunca
     * debe impedir el inicio de sesión.
     */
    console.error(
      'Error al registrar notificaciones:',
      error
    );

    return null;
  }
}