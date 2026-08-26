import { SESSION_COOKIE_NAME } from './ssr-session.constants';

export interface SsrSessionPayload {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function encodeSessionPayload(payload: SsrSessionPayload): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  return bytesToBase64Url(bytes);
}

export function decodeSessionPayload(value: string): SsrSessionPayload | null {
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(value));
    const parsed = JSON.parse(json) as SsrSessionPayload;

    if (
      typeof parsed?.token === 'string' &&
      typeof parsed?.user?.id === 'string' &&
      typeof parsed?.user?.name === 'string' &&
      typeof parsed?.user?.email === 'string'
    ) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export function parseCookieHeader(header: string | null): Record<string, string> {
  if (!header) {
    return {};
  }

  return header.split(';').reduce<Record<string, string>>((acc, part) => {
    const trimmed = part.trim();
    const separator = trimmed.indexOf('=');
    if (separator <= 0) {
      return acc;
    }

    const key = trimmed.slice(0, separator);
    const value = trimmed.slice(separator + 1);
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

export function readSessionFromCookieHeader(
  header: string | null
): SsrSessionPayload | null {
  const cookies = parseCookieHeader(header);
  const raw = cookies[SESSION_COOKIE_NAME];
  return raw ? decodeSessionPayload(raw) : null;
}
