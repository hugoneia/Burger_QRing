import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

const QR_SIZE = 210;

export function QRCodeCard({ value }: { value: string }) {
  const colors = useColors();
  
  const cleanValue = value ? value.trim() : '';

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
            // Forzamos el modo 'Byte' de manera explícita pasándolo como un objeto.
            // Esto evita que la librería decida por su cuenta y recrea el comportamiento exacto de ayer.
            value={[{ data: cleanValue, mode: 'Byte' }]} 
            size={QR_SIZE} 
            color="#0B0F0E" 
            backgroundColor="#FFFFFF"
            ecl="M" // Nivel de corrección medio estándar
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
