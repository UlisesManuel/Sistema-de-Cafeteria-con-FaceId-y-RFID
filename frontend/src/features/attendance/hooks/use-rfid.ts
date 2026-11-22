
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseRfidOptions {
  onRead: (uid: string) => void;
  delay?: number;
  expectedLength?: number;
}

export function useRfid({
  onRead,
  delay = 150,
  expectedLength = 10,
}: UseRfidOptions) {
  const [uid, setUid] = useState('');

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const handleChange = useCallback(
    (value: string) => {
      // Solo permitimos números.
      const numericValue = value.replace(/\D/g, '');

      // Evitamos aceptar más caracteres de los esperados.
      if (numericValue.length > expectedLength) {
        setUid('');
        return;
      }

      setUid(numericValue);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Esperamos hasta recibir los 10 dígitos.
      if (numericValue.length !== expectedLength) {
        return;
      }

      timeoutRef.current = setTimeout(() => {
        onRead(numericValue);
        setUid('');
        timeoutRef.current = null;
      }, delay);
    },
    [onRead, delay, expectedLength],
  );

  const clearReading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setUid('');
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    uid,
    handleChange,
    clearReading,
  };
}
