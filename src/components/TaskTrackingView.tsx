import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Building2, 
  User, 
  Calendar, 
  Paperclip, 
  Search, 
  Filter, 
  Sliders, 
  Edit3, 
  Trash2,
  ExternalLink,
  FileCheck2,
  Send,
  X,
  FileText
} from 'lucide-react';
import { TaskItem, UserProfile, PriorityLevel, TaskStatus } from '../types';
import { DEPARTMENTS, LEADERS_LIST } from '../data/initialData';

interface TaskTrackingViewProps {
  tasks: TaskItem[];
  currentUser: UserProfile;
  onAddTask: (task: TaskItem) => void;
  onUpdateTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskTrackingView: React.FC<TaskTrackingViewProps> = ({
  tasks,
  currentUser,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Specialist progress report modal state
  const [reportingTask, setReportingTask] = useState<TaskItem | null>(null);
  const [reportProgress, setReportProgress] = useState<number>(0);
  const [reportContent, setReportContent] = useState<string>('');
  const [reportDocName, setReportDocName] = useState<string>('');
  const [reportNote, setReportNote] = useState<string>('');

  // Form State
  const [title, setTitle] = useState('');
  const [assignedDepartment, setAssignedDepartment] = useState(DEPARTMENTS[0]);
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [supervisor, setSupervisor] = useState(LEADERS_LIST[0]);
  const [deadline, setDeadline] = useState('2026-10-10');
  const [progress, setProgress] = useState(0);
  const [priority, setPriority] = useState<PriorityLevel>('important');
  const [notes, setNotes] = useState('');
  const [docName, setDocName] = useState('');

  const openReportModal = (task: TaskItem) => {
    setReportingTask(task);
    setReportProgress(task.progress);
    setReportContent(task.resultReport || '');
    setReportDocName(task.attachedDocs?.[0]?.name || '');
    setReportNote(task.notes || '');
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingTask) return;

    const calculatedStatus: TaskStatus = reportProgress >= 100 
      ? 'completed' 
      : reportProgress > 0 
      ? 'in_progress' 
      : 'not_started';

    const updatedDocs = reportDocName.trim() 
      ? [{ name: reportDocName.trim(), url: '#' }] 
      : reportingTask.attachedDocs;

    const updatedTask: TaskItem = {
      ...reportingTask,
      progress: reportProgress,
      status: calculatedStatus,
      resultReport: reportContent.trim(),
      lastReportedBy: `${currentUser.name} (${currentUser.title})`,
      lastReportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: reportNote.trim() || reportingTask.notes,
      attachedDocs: updatedDocs,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onUpdateTask(updatedTask);
    setReportingTask(null);
  };

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setAssignedDepartment(currentUser.department.includes('Phòng') ? currentUser.department : DEPARTMENTS[0]);
    setAssignedOfficer(currentUser.name);
    setSupervisor(LEADERS_LIST[0]);
    setDeadline('2026-10-10');
    setProgress(0);
    setPriority('important');
    setNotes('');
    setDocName('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setTitle(task.title);
    setAssignedDepartment(task.assignedDepartment);
    setAssignedOfficer(task.assignedOfficer);
    setSupervisor(task.supervisor);
    setDeadline(task.deadline);
    setProgress(task.progress);
    setPriority(task.priority);
    setNotes(task.notes || '');
    setDocName(task.attachedDocs?.[0]?.name || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedOfficer.trim()) {
      alert('Vui lòng nhập đầy đủ tên nhiệm vụ và cán bộ phụ trách');
      return;
    }

    const calculatedStatus: TaskStatus = progress >= 100 
      ? 'completed' 
      : progress > 0 
      ? 'in_progress' 
      : 'not_started';

    const attachedDocs = docName.trim() ? [{ name: docName.trim(), url: '#' }] : [];

    if (editingTask) {
      const updated: TaskItem = {
        ...editingTask,
        title: title.trim(),
        assignedDepartment,
        assignedOfficer: assignedOfficer.trim(),
        supervisor,
        deadline,
        progress,
        status: calculatedStatus,
        priority,
        notes: notes.trim(),
        attachedDocs,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      onUpdateTask(updated);
    } else {
      const newTask: TaskItem = {
        id: 'task_' + Date.now(),
        title: title.trim(),
        assignedDepartment,
        assignedOfficer: assignedOfficer.trim(),
        supervisor,
        deadline,
        progress,
        status: calculatedStatus,
        priority,
        notes: notes.trim(),
        attachedDocs,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      onAddTask(newTask);
    }

    setIsModalOpen(false);
  };

  const handleQuickProgressChange = (task: TaskItem, newProgress: number) => {
    const updatedStatus: TaskStatus = newProgress >= 100 
      ? 'completed' 
      : newProgress > 0 
      ? 'in_progress' 
      : 'not_started';

    onUpdateTask({
      ...task,
      progress: newProgress,
      status: updatedStatus,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  const filteredTasks = tasks.filter(t => {
    if (filterDepartment !== 'all' && t.assignedDepartment !== filterDepartment) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.assignedOfficer.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const canManage = currentUser.role === 'LANH_DAO' || currentUser.role === 'VAN_PHONG' || currentUser.username === 'admin';

  return (
    <div className="space-y-4">
      {/* Read-only notification for specialist */}
      {currentUser.role === 'CHUYEN_VIEN' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center space-x-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-blue-700 flex-shrink-0" />
          <span>
            <strong>Chế độ xem dành cho Chuyên viên:</strong> Bạn có quyền xem danh sách nhiệm vụ được giao và hạn xử lý (chế độ chỉ xem, không có quyền sửa). Thẩm quyền giao việc và điều chỉnh tiến độ do Lãnh đạo hoặc Văn phòng thực hiện.
          </span>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span>Theo Dõi Nhiệm Vụ & Tiến Độ Văn Bản Kết Luận</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý việc thực thi các chỉ đạo sau các cuộc họp và giao ban tuần của UBND xã
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Giao Nhiệm Vụ Mới</span>
          </button>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:flex-initial">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên nhiệm vụ, cán bộ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700"
        >
          <option value="all">Tất cả Phòng Ban</option>
          {DEPARTMENTS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="in_progress">Đang thực hiện</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="not_started">Chưa bắt đầu</option>
        </select>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredTasks.map((task) => {
          const isCompleted = task.status === 'completed';
          return (
            <div 
              key={task.id} 
              className={`bg-white rounded-xl border p-4 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                isCompleted ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
              }`}
            >
              <div className="space-y-2.5">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    task.priority === 'urgent'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : task.priority === 'important'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {task.priority === 'urgent' ? '⚡ Khẩn' : task.priority === 'important' ? '★ Quan trọng' : 'Thường'}
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center space-x-1 ${
                    isCompleted 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : task.progress > 0 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-blue-600" />}
                    <span>{isCompleted ? 'Hoàn thành' : task.progress > 0 ? `Đang làm (${task.progress}%)` : 'Chưa làm'}</span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {task.title}
                </h3>

                {/* Meta details */}
                <div className="space-y-1 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span><b>Đơn vị:</b> {task.assignedDepartment}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span><b>Phụ trách:</b> {task.assignedOfficer} • <b>Chỉ đạo:</b> {task.supervisor}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                    <span><b>Hạn xử lý:</b> <span className="font-semibold text-red-700">{task.deadline}</span></span>
                  </div>
                </div>

                {/* Notes or result report */}
                {task.notes && (
                  <p className="text-xs text-slate-600 italic">
                    <span className="font-semibold not-italic text-slate-700">Ghi chú:</span> {task.notes}
                  </p>
                )}

                {task.resultReport && (
                  <div className="text-xs bg-emerald-50/90 text-emerald-950 p-2.5 rounded-lg border border-emerald-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-800 text-[11px]">
                      <span className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>Báo cáo tiến độ thực hiện:</span>
                      </span>
                      {task.lastReportedAt && (
                        <span className="text-[10px] text-emerald-700 font-normal">{task.lastReportedAt}</span>
                      )}
                    </div>
                    <p className="text-slate-800 leading-relaxed text-xs">{task.resultReport}</p>
                    {task.lastReportedBy && (
                      <div className="text-[10px] text-slate-500 italic text-right">
                        Người báo cáo: {task.lastReportedBy}
                      </div>
                    )}
                  </div>
                )}

                {/* Attached docs */}
                {task.attachedDocs && task.attachedDocs.length > 0 && (
                  <div className="flex items-center space-x-1 text-xs text-blue-700">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="font-semibold underline cursor-pointer">{task.attachedDocs[0].name}</span>
                  </div>
                )}
              </div>

              {/* Progress Slider & Fast Actions */}
              <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Tiến độ công việc:</span>
                  <span className="text-blue-700 font-bold">{task.progress}%</span>
                </div>

                {/* Progress bar and slider */}
                {canManage ? (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={task.progress}
                    onChange={(e) => handleQuickProgressChange(task, Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                ) : (
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        task.progress === 100 ? 'bg-emerald-500' : task.progress >= 50 ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  {canManage ? (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleQuickProgressChange(task, 100)}
                        disabled={isCompleted}
                        className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 disabled:opacity-50 cursor-pointer"
                      >
                        ✓ Xong 100%
                      </button>
                      <button
                        onClick={() => handleQuickProgressChange(task, 50)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 disabled:opacity-50 cursor-pointer"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => openReportModal(task)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded border border-indigo-200 cursor-pointer flex items-center space-x-1"
                        title="Báo cáo tiến độ"
                      >
                        <FileCheck2 className="w-3 h-3" />
                        <span>Báo cáo</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openReportModal(task)}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[11px] font-bold shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Báo Cáo Tiến Độ</span>
                    </button>
                  )}

                  {canManage && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1 text-slate-500 hover:text-blue-600 rounded cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <span>{editingTask ? 'Chỉnh Sửa Nhiệm Vụ' : 'Giao Nhiệm Vụ & Theo Dõi Tiến Độ'}</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên nội dung nhiệm vụ / văn bản chỉ đạo *</label>
                <textarea
                  rows={2}
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Hoàn tất trích lục bản đồ địa chính phục vụ hội nghị điện gió..."
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn vị chủ trì thực hiện</label>
                  <select
                    value={assignedDepartment}
                    onChange={(e) => setAssignedDepartment(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cán bộ phụ trách chính *</label>
                  <input
                    type="text"
                    required
                    value={assignedOfficer}
                    onChange={(e) => setAssignedOfficer(e.target.value)}
                    placeholder="Họ và tên cán bộ"
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lãnh đạo chỉ đạo</label>
                  <select
                    value={supervisor}
                    onChange={(e) => setSupervisor(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                  >
                    {LEADERS_LIST.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn chót hoàn thành (Deadline)</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức độ ưu tiên</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="normal">Bình thường</option>
                    <option value="important">Quan trọng</option>
                    <option value="urgent">Khẩn cấp</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tiến độ hiện tại ({progress}%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên tài liệu / Văn bản đính kèm</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Ví dụ: GiayMoi_3857_UBND.pdf"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú / Yêu cầu cụ thể</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Lưu ý các bước triển khai..."
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded transition shadow-xs cursor-pointer"
                >
                  {editingTask ? 'Cập nhật' : 'Tạo nhiệm vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Specialist Progress Report Modal */}
      {reportingTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-700 text-white px-4 sm:px-5 py-3.5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm sm:text-base">
                  Báo Cáo Tiến Độ Thực Hiện Nhiệm Vụ
                </h3>
              </div>
              <button
                onClick={() => setReportingTask(null)}
                className="p-1 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleReportSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* Task summary info */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Nhiệm vụ được giao:
                </div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                  {reportingTask.title}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1.5 border-t border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-700">Lãnh đạo chỉ đạo:</span> {reportingTask.supervisor}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Hạn xử lý:</span> <span className="text-red-700 font-bold">{reportingTask.deadline}</span>
                  </div>
                </div>
              </div>

              {/* Progress Slider and presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">
                    Tiến độ hoàn thành: <span className="text-blue-700 text-sm font-black">{reportProgress}%</span>
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    reportProgress === 100 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : reportProgress > 0 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {reportProgress === 100 ? '✓ Đã hoàn thành' : reportProgress > 0 ? 'Đang triển khai' : 'Chưa bắt đầu'}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={reportProgress}
                  onChange={(e) => setReportProgress(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />

                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[25, 50, 75, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setReportProgress(val)}
                      className={`py-1 rounded text-center font-bold text-[11px] border transition cursor-pointer ${
                        reportProgress === val
                          ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {val === 100 ? '✓ Xong 100%' : `${val}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Report content */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung báo cáo kết quả / Diễn biến công việc *
                </label>
                <textarea
                  rows={4}
                  required
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="Nêu tóm tắt kết quả đã thực hiện, cơ quan/đơn vị đã phối hợp, văn bản đã tham mưu ban hành..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs leading-relaxed"
                />
              </div>

              {/* Result attachment doc name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên tài liệu / Văn bản kết quả đính kèm (nếu có)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={reportDocName}
                    onChange={(e) => setReportDocName(e.target.value)}
                    placeholder="Ví dụ: Dự thảo Tờ trình số 45/TTr-UBND, Báo cáo ngày 05/10/2026..."
                    className="w-full pl-8.5 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Difficulties / Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Khó khăn, vướng mắc & Kiến nghị Lãnh đạo chỉ đạo (nếu có)
                </label>
                <textarea
                  rows={2}
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Ghi nhận các khó khăn tại thôn bản, vướng mắc vượt thẩm quyền cần chỉ đạo..."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReportingTask(null)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Báo Cáo Tiến Độ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
