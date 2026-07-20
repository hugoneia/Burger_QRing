import React, { useMemo, useState, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View, Modal } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { QRCodeCard } from '@/components/QRCodeCard';
import { RecordDateTimePicker } from '@/components/RecordDateTimePicker';
import { parseStructuredCode, replaceDateBlock } from '@/lib/qrContent';

export default function ResultScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ content?: string }>();
  const original = params.content ?? '';
  const [content, setContent] = useState(original);
  const [infoVisible, setInfoVisible] = useState(false);
  
  // Guardamos la posición Y absoluta del textInput
  const [inputYPosition, setInputYPosition] = useState(110);
  
  // Referencia para medir el contenedor de forma absoluta
  const sectionRef = useRef<View>(null);

  const structured = useMemo(() => parseStructuredCode(content), [content]);
  const isEdited = content !== original;

  // Medimos de manera absoluta en la pantalla
  const openInfoModal = () => {
    if (sectionRef.current) {
      sectionRef.current.measure((x, y, width, height, pageX, pageY) => {
        // pageY nos da los píxeles reales exactos desde el borde físico del teléfono
        // Sumamos la etiqueta "CONTENIDO" + un pequeño margen de separación (~32px)
        setInputYPosition(pageY + 32);
        setInfoVisible(true);
      });
    } else {
      setInfoVisible(true);
    }
  };

  const handleDateTimeChange = (next: Date) => {
    if (!structured) return;
    setContent(replaceDateBlock(structured, next));
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const handleSetNow = () => {
    if (!structured) return;
    const now = new Date();
    now.setSeconds(0);
    handleDateTimeChange(now);
  };

  const handleReset = () => {
    setContent(original);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleScanAgain = () => {
    router.replace('/');
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Añadimos la ref a la sección de contenido */}
      <View style={styles.section} ref={sectionRef}>
        <View style={styles.titleContainer}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CONTENIDO</Text>
          <Pressable 
            onPress={openInfoModal} 
            style={styles.infoButton}
            testID="info-button"
          >
            <Feather name="info" size={16} color={colors.primary} />
          </Pressable>
        </View>

        {/* Modal de información estructurada */}
        <Modal
          visible={infoVisible}
          transparent={true}
          animationType="fade"
          statusBarTranslucent={true} // Obligatorio para Android
          onRequestClose={() => setInfoVisible(false)}
        >
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setInfoVisible(false)}
          >
            <View 
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                  marginTop: inputYPosition, // Clavado en el sitio exacto de la build
                }
              ]}
            >
              <Text style={styles.infoTextParagraph}>
                <Text style={{ color: colors.foreground }}>
                  11111,222222222,33333333333333,44444444444444444444444444444444
                </Text>
              </Text>
              <Text style={styles.infoTextParagraph}>
                <Text style={{ color: colors.mutedForeground }}>----------------------------------------</Text>
              </Text>
              <Text style={styles.infoTextParagraph}>
                <Text style={{ color: colors.foreground, fontWeight: '600' }}>1</Text>
                <Text style={{ color: colors.mutedForeground }}>: ID establecimiento BK</Text>
              </Text>

              <Text style={styles.infoTextParagraph}>
                <Text style={{ color: colors.foreground, fontWeight: '600' }}>2</Text>
                <Text style={{ color: colors.mutedForeground }}>: ID transacción + Nº pedido</Text>
              </Text>

              <Text style={styles.infoTextParagraph}>
                <Text style={{ color: colors.foreground, fontWeight: '600' }}>3</Text>
                <Text style={{ color: colors.mutedForeground }}>: Fecha-Hora (YYYYMMDDhhmmss)</Text>
              </Text>

              <Text style={styles.infoTextParagraph}>
                <Text style={{ color: colors.foreground, fontWeight: '600' }}>4</Text>
                <Text style={{ color: colors.mutedForeground }}>: hash MD5</Text>
              </Text>
            </View>
          </Pressable>
        </Modal>

        <TextInput
          value={content}
          onChangeText={setContent}
          multiline
          placeholder="Contenido del QR"
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.textInput,
            {
              color: colors.foreground,
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
          testID="content-input"
        />
        <View style={styles.inputFooter}>
          {isEdited && (
            <Pressable onPress={handleReset} style={styles.resetLink} testID="reset-button">
              <Feather name="rotate-ccw" size={13} color={colors.primary} />
              <Text style={[styles.resetLinkText, { color: colors.primary }]}>Restablecer</Text>
            </Pressable>
          )}
        </View>
      </View>

      {structured && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            FECHA Y HORA DEL REGISTRO
          </Text>
          <RecordDateTimePicker value={structured.date} onChange={handleDateTimeChange} />
          <Pressable
            onPress={handleSetNow}
            style={[
              styles.nowButton,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
            ]}
            testID="set-now-button"
          >
            <Feather name="refresh-cw" size={16} color={colors.primary} />
            <Text style={[styles.nowButtonText, { color: colors.foreground }]}>
              Fecha/Hora Actual
            </Text>
          </Pressable>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CÓDIGO QR</Text>
        <View style={styles.qrCenter}>
          <QRCodeCard value={content} />
        </View>
      </View>

      <Pressable
        onPress={handleScanAgain}
        style={[styles.scanAgainButton, { backgroundColor: colors.primary }]}
        testID="scan-again-button"
      >
        <Feather name="camera" size={18} color={colors.primaryForeground} />
        <Text style={[styles.scanAgainText, { color: colors.primaryForeground }]}>
          Escanear nuevo código
        </Text>
      </Pressable>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  section: {
    gap: 10,
    position: 'relative',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  textInput: {
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  infoTextParagraph: {
    fontSize: 15,
    lineHeight: 18,
    marginBottom: 4,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 12,
  },
  resetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  resetLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    paddingVertical: 12,
  },
  nowButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  qrCenter: {
    alignItems: 'center',
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 100,
    paddingVertical: 16,
  },
  scanAgainText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
