import React, { useEffect } from 'react';
import { useCompanySettings } from '../contexts/CompanySettingsContext';

const DynamicFavicon: React.FC = () => {
  const { settings } = useCompanySettings();

  useEffect(() => {
    const updateFavicon = () => {
      const faviconElement = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      
      if (settings?.favicon) {
        faviconElement.href = settings.favicon;
      } else {
        // Fallback to default favicon
        faviconElement.href = new URL('../assets/icon light background.png', import.meta.url).href;
      }
    };

    updateFavicon();

    // Update favicon when settings change
    return () => {
      const faviconElement = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      faviconElement.href = new URL('../assets/icon light background.png', import.meta.url).href;
    };
  }, [settings?.favicon]);

  return null; // This component doesn't render anything
};

export default DynamicFavicon;
