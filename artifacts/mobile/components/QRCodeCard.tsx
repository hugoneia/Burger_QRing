import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

const QR_SIZE = 210;

export function QRCodeCard({ value }: { value: string }) {
  const colors = useColors();

  // PRUEBA DE AISLAMIENTO: Forzamos el texto exacto e idéntico del ticket original con salto de línea.
  const hardcodedValue = "19434,104650396,20260712202600,ada092e57430cc3b3d30c457d799e1d0\n";

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      <View style={styles.qrWrap}>
        <QRCode 
          value={hardcodedValue} 
          size={QR_SIZE} 
          color="#0B0F0E" 
          backgroundColor="#FFFFFF" 
          ecl="M"
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
