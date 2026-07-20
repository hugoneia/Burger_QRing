import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

const QR_SIZE = 210;

export function QRCodeCard({ value }: { value: string }) {
  const colors = useColors();

  // 1. Limpiamos espacios básicos
  let trimmed = value.trim();

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
      {trimmed ? (
        <View style={styles.qrWrap}>
          {/* 
            Pasamos un array con un único objeto de segmento de datos. 
            Esto FORZA a la librería a codificar todo en modo "Byte" puro (8-bit), 
            desactivando la optimización numérica inteligente y replicando el 
            comportamiento de una impresora de tickets térmica estándar.
          */}
          <QRCode 
            value={[{ data: trimmed, mode: 'Byte' }]} 
            size={QR_SIZE} 
            color="#0B0F0E" 
            backgroundColor="#FFFFFF" 
            ecl="L" // Nivel de corrección típico (Low - 7%)
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
