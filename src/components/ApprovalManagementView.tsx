import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Building2, 
  User, 
  Calendar, 
  MapPin, 
  CheckCheck, 
  FileCheck, 
  Filter,
  MessageSquare,
  ShieldCheck,
  Send,
  ArrowRight
} from 'lucide-react';
import { ScheduleItem, UserProfile } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface ApprovalManagementViewProps {
  schedules: ScheduleItem[];
  currentUser: UserProfile;
  onApprove: (id: string) => void;
  onApproveDept?: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onBatchApprove: (ids: string[]) => void;
  onEdit: (item: ScheduleItem) => void;
}

export const ApprovalManagementView: React.FC<ApprovalManagementViewProps> = ({
  schedules,
  currentUser,
  onApprove,
  onApproveDept,
  onReject,
  onBatchApprove,
  onEdit,
}) => {
  const isDeptLeader = currentUser.role === 'LANH_DAO_PHONG';
  const isTownLeader = currentUser.role === 'LANH_DAO' || currentUser.role === 'VAN_PHONG' || currentUser.username === 'admin';

  // Default filter: Dept leaders default to pending_dept; Town leaders default to pending
  const [statusFilter, setStatusFilter] = useState<'pending_dept' | 'pending' | 'approved' | 'rejected' | 'all'>(
    isDeptLeader ? 'pending_dept' : 'pending'
  );
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

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

  // Department leaders primarily oversee their department's schedules
  const myDeptSchedules = isDeptLeader
    ? schedules.filter(s => s.department === currentUser.department)
    : schedules;

  const pendingDeptCount = (isDeptLeader ? myDeptSchedules : schedules).filter(s => s.status === 'pending_dept').length;
  const pendingTownCount = schedules.filter(s => s.status === 'pending').length;

  const filteredList = (isDeptLeader ? myDeptSchedules : schedules).filter(s => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const handleConfirmReject = (id: string) => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối để thông báo cho cán bộ đăng ký');
      return;
    }
    onReject(id, rejectReason.trim());
    setRejectingId(null);
    setRejectReason('');
  };

  const handleApproveAll = () => {
    if (statusFilter === 'pending_dept' && onApproveDept) {
      const ids = filteredList.filter(s => s.status === 'pending_dept').map(s => s.id);
      if (ids.length === 0) return;
      setConfirmModalConfig({
        isOpen: true,
        title: 'Phê Duyệt Cấp Phòng Hàng Loạt',
        message: `Đồng ý phê duyệt cấp phòng cho tất cả ${ids.length} lịch công tác và chuyển lên thẻ phê duyệt chung của UBND xã?`,
        confirmText: 'Phê Duyệt Tất Cả',
        variant: 'primary',
        onConfirm: () => {
          ids.forEach(id => onApproveDept(id));
        },
      });
    } else {
      const ids = filteredList.filter(s => s.status === 'pending').map(s => s.id);
      if (ids.length === 0) return;
      setConfirmModalConfig({
        isOpen: true,
        title: 'Phê Duyệt Chính Thức Hàng Loạt',
        message: `Đồng ý phê duyệt chính thức tất cả ${ids.length} lịch công tác đang chờ để đưa lên Lịch tuần UBND xã?`,
        confirmText: 'Phê Duyệt Tất Cả',
        variant: 'primary',
        onConfirm: () => {
          onBatchApprove(ids);
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-red-700" />
            <span>
              {isDeptLeader 
                ? `Phê Duyệt Lịch Cấp Phòng: ${currentUser.department}`
                : 'Thẩm Tra & Phê Duyệt Lịch Công Tác UBND Xã'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isDeptLeader
              ? 'Lãnh đạo phòng, ban duyệt lịch của chuyên viên phòng trước khi chuyển sang thẻ duyệt chung của UBND xã'
              : 'Quy trình 2 cấp: Chuyên viên đăng ký ➔ Lãnh đạo Phòng duyệt ➔ UBND xã / Văn phòng phê duyệt chính thức'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {((statusFilter === 'pending_dept' && pendingDeptCount > 0) || (statusFilter === 'pending' && pendingTownCount > 0)) && (
            <button
              onClick={handleApproveAll}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Duyệt tất cả</span>
            </button>
          )}

          {/* Filter dropdown */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-md text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
            >
              <option value="pending_dept">Chờ Lãnh đạo Phòng duyệt ({pendingDeptCount})</option>
              <option value="pending">Chờ UBND xã duyệt ({pendingTownCount})</option>
              <option value="approved">Đã phê duyệt</option>
              <option value="rejected">Bị từ chối</option>
              <option value="all">Tất cả trạng thái</option>
            </select>
          </div>
        </div>
      </div>

      {/* Two-level approval guidance pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <button
          onClick={() => setStatusFilter('pending_dept')}
          className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
            statusFilter === 'pending_dept'
              ? 'bg-amber-50/80 border-amber-400 text-amber-950 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold flex items-center space-x-1.5">
                <span>Cấp 1: Chờ Lãnh đạo Phòng duyệt</span>
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black">
                  {pendingDeptCount}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Chuyên viên các phòng đăng ký, chờ Trưởng phòng thẩm định
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
            statusFilter === 'pending'
              ? 'bg-blue-50/80 border-blue-400 text-blue-950 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800 font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold flex items-center space-x-1.5">
                <span>Cấp 2: Chờ UBND Xã phê duyệt</span>
                <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-black">
                  {pendingTownCount}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Đã qua Lãnh đạo phòng duyệt ➔ Sẵn sàng lên lịch tuần chính thức
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* List of items to approve */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Không có lịch công tác nào trong mục này</h3>
          <p className="text-xs text-slate-500 mt-1">
            {statusFilter === 'pending_dept'
              ? 'Không có lịch chuyên viên nào đang chờ Lãnh đạo phòng duyệt.'
              : statusFilter === 'pending'
              ? 'Không có lịch nào đang chờ UBND xã / Văn phòng phê duyệt.'
              : 'Tất cả đề xuất lịch đã được xử lý xong.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => {
            const isPendingDept = item.status === 'pending_dept';
            const isPendingTown = item.status === 'pending';
            const canApproveThisDept = (isDeptLeader && item.department === currentUser.department) || isTownLeader;

            return (
              <div 
                key={item.id} 
                className={`bg-white rounded-xl border transition shadow-xs p-4 sm:p-5 ${
                  isPendingDept
                    ? 'border-amber-300 bg-amber-50/20'
                    : isPendingTown
                    ? 'border-blue-300 bg-blue-50/20'
                    : item.status === 'approved'
                    ? 'border-emerald-200'
                    : 'border-red-200 bg-red-50/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    {/* Status & Department badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                        {item.dayOfWeek} ({item.date}) • {item.session} [{item.time}]
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100 flex items-center space-x-1">
                        <Building2 className="w-3 h-3 text-blue-600" />
                        <span>Đơn vị: {item.department}</span>
                      </span>

                      {/* Status Badges */}
                      {isPendingDept && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Chờ Lãnh đạo Phòng duyệt (Cấp 1)</span>
                        </span>
                      )}

                      {isPendingTown && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white flex items-center space-x-1">
                          <Building2 className="w-3 h-3" />
                          <span>Chờ UBND xã duyệt (Cấp 2)</span>
                        </span>
                      )}

                      {item.status === 'approved' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Đã duyệt (Chính thức)</span>
                        </span>
                      )}

                      {item.status === 'rejected' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white flex items-center space-x-1">
                          <XCircle className="w-3 h-3" />
                          <span>Đã từ chối</span>
                        </span>
                      )}
                    </div>

                    {/* Department Approval Stamp if approved by dept */}
                    {item.deptApprovedBy && (
                      <div className="flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>
                          <b>Đã qua duyệt cấp phòng:</b> Phê duyệt bởi <strong>{item.deptApprovedBy}</strong> {item.deptApprovedAt ? `(${item.deptApprovedAt.substring(0, 10)})` : ''}
                        </span>
                      </div>
                    )}

                    {/* Title / Content */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {item.content}
                    </h3>

                    {/* Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs pt-1">
                      <div className="flex items-center space-x-1.5 text-slate-700 bg-slate-50 px-2 py-1.5 rounded">
                        <User className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                        <span><b>Chủ trì:</b> {item.host}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-700 bg-slate-50 px-2 py-1.5 rounded">
                        <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                        <span><b>Địa điểm:</b> {item.location}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-700 bg-slate-50 px-2 py-1.5 rounded">
                        <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span><b>Đăng ký bởi:</b> {item.createdBy}</span>
                      </div>
                    </div>

                    {/* Attendees */}
                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                      <span className="font-semibold text-slate-800">Thành phần tham dự:</span> {item.attendees}
                    </div>

                    {/* Notes / driver */}
                    {item.notes && (
                      <div className="text-xs text-amber-800 italic bg-amber-50/50 p-2 rounded border border-amber-100">
                        <span className="font-semibold not-italic">Đề xuất/Lưu ý:</span> {item.notes}
                      </div>
                    )}

                    {/* Rejection reason if rejected */}
                    {item.status === 'rejected' && item.rejectionReason && (
                      <div className="text-xs text-red-800 bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold">Lý do từ chối:</span> {item.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Approval action buttons */}
                  <div className="flex sm:flex-col items-center gap-2 pt-2 sm:pt-0 sm:pl-3 sm:border-l border-slate-200 min-w-[140px]">
                    {/* Level 1: Dept Approval Action */}
                    {isPendingDept && (
                      <>
                        <button
                          onClick={() => onApproveDept ? onApproveDept(item.id) : onApprove(item.id)}
                          disabled={!canApproveThisDept}
                          className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                          title="Duyệt chuyển lên thẻ duyệt chung của UBND xã"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Duyệt Cấp Phòng</span>
                        </button>

                        <button
                          onClick={() => setRejectingId(item.id)}
                          className="w-full flex items-center justify-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-xs font-semibold transition border border-red-200 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Từ chối</span>
                        </button>
                      </>
                    )}

                    {/* Level 2: Town (UBND) Approval Action */}
                    {isPendingTown && isTownLeader && (
                      <>
                        <button
                          onClick={() => onApprove(item.id)}
                          className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition shadow-xs cursor-pointer"
                          title="Duyệt phát hành chính thức vào lịch công tác tuần"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Duyệt Phát Hành</span>
                        </button>

                        <button
                          onClick={() => setRejectingId(item.id)}
                          className="w-full flex items-center justify-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-xs font-semibold transition border border-red-200 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Từ chối</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => onEdit(item)}
                      className="w-full px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition cursor-pointer"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                </div>

                {/* Rejection reason input */}
                {rejectingId === item.id && (
                  <div className="mt-3 pt-3 border-t border-slate-200 bg-white p-3 rounded-lg border border-red-300">
                    <label className="block text-xs font-bold text-red-800 mb-1 flex items-center space-x-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Lý do từ chối / Hướng dẫn điều chỉnh:</span>
                    </label>
                    <textarea
                      rows={2}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Ví dụ: Trùng phòng họp hoặc chưa hoàn thiện hồ sơ, đề nghị điều chỉnh..."
                      className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-red-600 focus:outline-none"
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleConfirmReject(item.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold"
                      >
                        Xác nhận từ chối
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
