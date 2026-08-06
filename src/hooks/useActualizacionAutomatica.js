import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export default function useActualizacionAutomatica(
  actualizar,
  segundos = 20
) {
  useFocusEffect(
    useCallback(() => {
      actualizar();

      const intervalo = setInterval(() => {
        actualizar(false);
      }, segundos * 1000);

      return () => {
        clearInterval(intervalo);
      };
    }, [actualizar, segundos])
  );
}
