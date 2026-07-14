import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useColors } from '@/hooks/useColors';

interface Props {
  /** The current value of the date/time block, decoded as a local Date. */
  value: Date;
  /** Called with the next Date whenever the user changes date, time, or seconds. */
  onChange: (next: Date) => void;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDate(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function formatTime(value: Date): string {
  return `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
}

/**
 * Lets the user change the date and time encoded in a single QR content
 * block, leaving the rest of the record untouched. Uses native calendar/
 * clock pickers on iOS and Android; on web (where the native picker module
 * has no implementation) it falls back to plain, validated text fields so
 * the flow still works during development/testing in the browser preview.
 */
export function RecordDateTimePicker({ value, onChange }: Props) {
  const colors = useColors();
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [dateText, setDateText] = useState(formatDate(value));
  const [timeText, setTimeText] = useState(formatTime(value));

  // Keep the web text fields in sync when the value changes from elsewhere
  // (e.g. the raw content field was edited manually).
  useEffect(() => {
    setDateText(formatDate(value));
    setTimeText(formatTime(value));
  }, [value]);

  const combineDate = (picked: Date) => {
    const next = new Date(value);
    next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
    return next;
  };
  const combineTime = (picked: Date) => {
    const next = new Date(value);
    next.setHours(picked.getHours(), picked.getMinutes(), value.getSeconds());
    return next;
  };
  const adjustSeconds = (delta: number) => {
    const next = new Date(value);
    next.setSeconds((next.getSeconds() + delta + 60) % 60);
    onChange(next);
  };

  const openDate = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: 'date',
        onChange: (_event, selected) => {
          if (selected) onChange(combineDate(selected));
        },
      });
    } else {
      setShowDate(true);
    }
  };

  const openTime = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: 'time',
        is24Hour: true,
        onChange: (_event, selected) => {
          if (selected) onChange(combineTime(selected));
        },
      });
    } else {
      setShowTime(true);
    }
  };

  const handleDateTextChange = (text: string) => {
    setDateText(text);
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return;
    const [, y, mo, d] = match;
    const next = new Date(value);
    next.setFullYear(Number(y), Number(mo) - 1, Number(d));
    if (!Number.isNaN(next.getTime())) onChange(next);
  };

  const handleTimeTextChange = (text: string) => {
    setTimeText(text);
    const match = text.match(/^(\d{2}):(\d{2}):(\d{2})$/);
    if (!match) return;
    const [, h, mi, s] = match;
    const next = new Date(value);
    next.setHours(Number(h), Number(mi), Number(s));
    if (!Number.isNaN(next.getTime())) onChange(next);
  };

  const fieldStyle = [
    styles.chip,
    { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {Platform.OS === 'web' ? (
          <View style={fieldStyle}>
            <Feather name="calendar" size={16} color={colors.primary} />
            <TextInput
              value={dateText}
              onChangeText={handleDateTextChange}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.chipInput, { color: colors.foreground }]}
              testID="date-field"
            />
          </View>
        ) : (
          <Pressable onPress={openDate} style={fieldStyle} testID="date-field">
            <Feather name="calendar" size={16} color={colors.primary} />
            <Text style={[styles.chipText, { color: colors.foreground }]}>
              {pad(value.getDate())}/{pad(value.getMonth() + 1)}/{value.getFullYear()}
            </Text>
          </Pressable>
        )}

        {Platform.OS === 'web' ? (
          <View style={fieldStyle}>
            <Feather name="clock" size={16} color={colors.primary} />
            <TextInput
              value={timeText}
              onChangeText={handleTimeTextChange}
              placeholder="HH:MM:SS"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.chipInput, { color: colors.foreground }]}
              testID="time-field"
            />
          </View>
        ) : (
          <Pressable onPress={openTime} style={fieldStyle} testID="time-field">
            <Feather name="clock" size={16} color={colors.primary} />
            <Text style={[styles.chipText, { color: colors.foreground }]}>
              {pad(value.getHours())}:{pad(value.getMinutes())}
            </Text>
          </Pressable>
        )}
      </View>

      {Platform.OS !== 'web' && (
        <View style={styles.secondsRow}>
          <Text style={[styles.secondsLabel, { color: colors.mutedForeground }]}>SECONDS</Text>
          <View style={styles.secondsControls}>
            <Pressable
              onPress={() => adjustSeconds(-1)}
              style={[styles.stepperButton, { borderColor: colors.border }]}
              testID="seconds-minus"
            >
              <Feather name="minus" size={14} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.secondsValue, { color: colors.foreground }]}>
              {pad(value.getSeconds())}
            </Text>
            <Pressable
              onPress={() => adjustSeconds(1)}
              style={[styles.stepperButton, { borderColor: colors.border }]}
              testID="seconds-plus"
            >
              <Feather name="plus" size={14} color={colors.foreground} />
            </Pressable>
          </View>
        </View>
      )}

      {Platform.OS === 'ios' && showDate && (
        <DateTimePicker
          value={value}
          mode="date"
          display="inline"
          onChange={(_event, selected) => {
            setShowDate(false);
            if (selected) onChange(combineDate(selected));
          }}
        />
      )}
      {Platform.OS === 'ios' && showTime && (
        <DateTimePicker
          value={value}
          mode="time"
          display="spinner"
          onChange={(_event, selected) => {
            setShowTime(false);
            if (selected) onChange(combineTime(selected));
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  chipInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    padding: 0,
  },
  secondsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondsLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  secondsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondsValue: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
});
