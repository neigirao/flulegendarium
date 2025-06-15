
import { captureMessage, setTag } from '@/services/sentry';

interface PerformanceBudget {
  metric: string;
  budget: number;
  unit: string;
  severity: 'info' | 'warning' | 'error';
}

const PERFORMANCE_BUDGETS: PerformanceBudget[] = [
  { metric: 'FCP', budget: 1800, unit: 'ms', severity: 'warning' },
  { metric: 'LCP', budget: 2500, unit: 'ms', severity: 'error' },
  { metric: 'FID', budget: 100, unit: 'ms', severity: 'warning' },
  { metric: 'CLS', budget: 0.1, unit: 'score', severity: 'error' },
  { metric: 'TTFB', budget: 800, unit: 'ms', severity: 'warning' },
  { metric: 'Bundle Size', budget: 250, unit: 'KB', severity: 'error' },
  { metric: 'Images Load Time', budget: 2000, unit: 'ms', severity: 'warning' },
  { metric: 'Game Response Time', budget: 1500, unit: 'ms', severity: 'warning' },
];

export class PerformanceBudgetMonitor {
  private violations: Map<string, number> = new Map();

  checkBudget(metric: string, value: number): boolean {
    const budget = PERFORMANCE_BUDGETS.find(b => b.metric === metric);
    if (!budget) return true;

    const isWithinBudget = value <= budget.budget;
    
    if (!isWithinBudget) {
      const violationKey = `${metric}_violation`;
      const currentViolations = this.violations.get(violationKey) || 0;
      this.violations.set(violationKey, currentViolations + 1);

      // Set tags for filtering in Sentry
      setTag('performance_budget_violation', metric);
      setTag('budget_severity', budget.severity);

      captureMessage(
        `Performance Budget Violation: ${metric} = ${value}${budget.unit} (budget: ${budget.budget}${budget.unit})`,
        budget.severity
      );

      console.warn(`🚨 Performance Budget Exceeded:`, {
        metric,
        value: `${value}${budget.unit}`,
        budget: `${budget.budget}${budget.unit}`,
        severity: budget.severity,
        totalViolations: currentViolations + 1
      });
    }

    return isWithinBudget;
  }

  getBudgetStatus(): { metric: string; status: 'ok' | 'warning' | 'error'; violations: number }[] {
    return PERFORMANCE_BUDGETS.map(budget => {
      const violations = this.violations.get(`${budget.metric}_violation`) || 0;
      const status = violations > 0 ? budget.severity : 'ok';
      
      return {
        metric: budget.metric,
        status: status as 'ok' | 'warning' | 'error',
        violations
      };
    });
  }

  getViolationSummary(): string {
    const totalViolations = Array.from(this.violations.values()).reduce((sum, count) => sum + count, 0);
    const violatedMetrics = Array.from(this.violations.keys()).length;
    
    return `${totalViolations} violations across ${violatedMetrics} metrics`;
  }
}

export const performanceBudgetMonitor = new PerformanceBudgetMonitor();
