import React, { createContext, useState, useContext } from 'react';

interface SettingsContextType {
  taxRate: number; // represented as decimal (e.g., 0.075)
  setTaxRate: (r: number) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  taxRate: 0.075,
  setTaxRate: () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [taxRate, setTaxRate] = useState<number>(0.075);

  return (
    <SettingsContext.Provider value={{ taxRate, setTaxRate }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
