import React, { useState } from 'react';
import { 
  Building2, 
  Award, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Check, 
  X, 
  RotateCcw, 
  ShieldCheck,
  AlertCircle,
  FolderTree,
  UserCheck
} from 'lucide-react';
import { DEPARTMENTS, DEFAULT_TITLES } from '../data/initialData';
import { ConfirmModal } from './ConfirmModal';

interface OrgConfigViewProps {
  departments: string[];
  titles: string[];
  onUpdateDepartments: (depts: string[]) => void;
  onUpdateTitles: (titles: string[]) => void;
}

export const OrgConfigView: React.FC<OrgConfigViewProps> = ({
  departments,
  titles,
  onUpdateDepartments,
  onUpdateTitles,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'departments' | 'titles'>('departments');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Department modal/inline state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDeptIndex, setEditingDeptIndex] = useState<number | null>(null);
  const [deptName, setDeptName] = useState('');

  // Title modal/inline state
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [editingTitleIndex, setEditingTitleIndex] = useState<number | null>(null);
  const [titleName, setTitleName] = useState('');

  // Department handlers
  const openAddDept = () => {
    setEditingDeptIndex(null);
    setDeptName('');
    setIsDeptModalOpen(true);
  };

  const openEditDept = (index: number) => {
    setEditingDeptIndex(index);
    setDeptName(departments[index]);
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = deptName.trim();
    if (!clean) return;

    if (editingDeptIndex !== null) {
      const updated = [...departments];
      updated[editingDeptIndex] = clean;
      onUpdateDepartments(updated);
    } else {
      if (departments.some(d => d.toLowerCase() === clean.toLowerCase())) {
        alert('Tên đơn vị này đã tồn tại trong danh mục!');
        return;
      }
      onUpdateDepartments([...departments, clean]);
    }

    setIsDeptModalOpen(false);
  };

  const handleDeleteDept = (index: number) => {
    const deptToDelete = departments[index];
    setConfirmModalConfig({
      isOpen: true,
      title: 'Xác Nhận Xóa Đơn Vị',
      message: `Bạn có chắc chắn muốn xóa đơn vị/phòng ban "${deptToDelete}" khỏi danh mục hệ thống?`,
      confirmText: 'Xác Nhận Xóa',
      variant: 'danger',
      onConfirm: () => {
        const updated = departments.filter((_, i) => i !== index);
        onUpdateDepartments(updated);
      },
    });
  };

  // Title handlers
  const openAddTitle = () => {
    setEditingTitleIndex(null);
    setTitleName('');
    setIsTitleModalOpen(true);
  };

  const openEditTitle = (index: number) => {
    setEditingTitleIndex(index);
    setTitleName(titles[index]);
    setIsTitleModalOpen(true);
  };

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = titleName.trim();
    if (!clean) return;

    if (editingTitleIndex !== null) {
      const updated = [...titles];
      updated[editingTitleIndex] = clean;
      onUpdateTitles(updated);
    } else {
      if (titles.some(t => t.toLowerCase() === clean.toLowerCase())) {
        alert('Chức danh này đã tồn tại trong danh mục!');
        return;
      }
      onUpdateTitles([...titles, clean]);
    }

    setIsTitleModalOpen(false);
  };

  const handleDeleteTitle = (index: number) => {
    const titleToDelete = titles[index];
    setConfirmModalConfig({
      isOpen: true,
      title: 'Xác Nhận Xóa Chức Danh',
      message: `Bạn có chắc chắn muốn xóa chức danh "${titleToDelete}" khỏi danh mục hệ thống?`,
      confirmText: 'Xác Nhận Xóa',
      variant: 'danger',
      onConfirm: () => {
        const updated = titles.filter((_, i) => i !== index);
        onUpdateTitles(updated);
      },
    });
  };

  const handleResetDefaults = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Khôi Phục Danh Mục Mặc Định',
      message: 'Bạn có chắc chắn muốn khôi phục toàn bộ danh mục Đơn vị và Chức danh về mặc định ban đầu của xã Lao Bảo?',
      confirmText: 'Khôi Phục Mặc Định',
      variant: 'warning',
      onConfirm: () => {
        onUpdateDepartments(DEPARTMENTS);
        onUpdateTitles(DEFAULT_TITLES);
      },
    });
  };

  // Filtered lists
  const filteredDepts = departments.filter(d => 
    d.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const filteredTitles = titles.filter(t => 
    t.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-red-100 text-red-800 rounded-lg">
              <FolderTree className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Cấu Hình Đơn Vị & Chức Danh Hệ Thống
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý danh mục phòng ban, ban ngành, thôn bản và chức vụ công tác tại UBND Xã Lao Bảo
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition cursor-pointer"
            title="Khôi phục danh mục chuẩn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Khôi phục chuẩn</span>
          </button>

          {activeSubTab === 'departments' ? (
            <button
              onClick={openAddDept}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Đơn Vị Mới</span>
            </button>
          ) : (
            <button
              onClick={openAddTitle}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Chức Danh Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs & Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('departments')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeSubTab === 'departments'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Đơn Vị & Phòng Ban ({departments.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('titles')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeSubTab === 'titles'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Chức Danh & Chức Vụ ({titles.length})</span>
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeSubTab === 'departments' ? 'Tìm tên phòng ban, thôn...' : 'Tìm chức danh...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Sub-Tab 1: Departments List */}
      {activeSubTab === 'departments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold uppercase tracking-wider text-[11px]">
              Danh mục Đơn vị / Phòng chuyên môn / Thôn bản
            </span>
            <span className="text-slate-500 font-medium">Hiển thị {filteredDepts.length} đơn vị</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredDepts.map((dept, index) => {
              const originalIndex = departments.indexOf(dept);
              const isVillage = dept.startsWith('Thôn') || dept.startsWith('Bản');
              const isKeyOffice = dept.includes('VP HĐND') || dept.includes('Công an') || dept.includes('Quân sự');

              return (
                <div key={dept} className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50/80 transition">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                      {index + 1}
                    </span>
                    <div className={`p-2 rounded-lg ${
                      isVillage 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : isKeyOffice 
                        ? 'bg-red-50 text-red-700' 
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {dept}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          isVillage ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isVillage ? 'Địa bàn Thôn / Bản' : 'Phòng / Khối chuyên môn'}
                        </span>
                        <span>Được tích hợp vào phiếu đăng ký lịch & giao việc</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditDept(originalIndex)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                      title="Sửa tên đơn vị"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDept(originalIndex)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                      title="Xóa đơn vị"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Titles List */}
      {activeSubTab === 'titles' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold uppercase tracking-wider text-[11px]">
              Danh mục Chức danh / Vị trí việc làm
            </span>
            <span className="text-slate-500 font-medium">Hiển thị {filteredTitles.length} chức danh</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTitles.map((title, index) => {
              const originalIndex = titles.indexOf(title);
              const isLeader = title.includes('Chủ tịch') || title.includes('PCT');
              const isDeptLeader = title.includes('Trưởng phòng') || title.includes('Phó Trưởng phòng') || title.includes('Trưởng ban') || title.includes('Chánh Văn phòng');

              return (
                <div key={title} className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50/80 transition">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                      {index + 1}
                    </span>
                    <div className={`p-2 rounded-lg ${
                      isLeader 
                        ? 'bg-amber-50 text-amber-700' 
                        : isDeptLeader 
                        ? 'bg-purple-50 text-purple-700' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {title}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          isLeader 
                            ? 'bg-red-100 text-red-800' 
                            : isDeptLeader 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isLeader ? 'Lãnh đạo UBND/HĐND' : isDeptLeader ? 'Lãnh đạo Phòng/Ban' : 'Vị trí Chuyên môn'}
                        </span>
                        <span>Được gán khi tạo tài khoản & phân quyền</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditTitle(originalIndex)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                      title="Sửa chức danh"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTitle(originalIndex)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                      title="Xóa chức danh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Department Add/Edit Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-800 to-red-700 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-amber-300" />
                <h3 className="font-bold text-sm">
                  {editingDeptIndex !== null ? 'Chỉnh Sửa Đơn Vị' : 'Thêm Đơn Vị Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên đơn vị / Phòng ban / Thôn bản *
                </label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="Ví dụ: Phòng Tài chính - Kế hoạch, Bản Khe Đá..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded font-medium cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded shadow-xs cursor-pointer"
                >
                  Lưu Đơn Vị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Title Add/Edit Modal */}
      {isTitleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-800 to-red-700 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-300" />
                <h3 className="font-bold text-sm">
                  {editingTitleIndex !== null ? 'Chỉnh Sửa Chức Danh' : 'Thêm Chức Danh Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsTitleModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTitle} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên chức danh / Chức vụ công tác *
                </label>
                <input
                  type="text"
                  required
                  value={titleName}
                  onChange={(e) => setTitleName(e.target.value)}
                  placeholder="Ví dụ: Trưởng phòng Kinh tế, Cán bộ Địa chính..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTitleModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded font-medium cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded shadow-xs cursor-pointer"
                >
                  Lưu Chức Danh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-app confirmation modal */}
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
