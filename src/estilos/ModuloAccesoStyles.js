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
      paddingBottom: 26,
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
      paddingHorizontal: 20,
      marginTop: 22,
      marginBottom: 10,
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

      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    usuarioChipActivo: {
      borderColor: colores.primario,
      backgroundColor: colores.primarioClaro,
    },

    usuarioAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colores.borde,
      justifyContent: 'center',
      alignItems: 'center',
    },

    usuarioAvatarActivo: {
      backgroundColor: colores.primario,
    },

    usuarioAvatarTexto: {
      fontSize: 11,
      fontWeight: 'bold',
      color: colores.textoSecundario,
    },

    usuarioAvatarTextoActivo: {
      color: colores.primarioTexto,
    },

    usuarioChipTexto: {
      color: colores.textoPrincipal,
      fontWeight: '600',
      fontSize: 13,
    },

    usuarioChipTextoActivo: {
      color: colores.primario,
    },

    tarjetaUsuarioSeleccionado: {
      marginHorizontal: 16,
      marginTop: 4,
      padding: 14,
      borderRadius: 14,
      backgroundColor: colores.primarioClaro,

      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    tarjetaUsuarioNombre: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colores.textoPrincipal,
    },

    tarjetaUsuarioCorreo: {
      fontSize: 12,
      color: colores.textoSecundario,
      marginTop: 1,
    },

    moduloContainer: {
      paddingHorizontal: 16,
      gap: 10,
      paddingBottom: 30,
    },

    moduloItem: {
      backgroundColor: colores.tarjeta,
      borderRadius: 14,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',

      borderWidth: 1,
      borderColor: colores.borde,
    },

    moduloIconoContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },

    moduloIconoActivo: {
      backgroundColor: colores.exitoClaro,
    },

    moduloIconoInactivo: {
      backgroundColor: colores.borde,
    },

    moduloTextos: {
      flex: 1,
    },

    moduloNombre: {
      fontSize: 15,
      fontWeight: '600',
      color: colores.textoPrincipal,
    },

    moduloCodigo: {
      fontSize: 11,
      color: colores.textoSecundario,
      marginTop: 3,

      backgroundColor: colores.fondo,
      alignSelf: 'flex-start',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
      overflow: 'hidden',

      fontWeight: '600',
      letterSpacing: 0.3,
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