import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingSyncCount: number;
  onSyncNow: () => void;
  isSyncing: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  pendingSyncCount,
  onSyncNow,
  isSyncing,
}) => {
  if (isOnline && pendingSyncCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center space-x-3 text-xs animate-in slide-in-from-bottom duration-300">
      {!isOnline ? (
        <div className="flex items-center space-x-2">
          <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
          <div>
            <span className="font-bold text-amber-300">Đang ngoại tuyến:</span>
            <span className="text-slate-300 ml-1">Dữ liệu được lưu an toàn trên máy</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Có <b>{pendingSyncCount}</b> thay đổi chờ đồng bộ đám mây</span>
        </div>
      )}

      {isOnline && pendingSyncCount > 0 && (
        <button
          onClick={onSyncNow}
          disabled={isSyncing}
          className="ml-2 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition flex items-center space-x-1"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Đồng bộ</span>
        </button>
      )}
    </div>
  );
};
