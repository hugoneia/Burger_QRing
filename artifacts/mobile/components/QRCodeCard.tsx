import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

const QR_SIZE = 210;

export function QRCodeCard({ value }: { value: string }) {
  const colors = useColors();
  
  // 1. Limpieza absoluta y conversión estricta a minúsculas para el hash MD5 final
  // Esto garantiza que 'ada092e...' no cambie a mayúsculas internamente.
  const cleanValue = value.trim().toLowerCase();

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
            // 2. Pasamos el string limpio directamente
            value={cleanValue} 
            size={QR_SIZE} 
            color="#0B0F0E" 
            backgroundColor="#FFFFFF" 
            // 3. Forzamos el nivel M (Medium) que es el que usa Burger King por defecto en sus tickets de 29x29
            ecl="M" 
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
