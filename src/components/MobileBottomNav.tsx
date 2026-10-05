import React from 'react';
import { Calendar, ShieldCheck, CheckSquare, BarChart3, Cloud, Plus } from 'lucide-react';
import { RoleType } from '../types';

interface MobileBottomNavProps {
  currentTab: 'schedule' | 'approvals' | 'tasks' | 'stats' | 'sync' | 'users' | 'org_config';
  setCurrentTab: (tab: 'schedule' | 'approvals' | 'tasks' | 'stats' | 'sync' | 'users' | 'org_config') => void;
  userRole: RoleType;
  pendingApprovalsCount: number;
  onOpenRegisterModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  pendingApprovalsCount,
  onOpenRegisterModal,
}) => {
  // In Guest Mode, only the weekly schedule view is accessible, no bottom navigation tabs needed
  if (userRole === 'CONG_KHAI') {
    return null;
  }

  const canApprove = userRole === 'LANH_DAO' || userRole === 'VAN_PHONG' || userRole === 'LANH_DAO_PHONG';
  const isSpecialist = userRole === 'CHUYEN_VIEN';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg md:hidden">
      <div className="flex items-center justify-around relative">
        {/* Tab: Lịch */}
        <button
          onClick={() => setCurrentTab('schedule')}
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition cursor-pointer ${
            currentTab === 'schedule' ? 'text-red-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full ${currentTab === 'schedule' ? 'bg-red-50' : ''}`}>
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 leading-none">Lịch tuần</span>
        </button>

        {/* Tab: Phê duyệt (nếu có quyền) */}
        {canApprove && (
          <button
            onClick={() => setCurrentTab('approvals')}
            className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition cursor-pointer relative ${
              currentTab === 'approvals' ? 'text-red-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-full relative ${currentTab === 'approvals' ? 'bg-red-50' : ''}`}>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              {pendingApprovalsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                  {pendingApprovalsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 leading-none">Phê duyệt</span>
          </button>
        )}

        {/* Center Floating Action Button (Đăng ký nhanh) */}
        <div className="flex flex-col items-center -mt-5">
          <button
            onClick={onOpenRegisterModal}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-700 to-red-600 text-white flex items-center justify-center shadow-lg shadow-red-700/30 hover:scale-105 active:scale-95 transition cursor-pointer border-2 border-white"
            title="Đăng ký lịch mới"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-bold text-slate-700 mt-1">Đăng ký</span>
        </div>

        {/* Tab: Nhiệm vụ (Chuyên viên chỉ xem) */}
        <button
          onClick={() => setCurrentTab('tasks')}
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition cursor-pointer ${
            currentTab === 'tasks' ? 'text-red-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full ${currentTab === 'tasks' ? 'bg-red-50' : ''}`}>
            <CheckSquare className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-[10px] mt-0.5 leading-none">Nhiệm vụ</span>
        </button>

        {/* Tab: Thống kê (Chỉ Lãnh đạo & Văn phòng) */}
        {!isSpecialist && (
          <button
            onClick={() => setCurrentTab('stats')}
            className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition cursor-pointer ${
              currentTab === 'stats' ? 'text-red-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-full ${currentTab === 'stats' ? 'bg-red-50' : ''}`}>
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-[10px] mt-0.5 leading-none">Thống kê</span>
          </button>
        )}

        {/* Tab: Đồng bộ (Chỉ Lãnh đạo & Văn phòng) */}
        {!isSpecialist && (
          <button
            onClick={() => setCurrentTab('sync')}
            className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition cursor-pointer ${
              currentTab === 'sync' ? 'text-red-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-full ${currentTab === 'sync' ? 'bg-red-50' : ''}`}>
              <Cloud className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] mt-0.5 leading-none">Đồng bộ</span>
          </button>
        )}
      </div>
    </div>
  );
};
