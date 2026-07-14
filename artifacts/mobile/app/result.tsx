import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

  const structured = useMemo(() => parseStructuredCode(content), [content]);
  const isEdited = content !== original;

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
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CONTENIDO</Text>
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
          <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
            {content.length} caracteres
          </Text>
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
    minHeight: 110,
    textAlignVertical: 'top',
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
