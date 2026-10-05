import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  Car, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';
import { ScheduleItem, UserProfile, DayOfWeek, SessionOfDay, PriorityLevel, ScheduleStatus } from '../types';
import { DEPARTMENTS, LEADERS_LIST, MEETING_LOCATIONS } from '../data/initialData';
import { getWeekDates, getAvailableWeeks, getWeekRangeText, dateStrToIso, isoToDateStr } from '../utils/dateUtils';

interface ScheduleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ScheduleItem) => void;
  editingItem: ScheduleItem | null;
  currentUser: UserProfile;
  allSchedules: ScheduleItem[];
  defaultWeekNumber?: number;
  departments?: string[];
}

export const ScheduleRegistrationModal: React.FC<ScheduleRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  currentUser,
  allSchedules,
  defaultWeekNumber = 41,
  departments,
}) => {
  const [weekNumber, setWeekNumber] = useState<number>(defaultWeekNumber);
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('Thứ Hai');
  const [date, setDate] = useState<string>('05/10/2026');
  const [session, setSession] = useState<SessionOfDay>('Sáng');
  const [time, setTime] = useState<string>('08h00');
  const [content, setContent] = useState<string>('');
  const [host, setHost] = useState<string>(LEADERS_LIST[0]);
  const [attendees, setAttendees] = useState<string>('');
  const [location, setLocation] = useState<string>(MEETING_LOCATIONS[0]);
  const [notes, setNotes] = useState<string>('');
  const [driverRequired, setDriverRequired] = useState<boolean>(false);
  const [driverName, setDriverName] = useState<string>('Đ/c Vũ (Lái xe VP)');
  const [invitationDocNumber, setInvitationDocNumber] = useState<string>('');
  const [department, setDepartment] = useState<string>(currentUser.department);
  const [priority, setPriority] = useState<PriorityLevel>('normal');

  const availableWeeks = getAvailableWeeks(2026);
  const currentWeekDays = getWeekDates(weekNumber, 2026);

  // Initialize or reset form when opened or editingItem changes
  useEffect(() => {
    if (editingItem) {
      setWeekNumber(editingItem.weekNumber);
      setDayOfWeek(editingItem.dayOfWeek);
      setDate(editingItem.date);
      setSession(editingItem.session);
      setTime(editingItem.time);
      setContent(editingItem.content);
      setHost(editingItem.host);
      setAttendees(editingItem.attendees);
      setLocation(editingItem.location);
      setNotes(editingItem.notes || '');
      setDriverRequired(!!editingItem.driverRequired);
      setDriverName(editingItem.driverName || 'Đ/c Vũ (Lái xe VP)');
      setInvitationDocNumber(editingItem.invitationDocNumber || '');
      setDepartment(editingItem.department);
      setPriority(editingItem.priority);
    } else {
      // Default to the provided defaultWeekNumber or 41
      const initialWeek = defaultWeekNumber || 41;
      setWeekNumber(initialWeek);
      const days = getWeekDates(initialWeek, 2026);
      setDayOfWeek(days[0].dayOfWeek);
      setDate(days[0].dateStr);
      setDepartment(currentUser.department.includes('Phòng') || currentUser.department.includes('Công an') ? currentUser.department : DEPARTMENTS[0]);
      setContent('');
      setAttendees('');
      setNotes('');
      setDriverRequired(false);
      setInvitationDocNumber('');
    }
  }, [editingItem, currentUser, isOpen, defaultWeekNumber]);

  // When weekNumber changes, update date & dayOfWeek to match the selected week's days
  const handleWeekChange = (newWeek: number) => {
    setWeekNumber(newWeek);
    const daysInNewWeek = getWeekDates(newWeek, 2026);
    // Find the matching day of week in the new week, or default to Monday
    const matchedDay = daysInNewWeek.find(d => d.dayOfWeek === dayOfWeek) || daysInNewWeek[0];
    setDayOfWeek(matchedDay.dayOfWeek);
    setDate(matchedDay.dateStr);
  };

  // When a day button in the week strip is clicked
  const handleSelectDay = (day: DayOfWeek, dateStr: string) => {
    setDayOfWeek(day);
    setDate(dateStr);
  };

  // When user picks a date via native date picker
  const handleNativeDateChange = (iso: string) => {
    if (!iso) return;
    const formattedDate = isoToDateStr(iso);
    setDate(formattedDate);
    // Find if this date belongs to any day in the current week
    const matchingDay = currentWeekDays.find(d => d.dateStr === formattedDate);
    if (matchingDay) {
      setDayOfWeek(matchingDay.dayOfWeek);
    } else {
      // Calculate day of week from native date
      const d = new Date(iso);
      const dayNames: DayOfWeek[] = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      setDayOfWeek(dayNames[d.getDay()]);
    }
  };

  // Conflict check with other meetings
  const hasConflict = allSchedules.some(s => {
    if (editingItem && s.id === editingItem.id) return false;
    return s.date === date && 
           s.session === session && 
           s.location === location && 
           !location.includes('Tại các thôn') &&
           s.status === 'approved';
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !attendees.trim()) {
      alert('Vui lòng nhập đầy đủ nội dung công việc và thành phần tham dự');
      return;
    }

    let status: ScheduleStatus;
    if (editingItem) {
      status = editingItem.status;
    } else if (currentUser.role === 'CHUYEN_VIEN') {
      status = 'pending_dept'; // Chờ Lãnh đạo Phòng duyệt trước
    } else if (currentUser.role === 'LANH_DAO_PHONG') {
      status = 'pending'; // Lãnh đạo phòng duyệt đề xuất, chuyển chờ UBND xã duyệt
    } else {
      status = 'approved'; // Lãnh đạo UBND / Văn phòng đăng ký trực tiếp
    }

    const item: ScheduleItem = {
      id: editingItem ? editingItem.id : 'sch_' + Date.now(),
      weekNumber,
      year: 2026,
      dayOfWeek,
      date,
      session,
      time: time.trim(),
      content: content.trim(),
      host,
      attendees: attendees.trim(),
      location,
      notes: notes.trim() || undefined,
      driverRequired,
      driverName: driverRequired ? driverName : undefined,
      invitationDocNumber: invitationDocNumber.trim() || undefined,
      status,
      department,
      createdBy: editingItem ? editingItem.createdBy : currentUser.name,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority,
      isOfficial: status === 'approved',
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-300 rounded-full mx-auto my-1.5 flex-shrink-0" />

        {/* Modal header */}
        <div className="bg-gradient-to-r from-red-800 to-red-700 text-white px-4 sm:px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-lg sm:text-xl">🏛️</span>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {editingItem ? 'Hiệu Chỉnh Lịch Công Tác' : 'Đăng Ký Lịch Công Tác Mới'}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-red-200">
                UBND Xã Lao Bảo • Phê duyệt trực tuyến & Điều phối phòng họp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Room Conflict Alert if detected */}
          {hasConflict && (
            <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-lg flex items-start space-x-2 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold">Cảnh báo trùng phòng: </span>
                Địa điểm "{location}" đã có phiên làm việc khác vào buổi {session} ngày {date}.
              </div>
            </div>
          )}

          {/* DYNAMIC WEEK & DATES SELECTOR (TÙY CHỌN TUẦN VÀ CÁC NGÀY TRONG TUẦN) */}
          <div className="bg-red-50/50 p-3 rounded-xl border border-red-200 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs">
                <CalendarDays className="w-4 h-4 text-red-700" />
                <span>Chọn Tuần công tác:</span>
              </label>

              {/* Week Navigation & Dropdown */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => handleWeekChange(Math.max(1, weekNumber - 1))}
                  className="p-1 hover:bg-white rounded border border-slate-200 text-slate-700 transition"
                  title="Tuần trước"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <select
                  value={weekNumber}
                  onChange={(e) => handleWeekChange(Number(e.target.value))}
                  className="p-1.5 font-bold text-red-800 bg-white border border-red-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
                >
                  {availableWeeks.map(w => (
                    <option key={w.weekNumber} value={w.weekNumber}>
                      {w.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleWeekChange(Math.min(52, weekNumber + 1))}
                  className="p-1 hover:bg-white rounded border border-slate-200 text-slate-700 transition"
                  title="Tuần kế tiếp"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 italic">
              📅 {getWeekRangeText(weekNumber, 2026, false)}
            </div>

            {/* DYNAMIC DAY PILLS FOR THE SELECTED WEEK */}
            <div>
              <span className="block font-semibold text-slate-700 text-[11px] mb-1.5">
                Chọn ngày làm việc trong <span className="text-red-700 font-bold">Tuần {weekNumber}</span>:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {currentWeekDays.slice(0, 5).map((d) => {
                  const isSelected = date === d.dateStr;
                  return (
                    <button
                      key={d.dayOfWeek}
                      type="button"
                      onClick={() => handleSelectDay(d.dayOfWeek, d.dateStr)}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                        isSelected 
                          ? 'bg-red-700 text-white border-red-700 shadow-xs font-bold' 
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs">{d.dayOfWeek}</div>
                      <div className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-amber-200' : 'text-slate-500'}`}>
                        {d.shortDate}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Saturday and Sunday optional toggles */}
              <div className="flex items-center space-x-2 mt-1.5 pt-1 border-t border-red-100">
                <span className="text-[10px] text-slate-500 font-medium">Cuối tuần:</span>
                {currentWeekDays.slice(5).map((d) => {
                  const isSelected = date === d.dateStr;
                  return (
                    <button
                      key={d.dayOfWeek}
                      type="button"
                      onClick={() => handleSelectDay(d.dayOfWeek, d.dateStr)}
                      className={`px-2 py-0.5 rounded text-[11px] border transition cursor-pointer ${
                        isSelected 
                          ? 'bg-red-700 text-white border-red-700 font-bold' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {d.dayOfWeek} ({d.shortDate})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time, Session and Date Confirmation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Ngày đã chọn (DD/MM/YYYY)
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full p-2 border border-slate-300 rounded font-mono font-bold text-red-800 bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Buổi làm việc</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as SessionOfDay)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-red-600 font-medium"
              >
                <option value="Sáng">Buổi Sáng</option>
                <option value="Chiều">Buổi Chiều</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Thời gian (Giờ:Phút)</label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="07h30, 08h00, 14h00..."
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-red-600 font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nội dung công việc / Hội nghị / Phiên làm việc *
            </label>
            <textarea
              rows={3}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ghi rõ nội dung cuộc họp, chương trình làm việc, đơn vị đối tác..."
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Host & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Đồng chí Chủ trì</label>
              <select
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-bold text-blue-900 focus:ring-1 focus:ring-red-600"
              >
                {LEADERS_LIST.map(l => (
                  <option key={l} value={l.split(' ')[0] + ' ' + l.split(' ')[1]}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Địa điểm tổ chức</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-red-600"
              >
                {MEETING_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Thành phần tham dự *
            </label>
            <textarea
              rows={2}
              required
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="Ví dụ: Đ/c Bảo, Đ/c Nga, Lãnh đạo các phòng ban liên quan, Trưởng thôn..."
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-red-600"
            />
          </div>

          {/* Department & Doc Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Đơn vị tham mưu / đăng ký</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-red-600"
              >
                {(departments || DEPARTMENTS).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Số Giấy mời (nếu có)</label>
              <input
                type="text"
                value={invitationDocNumber}
                onChange={(e) => setInvitationDocNumber(e.target.value)}
                placeholder="VD: 3857/GM-UBND ngày 02/10/2026"
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-red-600 font-mono"
              />
            </div>
          </div>

          {/* Notes & Vehicle Dispatch */}
          <div className="space-y-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ghi chú bổ sung (chuẩn bị tài liệu, maket...)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Lái xe (đ/c Vũ), Ban CHQS tham mưu GM..."
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-red-600"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={driverRequired}
                  onChange={(e) => setDriverRequired(e.target.checked)}
                  className="rounded text-red-700 focus:ring-red-600 w-4 h-4"
                />
                <span className="font-semibold text-slate-800 flex items-center space-x-1">
                  <Car className="w-3.5 h-3.5 text-blue-600" />
                  <span>Yêu cầu bố trí xe ô tô công vụ</span>
                </span>
              </label>

              {driverRequired && (
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Lái xe phụ trách"
                  className="flex-1 p-1.5 border border-slate-300 rounded text-xs bg-white"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <span className="text-[11px] text-slate-500 italic">
              {currentUser.role === 'LANH_DAO' || currentUser.role === 'VAN_PHONG' 
                ? '★ Quyền Lãnh đạo/Văn phòng: Lịch sẽ được duyệt chính thức'
                : 'Lịch đăng ký sẽ chuyển đến Văn phòng HĐND & UBND để thẩm tra'}
            </span>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded font-medium cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-red-700 hover:bg-red-800 text-white rounded-lg shadow-xs transition cursor-pointer"
              >
                {editingItem ? 'Lưu Thay Đổi' : `Đăng Ký Vào Tuần ${weekNumber}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
