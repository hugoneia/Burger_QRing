import type { ComponentProps } from 'react';
import type { Feather } from '@expo/vector-icons';

export type QrContentType =
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
