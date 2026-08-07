import { StyleSheet } from 'react-native';

const crearStyles = (colores) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colores.fondo,
    },

    header: {
      backgroundColor: colores.primario,
      paddingTop: 55,
      paddingBottom: 22,
      paddingHorizontal: 24,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,

      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },

    headerIconoContainer: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.18)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    headerTextos: {
      flex: 1,
    },

    headerTitulo: {
      color: colores.primarioTexto,
      fontSize: 21,
      fontWeight: 'bold',
    },

    headerSub: {
      color: colores.primarioTexto,
      opacity: 0.85,
      fontSize: 13,
      marginTop: 2,
    },

    seccionTitulo: {
      fontSize: 13,
      fontWeight: 'bold',
      color: colores.textoSecundario,
      paddingHorizontal: 16,
      marginTop: 18,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    usuariosScroll: {
      paddingHorizontal: 16,
      gap: 10,
      alignItems: 'flex-start',
    },

    usuarioChip: {
      backgroundColor: colores.tarjeta,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 14,
      marginRight: 4,
      borderWidth: 1.5,
      borderColor: colores.borde,
      alignSelf: 'flex-start',
    },

    usuarioChipActivo: {
      borderColor: colores.primario,
      backgroundColor: colores.primarioClaro,
    },

    usuarioChipTexto: {
      color: colores.textoPrincipal,
      fontWeight: '600',
      fontSize: 13,
    },

    usuarioChipTextoActivo: {
      color: colores.primario,
    },

    lista: {
      padding: 16,
      gap: 10,
    },

    fila: {
      backgroundColor: colores.tarjeta,
      borderRadius: 14,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',

      borderWidth: 1,
      borderColor: colores.borde,
      borderLeftWidth: 4,
    },

    filaExito: {
      borderLeftColor: colores.exito,
    },

    filaFallido: {
      borderLeftColor: colores.peligro,
    },

    filaNeutral: {
      borderLeftColor: colores.primario,
    },

    filaIconoContainer: {
      width: 38,
      height: 38,
      borderRadius: 11,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },

    filaIconoExito: {
      backgroundColor: colores.exitoClaro,
    },

    filaIconoFallido: {
      backgroundColor: colores.peligroClaro,
    },

    filaIconoNeutral: {
      backgroundColor: colores.primarioClaro,
    },

    filaTextos: {
      flex: 1,
    },

    accion: {
      fontSize: 14,
      fontWeight: '700',
      color: colores.textoPrincipal,
    },

    nombreUsuario: {
      fontSize: 12,
      color: colores.textoSecundario,
      marginTop: 3,
    },

    filaDerecha: {
      alignItems: 'flex-end',
    },

    fecha: {
      fontSize: 11,
      color: colores.textoSecundario,
      fontWeight: '600',
    },

    hora: {
      fontSize: 11,
      color: colores.textoSecundario,
      opacity: 0.7,
      marginTop: 2,
    },

    vacioContainer: {
      alignItems: 'center',
      marginTop: 60,
      paddingHorizontal: 30,
    },

    vacioTexto: {
      textAlign: 'center',
      color: colores.textoSecundario,
      marginTop: 12,
      fontSize: 14,
    },

    centrado: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default crearStyles;