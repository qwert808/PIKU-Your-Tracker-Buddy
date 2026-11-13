import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCompletionRate,
  getRemainingDayTime,
  computeWeeklySummary,
  computeYearlyMonthBreakdown,
} from './taskCalculations';
import { DailyTask } from '../types';

test('calculateCompletionRate correctly calculates 0, 50, and 100 percent', () => {
  assert.equal(calculateCompletionRate([]), 0);

  const mockTasks: DailyTask[] = [
    {
      id: '1',
      title: 'Task A',
      category: 'Productive',
      estimatedMinutes: 30,
      completed: true,
      createdAt: '2026-11-12',
      date: '2026-11-12',
    },
    {
      id: '2',
      title: 'Task B',
      category: 'Necessary',
      estimatedMinutes: 60,
      completed: false,
      createdAt: '2026-11-12',
      date: '2026-11-12',
    },
  ];

  assert.equal(calculateCompletionRate(mockTasks), 50);

  mockTasks[1].completed = true;
  assert.equal(calculateCompletionRate(mockTasks), 100);
});

test('getRemainingDayTime computes hours and minutes till midnight', () => {
  // Test at 20:30 (8:30 PM) -> should have 3 hours 30 mins left
  const sampleDate = new Date('2026-11-12T20:30:00');
  const res = getRemainingDayTime(sampleDate);

  assert.equal(res.hours, 3);
  assert.equal(res.minutes, 30);
  assert.equal(res.totalMinutes, 210);
});

test('computeWeeklySummary computes average and identifies best day', () => {
  const weekly = [
    { date: '2026-11-01', completionPercentage: 80 },
    { date: '2026-11-02', completionPercentage: 100 },
    { date: '2026-11-03', completionPercentage: 60 },
  ];

  const summary = computeWeeklySummary(weekly);
  assert.equal(summary.averageCompletion, 80);
  assert.equal(summary.bestDay, '2026-11-02');
  assert.equal(summary.recordedDays, 3);
});

test('computeYearlyMonthBreakdown produces all 12 months with calculated rates', () => {
  const archives = {
    '2026-01-10': { completionPercentage: 90, totalTasks: 10, completedTasks: 9 },
    '2026-01-11': { completionPercentage: 70, totalTasks: 10, completedTasks: 7 },
    '2026-05-15': { completionPercentage: 100, totalTasks: 5, completedTasks: 5 },
  };

  const yearly = computeYearlyMonthBreakdown(2026, archives);
  assert.equal(yearly.length, 12);
  assert.equal(yearly[0].monthName, 'January');
  assert.equal(yearly[0].averageRate, 80);
  assert.equal(yearly[0].totalDaysLogged, 2);
  assert.equal(yearly[4].monthName, 'May');
  assert.equal(yearly[4].averageRate, 100);
  assert.equal(yearly[11].monthName, 'December');
  assert.equal(yearly[11].averageRate, 0);
});
