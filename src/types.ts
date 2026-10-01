export type AccessLevel = 'public' | 'internal' | 'restricted' | 'confidential';

export type UserRole = 'admin' | 'editor' | 'staff' | 'guest';

export type DocumentFormat = 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'JPG' | 'PNG' | 'MP4';

export interface DocumentHistoryEntry {
  timestamp: string;
  action: string;
  userName: string;
  note?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  codeNumber: string;
  documentType: string;
  category: string;
  issuingAuthority: string;
  issueDate: string; // YYYY-MM-DD
  accessLevel: AccessLevel;
  summary: string;
  keywords: string[];
  fileFormat: DocumentFormat;
  fileSize: string;
  fileUrl?: string;
  ocrContent?: string;
  signatory?: string;
  updatedBy: string;
  updatedAt: string;
  isFeatured?: boolean;
  downloadCount: number;
  viewCount: number;
  history?: DocumentHistoryEntry[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export interface AuditLog {
  id: string;
  action: 'Tải lên' | 'Chỉnh sửa' | 'Xóa' | 'Xem chi tiết' | 'Tải xuống' | 'Đăng nhập' | 'Xuất dữ liệu';
  documentId?: string;
  documentTitle?: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  timestamp: string;
  details?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'urgent' | 'document' | 'info' | 'training';
  isRead: boolean;
  documentId?: string;
}

export interface UserCollection {
  id: string;
  name: string;
  description: string;
  documentIds: string[];
  createdAt: string;
}

export interface FilterCriteria {
  keyword: string;
  documentType: string;
  category: string;
  issuingAuthority: string;
  year: string;
  accessLevel: string;
  fileFormat: string;
  dateFrom: string;
  dateTo: string;
}
