/**
 * Performance Monitoring Utilities
 * Tools for measuring and optimizing application performance
 */

import React, { Profiler } from 'react';

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  interactions: Set<{ id: number; name: string; timestamp: number }>;
}

/**
 * Performance logger
 */
class PerformanceLogger {
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private enabled: boolean = import.meta.env.DEV || false;

  /**
   * Log performance metric
   */
  log(metric: PerformanceMetrics): void {
    if (!this.enabled) return;

    const componentMetrics = this.metrics.get(metric.id) || [];
    componentMetrics.push(metric);
    this.metrics.set(metric.id, componentMetrics);

    // Log to console in development
    if (metric.actualDuration > 16) {
      // Slower than 60fps
      console.warn(
        `[Performance] ${metric.id} (${metric.phase}) took ${metric.actualDuration.toFixed(2)}ms`,
        {
          actualDuration: metric.actualDuration,
          baseDuration: metric.baseDuration,
          difference: metric.actualDuration - metric.baseDuration,
        }
      );
    }
  }

  /**
   * Get metrics for a component
   */
  getMetrics(id: string): PerformanceMetrics[] {
    return this.metrics.get(id) || [];
  }

  /**
   * Get average duration for a component
   */
  getAverageDuration(id: string): number {
    const metrics = this.getMetrics(id);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.actualDuration, 0);
    return total / metrics.length;
  }

  /**
   * Get slow components (slower than threshold)
   */
  getSlowComponents(threshold = 16): Array<{ id: string; avgDuration: number }> {
    const slowComponents: Array<{ id: string; avgDuration: number }> = [];

    this.metrics.forEach((_, id) => {
      const avgDuration = this.getAverageDuration(id);
      if (avgDuration > threshold) {
        slowComponents.push({ id, avgDuration });
      }
    });

    return slowComponents.sort((a, b) => b.avgDuration - a.avgDuration);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Export metrics as JSON
   */
  export(): string {
    const data: Record<string, unknown> = {};
    
    this.metrics.forEach((metrics, id) => {
      data[id] = {
        count: metrics.length,
        avgDuration: this.getAverageDuration(id),
        metrics: metrics.map((m) => ({
          phase: m.phase,
          actualDuration: m.actualDuration,
          baseDuration: m.baseDuration,
        })),
      };
    });

    return JSON.stringify(data, null, 2);
  }
}

// Global performance logger instance
export const performanceLogger = new PerformanceLogger();

/**
 * React Profiler callback
 */
export const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
  interactions: Set<{ id: number; name: string; timestamp: number }>
) => {
  performanceLogger.log({
    id,
    phase: phase === 'nested-update' ? 'update' : phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions,
  });
};

/**
 * Performance monitoring HOC
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  id?: string
) {
  const componentName = id || Component.displayName || Component.name || 'Unknown';

  return function PerformanceMonitoredComponent(props: P) {
    // We need to cast because React 19 has different Profiler signature
    const callback = onRenderCallback as unknown as React.ProfilerOnRenderCallback;
    
    return React.createElement(
      Profiler,
      { id: componentName, onRender: callback },
      React.createElement(Component, props)
    );
  };
}

/**
 * Measure async function execution time
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    if (import.meta.env.DEV) {
      console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms`, error);
    }
    
    throw error;
  }
}

/**
 * Measure sync function execution time
 */
export function measure<T>(name: string, fn: () => T): T {
  const startTime = performance.now();
  
  try {
    const result = fn();
    const duration = performance.now() - startTime;
    
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    if (import.meta.env.DEV) {
      console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms`, error);
    }
    
    throw error;
  }
}

/**
 * Mark performance timing
 */
export function mark(name: string): void {
  if (import.meta.env.DEV && window.performance && window.performance.mark) {
    window.performance.mark(name);
  }
}

/**
 * Measure performance between two marks
 */
export function measureMarks(name: string, startMark: string, endMark: string): number | null {
  if (!import.meta.env.DEV || !window.performance || !window.performance.measure) {
    return null;
  }

  try {
    window.performance.measure(name, startMark, endMark);
    const measure = window.performance.getEntriesByName(name)[0];
    console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
    return measure.duration;
  } catch (error) {
    console.error(`[Performance] Failed to measure ${name}`, error);
    return null;
  }
}

/**
 * Clear performance marks and measures
 */
export function clearMarks(): void {
  if (window.performance && window.performance.clearMarks) {
    window.performance.clearMarks();
    window.performance.clearMeasures();
  }
}

/**
 * Get navigation timing info
 */
export function getNavigationTiming(): Record<string, number> | null {
  if (!window.performance || !window.performance.timing) {
    return null;
  }

  const timing = window.performance.timing;
  const navigation = {
    // Network
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    tcp: timing.connectEnd - timing.connectStart,
    request: timing.responseStart - timing.requestStart,
    response: timing.responseEnd - timing.responseStart,
    
    // Processing
    domLoading: timing.domLoading - timing.fetchStart,
    domInteractive: timing.domInteractive - timing.fetchStart,
    domComplete: timing.domComplete - timing.fetchStart,
    loadEvent: timing.loadEventEnd - timing.loadEventStart,
    
    // Total
    total: timing.loadEventEnd - timing.fetchStart,
  };

  if (import.meta.env.DEV) {
    console.table(navigation);
  }

  return navigation;
}

/**
 * Report Web Vitals (requires web-vitals package)
 */
export function reportWebVitals(_onPerfEntry?: (metric: unknown) => void): void {
  // Requires: npm install web-vitals
  // Uncomment the following code after installing the package:
  /*
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
  */
  if (import.meta.env.DEV) {
    console.log('Web Vitals reporting is disabled. Install web-vitals package to enable.');
  }
}

/**
 * Bundle size analyzer
 */
export function analyzeBundleSize(): void {
  if (!import.meta.env.DEV) return;

  const scripts = Array.from(document.getElementsByTagName('script'));
  const styles = Array.from(document.getElementsByTagName('link')).filter(
    (link) => link.rel === 'stylesheet'
  );

  console.group('[Performance] Bundle Analysis');
  
  console.log('Scripts:', scripts.length);
  scripts.forEach((script) => {
    if (script.src) {
      console.log(`  - ${script.src}`);
    }
  });

  console.log('Stylesheets:', styles.length);
  styles.forEach((style) => {
    if (style.href) {
      console.log(`  - ${style.href}`);
    }
  });

  console.groupEnd();
}

/**
 * Memory usage monitor
 */
export function monitorMemoryUsage(): void {
  if (!import.meta.env.DEV || !(performance as ExtendedPerformance).memory) {
    return;
  }

  const memory = (performance as ExtendedPerformance).memory!;
  const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
  const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
  const limitMB = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);

  console.log(`[Performance] Memory: ${usedMB}MB / ${totalMB}MB (limit: ${limitMB}MB)`);
}

interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

/**
 * Component render counter
 */
export function createRenderCounter(componentName: string) {
  let renderCount = 0;

  return () => {
    renderCount++;
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${componentName} rendered ${renderCount} times`);
    }
    return renderCount;
  };
}

/**
 * Detect unnecessary re-renders
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, unknown>): void {
  const previousProps = React.useRef<Record<string, unknown>>();

  React.useEffect(() => {
    const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV;
    
    if (!isDev || !previousProps.current) {
      previousProps.current = props;
      return;
    }

    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: unknown; to: unknown }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log(`[Performance] ${name} re-rendered due to:`, changedProps);
      }
    }

    previousProps.current = props;
  });
}
