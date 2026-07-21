import React, { useMemo, useState, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View, Modal, Alert, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useColors } from '@/hooks/useColors';
import { QRCodeCard } from '@/components/QRCodeCard';
import { RecordDateTimePicker } from '@/components/RecordDateTimePicker';
import { parseStructuredCode, replaceDateBlock } from '@/lib/qrContent';

// Función para consultar la API de Burger King vía GraphQL
async function obtenerStoreIds(latitud: number, longitud: number, radioMetros = 1000): Promise<string[]> {
  const queryGraphQL = `
    query GetRestaurants($input: RestaurantsInput) {
      restaurants(input: $input) {
        nodes {
          storeId
        }
      }
    }
  `;

  const respuesta = await fetch("https://euw3-prod-bk-gateway.rbictg.com/graphql", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-ui-language": "es",
      "x-ui-platform": "web",
      "x-ui-region": "ES"
    },
    body: JSON.stringify({
      operationName: "GetRestaurants",
      variables: {
        input: {
          filter: "NEARBY",
          coordinates: {
            userLat: latitud,
            userLng: longitud,
            searchRadius: radioMetros
          },
          first: 1000,
          status: "OPEN"
        }
      },
      query: queryGraphQL
    })
  });

  const datos = await respuesta.json();
  const nodos = datos?.data?.restaurants?.nodes || [];

  return nodos.map((tienda: { storeId: string }) => tienda.storeId).filter(Boolean);
}

export default function ResultScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ content?: string; latitude?: string; longitude?: string }>();
  const original = params.content ?? '';
  const [content, setContent] = useState(original);
  const [infoVisible, setInfoVisible] = useState(false);
  const [loadingBkId, setLoadingBkId] = useState(false);
  
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

  const handleFetchBkStoreId = async () => {
    setLoadingBkId(true);
    let lat = params.latitude ? parseFloat(params.latitude) : null;
    let lng = params.longitude ? parseFloat(params.longitude) : null;

    try {
      // Si no vinieron coordenadas en los params, pedimos / consultamos la ubicación actual
      if (!lat || !lng) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        }
      }

      if (!lat || !lng) {
        Alert.alert(
          'Ubicación no disponible',
          'No se han podido obtener las coordenadas GPS para localizar el restaurante más cercano.',
          [{ text: 'Entendido' }]
        );
        setLoadingBkId(false);
        return;
      }

      // Consultamos la API de Burger King
      const storeIds = await obtenerStoreIds(lat, lng);

      if (storeIds && storeIds.length > 0) {
        const newStoreId = storeIds[0];
        
        // Reemplazar la primera sección hasta la primera coma
        const commaIndex = content.indexOf(',');
        if (commaIndex !== -1) {
          const restOfCode = content.substring(commaIndex);
          setContent(`${newStoreId}${restOfCode}`);
        } else {
          setContent(newStoreId);
        }

        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        Alert.alert(
          'Restaurante no encontrado',
          'No se encontró ningún restaurante Burger King cercano a tu ubicación.',
          [{ text: 'Aceptar' }]
        );
      }
    } catch {
      Alert.alert(
        'Error de conexión',
        'No se pudo conectar con el servidor de Burger King para obtener el ID de la tienda.',
        [{ text: 'Aceptar' }]
      );
    } finally {
      setLoadingBkId(false);
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
          statusBarTranslucent={true}
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
                  marginTop: inputYPosition,
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
          
          <View style={styles.buttonsRow}>
            <Pressable
              onPress={handleSetNow}
              style={[
                styles.halfButton,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
              testID="set-now-button"
            >
              <Feather name="refresh-cw" size={16} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.foreground }]}>
                Fecha/Hora Act.
              </Text>
            </Pressable>

            <Pressable
              onPress={handleFetchBkStoreId}
              disabled={loadingBkId}
              style={[
                styles.halfButton,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
              testID="fetch-bk-id-button"
            >
              {loadingBkId ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Feather name="map-pin" size={16} color={colors.primary} />
                  <Text style={[styles.actionButtonText, { color: colors.foreground }]}>
                    ID de BK
                  </Text>
                </>
              )}
            </Pressable>
          </View>
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
  resetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  resetLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  actionButtonText: {
    fontSize: 13,
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
