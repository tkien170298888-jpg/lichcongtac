import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  Edit3, 
  Trash2, 
  Search, 
  CheckCircle2, 
  X, 
  Eye, 
  EyeOff, 
  Building2, 
  Phone, 
  Mail, 
  ShieldAlert,
  Info,
  Check,
  AlertTriangle
} from 'lucide-react';
import { UserProfile, RoleType } from '../types';
import { DEPARTMENTS } from '../data/initialData';
import { ConfirmModal } from './ConfirmModal';

interface UserManagementViewProps {
  users: UserProfile[];
  currentUser: UserProfile;
  onAddUser: (user: UserProfile) => void;
  onUpdateUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
  departments?: string[];
  titles?: string[];
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  departments,
  titles,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

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

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [role, setRole] = useState<RoleType>('CHUYEN_VIEN');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [zalo, setZalo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset password inline modal or notification
  const [revealedPasswords, setRevealedPasswords] = useState<{ [key: string]: boolean }>({});

  const togglePasswordReveal = (userId: string) => {
    setRevealedPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setPassword('123');
    setRole('CHUYEN_VIEN');
    setTitle('Chuyên viên');
    setDepartment(DEPARTMENTS[0]);
    setEmail('');
    setPhone('');
    setZalo('');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setName(u.name);
    setUsername(u.username || '');
    setPassword(u.password || '123');
    setRole(u.role);
    setTitle(u.title);
    setDepartment(u.department);
    setEmail(u.email);
    setPhone(u.phone);
    setZalo(u.zalo);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setErrorMessage('Tên đăng nhập không được để trống');
      return;
    }

    // Check duplicate username (except current editing user)
    const duplicate = users.find(u => 
      u.id !== editingUser?.id && 
      u.username?.toLowerCase() === cleanUsername
    );
    if (duplicate) {
      setErrorMessage(`Tên đăng nhập "${cleanUsername}" đã tồn tại trên hệ thống`);
      return;
    }

    if (editingUser) {
      const updated: UserProfile = {
        ...editingUser,
        name: name.trim(),
        username: cleanUsername,
        password: password.trim() || '123',
        role,
        title: title.trim(),
        department,
        email: email.trim() || `${cleanUsername}@laobao.gov.vn`,
        phone: phone.trim() || '0900.000.000',
        zalo: zalo.trim() || phone.trim(),
      };
      onUpdateUser(updated);
    } else {
      const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        username: cleanUsername,
        password: password.trim() || '123',
        role,
        title: title.trim(),
        department,
        email: email.trim() || `${cleanUsername}@laobao.gov.vn`,
        phone: phone.trim() || '0900.000.000',
        zalo: zalo.trim() || phone.trim(),
        avatar: `https://images.unsplash.com/photo-${1500000000000 + (users.length % 10)}?w=150&auto=format&fit=crop&q=80`,
      };
      onAddUser(newUser);
    }

