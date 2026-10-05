import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, Check, AlertCircle, KeyRound } from 'lucide-react';
import { UserProfile } from '../types';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onChangePassword: (newPassword: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onChangePassword,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Verify current password
    const expectedPassword = currentUser.password || '123';
    if (currentPassword !== expectedPassword) {
      setErrorMessage('Mật khẩu hiện tại không chính xác');
      return;
    }

    if (newPassword.trim().length < 3) {
      setErrorMessage('Mật khẩu mới phải có ít nhất 3 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Xác nhận mật khẩu mới không trùng khớp');
      return;
    }

    onChangePassword(newPassword);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Mobile handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-300 rounded-full mx-auto my-1.5 flex-shrink-0" />

        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-red-700 text-white px-4 sm:px-5 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm sm:text-base">Thay Đổi Mật Khẩu Truy Cập</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Info Box */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Tài khoản:</span>
            <span className="font-bold text-slate-800 font-mono">
              {currentUser.username || currentUser.email}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-slate-500">Họ và tên:</span>
            <span className="font-semibold text-slate-900">{currentUser.name}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-slate-500">Chức vụ:</span>
            <span className="text-red-700 font-bold">{currentUser.title}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Mật khẩu hiện tại *
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu đang dùng"
                className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Mật khẩu mới *
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 3 ký tự"
                className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Xác nhận mật khẩu mới *
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded font-medium"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-xs transition"
            >
              Lưu Mật Khẩu Mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
