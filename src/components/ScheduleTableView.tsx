import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  MapPin, 
  User, 
  Car, 
  FileText, 
  Edit3, 
  Trash2, 
  Share2, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Table as TableIcon,
  FileSpreadsheet
} from 'lucide-react';
import { ScheduleItem, UserProfile, DayOfWeek } from '../types';
import { getWeekDates, getWeekRangeText, getAvailableWeeks } from '../utils/dateUtils';

interface ScheduleTableViewProps {
  schedules: ScheduleItem[];
  currentUser: UserProfile;
  onEditSchedule: (item: ScheduleItem) => void;
  onDeleteSchedule: (id: string) => void;
  onOpenRegisterModal: () => void;
  onOpenShareZalo: (item?: ScheduleItem) => void;
  selectedWeek: number;
  setSelectedWeek: (week: number) => void;
  onExportExcel?: () => void;
}

export const ScheduleTableView: React.FC<ScheduleTableViewProps> = ({
  schedules,
  currentUser,
  onEditSchedule,
  onDeleteSchedule,
  onOpenRegisterModal,
  onOpenShareZalo,
  selectedWeek,
  setSelectedWeek,
  onExportExcel,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [filterHost, setFilterHost] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all'); // Mobile day pills
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  
  // Default to cards on smaller viewports, table on desktop
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'cards';
    }
    return 'table';
  });

  const availableWeeks = useMemo(() => getAvailableWeeks(selectedYear), [selectedYear]);
  const weekDays = useMemo(() => getWeekDates(selectedWeek, selectedYear), [selectedWeek, selectedYear]);
  const weekRangeText = useMemo(() => getWeekRangeText(selectedWeek, selectedYear, false), [selectedWeek, selectedYear]);

  // Day filter definitions dynamically computed for the active week
  const dayPills = useMemo(() => {
    return [
      { id: 'all', label: 'Tất cả', short: 'Tất cả', date: '' },
      ...weekDays.slice(0, 5).map(d => ({
        id: d.dayOfWeek,
        label: d.dayOfWeek,
        short: d.dayOfWeek === 'Thứ Hai' ? 'T2' : d.dayOfWeek === 'Thứ Ba' ? 'T3' : d.dayOfWeek === 'Thứ Tư' ? 'T4' : d.dayOfWeek === 'Thứ Năm' ? 'T5' : 'T6',
        date: d.shortDate
      }))
    ];
  }, [weekDays]);

  const daysOfWeek: DayOfWeek[] = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

  // Filter schedules
  const filteredList = useMemo(() => {
    return schedules.filter(item => {
      if (item.weekNumber !== selectedWeek || item.year !== selectedYear) return false;
      if (item.status !== 'approved') return false; // Official schedule only
      if (selectedDayFilter !== 'all' && item.dayOfWeek !== selectedDayFilter) return false;
      if (filterHost !== 'all' && !item.host.includes(filterHost)) return false;
      if (filterLocation !== 'all' && item.location !== filterLocation) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const inContent = item.content.toLowerCase().includes(query);
        const inHost = item.host.toLowerCase().includes(query);
        const inAttendees = item.attendees.toLowerCase().includes(query);
        const inLocation = item.location.toLowerCase().includes(query);
        if (!inContent && !inHost && !inAttendees && !inLocation) return false;
      }
      return true;
    });
  }, [schedules, selectedWeek, selectedYear, selectedDayFilter, filterHost, filterLocation, searchQuery]);

  // Conflict detection: Same date, session and location with overlapping time
  const conflicts = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    filteredList.forEach(item => {
      const key = `${item.date}_${item.session}_${item.location}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    const conflictIds = new Set<string>();
    map.forEach(items => {
      if (items.length > 1 && !items[0].location.includes('Tại các thôn')) {
        items.forEach(it => conflictIds.add(it.id));
      }
    });
    return conflictIds;
  }, [filteredList]);

  // Unique hosts and locations for filter dropdowns
  const hosts = useMemo(() => {
    const set = new Set<string>();
    schedules.forEach(s => set.add(s.host.trim()));
    return Array.from(set);
  }, [schedules]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    schedules.forEach(s => set.add(s.location.trim()));
    return Array.from(set);
  }, [schedules]);

  const canEdit = currentUser.role === 'LANH_DAO' || currentUser.role === 'VAN_PHONG';

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Week Selector & Quick Mode Switcher */}
      <div className="bg-white p-2.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Week switcher with dropdown */}
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                className="p-1 sm:p-1.5 hover:bg-white rounded text-slate-700 transition cursor-pointer"
                title="Tuần trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="bg-transparent font-bold text-red-800 text-xs sm:text-sm focus:outline-none cursor-pointer px-1 py-0.5"
              >
                {availableWeeks.map(w => (
                  <option key={w.weekNumber} value={w.weekNumber}>
                    {w.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setSelectedWeek(Math.min(52, selectedWeek + 1))}
                className="p-1 sm:p-1.5 hover:bg-white rounded text-slate-700 transition cursor-pointer"
                title="Tuần kế tiếp"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 'Tuần này' Button */}
            <button
              onClick={() => setSelectedWeek(41)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer ${
                selectedWeek === 41 
                  ? 'bg-red-700 text-white shadow-xs' 
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
              }`}
              title="Quay lại nhanh tuần hiện tại (Tuần 41)"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{selectedWeek === 41 ? 'Tuần này' : 'Về Tuần này (T41)'}</span>
            </button>
          </div>

          {/* Action buttons: Excel Export & View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Quick Export Excel button */}
            {onExportExcel && (
              <button
                onClick={onExportExcel}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                title={`Xuất lịch công tác Tuần ${selectedWeek} ra file Excel (.xls)`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                <span>Xuất Excel</span>
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md transition ${
                  viewMode === 'cards' ? 'bg-white text-red-700 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Thẻ di động</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md transition ${
                  viewMode === 'table' ? 'bg-white text-red-700 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Bảng công văn</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Day Strip */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none -mx-1 px-1">
          {dayPills.map(p => {
            const count = p.id === 'all' 
              ? schedules.filter(s => s.weekNumber === selectedWeek && s.status === 'approved').length
              : schedules.filter(s => s.weekNumber === selectedWeek && s.dayOfWeek === p.id && s.status === 'approved').length;

            const isSelected = selectedDayFilter === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedDayFilter(p.id)}
                className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 cursor-pointer border ${
                  isSelected 
                    ? 'bg-red-700 text-white border-red-700 shadow-xs' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{p.short}</span>
                {p.date && <span className={`text-[10px] ${isSelected ? 'text-red-200' : 'text-slate-400'}`}>({p.date})</span>}
                <span className={`text-[10px] px-1 rounded-full font-bold ml-0.5 ${
                  isSelected ? 'bg-red-900 text-amber-200' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Host Filter (Mobile Friendly Collapse) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm việc, chủ trì, phòng họp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 focus:bg-white"
            />
          </div>

          <select
            value={filterHost}
            onChange={(e) => setFilterHost(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả Lãnh đạo chủ trì</option>
            {hosts.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none truncate"
          >
            <option value="all">Tất cả Địa điểm họp</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Room conflict warning banner if any */}
      {conflicts.size > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-2.5 rounded-lg flex items-center space-x-2 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Cảnh báo trùng phòng: </span>
            Có {conflicts.size} phiên làm việc cùng xếp trùng địa điểm trong tuần.
          </div>
        </div>
      )}

      {/* Main Administrative Document Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden p-3 sm:p-6 print:border-none print:shadow-none print:p-0">
        {/* Official Header */}
        <div className="text-center pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-slate-200">
          <div className="inline-block bg-red-50 text-red-800 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider mb-1 sm:mb-2">
            HĐND VÀ UBND XÃ LAO BẢO
          </div>
          <h2 className="text-base sm:text-2xl font-black text-red-700 uppercase tracking-tight">
            LỊCH CÔNG TÁC TUẦN {selectedWeek}
          </h2>
          <h3 className="text-xs sm:text-base font-bold text-blue-900 uppercase mt-0.5">
            CỦA LÃNH ĐẠO HĐND VÀ UBND XÃ LAO BẢO (Chính thức)
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-600 italic mt-0.5 font-serif">
            {weekRangeText}
          </p>
          <div className="text-amber-500 font-bold text-xs tracking-widest mt-0.5">*****</div>
        </div>

        {/* View Mode: Responsive Mobile Cards (Default on mobile) */}
        {viewMode === 'cards' ? (
          <div className="space-y-3">
            {filteredList.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50/70 border border-dashed border-slate-300 rounded-xl space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-800 text-sm">
                  Tuần {selectedWeek} ({weekRangeText}) chưa có lịch công tác chính thức
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Các phòng ban có thể đăng ký lịch làm việc mới cho Tuần {selectedWeek} để trình Lãnh đạo UBND xã phê duyệt.
                </p>
                {currentUser.role !== 'CONG_KHAI' && (
                  <button
                    onClick={onOpenRegisterModal}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer mt-1"
                  >
                    <span>+ Đăng ký lịch cho Tuần {selectedWeek}</span>
                  </button>
                )}
              </div>
            ) : (
              daysOfWeek.map((day) => {
                const daySchedules = filteredList.filter(s => s.dayOfWeek === day);
                if (daySchedules.length === 0) return null;
                const dateStr = daySchedules[0]?.date || '';

                return (
                  <div key={day} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-slate-50/40">
                    {/* Day Group Header */}
                    <div className="bg-gradient-to-r from-red-800 to-red-700 text-white px-3 py-2 flex items-center justify-between sticky top-12 z-20">
                      <div className="font-bold flex items-center space-x-1.5 text-xs sm:text-sm">
                        <span>{day}</span>
                        <span className="text-red-200 font-normal text-[11px]">({dateStr})</span>
                      </div>
                      <span className="text-[10px] bg-red-900/80 px-2 py-0.5 rounded-full font-semibold">
                        {daySchedules.length} sự kiện
                      </span>
                    </div>

                    {/* Cards within the day */}
                    <div className="p-2 sm:p-3 space-y-2">
                      {daySchedules.map((item) => {
                        const isConflict = conflicts.has(item.id);
                        const isExpanded = !!expandedCards[item.id];

                        return (
                          <div 
                            key={item.id} 
                            className={`bg-white p-3 rounded-lg border transition shadow-2xs space-y-2 ${
                              isConflict ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
                            }`}
                          >
                            {/* Card Header: Session, Time & Actions */}
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center space-x-1.5">
                                <span className="px-2 py-0.5 bg-red-50 text-red-800 border border-red-200 rounded-md font-black text-xs font-mono">
                                  {item.time}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  item.session === 'Sáng' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                                }`}>
                                  {item.session}
                                </span>
                              </div>

                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => onOpenShareZalo(item)}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                                  title="Chia sẻ Zalo"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                                {canEdit && (
                                  <>
                                    <button
                                      onClick={() => onEditSchedule(item)}
                                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                                      title="Sửa"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => onDeleteSchedule(item.id)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                                      title="Xóa"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Meeting Content */}
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                              {item.content}
                            </h4>

                            {/* Host and Location Pills */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs pt-0.5">
                              <div className="flex items-center space-x-1.5 text-blue-900 font-bold bg-blue-50/80 px-2 py-1 rounded">
                                <User className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                                <span>Chủ trì: {item.host}</span>
                              </div>
                              <div className="flex items-center space-x-1.5 text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                                <span className="truncate">{item.location}</span>
                              </div>
                            </div>

                            {/* Driver notice if any */}
                            {item.driverRequired && (
                              <div className="flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-medium">
                                <Car className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                <span>Xe công vụ: {item.driverName || 'Có lái xe cơ quan'}</span>
                              </div>
                            )}

                            {/* Invitation doc number */}
                            {item.invitationDocNumber && (
                              <div className="text-[11px] text-blue-700 flex items-center space-x-1 font-mono">
                                <FileText className="w-3 h-3 text-blue-600" />
                                <span>Theo GM: {item.invitationDocNumber}</span>
                              </div>
                            )}

                            {/* Expandable Attendees Section (keeps cards compact on mobile!) */}
                            <div className="pt-1">
                              <button
                                onClick={() => toggleExpand(item.id)}
                                className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-100 transition"
                              >
                                <span>
                                  Thành phần tham dự: <b>{item.attendees.split(',')[0]}...</b>
                                </span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>

                              {isExpanded && (
                                <div className="mt-1.5 text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 space-y-1">
                                  <div className="font-semibold text-slate-800">Danh sách mời tham dự:</div>
                                  <p className="leading-relaxed">{item.attendees}</p>
                                  {item.notes && (
                                    <div className="pt-1 border-t border-slate-200 text-amber-800 italic text-[11px]">
                                      <b>Lưu ý:</b> {item.notes}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* View Mode: Official Document Table (with scroll hint on mobile) */
          <div>
            <div className="md:hidden text-[10px] text-slate-500 italic mb-1 flex items-center justify-end space-x-1">
              <span>👉 Vuốt ngang để xem toàn bộ các cột</span>
            </div>
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="w-full min-w-[700px] border-collapse border border-slate-300 text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="border border-slate-300 px-2.5 py-2 text-center w-24">Thứ ngày</th>
                    <th className="border border-slate-300 px-2 py-2 text-center w-16">Buổi</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">Nội dung công việc</th>
                    <th className="border border-slate-300 px-2 py-2 text-center w-24">Chủ trì</th>
                    <th className="border border-slate-300 px-2.5 py-2 text-left w-56">Tham dự</th>
                    <th className="border border-slate-300 px-2.5 py-2 text-left w-44">Địa điểm</th>
                    <th className="border border-slate-300 px-2 py-2 text-left w-24">Ghi chú</th>
                    {canEdit && (
                      <th className="border border-slate-300 px-2 py-2 text-center w-14 print:hidden">Tác vụ</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {daysOfWeek.map((day) => {
                    const daySchedules = filteredList.filter(s => s.dayOfWeek === day);
                    if (daySchedules.length === 0) return null;

                    const dateStr = daySchedules[0]?.date || '';
                    const totalRowsForDay = daySchedules.length;

                    return (
                      <React.Fragment key={day}>
                        {daySchedules.map((item, idx) => {
                          const isConflict = conflicts.has(item.id);
                          return (
                            <tr 
                              key={item.id} 
                              className={`hover:bg-amber-50/40 transition border-b border-slate-300 ${
                                isConflict ? 'bg-amber-50/70' : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30')
                              }`}
                            >
                              {idx === 0 && (
                                <td 
                                  rowSpan={totalRowsForDay} 
                                  className="border border-slate-300 px-2 py-3 text-center align-top bg-slate-50/80 font-bold text-slate-900"
                                >
                                  <div className="text-red-800 text-xs sm:text-sm">{day}</div>
                                  <div className="text-[10px] text-slate-500 font-normal">{dateStr}</div>
                                </td>
                              )}

                              <td className="border border-slate-300 px-1.5 py-3 text-center align-top font-semibold text-slate-800">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] ${
                                  item.session === 'Sáng' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                                }`}>
                                  {item.session}
                                </span>
                              </td>

                              <td className="border border-slate-300 px-2.5 py-3 align-top leading-relaxed">
                                <div className="flex items-baseline space-x-1">
                                  <span className="font-bold text-red-700 whitespace-nowrap">- {item.time}:</span>
                                  <span className="font-medium text-slate-900">{item.content}</span>
                                </div>
                                {item.invitationDocNumber && (
                                  <div className="mt-1 text-[10px] text-blue-700 flex items-center space-x-1 font-mono">
                                    <FileText className="w-3 h-3" />
                                    <span>Theo GM: {item.invitationDocNumber}</span>
                                  </div>
                                )}
                              </td>

                              <td className="border border-slate-300 px-2 py-3 text-center align-top font-bold text-blue-900">
                                {item.host}
                              </td>

                              <td className="border border-slate-300 px-2.5 py-3 align-top text-slate-700 leading-normal text-xs">
                                {item.attendees}
                              </td>

                              <td className="border border-slate-300 px-2.5 py-3 align-top text-slate-800 text-xs">
                                {item.location}
                              </td>

                              <td className="border border-slate-300 px-2 py-3 align-top text-slate-600 italic text-[11px]">
                                {item.driverRequired && (
                                  <span className="text-emerald-700 font-semibold not-italic block mb-0.5">
                                    {item.driverName || 'Lái xe'}
                                  </span>
                                )}
                                {item.notes}
                              </td>

                              {canEdit && (
                                <td className="border border-slate-300 px-1 py-3 text-center align-top print:hidden">
                                  <div className="flex items-center justify-center space-x-1">
                                    <button
                                      onClick={() => onOpenShareZalo(item)}
                                      className="p-1 text-slate-500 hover:text-blue-600 rounded"
                                    >
                                      <Share2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => onEditSchedule(item)}
                                      className="p-1 text-slate-500 hover:text-amber-600 rounded cursor-pointer"
                                      title="Chỉnh sửa lịch"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => onDeleteSchedule(item.id)}
                                      className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                                      title="Xóa phiên lịch này"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Administrative Official Footer Note */}
        <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-700">
          <p className="italic leading-relaxed font-serif text-[11px] sm:text-xs">
            <span className="font-bold not-italic text-red-800">Ghi chú:</span> Một số nội dung phiên họp, làm việc khi lịch có bổ sung, đề nghị các phòng, ban, trung tâm có liên quan tham mưu kịp thời giấy mời, chuẩn bị nội dung, chương trình chu đáo, theo đúng chỉ đạo của đồng chí lãnh đạo UBND xã trực tiếp chủ trì.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pt-2">
            <div className="text-[11px] text-slate-600 space-y-0.5">
              <div className="font-bold text-slate-800 italic">Nơi nhận:</div>
              <div>- Thường trực Đảng ủy (b/c);</div>
              <div>- TT HĐND, UBND xã;</div>
              <div>- Các ban, ngành, thôn bản;</div>
              <div>- Lưu: VT, VP.</div>
            </div>

            <div className="text-center w-full sm:w-56 mt-2 sm:mt-0">
              <div className="font-bold uppercase text-slate-900 text-xs">
                TM. THƯỜNG TRỰC UBND XÃ
              </div>
              <div className="font-bold uppercase text-red-800 text-xs mt-0.5">
                CHỦ TỊCH
              </div>
              <div className="h-10 sm:h-12 flex items-center justify-center">
                <span className="inline-block text-[10px] font-serif italic text-red-700 border border-red-200 px-2 py-0.5 rounded bg-red-50/50">
                  (Đã ký số điện tử)
                </span>
              </div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                Nguyễn Văn Vũ
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
