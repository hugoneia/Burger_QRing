import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  Keyboard,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { ScannerFrame } from '@/components/ScannerFrame';

export default function ScannerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualText, setManualText] = useState('');
  const scannedRef = useRef(false);

  // Estado para controlar dinámicamente la altura del teclado
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const goToResult = useCallback((content: string) => {
    if (!content.trim() || scannedRef.current) return;
    scannedRef.current = true;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push({ pathname: '/result', params: { content } });
    setTimeout(() => {
      scannedRef.current = false;
    }, 800);
  }, []);

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      goToResult(result.data);
    },
    [goToResult],
  );

  const handleManualSubmit = useCallback(() => {
    if (!manualText.trim()) return;
    Keyboard.dismiss();
    const text = manualText;
    setManualText('');
    setManualOpen(false);
    goToResult(text);
  }, [manualText, goToResult]);

  const openSettings = useCallback(async () => {
    if (Platform.OS === 'web') return;
    try {
      await Linking.openSettings();
    } catch {
      // no-op — nothing actionable if this fails
    }
  }, []);

  const renderPermissionGate = () => {
    if (!permission) {
      return (
        <View style={styles.centerFill}>
          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
            Comprobando acceso a la cámara…
          </Text>
        </View>
      );
    }

    if (!permission.granted) {
      const canAsk = permission.canAskAgain;
      return (
        <View style={[styles.centerFill, styles.permissionPad]}>
          <View style={[styles.iconBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="camera" size={30} color={colors.primary} />
          </View>
          <Text style={[styles.permissionTitle, { color: colors.foreground }]}>
            Se necesita acceso a la cámara
          </Text>
          <Text style={[styles.permissionBody, { color: colors.mutedForeground }]}>
            {canAsk
              ? 'Permite el acceso a la cámara para escanear códigos QR y leer su contenido.'
              : 'Se denegó el acceso a la cámara. Actívalo en Ajustes para empezar a escanear.'}
          </Text>
          <Pressable
            onPress={canAsk ? requestPermission : openSettings}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
              {canAsk ? 'Permitir acceso a la cámara' : 'Abrir Ajustes'}
            </Text>
          </Pressable>
        </View>
      );
    }

    return null;
  };

  const hasCamera = permission?.granted;

  // Calculamos la posición del bloque inferior
  const isKeyboardActive = keyboardHeight > 0;
  // Añadimos un pequeño extra (offset) de 20px para que los botones floten sobre el teclado con holgura
  const keyboardOffset = 20; 
  const bottomPosition = isKeyboardActive ? keyboardHeight + keyboardOffset : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {hasCamera ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torchOn}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={manualOpen ? undefined : handleBarcodeScanned}
        />
      ) : (
        <View style={[Sheet.absoluteFill, { backgroundColor: colors.background }]} />
      )}

      {hasCamera && (
        <View style={[StyleSheet.absoluteFill, styles.overlay]}>
          <View style={styles.overlayDim} />
          <View style={styles.overlayCenterRow}>
            <View style={styles.overlayDimSide} />
            <View style={styles.scannerWrapper}>
              <Text style={styles.byText}>by @hug0nES</Text>
              <ScannerFrame active={!manualOpen} />
            </View>
            <View style={styles.overlayDimSide} />
          </View>
          <View style={styles.overlayBottomDim}>
            <Text style={styles.helperText}>Encuadra el QR "Rellena tu bebida" de tu ticket</Text>
          </View>
        </View>
      )}

      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: hasCamera ? '#F4FBF8' : colors.foreground }]}>
          Escanear código QR
        </Text>
        {hasCamera && (
          <Pressable
            onPress={() => setTorchOn((v) => !v)}
            style={[styles.torchButton, { backgroundColor: 'rgba(20,27,25,0.75)' }]}
            testID="torch-toggle"
          >
            <Feather name={torchOn ? 'zap' : 'zap-off'} size={20} color="#F4FBF8" />
          </Pressable>
        )}
      </View>

      {renderPermissionGate()}

      <View
        style={[
          styles.bottomSheet,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            // Usamos un padding más generoso (24px) cuando el teclado esté abierto para que los botones respiren
            paddingBottom: isKeyboardActive ? 24 : insets.bottom + 20,
            bottom: bottomPosition,
          },
        ]}
      >
        {manualOpen ? (
          <View style={styles.manualRow}>
            <TextInput
              value={manualText}
              onChangeText={setManualText}
              placeholder="Escribe o pega el contenido"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.manualInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.muted,
                  borderColor: colors.border,
                },
              ]}
              autoFocus
              multiline
              testID="manual-input"
            />
            <View style={styles.manualActions}>
              <Pressable
                onPress={() => {
                  setManualOpen(false);
                  setManualText('');
                  Keyboard.dismiss();
                }}
                style={[styles.secondaryButton, { borderColor: colors.border }]}
                testID="manual-cancel"
              >
                <Text style={[styles.secondaryButtonText, { color: colors.mutedForeground }]}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={handleManualSubmit}
                disabled={!manualText.trim()}
                style={[
                  styles.primaryButtonSmall,
                  { backgroundColor: colors.primary, opacity: manualText.trim() ? 1 : 0.4 },
                ]}
                testID="manual-submit"
              >
                <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                  Continuar
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setManualOpen(true)}
            style={styles.manualEntryTrigger}
            testID="manual-entry-trigger"
          >
            <Feather name="edit-3" size={16} color={colors.primary} />
            <Text style={[styles.manualEntryText, { color: colors.primary }]}>
              Introducir contenido manualmente
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flexDirection: 'column',
  },
  overlayDim: {
    height: '18%',
    backgroundColor: 'rgba(11,15,14,0.55)',
  },
  overlayCenterRow: {
    flexDirection: 'row',
    height: 260,
  },
  overlayDimSide: {
    flex: 1,
    backgroundColor: 'rgba(11,15,14,0.55)',
  },
  scannerWrapper: {
    width: 260, // Ajustado al tamaño de altura del ScannerFrame
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  byText: {
    position: 'absolute',
    top: -22, // Distancia de separación por encima del marco (puedes ajustarla)
    fontSize: 10,
    fontWeight: '800',
    color: '#E7F5EF22',
    letterSpacing: 2, // Le da un toque más limpio al texto pequeño
    textAlign: 'center',
  },
  overlayBottomDim: {
    flex: 1,
    backgroundColor: 'rgba(11,15,14,0.55)',
    alignItems: 'center',
    paddingTop: 24,
  },
  helperText: {
    color: '#E7F5EF',
    fontSize: 14,
    fontWeight: '500',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  torchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    fontSize: 14,
  },
  permissionPad: {
    paddingHorizontal: 32,
    gap: 14,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  permissionTitle: {
    fontSize: 19,
    fontWeight: '700',
  },
  permissionBody: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 21,
  },
  primaryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 100,
  },
  primaryButtonSmall: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  manualEntryTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  manualEntryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  manualRow: {
    gap: 12,
  },
  manualInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 60,
    maxHeight: 120,
  },
  manualActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
});
