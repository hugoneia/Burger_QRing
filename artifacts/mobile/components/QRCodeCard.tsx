import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useColors } from '@/hooks/useColors';

const QR_SIZE = 210;

export function QRCodeCard({ value }: { value: string }) {
  const colors = useColors();

  // PROBAMOS LA VARIANTE 1: Retorno de carro + salto de línea (\r\n), típico de sistemas de impresión
  const testValue = "19434,104650396,20260712202600,ada092e57430cc3b3d30c457d799e1d0\r\n";

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.qrWrap}>
        <QRCode 
          value={testValue} 
          size={QR_SIZE} 
          color="#0B0F0E" 
          backgroundColor="#FFFFFF" 
          ecl="M" // Mantenemos M para ver cómo reacciona a los 67 caracteres
        />
      </View>
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
});
