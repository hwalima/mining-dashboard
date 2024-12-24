import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CompanySettings {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  lightLogo: string;  // Base64 string of the image
  darkLogo: string;   // Base64 string of the image
  favicon: string;    // Base64 string of the image
}

interface CompanySettingsContextType {
  settings: CompanySettings | null;
  updateSettings: (settings: CompanySettings) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const CompanySettingsContext = createContext<CompanySettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'companySettings';

export const CompanySettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load settings from localStorage on mount
    const loadSettings = () => {
      try {
        const storedSettings = localStorage.getItem(STORAGE_KEY);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (err) {
        setError('Failed to load company settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (newSettings: CompanySettings) => {
    try {
      setIsLoading(true);
      // Store in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      setError(null);
    } catch (err) {
      setError('Failed to update company settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CompanySettingsContext.Provider value={{ settings, updateSettings, isLoading, error }}>
      {children}
    </CompanySettingsContext.Provider>
  );
};

export const useCompanySettings = () => {
  const context = useContext(CompanySettingsContext);
  if (context === undefined) {
    throw new Error('useCompanySettings must be used within a CompanySettingsProvider');
  }
  return context;
};
