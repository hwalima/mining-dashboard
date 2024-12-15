import React, { createContext, useContext, useState, ReactNode } from 'react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

type DateRange = {
  startDate: Date;
  endDate: Date;
};

type DateRangeType = 'today' | 'week' | 'month' | 'custom' | '7days' | '30days';

interface DateFilterContextType {
  dateRange: DateRange;
  dateRangeType: DateRangeType;
  setDateRange: (range: DateRange) => void;
  setDateRangeType: (type: DateRangeType) => void;
  getDateRangeByType: (type: DateRangeType) => DateRange;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export const getDateRangeByType = (type: DateRangeType): DateRange => {
  // Use the current time from the system
  const today = new Date();
  switch (type) {
    case 'today':
      return {
        startDate: startOfDay(today),
        endDate: endOfDay(today),
      };
    case 'week':
      return {
        startDate: startOfWeek(today, { weekStartsOn: 1 }), // Start week on Monday
        endDate: endOfWeek(today, { weekStartsOn: 1 }), // End week on Sunday
      };
    case 'month':
      return {
        startDate: startOfMonth(today),
        endDate: endOfMonth(today),
      };
    case '7days':
      return {
        startDate: startOfDay(subDays(today, 7)),
        endDate: endOfDay(today),
      };
    case '30days':
      return {
        startDate: startOfDay(subDays(today, 30)),
        endDate: endOfDay(today),
      };
    default:
      return {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-13'),
      };
  }
};

export const DateFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('week');
  const [dateRange, setDateRange] = useState<DateRange>(() => getDateRangeByType('week'));

  const handleSetDateRangeType = (type: DateRangeType) => {
    setDateRangeType(type);
    if (type !== 'custom') {
      setDateRange(getDateRangeByType(type));
    }
  };

  return (
    <DateFilterContext.Provider
      value={{
        dateRange,
        dateRangeType,
        setDateRange,
        setDateRangeType: handleSetDateRangeType,
        getDateRangeByType,
      }}
    >
      {children}
    </DateFilterContext.Provider>
  );
};

export const useDateFilterContext = () => {
  const context = useContext(DateFilterContext);
  if (context === undefined) {
    throw new Error('useDateFilterContext must be used within a DateFilterProvider');
  }
  return context;
};

export default DateFilterContext;
