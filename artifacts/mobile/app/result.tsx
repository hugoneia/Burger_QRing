import React, { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { QRCodeCard } from '@/components/QRCodeCard';
import { RecordDateTimePicker } from '@/components/RecordDateTimePicker';
import { analyzeQrContent, parseStructuredCode, replaceDateBlock } from '@/lib/qrContent';

export default function ResultScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ content?: string }>();
  const original = params.content ?? '';
  const [content, setContent] = useState(original);
  const [copied, setCopied] = useState(false);

  const analysis = useMemo(() => analyzeQrContent(content), [content]);
  const structured = useMemo(() => parseStructuredCode(content), [content]);
  const isEdited = content !== original;
  const isEmpty = content.trim().length === 0;

  const handleDateTimeChange = (next: Date) => {
    if (!structured) return;
    setContent(replaceDateBlock(structured, next));
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const handleCopy = async () => {
    if (isEmpty) return;
    await Clipboard.setStringAsync(content);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleShare = async () => {
    if (isEmpty) return;
    try {
      await Share.share({ message: content });
    } catch {
      Alert.alert('Could not share', 'Something went wrong while sharing this content.');
    }
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
      <View
        style={[
          styles.analysisCard,
          { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
        ]}
      >
        <View style={[styles.analysisIcon, { backgroundColor: colors.accent }]}>
          <Feather name={analysis.icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.analysisTextWrap}>
          <Text style={[styles.analysisLabel, { color: colors.foreground }]}>{analysis.label}</Text>
          <Text style={[styles.analysisDetail, { color: colors.mutedForeground }]} numberOfLines={1}>
            {analysis.detail}
          </Text>
        </View>
        {isEdited && (
          <View style={[styles.editedPill, { backgroundColor: colors.accent }]}>
            <Text style={[styles.editedPillText, { color: colors.primary }]}>Edited</Text>
          </View>
        )}
      </View>

      {structured && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            DATE & TIME OF THE RECORD
          </Text>
          <RecordDateTimePicker value={structured.date} onChange={handleDateTimeChange} />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CONTENT</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          multiline
          placeholder="QR content"
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
            {content.length} characters
          </Text>
          {isEdited && (
            <Pressable onPress={handleReset} style={styles.resetLink} testID="reset-button">
              <Feather name="rotate-ccw" size={13} color={colors.primary} />
              <Text style={[styles.resetLinkText, { color: colors.primary }]}>Reset</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>NEW QR CODE</Text>
        <View style={styles.qrCenter}>
          <QRCodeCard value={content} />
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={handleCopy}
          disabled={isEmpty}
          style={[
            styles.actionButton,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: isEmpty ? 0.4 : 1 },
          ]}
          testID="copy-button"
        >
          <Feather name={copied ? 'check' : 'copy'} size={18} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.foreground }]}>
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleShare}
          disabled={isEmpty}
          style={[
            styles.actionButton,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: isEmpty ? 0.4 : 1 },
          ]}
          testID="share-button"
        >
          <Feather name="share-2" size={18} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.foreground }]}>Share</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={handleScanAgain}
        style={[styles.scanAgainButton, { backgroundColor: colors.primary }]}
        testID="scan-again-button"
      >
        <Feather name="camera" size={18} color={colors.primaryForeground} />
        <Text style={[styles.scanAgainText, { color: colors.primaryForeground }]}>Scan another code</Text>
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
  analysisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  analysisIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisTextWrap: {
    flex: 1,
    gap: 2,
  },
  analysisLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  analysisDetail: {
    fontSize: 13,
  },
  editedPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  editedPillText: {
    fontSize: 11,
    fontWeight: '700',
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
  qrCenter: {
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 100,
    paddingVertical: 14,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
