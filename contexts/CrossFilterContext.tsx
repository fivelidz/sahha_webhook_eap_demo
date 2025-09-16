'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface FilterState {
  departments: string[];
  scoreRanges: string[];
  archetypes: string[];
  metrics: string[];
  timeRange: string;
}

interface CrossFilterContextType {
  filters: FilterState;
  setDepartmentFilter: (departments: string[]) => void;
  setScoreRangeFilter: (ranges: string[]) => void;
  setArchetypeFilter: (archetypes: string[]) => void;
  setMetricFilter: (metrics: string[]) => void;
  setTimeRangeFilter: (range: string) => void;
  clearFilters: () => void;
  toggleDepartment: (dept: string) => void;
  toggleScoreRange: (range: string) => void;
  toggleArchetype: (archetype: string) => void;
  toggleMetric: (metric: string) => void;
}

const defaultFilters: FilterState = {
  departments: [],
  scoreRanges: [],
  archetypes: [],
  metrics: [],
  timeRange: '30d'
};

const CrossFilterContext = createContext<CrossFilterContextType | undefined>(undefined);

export function CrossFilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const setDepartmentFilter = useCallback((departments: string[]) => {
    setFilters(prev => ({ ...prev, departments }));
  }, []);

  const setScoreRangeFilter = useCallback((scoreRanges: string[]) => {
    setFilters(prev => ({ ...prev, scoreRanges }));
  }, []);

  const setArchetypeFilter = useCallback((archetypes: string[]) => {
    setFilters(prev => ({ ...prev, archetypes }));
  }, []);

  const setMetricFilter = useCallback((metrics: string[]) => {
    setFilters(prev => ({ ...prev, metrics }));
  }, []);

  const setTimeRangeFilter = useCallback((timeRange: string) => {
    setFilters(prev => ({ ...prev, timeRange }));
  }, []);

  const toggleDepartment = useCallback((dept: string) => {
    setFilters(prev => {
      const departments = prev.departments.includes(dept)
        ? prev.departments.filter(d => d !== dept)
        : [...prev.departments, dept];
      return { ...prev, departments };
    });
  }, []);

  const toggleScoreRange = useCallback((range: string) => {
    setFilters(prev => {
      const scoreRanges = prev.scoreRanges.includes(range)
        ? prev.scoreRanges.filter(r => r !== range)
        : [...prev.scoreRanges, range];
      return { ...prev, scoreRanges };
    });
  }, []);

  const toggleArchetype = useCallback((archetype: string) => {
    setFilters(prev => {
      const archetypes = prev.archetypes.includes(archetype)
        ? prev.archetypes.filter(a => a !== archetype)
        : [...prev.archetypes, archetype];
      return { ...prev, archetypes };
    });
  }, []);

  const toggleMetric = useCallback((metric: string) => {
    setFilters(prev => {
      const metrics = prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric];
      return { ...prev, metrics };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <CrossFilterContext.Provider value={{
      filters,
      setDepartmentFilter,
      setScoreRangeFilter,
      setArchetypeFilter,
      setMetricFilter,
      setTimeRangeFilter,
      clearFilters,
      toggleDepartment,
      toggleScoreRange,
      toggleArchetype,
      toggleMetric
    }}>
      {children}
    </CrossFilterContext.Provider>
  );
}

export function useCrossFilter() {
  const context = useContext(CrossFilterContext);
  if (context === undefined) {
    throw new Error('useCrossFilter must be used within a CrossFilterProvider');
  }
  return context;
}

// Helper function to filter data based on current filters
export function applyFilters<T extends any>(
  data: T[],
  filters: FilterState,
  getters: {
    getDepartment?: (item: T) => string;
    getScoreRange?: (item: T) => string;
    getArchetype?: (item: T) => string;
    getMetric?: (item: T) => string;
  }
): T[] {
  let filtered = [...data];

  // Apply department filter
  if (filters.departments.length > 0 && getters.getDepartment) {
    filtered = filtered.filter(item => 
      filters.departments.includes(getters.getDepartment!(item))
    );
  }

  // Apply score range filter
  if (filters.scoreRanges.length > 0 && getters.getScoreRange) {
    filtered = filtered.filter(item => 
      filters.scoreRanges.includes(getters.getScoreRange!(item))
    );
  }

  // Apply archetype filter
  if (filters.archetypes.length > 0 && getters.getArchetype) {
    filtered = filtered.filter(item => 
      filters.archetypes.includes(getters.getArchetype!(item))
    );
  }

  // Apply metric filter
  if (filters.metrics.length > 0 && getters.getMetric) {
    filtered = filtered.filter(item => 
      filters.metrics.includes(getters.getMetric!(item))
    );
  }

  return filtered;
}