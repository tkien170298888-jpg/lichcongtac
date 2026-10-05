import React, { useState } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  Cloud, 
  Bell, 
  PlusCircle, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Printer, 
  Share2,
  FileText,
  FileSpreadsheet,
  UserCheck,
  ChevronDown,
  LogOut,
  LogIn,
  KeyRound,
  Users,
  FolderTree
} from 'lucide-react';
import { UserProfile, RoleType } from '../types';

interface HeaderProps {
  currentTab: 'schedule' | 'approvals' | 'tasks' | 'stats' | 'sync' | 'users' | 'org_config';
  setCurrentTab: (tab: 'schedule' | 'approvals' | 'tasks' | 'stats' | 'sync' | 'users' | 'org_config') => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  allUsers: UserProfile[];
  isOnline: boolean;
  unreadNotificationsCount: number;
  pendingApprovalsCount: number;
  onOpenRegisterModal: () => void;
  onOpenNotifications: () => void;
  onOpenExportWord: () => void;
  onOpenExportExcel: () => void;
  onOpenShareZalo: () => void;
  onLogout: () => void;
  onOpenChangePassword?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  setCurrentUser,
  allUsers,
  isOnline,
  unreadNotificationsCount,
  pendingApprovalsCount,
  onOpenRegisterModal,
  onOpenNotifications,
  onOpenExportWord,
  onOpenExportExcel,
  onOpenShareZalo,
  onLogout,
  onOpenChangePassword,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-40">
      {/* Top red government administrative banner */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white px-3 sm:px-4 py-1 flex items-center justify-between text-[11px] font-medium">
        <div className="flex items-center space-x-1.5 truncate">
          <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-red-900 font-black shadow-inner text-[9px] flex-shrink-0">
            ★
          </div>
          <span className="hidden sm:inline uppercase tracking-wider font-semibold">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM — Độc lập - Tự do - Hạnh phúc
          </span>
          <span className="sm:hidden font-bold tracking-wide uppercase">
            UBND XÃ LAO BẢO
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Online/Offline status */}
          <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-300 animate-pulse" />
                <span className="text-emerald-200 hidden xs:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-300" />
                <span className="text-amber-200 font-bold">Offline</span>
              </>
            )}
          </div>

          {/* Role display & Logout/Login Header Action */}
          {currentUser.role === 'CONG_KHAI' ? (
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-amber-200 bg-black/25 px-2 py-0.5 rounded font-medium">
                Khách tra cứu công khai
              </span>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 bg-amber-400 hover:bg-amber-300 text-slate-950 px-2 py-0.5 rounded text-[11px] font-bold shadow-xs transition cursor-pointer"
                title="Đăng nhập tài khoản cán bộ"
              >
                <LogIn className="w-3 h-3" />
                <span className="hidden xs:inline">Đăng nhập Cán bộ</span>
                <span className="xs:hidden">Đăng nhập</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              {/* Role menu for authenticated officer */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center space-x-1 bg-black/25 hover:bg-black/35 px-2 py-0.5 rounded text-[11px] font-semibold text-amber-200 transition cursor-pointer"
                >
                  <UserCheck className="w-3 h-3 text-amber-300" />
                  <span className="max-w-[110px] sm:max-w-none truncate">{currentUser.title}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-1 text-slate-800 z-50 text-xs">
                    <div className="px-3 py-1.5 font-bold text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                      Tài khoản cán bộ:
                    </div>
                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                      <div className="font-bold text-slate-900">{currentUser.name}</div>
                      <div className="text-[11px] text-red-700 font-semibold">{currentUser.title}</div>
                      <div className="text-[10px] text-slate-500">{currentUser.department}</div>
                    </div>

                    {/* Password change and Logout options in menu */}
                    <div className="pt-1 px-1 space-y-0.5">
                      {onOpenChangePassword && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowRoleMenu(false);
                            onOpenChangePassword();
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded flex items-center space-x-1.5 font-medium transition cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-red-700" />
                          <span>Đổi mật khẩu tài khoản</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setShowRoleMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-50 rounded flex items-center space-x-1.5 font-bold transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={onLogout}
                className="p-1 hover:bg-black/20 rounded text-slate-200 hover:text-white transition cursor-pointer"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-md border-2 border-amber-300 flex-shrink-0">
            <span className="text-xl sm:text-2xl">🏛️</span>
          </div>
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold text-red-700 tracking-wider uppercase leading-none">
              HĐND & UBND XÃ LAO BẢO
            </div>
            <h1 className="text-xs sm:text-base font-bold text-slate-900 leading-tight mt-0.5">
              <span>Lịch Công Tác & Theo Dõi Nhiệm Vụ</span>
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Register Schedule Button (Desktop) */}
          {currentUser.role !== 'CONG_KHAI' && (
            <button
              onClick={onOpenRegisterModal}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-md text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đăng ký Lịch</span>
            </button>
          )}

          {/* Export Word, Excel, Zalo & Print */}
          <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white shadow-xs">
            <button
              onClick={onOpenExportWord}
              title="Xuất file Word (NĐ 30/2020)"
              className="p-1.5 text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition border-r border-slate-200"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700" />
            </button>
            <button
              onClick={onOpenExportExcel}
              title="Xuất file Excel (.xls)"
              className="p-1.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition border-r border-slate-200"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            </button>
            <button
              onClick={onOpenShareZalo}
              title="Chia sẻ Zalo"
              className="p-1.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition border-r border-slate-200 sm:border-r-0"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            </button>
            <button
              onClick={() => window.print()}
              title="In bản giấy A4"
              className="hidden sm:block p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications Bell (Officers only) */}
          {currentUser.role !== 'CONG_KHAI' && (
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Thông báo nhắc việc"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs (Desktop only) */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 space-x-3 overflow-x-auto border-t border-slate-100 py-1.5 scrollbar-none text-xs sm:text-sm font-medium">
        <button
          onClick={() => setCurrentTab('schedule')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer ${
            currentTab === 'schedule'
              ? 'bg-red-50 text-red-700 font-bold border-b-2 border-red-700'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Lịch Công Tác Tuần</span>
        </button>

        {/* Other tabs according to RBAC */}
        {currentUser.role !== 'CONG_KHAI' && (
          <>
            {/* Approvals: Leaders, Office & Dept Leaders */}
            {(currentUser.role === 'LANH_DAO' || currentUser.role === 'VAN_PHONG' || currentUser.role === 'LANH_DAO_PHONG') && (
              <button
                onClick={() => setCurrentTab('approvals')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer relative ${
                  currentTab === 'approvals'
                    ? 'bg-red-50 text-red-700 font-bold border-b-2 border-red-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{currentUser.role === 'LANH_DAO_PHONG' ? 'Duyệt Lịch Phòng' : 'Phê Duyệt Lịch'}</span>
                {pendingApprovalsCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}

            {/* Tasks: Leaders, Office, Dept Leaders & Specialist */}
            <button
              onClick={() => setCurrentTab('tasks')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer ${
                currentTab === 'tasks'
                  ? 'bg-red-50 text-red-700 font-bold border-b-2 border-red-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <span>Theo Dõi Nhiệm Vụ</span>
            </button>

            {/* Stats: Leaders & Office only */}
            {(currentUser.role === 'LANH_DAO' || currentUser.role === 'VAN_PHONG') && (
              <button
                onClick={() => setCurrentTab('stats')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer ${
                  currentTab === 'stats'
                    ? 'bg-red-50 text-red-700 font-bold border-b-2 border-red-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Báo Cáo & Thống Kê</span>
              </button>
            )}

            {/* Sync: Leaders & Office only */}
            {(currentUser.role === 'LANH_DAO' || currentUser.role === 'VAN_PHONG') && (
              <button
                onClick={() => setCurrentTab('sync')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer ${
                  currentTab === 'sync'
                    ? 'bg-red-50 text-red-700 font-bold border-b-2 border-red-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Cloud className="w-4 h-4 text-emerald-600" />
                <span>Đồng Bộ Google Workspace</span>
              </button>
            )}

            {/* User Management: Admin / Lãnh đạo only */}
            {(currentUser.username === 'admin' || currentUser.role === 'LANH_DAO') && (
              <button
                onClick={() => setCurrentTab('users')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer ${
                  currentTab === 'users'
                    ? 'bg-red-50 text-red-700 font-bold border-b-2 border-red-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4 text-amber-600" />
                <span>Quản Trị Tài Khoản</span>
              </button>
            )}

            {/* Org Units & Titles Config: Admin / Lãnh đạo only */}
            {(currentUser.username === 'admin' || currentUser.role === 'LANH_DAO') && (
              <button
                onClick={() => setCurrentTab('org_config')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md transition whitespace-nowrap cursor-pointer ${
                  currentTab === 'org_config'
                    ? 'bg-red-50 text-red-700 font-bold border-b-2 border-red-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FolderTree className="w-4 h-4 text-purple-600" />
                <span>Đơn Vị & Chức Danh</span>
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
};
