import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

const QR_SIZE = 210;

export function QRCodeCard({ value }: { value: string }) {
  const colors = useColors();
  
  // 1. Añadimos el salto de línea obligatorio al final, en minúsculas y sin espacios laterales.
  const cleanValue = value.trim().toLowerCase() + '\n';

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
            // 2. Quitamos el atributo 'ecl' por completo para que la librería herede 
            // el nivel de tolerancia nativo por defecto que encajaba los bloques.
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
