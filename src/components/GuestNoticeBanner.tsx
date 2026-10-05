import React, { useState, useEffect } from 'react';
import { Eye, LogIn, X, Clock } from 'lucide-react';

interface GuestNoticeBannerProps {
  onLoginClick: () => void;
  autoHideDurationSeconds?: number;
}

export const GuestNoticeBanner: React.FC<GuestNoticeBannerProps> = ({ 
  onLoginClick,
  autoHideDurationSeconds = 7
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [countdown, setCountdown] = useState(autoHideDurationSeconds);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 px-3 sm:px-4 py-2 text-amber-900 text-xs relative transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pr-6">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span className="font-semibold text-amber-950">
            Chế độ Khách (Xem Lịch công khai):
          </span>
          <span className="text-amber-800 hidden sm:inline">
            Bạn đang xem toàn bộ Lịch công tác tuần chính thức và Lịch tiếp công dân của UBND Xã Lao Bảo.
          </span>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto flex-shrink-0">
          <span className="text-[10px] text-amber-700/80 flex items-center space-x-1 bg-amber-500/20 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            <span>Tự ẩn sau {countdown}s</span>
          </span>
          <button
            onClick={onLoginClick}
            className="flex items-center space-x-1 px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded-md font-bold text-[11px] shadow-xs transition cursor-pointer"
          >
            <LogIn className="w-3 h-3" />
            <span>Đăng nhập Cán bộ</span>
          </button>
        </div>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-amber-700 hover:text-amber-950 hover:bg-amber-500/20 rounded-md transition cursor-pointer"
        title="Đóng thông báo"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
