import { StyleSheet } from 'react-native';
import { COLORES, SOMBRA, RADIO } from './globales';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORES.fondo,
    paddingHorizontal: 28,
    paddingVertical: 50,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORES.primario,
    textAlign: 'center',
  },
  sub: {
    fontSize: 15,
    color: COLORES.textoSecundario,
    textAlign: 'center',
    marginBottom: 28,
    marginTop: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORES.textoPrincipal,
    marginBottom: 12,
  },
  rolContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  rolBtn: {
    flex: 1,
    backgroundColor: COLORES.fondoTarjeta,
    borderWidth: 2,
    borderColor: COLORES.borde,
    borderRadius: RADIO.lg,
    padding: 16,
    alignItems: 'center',
    ...SOMBRA,
  },
  rolActivo: {
    borderColor: COLORES.primario,
    backgroundColor: COLORES.primarioClaro,
  },
  rolIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  rolTexto: {
    fontWeight: 'bold',
    color: COLORES.textoSecundario,
    fontSize: 15,
  },
  rolTextoActivo: {
    color: COLORES.primario,
  },
  rolDesc: {
    fontSize: 12,
    color: COLORES.textoClaro,
    marginTop: 3,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORES.fondoTarjeta,
    borderWidth: 1.5,
    borderColor: COLORES.borde,
    borderRadius: RADIO.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
    ...SOMBRA,
    color: COLORES.textoPrincipal,
  },
  btn: {
    backgroundColor: COLORES.primario,
    padding: 17,
    borderRadius: RADIO.md,
    alignItems: 'center',
    marginTop: 6,
    ...SOMBRA,
  },
  btnTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  linkTexto: {
    textAlign: 'center',
    color: COLORES.primario,
    fontWeight: '600',
    marginTop: 22,
    fontSize: 15,
  },
  errorTexto: {
    color: COLORES.peligro,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
    backgroundColor: COLORES.peligroClaro,
    padding: 10,
    borderRadius: RADIO.sm,
  },
});