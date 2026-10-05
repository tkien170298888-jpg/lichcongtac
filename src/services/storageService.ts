import { ScheduleItem, TaskItem, NotificationItem, AuditLog, SyncSettings, UserProfile } from '../types';
import { INITIAL_SCHEDULE, INITIAL_TASKS, INITIAL_USERS, DEPARTMENTS, DEFAULT_TITLES } from '../data/initialData';

const STORAGE_KEYS = {
  SCHEDULES: 'ubnd_laobao_schedules_v1',
  TASKS: 'ubnd_laobao_tasks_v1',
  NOTIFICATIONS: 'ubnd_laobao_notifications_v1',
  AUDIT_LOGS: 'ubnd_laobao_audit_v1',
  SETTINGS: 'ubnd_laobao_sync_settings_v1',
  CURRENT_USER: 'ubnd_laobao_current_user_v1',
};

export const getStoredSchedules = (): ScheduleItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULE));
      return INITIAL_SCHEDULE;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading schedules from storage', e);
    return INITIAL_SCHEDULE;
  }
};

export const saveStoredSchedules = (schedules: ScheduleItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  } catch (e) {
    console.error('Error saving schedules to storage', e);
  }
};

export const getStoredTasks = (): TaskItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading tasks from storage', e);
    return INITIAL_TASKS;
  }
};

export const saveStoredTasks = (tasks: TaskItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks to storage', e);
  }
};

export const getStoredAuditLogs = (): AuditLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addAuditLog = (action: string, details: string, performedBy: string, role: string): void => {
  try {
    const logs = getStoredAuditLogs();
    const newLog: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      action,
      details,
      performedBy,
      role,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...logs].slice(0, 100); // keep last 100 logs
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to log audit', e);
  }
};

export const getSyncSettings = (): SyncSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      const defaultSettings: SyncSettings = {
        googleAppsScriptUrl: '',
        autoSync: true,
        lastSyncedAt: new Date().toISOString(),
        syncIntervalMinutes: 5,
        offlineQueue: [],
      };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      googleAppsScriptUrl: '',
      autoSync: true,
      lastSyncedAt: null,
      syncIntervalMinutes: 5,
      offlineQueue: [],
    };
  }
};

export const saveSyncSettings = (settings: SyncSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
};

export const enqueueOfflineAction = (
  action: 'create' | 'update' | 'delete',
  entity: 'schedule' | 'task',
  data: any
): void => {
  const settings = getSyncSettings();
  settings.offlineQueue.push({
    action,
    entity,
    data,
    timestamp: new Date().toISOString(),
  });
  saveSyncSettings(settings);
};

export const clearOfflineQueue = (): void => {
  const settings = getSyncSettings();
  settings.offlineQueue = [];
  settings.lastSyncedAt = new Date().toISOString();
  saveSyncSettings(settings);
};

export const getStoredUsers = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem('ubnd_laobao_users_v3');
    if (!raw) {
      localStorage.setItem('ubnd_laobao_users_v3', JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed: UserProfile[] = JSON.parse(raw);
    // Filter out old demo user IDs if any leaked from previous version
    const demoIds = new Set(['user_vu', 'user_bao', 'user_vien', 'user_hung']);
    const cleaned = parsed.filter(u => !demoIds.has(u.id));

    // Ensure admin user exists with credentials
    if (!cleaned.some(u => u.username === 'admin')) {
      const updated = [INITIAL_USERS[0], ...cleaned];
      localStorage.setItem('ubnd_laobao_users_v3', JSON.stringify(updated));
      return updated;
    }
    if (cleaned.length !== parsed.length) {
      localStorage.setItem('ubnd_laobao_users_v3', JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (e) {
    console.error('Error reading users from storage', e);
    return INITIAL_USERS;
  }
};

export const saveStoredUsers = (users: UserProfile[]): void => {
  try {
    localStorage.setItem('ubnd_laobao_users_v3', JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to storage', e);
  }
};

export const getStoredDepartments = (): string[] => {
  try {
    const raw = localStorage.getItem('ubnd_laobao_depts_v1');
    if (!raw) {
      localStorage.setItem('ubnd_laobao_depts_v1', JSON.stringify(DEPARTMENTS));
      return DEPARTMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEPARTMENTS;
  }
};

export const saveStoredDepartments = (depts: string[]): void => {
  try {
    localStorage.setItem('ubnd_laobao_depts_v1', JSON.stringify(depts));
  } catch (e) {
    console.error('Error saving departments', e);
  }
};

export const getStoredTitles = (): string[] => {
  try {
    const raw = localStorage.getItem('ubnd_laobao_titles_v1');
    if (!raw) {
      localStorage.setItem('ubnd_laobao_titles_v1', JSON.stringify(DEFAULT_TITLES));
      return DEFAULT_TITLES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_TITLES;
  }
};

export const saveStoredTitles = (titles: string[]): void => {
  try {
    localStorage.setItem('ubnd_laobao_titles_v1', JSON.stringify(titles));
  } catch (e) {
    console.error('Error saving titles', e);
  }
};
