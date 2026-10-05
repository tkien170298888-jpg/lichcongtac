import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  FileText,
  Car
} from 'lucide-react';
import { ScheduleItem, TaskItem } from '../types';

interface StatisticsViewProps {
  schedules: ScheduleItem[];
  tasks: TaskItem[];
  onExportWord: () => void;
  onExportExcel: () => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  schedules,
  tasks,
  onExportWord,
  onExportExcel,
}) => {
  const currentWeekSchedules = schedules.filter(s => s.weekNumber === 41);
  const approvedSchedules = currentWeekSchedules.filter(s => s.status === 'approved');

  // KPI Calculations
  const totalMeetings = approvedSchedules.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const vehiclesDispatched = approvedSchedules.filter(s => s.driverRequired).length;

  // Host Leader distribution
  const hostCounts: Record<string, number> = {};
  approvedSchedules.forEach(s => {
    const host = s.host.trim();
    hostCounts[host] = (hostCounts[host] || 0) + 1;
  });
  const sortedHosts = Object.entries(hostCounts).sort((a, b) => b[1] - a[1]);

  // Location / Meeting Room utilization
  const locationCounts: Record<string, number> = {};
  approvedSchedules.forEach(s => {
    const loc = s.location.trim();
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });
  const sortedLocations = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]);

  // Department task breakdown
  const deptTaskStats: Record<string, { total: number; completed: number; inProgress: number }> = {};
  tasks.forEach(t => {
    if (!deptTaskStats[t.assignedDepartment]) {
      deptTaskStats[t.assignedDepartment] = { total: 0, completed: 0, inProgress: 0 };
    }
    deptTaskStats[t.assignedDepartment].total += 1;
    if (t.status === 'completed') deptTaskStats[t.assignedDepartment].completed += 1;
    else deptTaskStats[t.assignedDepartment].inProgress += 1;
  });

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Báo Cáo Hiệu Quả & Thống Kê Hoạt Động Điều Hành</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu tổng hợp tuần 41 (05/10/2026 - 09/10/2026) của HĐND & UBND Xã Lao Bảo
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onExportWord}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs font-semibold shadow-xs transition"
          >
            <FileText className="w-4 h-4" />
            <span>Xuất Báo Cáo Word</span>
          </button>
          <button
            onClick={onExportExcel}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Bảng Excel</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-red-50 text-red-700 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalMeetings}</div>
            <div className="text-xs text-slate-500 font-medium">Cuộc họp / phiên làm việc</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{taskCompletionRate}%</div>
            <div className="text-xs text-slate-500 font-medium">Tiến độ nhiệm vụ xong ({completedTasks}/{totalTasks})</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{vehiclesDispatched}</div>
            <div className="text-xs text-slate-500 font-medium">Chuyến xe cơ sở & đối ngoại</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">2</div>
            <div className="text-xs text-slate-500 font-medium">Lịch chờ phê duyệt</div>
          </div>
        </div>
      </div>

      {/* Visual Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Meetings by Host Leader */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center justify-between">
            <span>Phân Bổ Lịch Chủ Trì Của Lãnh Đạo</span>
            <span className="text-xs font-normal text-slate-500">Số phiên</span>
          </h3>

          <div className="space-y-3">
            {sortedHosts.map(([host, count]) => {
              const pct = Math.round((count / totalMeetings) * 100);
              return (
                <div key={host} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 font-semibold">{host}</span>
                    <span className="text-red-700 font-bold">{count} phiên ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-red-700 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Meeting Room & Facility Utilization */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center justify-between">
            <span>Tần Suất Sử Dụng Phòng Họp & Địa Điểm</span>
            <span className="text-xs font-normal text-slate-500">Lượt sử dụng</span>
          </h3>

          <div className="space-y-3">
            {sortedLocations.map(([loc, count]) => {
              const pct = Math.round((count / totalMeetings) * 100);
              return (
                <div key={loc} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 truncate max-w-[240px]">{loc}</span>
                    <span className="text-blue-700 font-bold">{count} lượt</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-700 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Performance by Department */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3">
          Tỷ Lệ Thực Thi Nhiệm Vụ Theo Từng Phòng/Ban
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-2.5 px-3">Phòng Ban / Đơn Vị</th>
                <th className="py-2.5 px-3 text-center">Tổng nhiệm vụ</th>
                <th className="py-2.5 px-3 text-center">Đã hoàn thành</th>
                <th className="py-2.5 px-3 text-center">Đang thực hiện</th>
                <th className="py-2.5 px-3 text-right">Tỉ lệ đạt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(deptTaskStats).map(([dept, stats]) => {
                const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                return (
                  <tr key={dept} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center space-x-2">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>{dept}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{stats.total}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{stats.completed}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-600">{stats.inProgress}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        rate === 100 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : rate >= 50 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
