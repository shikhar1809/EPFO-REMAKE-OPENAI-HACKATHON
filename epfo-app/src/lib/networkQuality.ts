import { toast } from 'react-hot-toast';
import i18n from '../i18n/config';
import { useSettingsStore } from '../store/useSettingsStore';

export type NetworkQuality = 'good' | 'low';

const SLOW_EFFECTIVE_TYPES = ['slow-2g', '2g'];
export const LOW_INTERNET_LATENCY_MS = 1200;

interface ConnectionLike {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

function getConnection(): ConnectionLike | undefined {
  const nav = navigator as Navigator & { connection?: ConnectionLike };
  return nav.connection;
}

export function connectionQuality(): NetworkQuality {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'low';
  }
  const connection = getConnection();
  if (connection) {
    if (connection.saveData) return 'low';
    if (connection.effectiveType && SLOW_EFFECTIVE_TYPES.includes(connection.effectiveType)) {
      return 'low';
    }
  }
  return 'good';
}

export async function probeLatency(maxTimeMs = 900): Promise<number> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), maxTimeMs);
  const samples: number[] = [];
  const url = `${window.location.origin}/?ncprobe=${Date.now()}`;
  try {
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
      await response.text();
      samples.push(performance.now() - start);
    }
  } catch {
    // aborted (budget exceeded) or network failure -> no usable sample
  } finally {
    clearTimeout(timeout);
  }
  if (samples.length === 0) return maxTimeMs + 1;
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length / 2)];
}

let lastIsLow: boolean | null = useSettingsStore.getState().lowInternetMode ? true : null;

function showLowInternetToast(): void {
  toast(i18n.t('net_low_internet_mode_toast'), {
    icon: '⚠️',
    position: 'top-center',
    duration: 4000,
    style: { background: '#f59e0b', color: '#fff', fontWeight: 'bold' },
  });
}

export function applyLowInternetMode(isLow: boolean): boolean {
  const changed = lastIsLow !== isLow;
  lastIsLow = isLow;
  if (useSettingsStore.getState().lowInternetMode !== isLow) {
    useSettingsStore.getState().setLowInternetMode(isLow);
  }
  if (isLow && changed) {
    showLowInternetToast();
  }
  return changed;
}

export function watchNetworkQuality(onQualityChange: (quality: NetworkQuality) => void): () => void {
  const connection = getConnection();
  const evaluate = () => onQualityChange(connectionQuality());
  window.addEventListener('online', evaluate);
  window.addEventListener('offline', evaluate);
  connection?.addEventListener('change', evaluate);
  return () => {
    window.removeEventListener('online', evaluate);
    window.removeEventListener('offline', evaluate);
    connection?.removeEventListener('change', evaluate);
  };
}