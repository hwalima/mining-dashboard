import React, { createContext, useContext, useState, useEffect } from 'react';
import { Widget } from '../types/dashboard';

const defaultWidgets: Widget[] = [
  {
    id: 'equipment',
    name: 'Equipment Status',
    type: 'status',
    isVisible: true,
    description: 'Status of mining machinery and equipment'
  },
  {
    id: 'energy',
    name: 'Energy Consumption',
    type: 'chart',
    isVisible: true,
    description: 'Daily electricity and diesel consumption with costs'
  },
  {
    id: 'gold-production',
    name: 'Gold Production',
    type: 'chart',
    isVisible: true,
    description: 'Daily gold production with weight, purity, and value'
  },
  {
    id: 'labor',
    name: 'Labor Metrics',
    type: 'metrics',
    isVisible: true,
    description: 'Workforce statistics and productivity metrics'
  },
  {
    id: 'safety',
    name: 'Safety Status',
    type: 'status',
    isVisible: true,
    description: 'Safety incidents and days without accidents'
  },
  {
    id: 'chemicals',
    name: 'Chemical Inventory',
    type: 'inventory',
    isVisible: true,
    description: 'Chemical stock levels in kg and costs in $'
  },
  {
    id: 'explosives',
    name: 'Explosives Inventory',
    type: 'inventory',
    isVisible: true,
    description: 'Explosives stock levels and usage'
  },
  {
    id: 'environmental',
    name: 'Environmental Metrics',
    type: 'chart',
    isVisible: true,
    description: 'Environmental impact metrics and compliance data'
  },
  {
    id: 'expenses',
    name: 'Daily Expenses',
    type: 'chart',
    isVisible: true,
    description: 'Breakdown of daily operational costs in $'
  }
];

interface DashboardContextType {
  widgets: Widget[];
  toggleWidget: (id: string) => void;
  addWidget: (widget: Omit<Widget, 'isVisible'>) => void;
  removeWidget: (id: string) => void;
  updateWidgets: (widgets: Widget[]) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    const savedWidgets = localStorage.getItem('dashboardWidgets');
    if (savedWidgets) {
      try {
        const parsed = JSON.parse(savedWidgets);
        // Merge with default widgets to ensure all required widgets exist
        const widgetMap = new Map(parsed.map((w: Widget) => [w.id, w]));
        return defaultWidgets.map(dw => ({
          ...dw,
          isVisible: widgetMap.has(dw.id) ? widgetMap.get(dw.id)!.isVisible : dw.isVisible
        }));
      } catch (e) {
        console.error('Error parsing saved widgets:', e);
        return defaultWidgets;
      }
    }
    return defaultWidgets;
  });

  useEffect(() => {
    try {
      localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
    } catch (e) {
      console.error('Error saving widgets to localStorage:', e);
    }
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

export default DashboardContext;