    setIsModalOpen(false);
  };

  const handleResetPassword = (targetUser: UserProfile) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Đặt Lại Mật Khẩu',
      message: `Bạn có chắc muốn đặt lại mật khẩu của tài khoản "${targetUser.name}" (${targetUser.username}) về mặc định là "123"?`,
      confirmText: 'Đặt Lại Mật Khẩu',
      variant: 'warning',
      onConfirm: () => {
        onUpdateUser({
          ...targetUser,
          password: '123',
        });
      },
    });
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const inName = u.name.toLowerCase().includes(q);
      const inUser = (u.username || '').toLowerCase().includes(q);
      const inTitle = u.title.toLowerCase().includes(q);
      const inDept = u.department.toLowerCase().includes(q);
      if (!inName && !inUser && !inTitle && !inDept) return false;
    }
    return true;
  });

  const leaderCount = users.filter(u => u.role === 'LANH_DAO').length;
  const deptLeaderCount = users.filter(u => u.role === 'LANH_DAO_PHONG').length;
  const officeCount = users.filter(u => u.role === 'VAN_PHONG').length;
  const specialistCount = users.filter(u => u.role === 'CHUYEN_VIEN').length;

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-red-100 text-red-800 rounded-lg">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Quản Trị Tài Khoản & Phân Quyền Hệ Thống
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập quyền truy cập theo từng nhóm vị trí công tác cho cán bộ, công chức UBND Xã Lao Bảo
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 cursor-pointer self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Tạo Tài Khoản Mới</span>
        </button>
      </div>

      {/* Role Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500">Tổng tài khoản</div>
          <div className="text-xl font-black text-slate-900 mt-1">{users.length}</div>
        </div>
        <div className="bg-red-50/70 p-3 rounded-xl border border-red-200 shadow-2xs">
          <div className="text-red-700 font-semibold flex items-center space-x-1">
            <span>👑 Lãnh đạo xã</span>
          </div>
          <div className="text-xl font-black text-red-900 mt-1">{leaderCount}</div>
        </div>
        <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200 shadow-2xs">
          <div className="text-purple-700 font-semibold flex items-center space-x-1">
            <span>🏛️ Lãnh đạo phòng</span>
          </div>
          <div className="text-xl font-black text-purple-900 mt-1">{deptLeaderCount}</div>
        </div>
        <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 shadow-2xs">
          <div className="text-blue-700 font-semibold flex items-center space-x-1">
            <span>🏛️ Văn phòng</span>
          </div>
          <div className="text-xl font-black text-blue-900 mt-1">{officeCount}</div>
        </div>
        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="text-emerald-700 font-semibold flex items-center space-x-1">
            <span>📋 Chuyên viên</span>
          </div>
          <div className="text-xl font-black text-emerald-900 mt-1">{specialistCount}</div>
        </div>
      </div>

      {/* Permission Matrix Guide Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Quy Định & Ma Trận Phân Quyền Theo Nhóm:</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Phân quyền bảo mật theo thẩm quyền công vụ</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/10 p-3 rounded-lg border border-white/10 space-y-1">
            <div className="font-bold text-amber-300 flex items-center space-x-1">
              <span>👑 Lãnh đạo (Chủ tịch / PCT / Admin)</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Toàn quyền phê duyệt lịch công tác, phát hành lịch chính thức, giao nhiệm vụ, chỉnh sửa tiến độ và quản trị tài khoản.
            </p>
          </div>

          <div className="bg-white/10 p-3 rounded-lg border border-white/10 space-y-1">
            <div className="font-bold text-blue-300 flex items-center space-x-1">
              <span>🏛️ Văn phòng HĐND & UBND</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Thẩm tra lịch, điều phối phòng họp và xe công vụ, giao việc theo dõi kết luận, xuất văn bản Word / Excel.
            </p>
          </div>

          <div className="bg-white/10 p-3 rounded-lg border border-white/10 space-y-1">
            <div className="font-bold text-emerald-300 flex items-center space-x-1">
              <span>📋 Chuyên viên / Cán bộ</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Đăng ký lịch làm việc; Xem lịch công tác tuần; Xem thẻ theo dõi nhiệm vụ (<strong>chế độ chỉ xem, không có quyền sửa/xóa nhiệm vụ</strong>).
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên cán bộ, tài khoản, phòng ban..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả nhóm quyền</option>
            <option value="LANH_DAO">👑 Lãnh đạo xã</option>
            <option value="LANH_DAO_PHONG">🏛️ Lãnh đạo Phòng/Ban</option>
            <option value="VAN_PHONG">🏛️ Văn phòng</option>
            <option value="CHUYEN_VIEN">📋 Chuyên viên</option>
            <option value="CONG_KHAI">👁️ Khách</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 sm:px-4">Cán bộ / Họ tên</th>
                <th className="py-3 px-3">Tài khoản & Mật khẩu</th>
                <th className="py-3 px-3">Chức vụ & Đơn vị</th>
                <th className="py-3 px-3">Nhóm Phân Quyền</th>
                <th className="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isAdmin = u.username === 'admin';
                const isGuest = u.role === 'CONG_KHAI';
                const isPassRevealed = revealedPasswords[u.id];

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    {/* Name & Avatar */}
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-800 font-bold flex items-center justify-center flex-shrink-0 text-xs border border-red-200">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            u.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                            <span>{u.name}</span>
                            {isAdmin && (
                              <span className="px-1.5 py-0.2 bg-red-700 text-white rounded text-[9px] font-bold">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Username & Password */}
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-800 font-semibold">
                        {u.username || <span className="text-slate-400 italic">Chưa đặt</span>}
                      </div>
                      {!isGuest && (
                        <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                          <span>MK:</span>
                          <span className="font-mono bg-slate-100 px-1 rounded text-slate-700 font-semibold">
                            {isPassRevealed ? (u.password || '123') : '••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordReveal(u.id)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            title={isPassRevealed ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          >
                            {isPassRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Title & Department */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900">{u.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Building2 className="w-3 h-3 flex-shrink-0" />
                        <span>{u.department}</span>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3 px-3">
                      {u.role === 'LANH_DAO' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 rounded-full font-bold text-[11px]">
                          <span>👑 Lãnh đạo xã</span>
                        </span>
                      )}
                      {u.role === 'LANH_DAO_PHONG' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-full font-bold text-[11px]">
                          <span>🏛️ Lãnh đạo Phòng/Ban</span>
                        </span>
                      )}
                      {u.role === 'VAN_PHONG' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full font-bold text-[11px]">
                          <span>🏛️ Văn phòng</span>
                        </span>
                      )}
                      {u.role === 'CHUYEN_VIEN' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[11px]">
                          <span>📋 Chuyên viên</span>
                        </span>
                      )}
                      {u.role === 'CONG_KHAI' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-[11px]">
                          <span>👁️ Khách tra cứu</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 sm:px-4 text-right">
                      {!isGuest && (
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => handleResetPassword(u)}
                            title="Đặt lại mật khẩu về 123"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(u)}
                            title="Chỉnh sửa thông tin"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {!isAdmin && (
                            <button
                              onClick={() => {
                                setConfirmModalConfig({
                                  isOpen: true,
                                  title: 'Xác Nhận Xóa Tài Khoản',
                                  message: `Xác nhận xóa tài khoản cán bộ "${u.name}" (${u.username || u.email}) khỏi hệ thống? Dữ liệu tài khoản này sẽ bị gỡ bỏ hoàn toàn.`,
                                  confirmText: 'Xác Nhận Xóa',
                                  variant: 'danger',
                                  onConfirm: () => onDeleteUser(u.id),
                                });
                              }}
                              title="Xóa tài khoản"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 active:scale-90 rounded transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-800 to-red-700 text-white px-4 sm:px-5 py-3.5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingUser ? 'Cập Nhật Tài Khoản Cán Bộ' : 'Tạo Tài Khoản Truy Cập Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên cán bộ, công chức *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Đ/c Lê Văn Nam"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Username & Initial Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên đăng nhập (username) *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ví dụ: diachinh.nam"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mật khẩu truy cập *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mật khẩu"
                      className="w-full px-3 py-2 pr-9 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Selection (Custom Group) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Nhóm phân quyền truy cập *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <label className={`flex items-start space-x-2.5 p-2.5 rounded-lg border transition cursor-pointer ${
                    role === 'LANH_DAO' ? 'bg-red-50/80 border-red-400 text-red-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="userRole"
                      value="LANH_DAO"
                      checked={role === 'LANH_DAO'}
                      onChange={() => setRole('LANH_DAO')}
                      className="mt-0.5 text-red-700"
                    />
                    <div>
                      <div className="font-bold flex items-center space-x-1">
                        <span>👑 Nhóm Lãnh Đạo (Chủ tịch / PCT)</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Toàn quyền phê duyệt lịch tuần, phát hành lịch chính thức, giao việc và theo dõi tiến độ toàn xã.
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-start space-x-2.5 p-2.5 rounded-lg border transition cursor-pointer ${
                    role === 'VAN_PHONG' ? 'bg-blue-50/80 border-blue-400 text-blue-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="userRole"
                      value="VAN_PHONG"
                      checked={role === 'VAN_PHONG'}
                      onChange={() => setRole('VAN_PHONG')}
                      className="mt-0.5 text-blue-700"
                    />
                    <div>
                      <div className="font-bold flex items-center space-x-1">
                        <span>🏛️ Nhóm Văn Phòng HĐND & UBND</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Tổng hợp lịch, điều phối phòng họp, bố trí xe công vụ, giao việc theo kết luận họp, xuất Word/Excel.
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-start space-x-2.5 p-2.5 rounded-lg border transition cursor-pointer ${
                    role === 'LANH_DAO_PHONG' ? 'bg-purple-50/80 border-purple-400 text-purple-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="userRole"
                      value="LANH_DAO_PHONG"
                      checked={role === 'LANH_DAO_PHONG'}
                      onChange={() => setRole('LANH_DAO_PHONG')}
                      className="mt-0.5 text-purple-700"
                    />
                    <div>
                      <div className="font-bold flex items-center space-x-1">
                        <span>🏛️ Nhóm Lãnh Đạo Phòng, Ban (Trưởng / Phó Phòng)</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Phê duyệt lịch công tác của các chuyên viên thuộc phòng mình trước khi chuyển sang thẻ duyệt chung của UBND xã.
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-start space-x-2.5 p-2.5 rounded-lg border transition cursor-pointer ${
                    role === 'CHUYEN_VIEN' ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="userRole"
                      value="CHUYEN_VIEN"
                      checked={role === 'CHUYEN_VIEN'}
                      onChange={() => setRole('CHUYEN_VIEN')}
                      className="mt-0.5 text-emerald-700"
                    />
                    <div>
                      <div className="font-bold flex items-center space-x-1">
                        <span>📋 Nhóm Chuyên Viên / Cán Bộ Chuyên Môn</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Đăng ký lịch làm việc (chờ Trưởng phòng duyệt); Xem lịch công tác; Xem và báo cáo tiến độ nhiệm vụ được giao.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Title & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chức vụ / Chức danh *
                  </label>
                  <input
                    type="text"
                    required
                    list="titles-datalist"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Trưởng phòng Kinh tế, Chuyên viên..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 bg-white"
                  />
                  {titles && (
                    <datalist id="titles-datalist">
                      {titles.map(t => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Đơn vị / Phòng ban *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 bg-white"
                  >
                    {(departments || DEPARTMENTS).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email công vụ
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="canbo@quangtri.gov.vn"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số điện thoại / Zalo
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912.xxx.xxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-xs transition active:scale-95 cursor-pointer"
                >
                  {editingUser ? 'Cập Nhật Tài Khoản' : 'Lưu Tài Khoản Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable In-App Confirmation Modal */}
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
};
