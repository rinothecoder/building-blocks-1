import React, { createContext, useContext, useState, ReactNode } from 'react';

type GridColumns = 2 | 3 | 4;

interface LayoutContextType {
  gridColumns: GridColumns;
  setGridColumns: (columns: GridColumns) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [gridColumns, setGridColumns] = useState<GridColumns>(4);

  return (
    <LayoutContext.Provider value={{ gridColumns, setGridColumns }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}