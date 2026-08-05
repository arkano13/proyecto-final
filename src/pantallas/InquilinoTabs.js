import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORES } from '../estilos/globales';
import { registrarBitacora } from '../utils/bitacora';

const MENU = [
  { label: '🏠 Explorar propiedades', pantalla: 'ExplorarScreen', codigo: 'EXPLORAR' },
  { label: '📋 Mis Solicitudes', pantalla: 'MisSolicitudes', codigo: 'MISSOLIC' },
  { label: '📝 Mi Contrato', pantalla: 'MiContrato', codigo: 'MICONTRATO' },
  { label: '💰 Mis Pagos', pantalla: 'MisPagos', codigo: 'MISPAGOS' },
];

export default function InquilinoTabs({ navigation }) {
  const { usuario, tieneAcceso, cerrarSesion } = useAuth();

  const menuVisible = MENU.filter((item) => tieneAcceso(item.codigo));

  const entrarAModulo = (item) => {
    registrarBitacora(usuario?.id, `ENTRAR_MODULO_${item.codigo}`, 'tbl_modulo_final', item.codigo, 'EXITOSO');
    navigation.navigate(item.pantalla);
  };

  const manejarCerrarSesion = () => {
    registrarBitacora(usuario?.id, 'CERRAR_SESION', 'tbl_usuario_final', usuario?.id, 'EXITOSO');
    cerrarSesion();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }} contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 30 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORES.primario, marginBottom: 4 }}>
        🔍 Menú Inquilino
      </Text>
      <Text style={{ fontSize: 14, color: COLORES.textoSecundario, marginBottom: 20 }}>
        {usuario?.nombre_completo || 'Usuario'}
      </Text>

      {menuVisible.length === 0 ? (
        <Text style={{ textAlign: 'center', color: COLORES.textoSecundario, marginTop: 20 }}>
          No tienes acceso a ningún módulo todavía. Pide a un administrador que te asigne permisos.
        </Text>
      ) : (
        <View style={{ gap: 14 }}>
          {menuVisible.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => entrarAModulo(item)}
              style={{ backgroundColor: '#fff', padding: 18, borderRadius: 14, elevation: 2 }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a' }}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity onPress={manejarCerrarSesion} style={{ marginTop: 30 }}>
        <Text style={{ color: '#dc2626', textAlign: 'center', fontWeight: 'bold' }}>
          Cerrar sesión
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}   