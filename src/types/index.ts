export type DayOfWeek = 
  | 'Thứ Hai' 
  | 'Thứ Ba' 
  | 'Thứ Tư' 
  | 'Thứ Năm' 
  | 'Thứ Sáu' 
  | 'Thứ Bảy' 
  | 'Chủ Nhật';

export type SessionOfDay = 'Sáng' | 'Chiều';

export type ScheduleStatus = 'draft' | 'pending_dept' | 'pending' | 'approved' | 'rejected';

export type PriorityLevel = 'normal' | 'important' | 'urgent';

export interface ScheduleItem {
  id: string;
  weekNumber: number;
  year: number;
  dayOfWeek: DayOfWeek;
  date: string; // DD/MM/YYYY
  session: SessionOfDay;
  time: string; // e.g. "07h30", "14h00"
  content: string;
  host: string; // Chủ trì: "Đ/c Vũ", "Đ/c Minh", "Đ/c Cường", v.v.
  attendees: string; // Tham dự
  location: string; // Địa điểm
  notes?: string; // Ghi chú: lái xe, tham mưu giấy mời, v.v.
  status: ScheduleStatus;
  department: string; // Đơn vị đăng ký: "VP HĐND & UBND", "Phòng Kinh tế", v.v.
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  priority: PriorityLevel;
  rejectionReason?: string;
  deptApprovedBy?: string; // Tên lãnh đạo phòng duyệt
  deptApprovedAt?: string;
  deptRejectionReason?: string;
  driverRequired?: boolean;
  driverName?: string;
  invitationDocNumber?: string; // Số giấy mời: "3857/GM-UBND"
  attachedFiles?: { name: string; url: string; size?: string }[];
  isOfficial?: boolean; // Lịch chính thức hay dự kiến
}

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';

export interface TaskItem {
  id: string;
  title: string;
  scheduleId?: string; // Gắn với lịch làm việc nào
  assignedDepartment: string;
  assignedOfficer: string;
  supervisor: string; // Lãnh đạo phụ trách
  deadline: string; // YYYY-MM-DD
  progress: number; // 0 - 100%
  status: TaskStatus;
  priority: PriorityLevel;
  notes?: string;
  resultReport?: string;
  lastReportedBy?: string;
  lastReportedAt?: string;
  attachedDocs?: { name: string; url: string }[];
  createdAt: string;
  updatedAt: string;
}

export type RoleType = 
  | 'LANH_DAO'        // Chủ tịch / PCT UBND & HĐND (Phê duyệt, chỉ đạo)
  | 'VAN_PHONG'       // Văn phòng HĐND & UBND (Điều phối, tổng hợp, phát hành, quản lý phòng họp)
  | 'LANH_DAO_PHONG'  // Lãnh đạo Phòng, Ban (Phê duyệt lịch của chuyên viên phòng trước khi chuyển UBND xã)
  | 'CHUYEN_VIEN'     // Chuyên viên / Cán bộ chuyên môn (Đăng ký lịch, nhận nhiệm vụ, báo cáo)
  | 'CONG_KHAI';      // Người dân / Khách (Chỉ xem lịch công khai)

export interface UserProfile {
  id: string;
  name: string;
  role: RoleType;
  title: string; // Chức vụ: "Chủ tịch UBND xã", "Phó Chủ tịch HĐND", v.v.
  department: string;
  avatar?: string;
  email: string;
  phone: string;
  zalo: string;
  username?: string;
  password?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'schedule_approved' | 'schedule_pending' | 'task_assigned' | 'task_reminder' | 'system';
  timestamp: string;
  read: boolean;
  linkId?: string;
  linkTab?: string;
}

export interface SyncSettings {
  googleAppsScriptUrl: string;
  autoSync: boolean;
  lastSyncedAt: string | null;
  syncIntervalMinutes: number;
  offlineQueue: { action: 'create' | 'update' | 'delete'; entity: 'schedule' | 'task'; data: any; timestamp: string }[];
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  role: string;
  timestamp: string;
}
