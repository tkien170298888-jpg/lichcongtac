import { NotificationItem, ScheduleItem, TaskItem } from '../types';

export const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Nice administrative gentle bell / chime (two harmonious tones)
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.8);
  } catch (e) {
    console.debug('Audio play not allowed or supported', e);
  }
};

export const requestPushPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const sendSystemNotification = (title: string, body: string, icon = '🏛️'): void => {
  playNotificationSound();

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'ubnd-reminder-' + Date.now(),
      });
    } catch (e) {
      console.debug('Push notification error', e);
    }
  }
};

export const generateDailyReminders = (schedules: ScheduleItem[], tasks: TaskItem[]): NotificationItem[] => {
  const notifications: NotificationItem[] = [];
  const today = '05/10/2026'; // Match the active week date

  // Check today's schedules
  const todaysSchedules = schedules.filter(s => s.date === today && s.status === 'approved');
  if (todaysSchedules.length > 0) {
    notifications.push({
      id: 'remind-today-sch',
      title: `Hôm nay có ${todaysSchedules.length} lịch công tác quan trọng`,
      message: `Bắt đầu lúc ${todaysSchedules[0].time}: ${todaysSchedules[0].content} (${todaysSchedules[0].location})`,
      type: 'schedule_pending',
      timestamp: new Date().toISOString(),
      read: false,
      linkTab: 'schedule',
    });
  }

  // Check urgent or pending tasks
  const pendingTasks = tasks.filter(t => t.status === 'in_progress' && t.priority === 'urgent');
  if (pendingTasks.length > 0) {
    notifications.push({
      id: 'remind-urgent-task',
      title: `Nhắc việc khẩn: ${pendingTasks[0].title}`,
      message: `Hạn chót: ${pendingTasks[0].deadline} - Phụ trách: ${pendingTasks[0].assignedOfficer}`,
      type: 'task_reminder',
      timestamp: new Date().toISOString(),
      read: false,
      linkTab: 'tasks',
      linkId: pendingTasks[0].id,
    });
  }

  return notifications;
};
