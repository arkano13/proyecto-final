import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/*
 * Clave utilizada para guardar la
 * sesión en el almacenamiento seguro
 * del teléfono.
 */
const CLAVE_SESION = 'rentafacil_sesion_usuario';

/*
 * Guarda al usuario en el
 * almacenamiento seguro del
 * dispositivo para no tener que
 * iniciar sesión cada vez que se
 * abre la aplicación.
 */
export async function guardarSesion(
  usuario
) {
  if (Platform.OS === 'web') {
    console.log(
      'La sesión no se guarda en la versión web.'
    );

    return;
  }

  if (!usuario) {
    return;
  }

  try {
    await SecureStore.setItemAsync(
      CLAVE_SESION,
      JSON.stringify(usuario)
    );
  } catch (error) {
    console.error(
      'Error al guardar la sesión:',
      error
    );
  }
}

/*
 * Consulta la sesión guardada en el
 * teléfono. Devuelve null si no hay
 * ninguna sesión guardada.
 */
export async function obtenerSesion() {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const guardado =
      await SecureStore.getItemAsync(
        CLAVE_SESION
      );

    if (!guardado) {
      return null;
    }

    return JSON.parse(guardado);
  } catch (error) {
    console.error(
      'Error al leer la sesión guardada:',
      error
    );

    return null;
  }
}

/*
 * Borra la sesión guardada en el
 * teléfono. Se usa al cerrar sesión.
 */
export async function borrarSesion() {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await SecureStore.deleteItemAsync(
      CLAVE_SESION
    );
  } catch (error) {
    console.error(
      'Error al borrar la sesión:',
      error
    );
  }
}