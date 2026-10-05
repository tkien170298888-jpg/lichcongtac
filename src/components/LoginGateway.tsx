import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  KeyRound
} from 'lucide-react';
import { UserProfile } from '../types';

interface LoginGatewayProps {
  onLoginSuccess: (user: UserProfile) => void;
  onEnterAsGuest: () => void;
  allUsers: UserProfile[];
}

export const LoginGateway: React.FC<LoginGatewayProps> = ({
  onLoginSuccess,
  onEnterAsGuest,
  allUsers,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier = usernameInput.trim().toLowerCase();
    const foundUser = allUsers.find(
      u => u.username?.toLowerCase() === identifier || u.email.toLowerCase() === identifier
    );

    if (!foundUser) {
      setErrorMessage('Tên tài khoản hoặc Email không tồn tại trên hệ thống');
      return;
    }

    if (foundUser.password && foundUser.password !== passwordInput.trim()) {
      setErrorMessage('Mật khẩu không chính xác. Vui lòng kiểm tra lại');
      return;
    }

    onLoginSuccess(foundUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 flex flex-col justify-between font-sans text-slate-100 p-3 sm:p-6">
      {/* Top Emblem Bar */}
      <div className="text-center pt-2 sm:pt-4">
        <div className="inline-flex items-center space-x-2 bg-red-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-red-700/60 text-xs text-amber-300 font-semibold mb-2">
          <span className="text-amber-400 font-black">★</span>
          <span>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM — Độc lập - Tự do - Hạnh phúc</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch my-auto py-3">
        {/* Left Column: Organization & Guest Access */}
        <div className="lg:col-span-5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl space-y-5">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-red-600 to-red-800 flex items-center justify-center text-3xl shadow-lg border-2 border-amber-400 flex-shrink-0">
                🏛️
              </div>
              <div>
                <div className="text-[11px] font-black tracking-wider text-amber-400 uppercase leading-none">
                  HĐND & UBND XÃ LAO BẢO
                </div>
                <h1 className="text-lg sm:text-xl font-black text-white leading-tight mt-1">
                  Hệ thống Quản lý Lịch Công tác
                </h1>
                <p className="text-xs text-slate-300">
                  Phê duyệt văn bản & Theo dõi tiến độ nhiệm vụ
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/10">
              Cổng thông tin điều hành tác nghiệp chính thức của Thường trực HĐND và UBND Xã Lao Bảo. Đảm bảo tính minh bạch, tức thời và an toàn dữ liệu công vụ.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Xem lịch công tác tuần & lịch tiếp công dân định kỳ</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Xuất văn bản Word (NĐ 30/2020) & bảng tính Excel</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Đồng bộ Google Workspace & hỗ trợ ngoại tuyến</span>
              </div>
            </div>
          </div>

          {/* PROMINENT GUEST MODE BUTTON */}
          <div className="pt-3 border-t border-white/15">
            <div className="bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-400/40 rounded-xl p-3.5 space-y-2 text-center">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center justify-center space-x-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Dành cho Nhân dân & Khách vãng lai</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                Tra cứu nhanh toàn bộ lịch công tác tuần của Lãnh đạo xã mà không cần tạo tài khoản hay mật khẩu.
              </p>
              <button
                type="button"
                onClick={onEnterAsGuest}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg transition active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Xem Lịch Công Khai (Chế Độ Khách)</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Officer Login (Clean & Direct) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-8 text-slate-900 shadow-2xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-red-700" />
                <span>Đăng Nhập Tài Khoản Quản Trị & Cán Bộ</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Dành cho Quản trị viên hệ thống, Lãnh đạo xã và cán bộ chuyên môn
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Tài khoản đăng nhập hoặc Email công vụ *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Nhập tên tài khoản (Ví dụ: admin)"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Mật khẩu truy cập *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <span>Đăng Nhập Vào Hệ Thống</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Administrative Notice */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-red-700" />
              <span>Quy định bảo mật tài khoản công vụ:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Mỗi cán bộ được cấp tài khoản định danh riêng theo thẩm quyền vị trí công tác. Sau khi đăng nhập, vui lòng đổi mật khẩu định kỳ để đảm bảo tính an toàn dữ liệu.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 pb-1">
        © 2026 UBND Xã Lao Bảo, Huyện Hướng Hóa, Tỉnh Quảng Trị • Cổng Thông Tin Điều Hành Điện Tử
      </div>
    </div>
  );
};
