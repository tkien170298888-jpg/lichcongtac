/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { 
  ScheduleItem, 
  TaskItem, 
  UserProfile, 
  NotificationItem, 
  SyncSettings 
} from './types';
import { 
  INITIAL_USERS 
} from './data/initialData';
import { 
  getStoredSchedules, 
  saveStoredSchedules, 
  getStoredTasks, 
  saveStoredTasks, 
  getSyncSettings, 
  saveSyncSettings, 
  enqueueOfflineAction, 
  clearOfflineQueue,
  addAuditLog,
  getStoredUsers,
  saveStoredUsers,
  getStoredDepartments,
  saveStoredDepartments,
  getStoredTitles,
  saveStoredTitles
} from './services/storageService';
import { 
  syncToGoogleAppsScript 
} from './services/googleAppsScriptService';
import { 
  exportToWordDocument, 
  exportToExcel 
} from './services/exportService';
import { 
  generateDailyReminders, 
  sendSystemNotification 
} from './services/notificationService';

import { Header } from './components/Header';
import { ScheduleTableView } from './components/ScheduleTableView';
import { ApprovalManagementView } from './components/ApprovalManagementView';
import { TaskTrackingView } from './components/TaskTrackingView';
import { StatisticsView } from './components/StatisticsView';
import { GoogleWorkspaceSyncModal } from './components/GoogleWorkspaceSyncModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ScheduleRegistrationModal } from './components/ScheduleRegistrationModal';
import { ShareZaloModal } from './components/ShareZaloModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LoginGateway } from './components/LoginGateway';
import { GuestNoticeBanner } from './components/GuestNoticeBanner';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { UserManagementView } from './components/UserManagementView';
import { OrgConfigView } from './components/OrgConfigView';
import { ConfirmModal } from './components/ConfirmModal';

