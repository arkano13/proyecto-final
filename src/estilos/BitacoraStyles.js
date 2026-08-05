import { StyleSheet } from 'react-native';
import { COLORES, SOMBRA, RADIO } from './globales';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  header: {
    backgroundColor: COLORES.primario,
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitulo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSub: {
    color: COLORES.primarioClaro,
    fontSize: 13,
    marginTop: 2,
  },
  seccionTitulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORES.textoSecundario,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  usuariosScroll: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'flex-start',
  },
  usuarioChip: {
    backgroundColor: COLORES.fondoTarjeta,
    borderRadius: RADIO.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    borderWidth: 2,
    borderColor: COLORES.borde,
    alignSelf: 'flex-start',
  },
  usuarioChipActivo: {
    borderColor: COLORES.primario,
    backgroundColor: COLORES.primarioClaro,
  },
  usuarioChipTexto: {
    color: COLORES.textoPrincipal,
    fontWeight: '600',
    fontSize: 13,
  },
  usuarioChipTextoActivo: {
    color: COLORES.primarioOscuro,
  },
  lista: {
    padding: 16,
    gap: 8,
  },
  fila: {
    backgroundColor: COLORES.fondoTarjeta,
    borderRadius: RADIO.md,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SOMBRA,
  },
  accion: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.textoPrincipal,
  },
  nombreUsuario: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    marginTop: 3,
  },
  fecha: {
    fontSize: 11,
    color: COLORES.textoClaro,
  },
  vacioTexto: {
    textAlign: 'center',
    color: COLORES.textoSecundario,
    marginTop: 40,
    fontSize: 14,
    paddingHorizontal: 30,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});