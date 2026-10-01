import React, { useState } from 'react';
import { Activity, X, Search, Shield, Filter, Download, User, Calendar } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose, logs }) => {
  const [filterAction, setFilterAction] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (filterAction && log.action !== filterAction) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const inUser = log.userName.toLowerCase().includes(term) || log.userEmail.toLowerCase().includes(term);
      const inDoc = log.documentTitle?.toLowerCase().includes(term);
      const inDetails = log.details?.toLowerCase().includes(term);
      if (!inUser && !inDoc && !inDetails) return false;
    }
    return true;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Tải lên':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Chỉnh sửa':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Xóa':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Tải xuống':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Xem chi tiết':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nhat_ky_luu_tru_ca_mau_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG (AUDIT TRAIL)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ghi vết toàn bộ hành vi: Tải lên, Chỉnh sửa, Tải xuống, Xem chi tiết và Xóa tài liệu phục vụ bảo mật
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportLogs}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất nhật ký JSON
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên cán bộ, email, tài liệu hoặc chi tiết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="">-- Tất cả hành động --</option>
              <option value="Tải lên">Tải lên</option>
              <option value="Chỉnh sửa">Chỉnh sửa</option>
              <option value="Tải xuống">Tải xuống</option>
              <option value="Xem chi tiết">Xem chi tiết</option>
              <option value="Xóa">Xóa tài liệu</option>
            </select>
          </div>
        </div>

        {/* Log table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-2.5">Thời gian</th>
                <th className="px-3 py-2.5">Hành động</th>
                <th className="px-3 py-2.5">Cán bộ thực hiện</th>
                <th className="px-3 py-2.5">Tài liệu liên quan</th>
                <th className="px-3 py-2.5">Chi tiết ghi nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-sans">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getActionColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">{log.userName}</div>
                    <div className="text-[10px] text-slate-400">{log.userEmail}</div>
                  </td>
                  <td className="px-3 py-2.5 min-w-[180px]">
                    <span className="font-medium text-slate-900 line-clamp-1">
                      {log.documentTitle || 'Hệ thống'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 text-[11px]">
                    {log.details || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