export default function App() {
  // Stored users, departments & titles
  const [users, setUsers] = useState<UserProfile[]>(() => getStoredUsers());
  const [departments, setDepartments] = useState<string[]>(() => getStoredDepartments());
  const [titles, setTitles] = useState<string[]>(() => getStoredTitles());

  // In-app confirmation modal state
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Authentication & session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const session = localStorage.getItem('ubnd_laobao_auth_session_v1');
    return !!session;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const session = localStorage.getItem('ubnd_laobao_auth_session_v1');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        const demoIds = new Set(['user_vu', 'user_bao', 'user_vien', 'user_hung']);
        if (parsed.user && !demoIds.has(parsed.user.id)) return parsed.user;
      } catch {}
    }
    return INITIAL_USERS[0]; // Admin user
  });

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [isShareZaloOpen, setIsShareZaloOpen] = useState(false);
  const [shareItem, setShareItem] = useState<ScheduleItem | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Primary state
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => getStoredSchedules());
  const [tasks, setTasks] = useState<TaskItem[]>(() => getStoredTasks());
  const [selectedWeek, setSelectedWeek] = useState<number>(41);
  const [currentTab, setCurrentTab] = useState<'schedule' | 'approvals' | 'tasks' | 'stats' | 'sync' | 'users' | 'org_config'>('schedule');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncSettings, setSyncSettings] = useState<SyncSettings>(() => getSyncSettings());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Authentication Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('ubnd_laobao_auth_session_v1', JSON.stringify({ isAuthenticated: true, user }));
    addAuditLog('Đăng nhập', `Đăng nhập thành công với vai trò ${user.title}`, user.name, user.title);
    showToast(`Xin chào ${user.name} (${user.title})!`);
    setCurrentTab('schedule');
  };

  const handleEnterAsGuest = () => {
    const guestUser = users.find(u => u.role === 'CONG_KHAI') || INITIAL_USERS.find(u => u.role === 'CONG_KHAI')!;
    setCurrentUser(guestUser);
    setIsAuthenticated(true);
    localStorage.setItem('ubnd_laobao_auth_session_v1', JSON.stringify({ isAuthenticated: true, user: guestUser }));
    addAuditLog('Truy cập Khách', 'Xem lịch công khai không cần đăng nhập', 'Khách vãng lai', 'Công dân');
    showToast('Đang xem lịch công tác ở Chế độ Khách (Công khai)');
    setCurrentTab('schedule');
  };

  // Enforce role-based access for tabs
  useEffect(() => {
    if (currentUser.role === 'CONG_KHAI' && currentTab !== 'schedule') {
      setCurrentTab('schedule');
    } else if (currentUser.role === 'CHUYEN_VIEN' && currentTab !== 'schedule' && currentTab !== 'tasks') {
      setCurrentTab('schedule');
    } else if (currentUser.role === 'LANH_DAO_PHONG' && currentTab !== 'schedule' && currentTab !== 'approvals' && currentTab !== 'tasks') {
      setCurrentTab('schedule');
    } else if ((currentTab === 'users' || currentTab === 'org_config') && !(currentUser.username === 'admin' || currentUser.role === 'LANH_DAO')) {
      setCurrentTab('schedule');
    }
  }, [currentUser.role, currentUser.username, currentTab]);

  const handleLogout = () => {
    localStorage.removeItem('ubnd_laobao_auth_session_v1');
    setIsAuthenticated(false);
    showToast('Đã chuyển về màn hình đăng nhập.');
  };

  const handleChangePassword = (newPassword: string) => {
    const updatedUser = { ...currentUser, password: newPassword };
    setCurrentUser(updatedUser);
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
    localStorage.setItem('ubnd_laobao_auth_session_v1', JSON.stringify({ isAuthenticated: true, user: updatedUser }));
    addAuditLog('Đổi mật khẩu', `Tài khoản ${currentUser.username || currentUser.email} đã đổi mật khẩu`, currentUser.name, currentUser.title);
    showToast('Đã thay đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.');
  };

  // Department & Titles configuration handlers
  const handleUpdateDepartments = (newDepts: string[]) => {
    setDepartments(newDepts);
    saveStoredDepartments(newDepts);
    addAuditLog('Cấu hình đơn vị', `Cập nhật danh mục đơn vị/phòng ban (${newDepts.length} đơn vị)`, currentUser.name, currentUser.title);
    showToast('Đã lưu danh mục đơn vị & phòng ban thành công!');
  };

  const handleUpdateTitles = (newTitles: string[]) => {
    setTitles(newTitles);
    saveStoredTitles(newTitles);
    addAuditLog('Cấu hình chức danh', `Cập nhật danh mục chức danh (${newTitles.length} chức danh)`, currentUser.name, currentUser.title);
    showToast('Đã lưu danh mục chức danh thành công!');
  };

  // Level 1: Department Approval handler
  const handleApproveDeptSchedule = (id: string) => {
    const updated = schedules.map(s => {
      if (s.id === id) {
        return { 
          ...s, 
          status: 'pending' as const, 
          deptApprovedBy: currentUser.name,
          deptApprovedAt: new Date().toISOString()
        };
      }
      return s;
    });
    setSchedules(updated);
    saveStoredSchedules(updated);
    addAuditLog('Duyệt cấp phòng', `Trưởng phòng duyệt chuyển UBND xã lịch ID: ${id}`, currentUser.name, currentUser.title);
    showToast('Đã phê duyệt cấp phòng và chuyển lên thẻ duyệt chung của UBND xã!');
    sendSystemNotification('Lịch chuyển duyệt cấp xã', `${currentUser.name} đã duyệt lịch cấp phòng, chuyển UBND xã thẩm tra`);
  };

  // User management CRUD
  const handleAddUser = (newUser: UserProfile) => {
    const updated = [...users, newUser];
    setUsers(updated);
    saveStoredUsers(updated);
    addAuditLog('Tạo tài khoản', `Đã tạo tài khoản cho ${newUser.name} (${newUser.title})`, currentUser.name, currentUser.title);
    showToast(`Đã tạo tài khoản thành công cho ${newUser.name}!`);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    const updated = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updated);
    saveStoredUsers(updated);
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('ubnd_laobao_auth_session_v1', JSON.stringify({ isAuthenticated: true, user: updatedUser }));
    }
    addAuditLog('Cập nhật tài khoản', `Cập nhật thông tin/quyền tài khoản ${updatedUser.name}`, currentUser.name, currentUser.title);
    showToast(`Đã cập nhật thông tin tài khoản ${updatedUser.name}!`);
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    saveStoredUsers(updated);
    addAuditLog('Xóa tài khoản', `Đã xóa tài khoản ${target?.name || userId}`, currentUser.name, currentUser.title);
    showToast(`Đã xóa tài khoản thành công!`);
  };

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Đã kết nối lại Internet! Đang đồng bộ dữ liệu...');
      handleTriggerSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Mất kết nối mạng. Đã chuyển sang chế độ lưu trữ ngoại tuyến an toàn.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize notifications & daily reminder check
  useEffect(() => {
    const dailyReminders = generateDailyReminders(schedules, tasks);
    setNotifications(dailyReminders);
  }, []);

  // Toast feedback helper with reliable auto-hide duration
  const showToast = (msg: string, durationMs: number = 3200) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, durationMs);
  };

  // Schedule management handlers
  const handleSaveSchedule = (item: ScheduleItem) => {
    const exists = schedules.some(s => s.id === item.id);
    let updated: ScheduleItem[];
    if (exists) {
      updated = schedules.map(s => s.id === item.id ? item : s);
      addAuditLog('Cập nhật lịch', `Sửa lịch: ${item.content}`, currentUser.name, currentUser.title);
      enqueueOfflineAction('update', 'schedule', item);
    } else {
      updated = [item, ...schedules];
      addAuditLog('Đăng ký lịch mới', `Đăng ký lịch: ${item.content}`, currentUser.name, currentUser.title);
      enqueueOfflineAction('create', 'schedule', item);
    }

    setSchedules(updated);
    saveStoredSchedules(updated);

    if (item.status === 'pending') {
      showToast('Đã gửi đề xuất lịch công tác! Văn phòng sẽ thẩm tra và trình Lãnh đạo phê duyệt.');
      // Add notification for office
      setNotifications(prev => [
        {
          id: 'notif_' + Date.now(),
          title: 'Đề xuất lịch mới cần duyệt',
          message: `${item.createdBy} (${item.department}) vừa đăng ký lịch: ${item.content}`,
          type: 'schedule_pending',
          timestamp: new Date().toISOString(),
          read: false,
          linkTab: 'approvals',
        },
        ...prev
      ]);
    } else {
      showToast('Lịch công tác đã được lưu chính thức vào hệ thống!');
      sendSystemNotification('Lịch công tác mới', `Đã phát hành: ${item.content} (${item.time} ${item.dayOfWeek})`);
    }

    setEditingSchedule(null);
  };

  const handleDeleteSchedule = (id: string) => {
    const item = schedules.find(s => s.id === id);
    if (!item) return;

    setConfirmModalConfig({
      isOpen: true,
      title: 'Xác Nhận Xóa Lịch Công Tác',
      message: `Bạn có chắc chắn muốn xóa phiên làm việc sau khỏi lịch tuần:\n\n"${item.content}"\nThời gian: ${item.time} ${item.dayOfWeek} (${item.date})?`,
      confirmText: 'Xác Nhận Xóa',
      variant: 'danger',
      onConfirm: () => {
        const updated = schedules.filter(s => s.id !== id);
        setSchedules(updated);
        saveStoredSchedules(updated);
        addAuditLog('Xóa lịch', `Xóa lịch: ${item.content}`, currentUser.name, currentUser.title);
        enqueueOfflineAction('delete', 'schedule', { id });
        showToast('Đã xóa phiên làm việc khỏi lịch tuần.');
      },
    });
  };

  const handleApproveSchedule = (id: string) => {
    const updated = schedules.map(s => {
      if (s.id === id) {
        return { ...s, status: 'approved' as const, isOfficial: true };
      }
      return s;
    });
    setSchedules(updated);
    saveStoredSchedules(updated);
    addAuditLog('Phê duyệt lịch', `Duyệt lịch ID: ${id}`, currentUser.name, currentUser.title);
    showToast('Đã phê duyệt lịch công tác thành công!');
    sendSystemNotification('Phê duyệt thành công', 'Lãnh đạo đã duyệt lịch công tác mới vào lịch tuần');
  };

  const handleRejectSchedule = (id: string, reason: string) => {
    const updated = schedules.map(s => {
      if (s.id === id) {
        return { ...s, status: 'rejected' as const, rejectionReason: reason };
      }
      return s;
    });
    setSchedules(updated);
    saveStoredSchedules(updated);
    addAuditLog('Từ chối lịch', `Từ chối ID: ${id} - Lý do: ${reason}`, currentUser.name, currentUser.title);
    showToast('Đã từ chối và gửi phản hồi đến đơn vị đăng ký.');
  };

  const handleBatchApprove = (ids: string[]) => {
    const idSet = new Set(ids);
    const updated = schedules.map(s => {
      if (idSet.has(s.id)) {
        return { ...s, status: 'approved' as const, isOfficial: true };
      }
      return s;
    });
    setSchedules(updated);
    saveStoredSchedules(updated);
    addAuditLog('Phê duyệt hàng loạt', `Duyệt ${ids.length} lịch công tác`, currentUser.name, currentUser.title);
    showToast(`Đã phê duyệt đồng loạt ${ids.length} lịch công tác!`);
  };

  // Task Handlers
  const handleAddTask = (task: TaskItem) => {
    const updated = [task, ...tasks];
    setTasks(updated);
    saveStoredTasks(updated);
    addAuditLog('Giao nhiệm vụ', `Nhiệm vụ mới: ${task.title}`, currentUser.name, currentUser.title);
    enqueueOfflineAction('create', 'task', task);
    showToast('Đã giao nhiệm vụ mới thành công!');
    sendSystemNotification('Giao nhiệm vụ mới', `${task.assignedOfficer}: ${task.title}`);
  };

  const handleUpdateTask = (task: TaskItem) => {
    const updated = tasks.map(t => t.id === task.id ? task : t);
    setTasks(updated);
    saveStoredTasks(updated);
    addAuditLog('Cập nhật tiến độ', `Tiến độ ${task.progress}% - ${task.title}`, currentUser.name, currentUser.title);
    enqueueOfflineAction('update', 'task', task);

    if (task.lastReportedBy) {
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          title: 'Báo cáo tiến độ mới',
          message: `${task.lastReportedBy} đã báo cáo tiến độ ${task.progress}% cho nhiệm vụ: "${task.title}"`,
          type: 'task_reminder',
          timestamp: new Date().toISOString(),
          read: false,
          linkTab: 'tasks',
        },
        ...prev
      ]);
      sendSystemNotification('Báo cáo tiến độ nhiệm vụ', `${task.lastReportedBy}: ${task.title} (${task.progress}%)`);
      showToast(`Đã gửi báo cáo tiến độ nhiệm vụ (${task.progress}%) cho Lãnh đạo!`);
    } else {
      showToast(`Đã cập nhật tiến độ nhiệm vụ (${task.progress}%)`);
    }
  };

  const handleDeleteTask = (id: string) => {
    const target = tasks.find(t => t.id === id);
    setConfirmModalConfig({
      isOpen: true,
      title: 'Xác Nhận Xóa Nhiệm Vụ',
      message: `Bạn có chắc chắn muốn xóa nhiệm vụ "${target?.title || 'này'}" khỏi danh sách theo dõi?`,
      confirmText: 'Xác Nhận Xóa',
      variant: 'danger',
      onConfirm: () => {
        const updated = tasks.filter(t => t.id !== id);
        setTasks(updated);
        saveStoredTasks(updated);
        enqueueOfflineAction('delete', 'task', { id });
        addAuditLog('Xóa nhiệm vụ', `Xóa nhiệm vụ: ${target?.title || id}`, currentUser.name, currentUser.title);
        showToast('Đã xóa nhiệm vụ thành công.');
      },
    });
  };

  // Google Workspace Sync Handler
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    const result = await syncToGoogleAppsScript(
      syncSettings.googleAppsScriptUrl,
      schedules,
      tasks,
      currentUser.name
    );
    setIsSyncing(false);
    if (result.success) {
      clearOfflineQueue();
      const updatedSettings = {
        ...syncSettings,
        lastSyncedAt: result.timestamp || new Date().toISOString(),
      };
      setSyncSettings(updatedSettings);
      saveSyncSettings(updatedSettings);
      showToast(result.message);
    } else {
      showToast('Lỗi đồng bộ: ' + result.message);
    }
  };

  const handleImportBackup = (data: { schedules: ScheduleItem[]; tasks: TaskItem[] }) => {
    setSchedules(data.schedules);
    saveStoredSchedules(data.schedules);
    if (data.tasks) {
      setTasks(data.tasks);
      saveStoredTasks(data.tasks);
    }
    showToast('Đã phục hồi toàn bộ dữ liệu thành công!');
  };

  const pendingApprovalsCount = currentUser.role === 'LANH_DAO_PHONG'
    ? schedules.filter(s => s.status === 'pending_dept' && s.department === currentUser.department).length
    : schedules.filter(s => s.status === 'pending').length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  if (!isAuthenticated) {
    return (
      <LoginGateway
        onLoginSuccess={handleLoginSuccess}
        onEnterAsGuest={handleEnterAsGuest}
        allUsers={users}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 pb-16 lg:pb-0">
      {/* Toast Feedback */}
      {toastMessage && (
        <div 
          className="fixed top-14 right-4 z-50 bg-slate-900/95 backdrop-blur-md text-white pl-4 pr-3 py-2.5 rounded-xl shadow-2xl text-xs flex items-center space-x-3 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
              ✓
            </span>
            <span className="font-medium text-slate-100">{toastMessage}</span>
          </div>

          <button
            onClick={() => {
              if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
              setToastMessage(null);
            }}
            className="text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer"
            title="Đóng thông báo ngay"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Animated Countdown Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
            <div 
              className="h-full bg-emerald-500"
              style={{
                animation: 'toastProgress 3.2s linear forwards',
              }}
            />
          </div>
        </div>
      )}

      {/* Header & Role Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        allUsers={users}
        isOnline={isOnline}
        unreadNotificationsCount={unreadNotificationsCount}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenRegisterModal={() => {
          if (currentUser.role === 'CONG_KHAI') {
            if (window.confirm('Chức năng Đăng ký Lịch công tác chỉ dành cho Cán bộ & Lãnh đạo xã. Bạn có muốn đăng nhập tài khoản cán bộ?')) {
              handleLogout();
            }
            return;
          }
          setEditingSchedule(null);
          setIsRegisterOpen(true);
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenExportWord={() => exportToWordDocument(schedules, selectedWeek, 2026, true)}
        onOpenExportExcel={() => exportToExcel(schedules, selectedWeek)}
        onOpenShareZalo={() => {
          setShareItem(null);
          setIsShareZaloOpen(true);
        }}
        onLogout={handleLogout}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
      />

      {/* Guest Mode Notice Banner */}
      {currentUser.role === 'CONG_KHAI' && (
        <GuestNoticeBanner onLoginClick={handleLogout} />
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 flex-1 w-full">
        {currentTab === 'schedule' && (
          <ScheduleTableView
            schedules={schedules}
            currentUser={currentUser}
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
            onExportExcel={() => exportToExcel(schedules, selectedWeek)}
            onEditSchedule={(item) => {
              setEditingSchedule(item);
              setIsRegisterOpen(true);
            }}
            onDeleteSchedule={handleDeleteSchedule}
            onOpenRegisterModal={() => {
              setEditingSchedule(null);
              setIsRegisterOpen(true);
            }}
            onOpenShareZalo={(item) => {
              setShareItem(item || null);
              setIsShareZaloOpen(true);
            }}
          />
        )}

        {currentTab === 'approvals' && (
          <ApprovalManagementView
            schedules={schedules}
            currentUser={currentUser}
            onApprove={handleApproveSchedule}
            onApproveDept={handleApproveDeptSchedule}
            onReject={handleRejectSchedule}
            onBatchApprove={handleBatchApprove}
            onEdit={(item) => {
              setEditingSchedule(item);
              setIsRegisterOpen(true);
            }}
          />
        )}

        {currentTab === 'tasks' && (
          <TaskTrackingView
            tasks={tasks}
            currentUser={currentUser}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {currentTab === 'stats' && (
          <StatisticsView
            schedules={schedules}
            tasks={tasks}
            onExportWord={() => exportToWordDocument(schedules, 41, 2026, true)}
            onExportExcel={() => exportToExcel(schedules, 41)}
          />
        )}

        {currentTab === 'sync' && (
          <GoogleWorkspaceSyncModal
            settings={syncSettings}
            onUpdateSettings={(newSettings) => {
              setSyncSettings(newSettings);
              saveSyncSettings(newSettings);
              showToast('Đã lưu cấu hình Google Workspace Apps Script!');
            }}
            onManualSync={handleTriggerSync}
            schedules={schedules}
            tasks={tasks}
            onImportBackup={handleImportBackup}
          />
        )}

        {currentTab === 'users' && (currentUser.username === 'admin' || currentUser.role === 'LANH_DAO') && (
          <UserManagementView
            users={users}
            currentUser={currentUser}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            departments={departments}
            titles={titles}
          />
        )}

        {currentTab === 'org_config' && (currentUser.username === 'admin' || currentUser.role === 'LANH_DAO') && (
          <OrgConfigView
            departments={departments}
            titles={titles}
            onUpdateDepartments={handleUpdateDepartments}
            onUpdateTitles={handleUpdateTitles}
          />
        )}
      </main>

      {/* Modals */}
      <ScheduleRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          setEditingSchedule(null);
        }}
        onSave={handleSaveSchedule}
        editingItem={editingSchedule}
        currentUser={currentUser}
        allSchedules={schedules}
        defaultWeekNumber={selectedWeek}
        departments={departments}
      />

      <ShareZaloModal
        isOpen={isShareZaloOpen}
        onClose={() => {
          setIsShareZaloOpen(false);
          setShareItem(null);
        }}
        schedules={schedules}
        selectedItem={shareItem}
        weekNumber={selectedWeek}
      />

      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          showToast('Đã đánh dấu đọc tất cả thông báo');
        }}
        onClearAll={() => {
          setNotifications([]);
          showToast('Đã xóa danh sách thông báo');
        }}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        currentUser={currentUser}
        onChangePassword={handleChangePassword}
      />

      {/* Offline sync indicator */}
      <OfflineIndicator
        isOnline={isOnline}
        pendingSyncCount={syncSettings.offlineQueue.length}
        onSyncNow={handleTriggerSync}
        isSyncing={isSyncing}
      />

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={currentUser.role}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenRegisterModal={() => {
          setEditingSchedule(null);
          setIsRegisterOpen(true);
        }}
      />

      {/* Global In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        variant={confirmModalConfig.variant}
        onConfirm={confirmModalConfig.onConfirm}
        onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
