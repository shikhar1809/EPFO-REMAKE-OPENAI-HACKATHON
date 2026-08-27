import React, { useEffect } from 'react';
import { applyLowInternetMode, connectionQuality, watchNetworkQuality } from '../../lib/networkQuality';

export const NetworkQualityMonitor: React.FC = () => {
  useEffect(() => {
    applyLowInternetMode(connectionQuality() === 'low');
    return watchNetworkQuality((quality) => applyLowInternetMode(quality === 'low'));
  }, []);
  return null;
};