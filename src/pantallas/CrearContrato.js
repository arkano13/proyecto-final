import React, { useState } from 'react';
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
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, API_URLS } from '../config/config';

export default function CrearContrato({ route, navigation }) {
  const usuario = route?.params?.usuario;
  const solicitud = route?.params?.solicitud;

  const obtenerFechaActual = () => {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  };

  const obtenerFechaFinal = () => {
    const fecha = new Date();
    fecha.setFullYear(fecha.getFullYear() + 1);

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  };

  const [fechaInicio, setFechaInicio] = useState(
    obtenerFechaActual()
  );
  const [fechaFin, setFechaFin] = useState(
    obtenerFechaFinal()
  );
  const [deposito, setDeposito] = useState('0');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const obtenerSolicitudId = () => {
    return Number(
      solicitud?.id ||
        solicitud?.solicitud_id ||
        0
    );
  };

  const obtenerArrendadorId = () => {
    return Number(
      usuario?.id ||
        usuario?.usuario_id ||
        0
    );
  };

  const obtenerTituloPropiedad = () => {
    return (
      solicitud?.propiedad?.titulo ||
      solicitud?.propiedad?.propiedad_titulo ||
      solicitud?.propiedad_titulo ||
      'Propiedad'
    );
  };

  const obtenerDireccionPropiedad = () => {
    return (
      solicitud?.propiedad?.direccion ||
      solicitud?.propiedad?.propiedad_direccion ||
      solicitud?.propiedad_direccion ||
      'Dirección no disponible'
    );
  };

  const obtenerPrecioPropiedad = () => {
    const precio =
      solicitud?.propiedad?.precio ||
      solicitud?.propiedad?.propiedad_precio ||
      solicitud?.propiedad_precio ||
      0;

    return Number(precio);
  };

  const obtenerNombreInquilino = () => {
    return (
      solicitud?.inquilino?.nombre ||
      solicitud?.inquilino?.usuario_nombrecomp ||
      solicitud?.inquilino_nombre ||
      'Inquilino'
    );
  };

  const obtenerCorreoInquilino = () => {
    return (
      solicitud?.inquilino?.correo ||
      solicitud?.inquilino?.email ||
      solicitud?.inquilino?.usuario_correo ||
      solicitud?.inquilino_correo ||
      ''
    );
  };

  const obtenerImagen = () => {
    const ruta =
      solicitud?.propiedad?.imagen ||
      solicitud?.propiedad?.foto ||
      solicitud?.propiedad?.imagen_ruta ||
      solicitud?.propiedad?.propiedad_img_ruta ||
      solicitud?.propiedad_imagen ||
      '';

    if (!ruta) {
      return null;
    }

    if (
      String(ruta).startsWith('http://') ||
      String(ruta).startsWith('https://')
    ) {
      return String(ruta);
    }

    const rutaLimpia = String(ruta).replace(/^\/+/, '');

    return `${API_BASE_URL}/${rutaLimpia}`;
  };

  const fechaEsValida = (fecha) => {
    const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

    if (!formatoFecha.test(fecha)) {
      return false;
    }

    const fechaObjeto = new Date(`${fecha}T00:00:00`);

    return !Number.isNaN(fechaObjeto.getTime());
  };

  const mostrarError = (mensaje) => {
    setError(mensaje);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(mensaje);
      return;
    }

    Alert.alert('Error', mensaje);
  };

  const mostrarExito = (mensaje) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(mensaje);
      navigation.goBack();
      return;
    }

    Alert.alert(
      'Contrato creado',
      mensaje,
      [
        {
          text: 'Aceptar',
          onPress: () => navigation.goBack(),
        },
      ],
      {
        cancelable: false,
      }
    );
  };

  const crearContrato = async () => {
    setError('');

    const solicitudId = obtenerSolicitudId();
    const arrendadorId = obtenerArrendadorId();
    const depositoNumero = Number(
      String(deposito).replace(',', '.')
    );

    if (!solicitudId) {
      mostrarError('No se pudo identificar la solicitud.');
      return;
    }

    if (!arrendadorId) {
      mostrarError('No se pudo identificar al arrendador.');
      return;
    }

    if (!fechaEsValida(fechaInicio)) {
      mostrarError(
        'La fecha de inicio debe escribirse como AAAA-MM-DD.'
      );
      return;
    }

    if (!fechaEsValida(fechaFin)) {
      mostrarError(
        'La fecha final debe escribirse como AAAA-MM-DD.'
      );
      return;
    }

    const inicio = new Date(`${fechaInicio}T00:00:00`);
    const fin = new Date(`${fechaFin}T00:00:00`);

    if (fin <= inicio) {
      mostrarError(
        'La fecha final debe ser mayor que la fecha de inicio.'
      );
      return;
    }

    if (
      deposito.trim() === '' ||
      Number.isNaN(depositoNumero) ||
      depositoNumero < 0
    ) {
      mostrarError(
        'Escribe un depósito válido. Puede ser cero.'
      );
      return;
    }

    try {
      setGuardando(true);

      const respuesta = await fetch(
        API_URLS.CREAR_CONTRATO,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            solicitud_id: solicitudId,
            arrendador_id: arrendadorId,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            deposito: depositoNumero,
          }),
        }
      );

      const textoRespuesta = await respuesta.text();

      let datos;

      try {
        datos = JSON.parse(textoRespuesta);
      } catch (errorJson) {
        console.log(
          'Respuesta recibida al crear contrato:',
          textoRespuesta
        );

        throw new Error(
          'El servidor no devolvió una respuesta válida.'
        );
      }

      const fueExitoso =
        datos.exito === true ||
        datos.success === true;

      if (!respuesta.ok || !fueExitoso) {
        throw new Error(
          datos.mensaje ||
            datos.message ||
            'No se pudo crear el contrato.'
        );
      }

      mostrarExito(
        'El contrato se creó correctamente.'
      );
    } catch (errorPeticion) {
      console.error(
        'Error al crear el contrato:',
        errorPeticion
      );

      mostrarError(
        errorPeticion.message ||
          'Ocurrió un error al crear el contrato.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const imagen = obtenerImagen();
  const precioMensual = obtenerPrecioPropiedad();

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.encabezado}>
          <TouchableOpacity
            style={styles.botonRegresar}
            onPress={() => navigation.goBack()}
            disabled={guardando}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#0f172a"
            />
          </TouchableOpacity>

          <View style={styles.encabezadoTexto}>
            <Text style={styles.tituloPantalla}>
              Crear contrato
            </Text>

            <Text style={styles.descripcionPantalla}>
              Completa los datos del alquiler
            </Text>
          </View>
        </View>

        <View style={styles.tarjetaPropiedad}>
          {imagen ? (
            <Image
              source={{ uri: imagen }}
              style={styles.imagenPropiedad}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.sinImagen}>
              <Ionicons
                name="home-outline"
                size={48}
                color="#94a3b8"
              />

              <Text style={styles.textoSinImagen}>
                Sin fotografía
              </Text>
            </View>
          )}

          <View style={styles.informacionPropiedad}>
            <Text style={styles.tituloPropiedad}>
              {obtenerTituloPropiedad()}
            </Text>

            <View style={styles.filaInformacion}>
              <Ionicons
                name="location-outline"
                size={18}
                color="#64748b"
              />

              <Text style={styles.textoInformacion}>
                {obtenerDireccionPropiedad()}
              </Text>
            </View>

            <View style={styles.precioContenedor}>
              <Text style={styles.precioEtiqueta}>
                Precio mensual
              </Text>

              <Text style={styles.precio}>
                L {precioMensual.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.tituloSeccion}>
            Información del inquilino
          </Text>

          <View style={styles.filaInformacion}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#2563eb"
            />

            <Text style={styles.textoInformacionPrincipal}>
              {obtenerNombreInquilino()}
            </Text>
          </View>

          {obtenerCorreoInquilino() !== '' && (
            <View style={styles.filaInformacion}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#2563eb"
              />

              <Text style={styles.textoInformacion}>
                {obtenerCorreoInquilino()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.tituloSeccion}>
            Duración del contrato
          </Text>

          <Text style={styles.ayuda}>
            Escribe las fechas con el formato AAAA-MM-DD.
          </Text>

          <Text style={styles.etiqueta}>
            Fecha de inicio
          </Text>

          <View style={styles.inputContenedor}>
            <Ionicons
              name="calendar-outline"
              size={21}
              color="#64748b"
            />

            <TextInput
              style={styles.input}
              value={fechaInicio}
              onChangeText={setFechaInicio}
              placeholder="2026-08-05"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              editable={!guardando}
              maxLength={10}
            />
          </View>

          <Text style={styles.etiqueta}>
            Fecha de finalización
          </Text>

          <View style={styles.inputContenedor}>
            <Ionicons
              name="calendar-outline"
              size={21}
              color="#64748b"
            />

            <TextInput
              style={styles.input}
              value={fechaFin}
              onChangeText={setFechaFin}
              placeholder="2027-08-05"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              editable={!guardando}
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.tituloSeccion}>
            Información de pago
          </Text>

          <View style={styles.resumenPago}>
            <View>
              <Text style={styles.resumenEtiqueta}>
                Mensualidad
              </Text>

              <Text style={styles.resumenDescripcion}>
                Precio registrado en la propiedad
              </Text>
            </View>

            <Text style={styles.resumenMonto}>
              L {precioMensual.toFixed(2)}
            </Text>
          </View>

          <Text style={styles.etiqueta}>
            Depósito
          </Text>

          <View style={styles.inputContenedor}>
            <Text style={styles.simboloMoneda}>L</Text>

            <TextInput
              style={styles.input}
              value={deposito}
              onChangeText={setDeposito}
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              editable={!guardando}
            />
          </View>

          <Text style={styles.ayudaDeposito}>
            Si no se solicitará depósito, deja el valor en cero.
          </Text>
        </View>

        {error !== '' && (
          <View style={styles.errorContenedor}>
            <Ionicons
              name="alert-circle-outline"
              size={21}
              color="#dc2626"
            />

            <Text style={styles.errorTexto}>
              {error}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.botonCrear,
            guardando && styles.botonDeshabilitado,
          ]}
          onPress={crearContrato}
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
                name="document-text-outline"
                size={22}
                color="#ffffff"
              />

              <Text style={styles.textoBotonCrear}>
                Crear contrato
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonCancelar}
          onPress={() => navigation.goBack()}
          disabled={guardando}
        >
          <Text style={styles.textoBotonCancelar}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  contenido: {
    padding: 18,
    paddingBottom: 40,
  },

  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  botonRegresar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  encabezadoTexto: {
    flex: 1,
  },

  tituloPantalla: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#0f172a',
  },

  descripcionPantalla: {
    marginTop: 3,
    fontSize: 14,
    color: '#64748b',
  },

  tarjetaPropiedad: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    boxShadow: '0px 3px 10px rgba(15, 23, 42, 0.10)',
    elevation: 3,
  },

  imagenPropiedad: {
    width: '100%',
    height: 185,
    backgroundColor: '#e2e8f0',
  },

  sinImagen: {
    height: 165,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },

  textoSinImagen: {
    marginTop: 7,
    color: '#94a3b8',
  },

  informacionPropiedad: {
    padding: 17,
  },

  tituloPropiedad: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },

  filaInformacion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },

  textoInformacion: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
  },

  textoInformacionPrincipal: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },

  precioContenedor: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  precioEtiqueta: {
    fontSize: 14,
    color: '#64748b',
  },

  precio: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#16a34a',
  },

  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  tituloSeccion: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },

  ayuda: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },

  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginTop: 12,
    marginBottom: 7,
  },

  inputContenedor: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  input: {
    flex: 1,
    minHeight: 48,
    marginLeft: 9,
    fontSize: 16,
    color: '#0f172a',
    outlineStyle: 'none',
  },

  simboloMoneda: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#16a34a',
  },

  resumenPago: {
    marginTop: 10,
    marginBottom: 10,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resumenEtiqueta: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#166534',
  },

  resumenDescripcion: {
    marginTop: 3,
    fontSize: 12,
    color: '#4d7c5b',
  },

  resumenMonto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#15803d',
  },

  ayudaDeposito: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748b',
  },

  errorContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    gap: 8,
  },

  errorTexto: {
    flex: 1,
    fontSize: 14,
    color: '#b91c1c',
  },

  botonCrear: {
    minHeight: 52,
    borderRadius: 11,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  textoBotonCrear: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  botonCancelar: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  textoBotonCancelar: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },
});