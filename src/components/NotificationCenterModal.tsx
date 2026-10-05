import React, { useState } from 'react';
import { 
  Bell, 
  Volume2, 
  Check, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  X,
  Sparkles
} from 'lucide-react';
import { NotificationItem } from '../types';
import { playNotificationSound, requestPushPermission, sendSystemNotification } from '../services/notificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNavigateTab: (tab: any) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onNavigateTab,
}) => {
  const [pushEnabled, setPushEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    setPushEnabled(granted);
    if (granted) {
      sendSystemNotification('UBND Xã Lao Bảo', 'Đã kích hoạt thông báo đẩy nhắc lịch thành công! 🏛️');
    } else {
      alert('Trình duyệt chưa cho phép thông báo. Vui lòng cho phép trong cài đặt trang web.');
    }
  };

  const handleTestSound = () => {
    playNotificationSound();
    sendSystemNotification('Chuông nhắc việc', '08h00: Ban Kinh tế - Ngân sách làm việc tại Hội trường tầng 3');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-300 rounded-full mx-auto my-1.5 flex-shrink-0" />

        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-red-700 text-white px-4 sm:px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm sm:text-base">Trung Tâm Thông Báo & Nhắc Việc</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Push settings block */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800">Thông báo đẩy (Web Push Notifications):</span>
              <p className="text-[11px] text-slate-500">Tự động nhắc nhở trước giờ họp 15 phút và hạn xử lý nhiệm vụ</p>
            </div>
            {pushEnabled ? (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-md flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Đã bật</span>
              </span>
            ) : (
              <button
                onClick={handleEnablePush}
                className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-md transition shadow-xs"
              >
                Bật thông báo
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200">
            <span className="text-slate-600 font-medium">Âm thanh chuông nhắc hành chính:</span>
            <button
              onClick={handleTestSound}
              className="flex items-center space-x-1 text-slate-700 hover:text-red-700 bg-white border border-slate-300 px-2.5 py-1 rounded transition text-xs font-semibold"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Nghe thử âm báo</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="font-bold text-slate-700">Lịch sử thông báo ({notifications.length})</span>
            {notifications.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={onMarkAllAsRead}
                  className="text-blue-600 hover:underline"
                >
                  Đánh dấu đã đọc
                </button>
                <span>•</span>
                <button
                  onClick={onClearAll}
                  className="text-slate-400 hover:text-red-600"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <span>Chưa có thông báo nhắc việc mới nào</span>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (n.linkTab) {
                    onNavigateTab(n.linkTab);
                    onClose();
                  }
                }}
                className={`p-3 rounded-xl border text-xs transition cursor-pointer ${
                  n.read 
                    ? 'bg-white border-slate-200 text-slate-600' 
                    : 'bg-red-50/40 border-red-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold flex items-center space-x-1.5">
                    <span className="text-red-700">●</span>
                    <span>{n.title}</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(n.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="mt-1 text-slate-600 leading-normal pl-3">
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
