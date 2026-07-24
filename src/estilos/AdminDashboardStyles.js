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
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerSaludo: {
    color: COLORES.primarioClaro,
    fontSize: 14,
  },
  headerNombre: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
  headerBadge: {
    backgroundColor: COLORES.acento,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 8,
  },
  headerBadgeTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tarjetasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  tarjeta: {
    backgroundColor: COLORES.fondoTarjeta,
    borderRadius: RADIO.lg,
    padding: 18,
    width: '47%',
    ...SOMBRA,
  },
  tarjetaIcono: {
    fontSize: 30,
    marginBottom: 10,
  },
  tarjetaNumero: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORES.primario,
  },
  tarjetaLabel: {
    fontSize: 13,
    color: COLORES.textoSecundario,
    marginTop: 2,
  },
  seccionTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORES.textoPrincipal,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 12,
  },
  menuContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  menuBtn: {
    backgroundColor: COLORES.fondoTarjeta,
    borderRadius: RADIO.md,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    ...SOMBRA,
    gap: 14,
  },
  menuIconoContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORES.primarioClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcono: {
    fontSize: 22,
  },
  menuTextoContainer: {
    flex: 1,
  },
  menuTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORES.textoPrincipal,
  },
  menuSub: {
    fontSize: 13,
    color: COLORES.textoSecundario,
    marginTop: 2,
  },
  menuFlecha: {
    fontSize: 20,
    color: COLORES.textoClaro,
  },
  cerrarBtn: {
    margin: 20,
    padding: 16,
    borderRadius: RADIO.md,
    borderWidth: 2,
    borderColor: COLORES.peligro,
    alignItems: 'center',
  },
  cerrarTexto: {
    color: COLORES.peligro,
    fontWeight: 'bold',
    fontSize: 15,
  },
});