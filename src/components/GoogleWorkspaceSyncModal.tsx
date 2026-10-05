import React, { useState } from 'react';
import { 
  Cloud, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Download, 
  Upload, 
  Database,
  FileSpreadsheet,
  Server
} from 'lucide-react';
import { SyncSettings, ScheduleItem, TaskItem } from '../types';
import { APPS_SCRIPT_TEMPLATE, testAppsScriptConnection } from '../services/googleAppsScriptService';

interface GoogleWorkspaceSyncViewProps {
  settings: SyncSettings;
  onUpdateSettings: (settings: SyncSettings) => void;
  onManualSync: () => Promise<void>;
  schedules: ScheduleItem[];
  tasks: TaskItem[];
  onImportBackup: (data: { schedules: ScheduleItem[]; tasks: TaskItem[] }) => void;
}

export const GoogleWorkspaceSyncModal: React.FC<GoogleWorkspaceSyncViewProps> = ({
  settings,
  onUpdateSettings,
  onManualSync,
  schedules,
  tasks,
  onImportBackup,
}) => {
  const [urlInput, setUrlInput] = useState(settings.googleAppsScriptUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSaveUrl = () => {
    onUpdateSettings({
      ...settings,
      googleAppsScriptUrl: urlInput.trim(),
    });
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!urlInput.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập đường dẫn URL Web App trước khi kiểm tra',
      });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const res = await testAppsScriptConnection(urlInput.trim());
    setTestResult(res);
    setIsTesting(false);
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    await onManualSync();
    setIsSyncing(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleExportBackupJson = () => {
    const backupData = {
      app: 'UBND_Lao_Bao_Schedule_App',
      exportDate: new Date().toISOString(),
      schedules,
      tasks,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sao_Luu_UBND_Lao_Bao_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.schedules && Array.isArray(json.schedules)) {
          if (window.confirm(`Tìm thấy ${json.schedules.length} lịch và ${json.tasks ? json.tasks.length : 0} nhiệm vụ trong file sao lưu. Bạn có muốn phục hồi dữ liệu?`)) {
            onImportBackup({
              schedules: json.schedules,
              tasks: json.tasks || [],
            });
            alert('Phục hồi dữ liệu thành công!');
          }
        } else {
          alert('Định dạng file sao lưu không hợp lệ!');
        }
      } catch (err) {
        alert('Lỗi đọc file JSON: ' + err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Đồng Bộ Hóa Đám Mây Google Workspace Apps Script
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Giải pháp lưu trữ đám mây <b>hoàn toàn miễn phí</b>, bảo mật cao và vận hành trực tiếp trên hạ tầng Google Sheets của UBND Xã, không tốn chi phí thuê máy chủ định kỳ.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}</span>
            </button>
          </div>
        </div>

        {/* Sync Settings Form */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <label className="block text-xs font-bold text-slate-800">
            Đường dẫn Google Apps Script Web App URL:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveUrl}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition"
              >
                Lưu URL
              </button>
              <button
                onClick={handleTest}
                disabled={isTesting}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg transition"
              >
                {isTesting ? 'Đang thử...' : 'Kiểm tra'}
              </button>
            </div>
          </div>

          {/* Connection Test Result */}
          {testResult && (
            <div className={`p-3 rounded-lg text-xs flex items-start space-x-2 ${
              testResult.success 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              Lần đồng bộ gần nhất: <b>{settings.lastSyncedAt ? new Date(settings.lastSyncedAt).toLocaleString('vi-VN') : 'Chưa đồng bộ'}</b>
            </span>
            <span className="text-emerald-700 font-medium">
              ✓ Hỗ trợ ngoại tuyến (Offline-First) với bộ nhớ cục bộ IndexedDB
            </span>
          </div>
        </div>
      </div>

      {/* Step by Step Deployment Guide */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Mã Nguồn Google Apps Script (Code.gs) Sẵn Sàng Triển Khai</span>
          </h3>
          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedCode ? '✓ Đã sao chép!' : 'Sao chép mã Apps Script'}</span>
          </button>
        </div>

        <div className="bg-slate-900 text-slate-200 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto max-h-64 border border-slate-800">
          <pre>{APPS_SCRIPT_TEMPLATE}</pre>
        </div>

        {/* 4 simple steps */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-700">
          <div className="font-bold text-slate-900 text-sm">4 Bước triển khai nhanh trong 2 phút:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="font-bold text-red-700">Bước 1:</span> Tạo 1 file Google Sheets mới trên Google Drive của UBND Xã (ví dụ: "He_Thong_Lich_Lao_Bao").
            </div>
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="font-bold text-red-700">Bước 2:</span> Chọn menu <b>Tiện ích mở rộng (Extensions)</b> → <b>Apps Script</b>.
            </div>
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="font-bold text-red-700">Bước 3:</span> Xóa nội dung mặc định và dán toàn bộ đoạn mã ở trên vào file <code>Code.gs</code>, bấm Lưu.
            </div>
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="font-bold text-red-700">Bước 4:</span> Bấm <b>Triển khai (Deploy)</b> → <b>Triển khai mới</b> → Chọn loại <b>Ứng dụng web</b> (Truy cập: "Bất kỳ ai") rồi dán URL vào ô trên.
            </div>
          </div>
        </div>
      </div>

      {/* Backup and Restore Box */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Sao Lưu & Phục Hồi Dữ Liệu Toàn Cục</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Xuất dữ liệu an toàn để lưu trữ định kỳ hoặc chuyển giao thiết bị
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportBackupJson}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" />
            <span>Tải file sao lưu (.JSON)</span>
          </button>

          <label className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Phục hồi từ file</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
