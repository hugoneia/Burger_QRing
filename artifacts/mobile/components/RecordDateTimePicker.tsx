import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useColors } from '@/hooks/useColors';

interface Props {
  /** The current value of the date/time block, decoded as a local Date. */
  value: Date;
  /** Called with the next Date whenever the user changes the date or time. */
  onChange: (next: Date) => void;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDate(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function formatTime(value: Date): string {
  return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

/**
 * Lets the user change the date and time encoded in a single QR content
 * block, leaving the rest of the record untouched. Seconds are not
 * editable and are always normalized to 00 whenever the date or time is
 * changed. Uses native calendar/clock pickers on iOS and Android; on web
 * (where the native picker module has no implementation) it falls back to
 * plain, validated text fields so the flow still works during
 * development/testing in the browser preview.
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
    next.setSeconds(0);
    return next;
  };
  const combineTime = (picked: Date) => {
    const next = new Date(value);
    next.setHours(picked.getHours(), picked.getMinutes(), 0);
    return next;
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
    const match = text.match(/^(\d{2}):(\d{2})$/);
    if (!match) return;
    const [, h, mi] = match;
    const next = new Date(value);
    next.setHours(Number(h), Number(mi), 0);
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
              placeholder="HH:MM"
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
});
