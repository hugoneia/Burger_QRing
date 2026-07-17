import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

const QR_SIZE = 210;

export function QRCodeCard({ value }: { value: string }) {
  const colors = useColors();

  // =========================================================================
  // NOTA DE AJUSTE: Las impresoras de tickets suelen añadir un salto de línea
  // invisible al final. Si tras aplicar este código sigue sin ser idéntico,
  // prueba a descomentar UNA de estas dos líneas siguientes para probar:
  //
  // trimmed = trimmed + '\n';   // Opción A: Salto de línea LF
  // trimmed = trimmed + '\r\n'; // Opción B: Salto de línea CRLF Windows
  // =========================================================================

  
  // 1. Procesamos el texto plano añadiendo el salto de línea que imita el modo Byte del ticket.
  // Al ser un String estándar, Metro lo compilará en producción al instante y sin consumir RAM extra.
  const cleanValue = value.trim() + '\n';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      {value.trim() ? (
        <View style={styles.qrWrap}>
          <QRCode 
            value={cleanValue} 
            size={QR_SIZE} 
            color="#0B0F0E" 
            backgroundColor="#FFFFFF" 
            ecl="L" // Mantenemos el nivel de corrección bajo del ticket
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
