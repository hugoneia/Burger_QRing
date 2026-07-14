import type { ComponentProps } from 'react';
import type { Feather } from '@expo/vector-icons';

export type QrContentType =
  | 'structured-code'
  | 'url'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'vcard'
  | 'geo'
  | 'text';

export type FeatherIconName = ComponentProps<typeof Feather>['name'];

export interface QrAnalysis {
  type: QrContentType;
  label: string;
  icon: FeatherIconName;
  detail: string;
}

const DATE_BLOCK_REGEX = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/;

export interface StructuredCodeParts {
  /** The comma-separated blocks of the raw content, in order. */
  blocks: string[];
  /** Index of the block that holds the YYYYMMDDhhmmss timestamp. */
  dateIndex: number;
  /** The timestamp block decoded into a local Date. */
  date: Date;
}

/**
 * Detects the fixed comma-separated record format used by this app's QR
 * codes (e.g. "19434,104650396,20260714142600,ada09...") and locates the
 * single block that encodes a YYYYMMDDhhmmss timestamp, so the UI can offer
 * a date/time picker for that block alone while leaving the rest untouched.
 */
export function parseStructuredCode(raw: string): StructuredCodeParts | null {
  const content = raw.trim();
  if (!content.includes(',')) return null;

  const blocks = content.split(',');
  if (blocks.length < 3) return null;

  const dateIndex = blocks.findIndex((block) => DATE_BLOCK_REGEX.test(block));
  if (dateIndex === -1) return null;

  const match = blocks[dateIndex].match(DATE_BLOCK_REGEX);
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match;
  const date = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
  if (Number.isNaN(date.getTime())) return null;

  return { blocks, dateIndex, date };
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

/** Formats a Date back into the YYYYMMDDhhmmss block format. */
export function formatDateBlock(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

/** Rebuilds the full record string with the date block replaced by `date`. */
export function replaceDateBlock(parts: StructuredCodeParts, date: Date): string {
  const blocks = [...parts.blocks];
  blocks[parts.dateIndex] = formatDateBlock(date);
  return blocks.join(',');
}

function parseWifi(content: string): string {
  const ssidMatch = content.match(/S:([^;]*);/);
  const ssid = ssidMatch?.[1];
  return ssid ? `Network "${ssid}"` : 'Wi-Fi network credentials';
}

function parseVCard(content: string): string {
  const nameMatch = content.match(/FN:([^\r\n]*)/i) ?? content.match(/N:([^\r\n]*)/i);
  const name = nameMatch?.[1]?.trim();
  return name ? `Contact card for ${name}` : 'Contact card';
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Classifies raw QR payload text into a recognizable content type so the
 * UI can show a friendly label and icon instead of a wall of raw text.
 */
export function analyzeQrContent(raw: string): QrAnalysis {
  const content = raw.trim();

  if (!content) {
    return { type: 'text', label: 'Empty', icon: 'type', detail: 'No content yet' };
  }

  const structured = parseStructuredCode(content);
  if (structured) {
    const { date } = structured;
    const detail = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    return { type: 'structured-code', label: 'Coded record', icon: 'hash', detail };
  }

  if (/^https?:\/\//i.test(content) || /^www\./i.test(content)) {
    let host = content;
    try {
      host = new URL(/^www\./i.test(content) ? `https://${content}` : content).hostname;
    } catch {
      // keep raw content as fallback
    }
    return { type: 'url', label: 'Website link', icon: 'link', detail: host };
  }

  if (/^mailto:/i.test(content)) {
    return {
      type: 'email',
      label: 'Email address',
      icon: 'mail',
      detail: content.replace(/^mailto:/i, ''),
    };
  }
  if (EMAIL_REGEX.test(content)) {
    return { type: 'email', label: 'Email address', icon: 'mail', detail: content };
  }

  if (/^tel:/i.test(content)) {
    return {
      type: 'phone',
      label: 'Phone number',
      icon: 'phone',
      detail: content.replace(/^tel:/i, ''),
    };
  }

  if (/^smsto:|^sms:/i.test(content)) {
    return {
      type: 'sms',
      label: 'Text message',
      icon: 'message-square',
      detail: content.replace(/^smsto:|^sms:/i, ''),
    };
  }

  if (/^WIFI:/i.test(content)) {
    return { type: 'wifi', label: 'Wi-Fi network', icon: 'wifi', detail: parseWifi(content) };
  }

  if (/^BEGIN:VCARD/i.test(content)) {
    return { type: 'vcard', label: 'Contact card', icon: 'user', detail: parseVCard(content) };
  }

  if (/^geo:/i.test(content)) {
    return {
      type: 'geo',
      label: 'Map location',
      icon: 'map-pin',
      detail: content.replace(/^geo:/i, ''),
    };
  }

  const preview = content.length > 60 ? `${content.slice(0, 60)}…` : content;
  return { type: 'text', label: 'Plain text', icon: 'type', detail: preview };
}
