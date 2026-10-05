import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Send, 
  Mail, 
  MessageCircle, 
  X,
  ExternalLink
} from 'lucide-react';
import { ScheduleItem } from '../types';
import { generateZaloMessage, openEmailShare } from '../services/exportService';

interface ShareZaloModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: ScheduleItem[];
  selectedItem?: ScheduleItem | null;
  weekNumber: number;
}

export const ShareZaloModal: React.FC<ShareZaloModalProps> = ({
  isOpen,
  onClose,
  schedules,
  selectedItem,
  weekNumber,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareScope, setShareScope] = useState<'week' | 'item'>(selectedItem ? 'item' : 'week');

  if (!isOpen) return null;

  let messageText = '';
  if (shareScope === 'week' || !selectedItem) {
    messageText = generateZaloMessage(schedules, weekNumber);
  } else {
    messageText = `🏛️ THÔNG BÁO LỊCH CÔNG TÁC - UBND XÃ LAO BẢO\n` +
      `📅 ${selectedItem.dayOfWeek} (${selectedItem.date}) - Buổi ${selectedItem.session}\n` +
      `⏰ Thời gian: ${selectedItem.time}\n` +
      `📌 Nội dung: ${selectedItem.content}\n` +
      `👤 Chủ trì: ${selectedItem.host}\n` +
      `👥 Thành phần tham dự: ${selectedItem.attendees}\n` +
      `📍 Địa điểm: ${selectedItem.location}\n` +
      (selectedItem.notes ? `💡 Lưu ý: ${selectedItem.notes}\n` : '') +
      `-----------------------------\n` +
      `⚠️ Đề nghị các đồng chí liên quan tham dự đầy đủ, đúng giờ.`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenZaloWeb = () => {
    handleCopy();
    window.open('https://chat.zalo.me/', '_blank');
  };

  const handleSendEmail = () => {
    if (shareScope === 'week' || !selectedItem) {
      openEmailShare(schedules, weekNumber);
    } else {
      const subject = encodeURIComponent(`[UBND XÃ LAO BẢO] Lịch làm việc ${selectedItem.dayOfWeek} (${selectedItem.date}) - ${selectedItem.content}`);
      const body = encodeURIComponent(messageText);
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-300 rounded-full mx-auto my-1.5 flex-shrink-0" />

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 sm:px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm sm:text-base">Gửi Lịch Qua Zalo & Email</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto">
          {/* Scope Selector */}
          {selectedItem && (
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setShareScope('item')}
                className={`flex-1 py-1.5 rounded transition ${
                  shareScope === 'item' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600'
                }`}
              >
                Chỉ chia sẻ cuộc họp này
              </button>
              <button
                onClick={() => setShareScope('week')}
                className={`flex-1 py-1.5 rounded transition ${
                  shareScope === 'week' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600'
                }`}
              >
                Toàn bộ Lịch Tuần {weekNumber}
              </button>
            </div>
          )}

          {/* Formatted Text Box */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Định dạng tin nhắn chuẩn đã tạo sẵn:
            </label>
            <textarea
              readOnly
              rows={10}
              value={messageText}
              className="w-full p-3 font-sans text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 leading-relaxed focus:outline-none select-all"
            />
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-xs cursor-pointer text-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '✓ Đã sao chép vào bộ nhớ tạm!' : 'Sao chép tin nhắn để dán vào Zalo'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleOpenZaloWeb}
                className="flex items-center justify-center space-x-1.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-lg transition border border-blue-200 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở Zalo Web</span>
              </button>

              <button
                onClick={handleSendEmail}
                className="flex items-center justify-center space-x-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition border border-slate-200 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-red-600" />
                <span>Gửi qua Email</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
