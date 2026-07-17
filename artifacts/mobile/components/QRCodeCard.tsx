import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

const QR_SIZE = 210;

export function QRCodeCard({ value }: { value: string }) {
  const colors = useColors();
  
  // 1. Limpieza absoluta: SIN añadir saltos de línea artificiales (\n)
  const cleanValue = value.trim();

// =========================================================================
  // NOTA DE AJUSTE: Las impresoras de tickets suelen añadir un salto de línea
  // invisible al final. Si tras aplicar este código sigue sin ser idéntico,
  // prueba a descomentar UNA de estas dos líneas siguientes para probar:
  //
  // trimmed = trimmed + '\n';   // Opción A: Salto de línea LF
  // trimmed = trimmed + '\r\n'; // Opción B: Salto de línea CRLF Windows
  // =========================================================================

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      {cleanValue ? (
        <View style={styles.qrWrap}>
          <QRCode 
            // 2. Pasamos el string limpio directamente (sin la envoltura de array ni modo Byte)
            value={cleanValue} 
            size={QR_SIZE} 
            color="#0B0F0E" 
            backgroundColor="#FFFFFF" 
            // 3. Forzamos el nivel de corrección Bajo para lograr la cuadrícula exacta de 29x29
            ecl="L" 
          />
        </View>
      ) : (
        <View style={[styles.placeholder, { width: QR_SIZE, height: QR_SIZE }]}>
          <Feather name="square" size={40} color={colors.mutedForeground} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrWrap: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
});