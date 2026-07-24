import { StyleSheet } from 'react-native';
import { COLORES, SOMBRA, RADIO } from './globales';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORES.fondo,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCirculo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORES.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoIcon: {
    fontSize: 44,
  },
  logoTexto: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORES.primario,
  },
  logoSub: {
    fontSize: 14,
    color: COLORES.textoSecundario,
    marginTop: 4,
  },
  inputContainer: {
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
  olvidaste: {
    textAlign: 'center',
    color: COLORES.textoSecundario,
    marginTop: 12,
    fontSize: 14,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLinea: {
    flex: 1,
    height: 1,
    backgroundColor: COLORES.borde,
  },
  dividerTexto: {
    color: COLORES.textoClaro,
    paddingHorizontal: 10,
    fontSize: 13,
  },
});