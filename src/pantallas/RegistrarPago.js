import React, {
  useEffect,
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
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URLS } from '../config/config';
import {
  RADIO,
} from '../estilos/globales';
import { useTema } from '../context/TemaContext';

export default function RegistrarPago({
  route,
  navigation,
}) {
  const { colores } = useTema();
  const styles = crearStyles(colores);

  const usuario = route?.params?.usuario;
  const contratoRecibido =
    route?.params?.contrato;

  const obtenerFechaActual = () => {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(
      fecha.getMonth() + 1
    ).padStart(2, '0');
    const dia = String(
      fecha.getDate()
    ).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  };

  const obtenerPeriodoActual = () => {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(
      fecha.getMonth() + 1
    ).padStart(2, '0');

    return `${anio}-${mes}`;
  };

  const arrendadorId = Number(
    usuario?.id ||
      usuario?.usuario_id ||
      0
  );

  const [contratos, setContratos] = useState([]);
  const [
    contratoSeleccionado,
    setContratoSeleccionado,
  ] = useState(contratoRecibido || null);

  const [periodo, setPeriodo] = useState(
    obtenerPeriodoActual()
  );

  const [fechaPago, setFechaPago] = useState(
    obtenerFechaActual()
  );

  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] =
    useState('EFECTIVO');

  const [referencia, setReferencia] =
    useState('');

  const [observacion, setObservacion] =
    useState('');

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] = useState('');

  const obtenerContratoId = (contrato) => {
    return Number(
      contrato?.id ||
        contrato?.contrato_id ||
        0
    );
  };

  const obtenerEstadoContrato = (
    contrato
  ) => {
    return String(
      contrato?.estado ||
        contrato?.contrato_estado ||
        ''
    ).toLowerCase();
  };

  const obtenerTituloPropiedad = (
    contrato
  ) => {
    return (
      contrato?.propiedad?.titulo ||
      contrato?.propiedad?.propiedad_titulo ||
      contrato?.propiedad_titulo ||
      'Propiedad'
    );
  };

  const obtenerNombreInquilino = (
    contrato
  ) => {
    return (
      contrato?.inquilino?.nombre ||
      contrato?.inquilino
        ?.usuario_nombrecomp ||
      contrato?.inquilino_nombre ||
      'Inquilino'
    );
  };

  const obtenerMontoContrato = (
    contrato
  ) => {
    return Number(
      contrato?.monto_mensual ||
        contrato?.contrato_monto_mensual ||
        0
    );
  };

  const mostrarDinero = (cantidad) => {
    return Number(
      cantidad || 0
    ).toLocaleString('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const seleccionarContrato = (
    contrato
  ) => {
    setContratoSeleccionado(contrato);

    const mensualidad =
      obtenerMontoContrato(contrato);

    setMonto(
      mensualidad > 0
        ? String(mensualidad)
        : ''
    );

    setError('');
  };

  const cargarContratos = async () => {
    if (!arrendadorId) {
      setError(
        'No se pudo identificar al arrendador.'
      );
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError('');

      const respuesta = await fetch(
        API_URLS.LISTAR_CONTRATOS_ARRENDADOR,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            arrendador_id: arrendadorId,
          }),
        }
      );

      const textoRespuesta =
        await respuesta.text();

      let datos;

      try {
        datos = JSON.parse(textoRespuesta);
      } catch (errorJson) {
        console.log(
          'Respuesta del servidor:',
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
            'No se pudieron cargar los contratos.'
        );
      }

      let lista = [];

      if (Array.isArray(datos)) {
        lista = datos;
      } else if (
        Array.isArray(datos.contratos)
      ) {
        lista = datos.contratos;
      } else if (Array.isArray(datos.data)) {
        lista = datos.data;
      }

      const activos = lista.filter(
        (contrato) =>
          obtenerEstadoContrato(contrato) ===
          'activo'
      );

      setContratos(activos);

      if (contratoRecibido) {
        const idRecibido =
          obtenerContratoId(contratoRecibido);

        const contratoEncontrado =
          activos.find(
            (contrato) =>
              obtenerContratoId(contrato) ===
              idRecibido
          );

        if (contratoEncontrado) {
          seleccionarContrato(
            contratoEncontrado
          );
        }
      }
    } catch (errorPeticion) {
      console.error(
        'Error al cargar contratos:',
        errorPeticion
      );

      setContratos([]);

      setError(
        errorPeticion.message ||
          'No se pudieron cargar los contratos.'
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarContratos();
  }, [arrendadorId]);

  const mostrarError = (mensaje) => {
    setError(mensaje);

    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined'
    ) {
      window.alert(mensaje);
      return;
    }

    Alert.alert('Error', mensaje);
  };

  const mostrarExito = (mensaje) => {
    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined'
    ) {
      window.alert(mensaje);
      navigation.goBack();
      return;
    }

    Alert.alert(
      'Pago registrado',
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

  const validarPeriodo = (
    periodoPago
  ) => {
    if (
      !/^\d{4}-\d{2}$/.test(periodoPago)
    ) {
      return false;
    }

    const mes = Number(
      periodoPago.split('-')[1]
    );

    return mes >= 1 && mes <= 12;
  };

  const validarFecha = (fecha) => {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ) {
      return false;
    }

    const fechaObjeto = new Date(
      `${fecha}T00:00:00`
    );

    return !Number.isNaN(
      fechaObjeto.getTime()
    );
  };

  const registrarPago = async () => {
    const contratoId =
      obtenerContratoId(
        contratoSeleccionado
      );

    const montoNumero = Number(
      String(monto).replace(',', '.')
    );

    if (!contratoId) {
      mostrarError(
        'Selecciona un contrato.'
      );
      return;
    }

    if (!arrendadorId) {
      mostrarError(
        'No se pudo identificar al arrendador.'
      );
      return;
    }

    if (!validarPeriodo(periodo)) {
      mostrarError(
        'El periodo debe tener el formato AAAA-MM.'
      );
      return;
    }

    if (!validarFecha(fechaPago)) {
      mostrarError(
        'La fecha debe tener el formato AAAA-MM-DD.'
      );
      return;
    }

    if (
      monto.trim() === '' ||
      Number.isNaN(montoNumero) ||
      montoNumero <= 0
    ) {
      mostrarError(
        'El monto debe ser mayor que cero.'
      );
      return;
    }

    try {
      setGuardando(true);
      setError('');

      const respuesta = await fetch(
        API_URLS.REGISTRAR_PAGO,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            contrato_id: contratoId,
            arrendador_id: arrendadorId,
            periodo,
            fecha_pago: fechaPago,
            monto: montoNumero,
            metodo,
            referencia: referencia.trim(),
            observacion: observacion.trim(),
          }),
        }
      );

      const textoRespuesta =
        await respuesta.text();

      let datos;

      try {
        datos = JSON.parse(textoRespuesta);
      } catch (errorJson) {
        console.log(
          'Respuesta al registrar pago:',
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
            'No se pudo registrar el pago.'
        );
      }

      mostrarExito(
        'El pago se registró correctamente.'
      );
    } catch (errorPeticion) {
      console.error(
        'Error al registrar pago:',
        errorPeticion
      );

      mostrarError(
        errorPeticion.message ||
          'No se pudo registrar el pago.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const metodosPago = [
    {
      valor: 'EFECTIVO',
      nombre: 'Efectivo',
      icono: 'cash-outline',
    },
    {
      valor: 'TRANSFERENCIA',
      nombre: 'Transferencia',
      icono: 'swap-horizontal-outline',
    },
    {
      valor: 'DEPOSITO',
      nombre: 'Depósito',
      icono: 'business-outline',
    },
    {
      valor: 'OTRO',
      nombre: 'Otro',
      icono: 'wallet-outline',
    },
  ];

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
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.encabezado}>
          <TouchableOpacity
            style={styles.botonRegresar}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colores.primarioTexto}
            />
          </TouchableOpacity>

          <View style={styles.encabezadoTexto}>
            <Text style={styles.titulo}>
              Registrar pago
            </Text>

            <Text style={styles.subtitulo}>
              Pago mensual de un contrato
            </Text>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>
            Selecciona un contrato
          </Text>

          {cargando ? (
            <View style={styles.cargando}>
              <ActivityIndicator
                size="small"
                color={colores.primario}
              />

              <Text style={styles.cargandoTexto}>
                Cargando contratos...
              </Text>
            </View>
          ) : contratos.length === 0 ? (
            <View style={styles.vacio}>
              <Ionicons
                name="document-text-outline"
                size={45}
                color={colores.textoSecundario}
              />

              <Text style={styles.vacioTitulo}>
                No hay contratos activos
              </Text>
            </View>
          ) : (
            contratos.map((contrato) => {
              const contratoId =
                obtenerContratoId(contrato);

              const seleccionado =
                obtenerContratoId(
                  contratoSeleccionado
                ) === contratoId;

              return (
                <TouchableOpacity
                  key={contratoId}
                  style={[
                    styles.contrato,
                    seleccionado &&
                      styles.contratoSeleccionado,
                  ]}
                  onPress={() =>
                    seleccionarContrato(contrato)
                  }
                >
                  <View style={styles.iconoContrato}>
                    <Ionicons
                      name="home-outline"
                      size={23}
                      color={
                        seleccionado
                          ? colores.primarioTexto
                          : colores.primario
                      }
                    />
                  </View>

                  <View style={styles.contratoInfo}>
                    <Text
                      style={[
                        styles.contratoTitulo,
                        seleccionado &&
                          styles.textoBlanco,
                      ]}
                    >
                      {obtenerTituloPropiedad(
                        contrato
                      )}
                    </Text>

                    <Text
                      style={[
                        styles.contratoInquilino,
                        seleccionado &&
                          styles.textoClaro,
                      ]}
                    >
                      {obtenerNombreInquilino(
                        contrato
                      )}
                    </Text>

                    <Text
                      style={[
                        styles.contratoMonto,
                        seleccionado &&
                          styles.textoBlanco,
                      ]}
                    >
                      L{' '}
                      {mostrarDinero(
                        obtenerMontoContrato(
                          contrato
                        )
                      )}
                    </Text>
                  </View>

                  <Ionicons
                    name={
                      seleccionado
                        ? 'checkmark-circle'
                        : 'ellipse-outline'
                    }
                    size={24}
                    color={
                      seleccionado
                        ? colores.primarioTexto
                        : colores.textoSecundario
                    }
                  />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {contratoSeleccionado && (
          <>
            <View style={styles.seccion}>
              <Text style={styles.seccionTitulo}>
                Datos del pago
              </Text>

              <Text style={styles.etiqueta}>
                Periodo
              </Text>

              <TextInput
                style={styles.input}
                value={periodo}
                onChangeText={setPeriodo}
                placeholder="2026-08"
                maxLength={7}
                editable={!guardando}
              />

              <Text style={styles.ayuda}>
                Formato AAAA-MM
              </Text>

              <Text style={styles.etiqueta}>
                Fecha del pago
              </Text>

              <TextInput
                style={styles.input}
                value={fechaPago}
                onChangeText={setFechaPago}
                placeholder="2026-08-05"
                maxLength={10}
                editable={!guardando}
              />

              <Text style={styles.ayuda}>
                Formato AAAA-MM-DD
              </Text>

              <Text style={styles.etiqueta}>
                Monto
              </Text>

              <TextInput
                style={styles.input}
                value={monto}
                onChangeText={setMonto}
                placeholder="0.00"
                keyboardType="decimal-pad"
                editable={!guardando}
              />
            </View>

            <View style={styles.seccion}>
              <Text style={styles.seccionTitulo}>
                Método de pago
              </Text>

              <View style={styles.metodos}>
                {metodosPago.map((item) => {
                  const seleccionado =
                    metodo === item.valor;

                  return (
                    <TouchableOpacity
                      key={item.valor}
                      style={[
                        styles.metodo,
                        seleccionado &&
                          styles.metodoSeleccionado,
                      ]}
                      onPress={() =>
                        setMetodo(item.valor)
                      }
                    >
                      <Ionicons
                        name={item.icono}
                        size={21}
                        color={
                          seleccionado
                            ? colores.primarioTexto
                            : colores.primario
                        }
                      />

                      <Text
                        style={[
                          styles.metodoTexto,
                          seleccionado &&
                            styles.textoBlanco,
                        ]}
                      >
                        {item.nombre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.etiqueta}>
                Referencia
              </Text>

              <TextInput
                style={styles.input}
                value={referencia}
                onChangeText={setReferencia}
                placeholder="Opcional"
                maxLength={100}
                editable={!guardando}
              />

              <Text style={styles.etiqueta}>
                Observación
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.inputObservacion,
                ]}
                value={observacion}
                onChangeText={setObservacion}
                placeholder="Observación opcional"
                multiline
                numberOfLines={4}
                maxLength={255}
                editable={!guardando}
              />
            </View>
          </>
        )}

        {error !== '' && (
          <View style={styles.error}>
            <Ionicons
              name="alert-circle-outline"
              size={21}
              color={colores.peligro}
            />

            <Text style={styles.errorTexto}>
              {error}
            </Text>
          </View>
        )}

        {contratoSeleccionado && (
          <TouchableOpacity
            style={[
              styles.botonGuardar,
              guardando &&
                styles.botonDeshabilitado,
            ]}
            onPress={registrarPago}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator
                size="small"
                color={colores.primarioTexto}
              />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={22}
                  color={colores.primarioTexto}
                />

                <Text
                  style={styles.textoBoton}
                >
                  Registrar pago
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
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

  contenido: {
    paddingBottom: 40,
  },

  encabezado: {
    backgroundColor: colores.primario,
    paddingTop: 50,
    paddingBottom: 22,
    paddingHorizontal: 20,
    marginBottom: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  botonRegresar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  encabezadoTexto: {
    flex: 1,
    marginLeft: 13,
  },

  titulo: {
    fontSize: 23,
    fontWeight: 'bold',
    color: colores.primarioTexto,
  },

  subtitulo: {
    marginTop: 3,
    fontSize: 13,
    color: colores.primarioTexto,
    opacity: 0.9,
  },

  seccion: {
    marginHorizontal: 17,
    marginBottom: 16,
    padding: 17,
    backgroundColor: colores.tarjeta,
    borderRadius: RADIO.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    boxShadow:
      '0px 2px 8px rgba(15, 23, 42, 0.08)',
    elevation: 2,
  },

  seccionTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
    marginBottom: 13,
  },

  cargando: {
    alignItems: 'center',
    padding: 20,
  },

  cargandoTexto: {
    marginTop: 8,
    color: colores.textoSecundario,
  },

  vacio: {
    alignItems: 'center',
    padding: 20,
  },

  vacioTitulo: {
    marginTop: 9,
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  contrato: {
    minHeight: 82,
    padding: 13,
    marginBottom: 10,
    borderRadius: RADIO.sm,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.fondo,
    flexDirection: 'row',
    alignItems: 'center',
  },

  contratoSeleccionado: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },

  iconoContrato: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colores.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },

  contratoInfo: {
    flex: 1,
    marginLeft: 11,
  },

  contratoTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
  },

  contratoInquilino: {
    marginTop: 2,
    fontSize: 13,
    color: colores.textoSecundario,
  },

  contratoMonto: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: colores.exito,
  },

  textoBlanco: {
    color: colores.primarioTexto,
  },

  textoClaro: {
    color: colores.primarioTexto,
    opacity: 0.85,
  },

  etiqueta: {
    marginTop: 12,
    marginBottom: 7,
    fontSize: 14,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },

  input: {
    minHeight: 50,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: RADIO.sm,
    backgroundColor: colores.tarjeta,
    fontSize: 16,
    color: colores.textoPrincipal,
  },

  inputObservacion: {
    minHeight: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  ayuda: {
    marginTop: 5,
    fontSize: 12,
    color: colores.textoSecundario,
  },

  metodos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  metodo: {
    width: '48%',
    minHeight: 67,
    borderRadius: RADIO.sm,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.fondo,
    justifyContent: 'center',
    alignItems: 'center',
  },

  metodoSeleccionado: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },

  metodoTexto: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },

  error: {
    marginHorizontal: 17,
    marginBottom: 15,
    padding: 12,
    borderRadius: RADIO.sm,
    borderWidth: 1,
    borderColor: colores.peligro,
    backgroundColor: colores.peligroClaro,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  errorTexto: {
    flex: 1,
    fontSize: 14,
    color: colores.peligro,
  },

  botonGuardar: {
    minHeight: 52,
    marginHorizontal: 17,
    borderRadius: RADIO.sm,
    backgroundColor: colores.exito,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  textoBoton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.primarioTexto,
  },
});