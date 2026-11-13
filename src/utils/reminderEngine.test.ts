import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNextOccurrence,
  calculateSnoozeTime,
  isReminderDue,
  sortReminders,
} from './reminderEngine';
import { ReminderItem } from '../types';

test('calculateNextOccurrence increments Daily, Weekly and Monthly properly', () => {
  const base = new Date('2026-11-12T10:00:00Z');
  
  const daily = calculateNextOccurrence(base, 'Daily');
  assert.equal(daily.toISOString(), new Date('2026-11-13T10:00:00Z').toISOString());

  const weekly = calculateNextOccurrence(base, 'Weekly');
  assert.equal(weekly.toISOString(), new Date('2026-11-19T10:00:00Z').toISOString());

  const monthly = calculateNextOccurrence(base, 'Monthly');
  assert.equal(monthly.toISOString(), new Date('2026-12-12T10:00:00Z').toISOString());
});

test('calculateSnoozeTime adds requested minutes', () => {
  const base = new Date('2026-11-12T10:00:00.000Z');
  const snoozed = calculateSnoozeTime(10, base);
  assert.equal(snoozed, new Date('2026-11-12T10:10:00.000Z').toISOString());
});

test('isReminderDue detects past and snoozed reminders', () => {
  const pastReminder: ReminderItem = {
    id: '1',
    title: 'Dentist',
    type: 'Appointment',
    priority: 'High',
    frequency: 'None',
    scheduledTime: '2026-11-12T09:00:00.000Z',
    completed: false,
    createdAt: '2026-11-12T08:00:00.000Z',
  };

  const checkNow = new Date('2026-11-12T10:00:00.000Z');
  assert.equal(isReminderDue(pastReminder, checkNow), true);

  // If snoozed until 10:30, it should NOT be due at 10:00
  pastReminder.snoozedUntil = '2026-11-12T10:30:00.000Z';
  assert.equal(isReminderDue(pastReminder, checkNow), false);

  // If completed, never due
  pastReminder.completed = true;
  assert.equal(isReminderDue(pastReminder, checkNow), false);
});

test('sortReminders places incomplete first, then High priority over Low', () => {
  const reminders: ReminderItem[] = [
    {
      id: 'low',
      title: 'Water plants',
      type: 'Personal',
      priority: 'Low',
      frequency: 'Daily',
      scheduledTime: '2026-11-12T10:00:00.000Z',
      completed: false,
      createdAt: '2026-11-12T08:00:00.000Z',
    },
    {
      id: 'high',
      title: 'Board Meeting',
      type: 'Meeting',
      priority: 'High',
      frequency: 'None',
      scheduledTime: '2026-11-12T11:00:00.000Z',
      completed: false,
      createdAt: '2026-11-12T08:00:00.000Z',
    },
    {
      id: 'done',
      title: 'Past Item',
      type: 'Personal',
      priority: 'High',
      frequency: 'None',
      scheduledTime: '2026-11-12T07:00:00.000Z',
      completed: true,
      createdAt: '2026-11-12T06:00:00.000Z',
    },
  ];

  const sorted = sortReminders(reminders);
  assert.equal(sorted[0].id, 'high');
  assert.equal(sorted[1].id, 'low');
  assert.equal(sorted[2].id, 'done');
});
