import React, { createContext, useContext, useState, useEffect } from 'react';

interface Widget {
  id: string;
  name: string;
  type: string;
  isVisible: boolean;
  description?: string;
}

interface DashboardContextType {
  widgets: Widget[];
  toggleWidget: (id: string) => void;
  addWidget: (widget: Omit<Widget, 'isVisible'>) => void;
  removeWidget: (id: string) => void;
  updateWidgets: (updatedWidgets: Widget[]) => void;
}

const defaultWidgets: Widget[] = [
  { 
    id: 'equipment', 
    name: 'Equipment Status', 
    type: 'equipment',
    description: 'Status of mining machinery and equipment',
    isVisible: true 
  },
  { 
    id: 'energy', 
    name: 'Energy Consumption', 
    type: 'energy',
    description: 'Daily electricity and diesel consumption with costs',
    isVisible: true 
  },
  { 
    id: 'goldProduction', 
    name: 'Gold Production', 
    type: 'goldProduction',
    description: 'Daily gold production with weight, purity, and value',
    isVisible: true 
  },
  { 
    id: 'production', 
    name: 'Production Overview', 
    type: 'production',
    description: 'Overall production metrics and efficiency',
    isVisible: true 
  },
  { 
    id: 'safety', 
    name: 'Safety Status', 
    type: 'safety',
    description: 'Safety incidents and days without accidents',
    isVisible: true 
  },
  { 
    id: 'chemicals', 
    name: 'Chemical Inventory', 
    type: 'chemicals',
    description: 'Chemical stock levels in kg and costs in $',
    isVisible: true 
  },
  { 
    id: 'explosives', 
    name: 'Explosives Inventory', 
    type: 'explosives',
    description: 'Explosives stock levels and usage',
    isVisible: false 
  },
  { 
    id: 'stockpile', 
    name: 'Stockpile Volumes', 
    type: 'stockpile',
    description: 'Crushed and milled ore volumes',
    isVisible: false 
  },
  { 
    id: 'expenses', 
    name: 'Daily Expenses', 
    type: 'expenses',
    description: 'Breakdown of daily operational costs in $',
    isVisible: false 
  },
  { 
    id: 'labor', 
    name: 'Labor Metrics', 
    type: 'labor',
    description: 'Workforce statistics and costs',
    isVisible: false 
  },
  { 
    id: 'environmental', 
    name: 'Environmental Impact', 
    type: 'environmental',
    description: 'Water usage, emissions, and waste metrics',
    isVisible: false 
  }
];

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    const savedWidgets = localStorage.getItem('dashboardWidgets');
    return savedWidgets ? JSON.parse(savedWidgets) : defaultWidgets;
  });

  useEffect(() => {
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
  }, [widgets]);

  const toggleWidget = (id: string) => {
    setWidgets(prevWidgets =>
      prevWidgets.map(widget =>
        widget.id === id ? { ...widget, isVisible: !widget.isVisible } : widget
      )
    );
  };

  const addWidget = (widget: Omit<Widget, 'isVisible'>) => {
    setWidgets(prevWidgets => [...prevWidgets, { ...widget, isVisible: true }]);
  };

  const removeWidget = (id: string) => {
    setWidgets(prevWidgets => prevWidgets.filter(widget => widget.id !== id));
  };

  const updateWidgets = (updatedWidgets: Widget[]) => {
    setWidgets(updatedWidgets);
  };

  return (
    <DashboardContext.Provider value={{ widgets, toggleWidget, addWidget, removeWidget, updateWidgets }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
