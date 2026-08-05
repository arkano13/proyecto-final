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
    paddingBottom: 24,
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
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORES.textoPrincipal,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
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
  moduloContainer: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 30,
  },
  moduloItem: {
    backgroundColor: COLORES.fondoTarjeta,
    borderRadius: RADIO.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SOMBRA,
  },
  moduloNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORES.textoPrincipal,
  },
  moduloCodigo: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    marginTop: 2,
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