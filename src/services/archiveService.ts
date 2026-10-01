import { DocumentItem, AuditLog, NotificationItem, UserCollection, UserRole, AccessLevel } from '../types';
import { INITIAL_DOCUMENTS, INITIAL_NOTIFICATIONS, INITIAL_AUDIT_LOGS } from '../data/initialDocuments';

const STORAGE_KEYS = {
  DOCS: 'cm_archive_documents',
  AUDIT: 'cm_archive_audit_logs',
  NOTIFS: 'cm_archive_notifications',
  COLLECTIONS: 'cm_archive_user_collections',
  BOOKMARKS: 'cm_archive_bookmarks',
};

export class ArchiveService {
  private static getStoredData<T>(key: string, defaultData: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
    }
    return defaultData;
  }

  private static setStoredData<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error writing ${key} to storage:`, e);
    }
  }

  public static getDocuments(): DocumentItem[] {
    const docs = this.getStoredData<DocumentItem[]>(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
    // Ensure all initial documents exist
    if (!docs || docs.length === 0) {
      this.setStoredData(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
      return INITIAL_DOCUMENTS;
    }
    // Migrate any legacy 'confidential' access level to 'restricted'
    let hasConfidential = false;
    const cleanedDocs = docs.map((d) => {
      if ((d.accessLevel as string) === 'confidential') {
        hasConfidential = true;
        return { ...d, accessLevel: 'restricted' as const };
      }
      return d;
    });
    if (hasConfidential) {
      this.setStoredData(STORAGE_KEYS.DOCS, cleanedDocs);
    }
    return cleanedDocs;
  }

  public static saveDocument(doc: DocumentItem, user: { name: string; email: string; role: UserRole }): DocumentItem {
    const docs = this.getDocuments();
    const existingIndex = docs.findIndex((d) => d.id === doc.id);
    let updatedDoc: DocumentItem;

    if (existingIndex >= 0) {
      const history = docs[existingIndex].history || [];
      history.unshift({
        timestamp: new Date().toLocaleString('vi-VN'),
        action: 'Chỉnh sửa tài liệu',
        userName: user.name,
      });
      updatedDoc = {
        ...doc,
        updatedBy: user.name,
        updatedAt: new Date().toISOString(),
        history,
      };
      docs[existingIndex] = updatedDoc;
      this.logActivity({
        action: 'Chỉnh sửa',
        documentId: doc.id,
        documentTitle: doc.title,
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        details: `Cập nhật thông tin tài liệu số: ${doc.codeNumber}`,
      });
    } else {
      updatedDoc = {
        ...doc,
        id: doc.id || `doc-${Date.now()}`,
        updatedBy: user.name,
        updatedAt: new Date().toISOString(),
        downloadCount: 0,
        viewCount: 1,
        history: [
          {
            timestamp: new Date().toLocaleString('vi-VN'),
            action: 'Tải lên & Khởi tạo số hóa',
            userName: user.name,
          },
        ],
      };
      docs.unshift(updatedDoc);
      this.logActivity({
        action: 'Tải lên',
        documentId: updatedDoc.id,
        documentTitle: updatedDoc.title,
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        details: `Tải lên tài liệu mới: ${updatedDoc.codeNumber} - ${updatedDoc.title}`,
      });
    }

    this.setStoredData(STORAGE_KEYS.DOCS, docs);
    return updatedDoc;
  }

  public static deleteDocument(docId: string, reason: string, user: { name: string; email: string; role: UserRole }): boolean {
    const docs = this.getDocuments();
    const target = docs.find((d) => d.id === docId);
    if (!target) return false;

    const filtered = docs.filter((d) => d.id !== docId);
    this.setStoredData(STORAGE_KEYS.DOCS, filtered);

    this.logActivity({
      action: 'Xóa',
      documentId: docId,
      documentTitle: target.title,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      details: `Đã xóa tài liệu khỏi kho số. Lý do: ${reason || 'Không ghi chú'}`,
    });

    return true;
  }

  public static incrementView(docId: string, user?: { name: string; email: string; role: UserRole }): void {
    const docs = this.getDocuments();
    const doc = docs.find((d) => d.id === docId);
    if (doc) {
      doc.viewCount = (doc.viewCount || 0) + 1;
      this.setStoredData(STORAGE_KEYS.DOCS, docs);
      if (user && user.role !== 'guest') {
        this.logActivity({
          action: 'Xem chi tiết',
          documentId: doc.id,
          documentTitle: doc.title,
          userEmail: user.email,
          userName: user.name,
          userRole: user.role,
          details: `Tra cứu hồ sơ tài liệu`,
        });
      }
    }
  }

  public static incrementDownload(docId: string, user?: { name: string; email: string; role: UserRole }): void {
    const docs = this.getDocuments();
    const doc = docs.find((d) => d.id === docId);
    if (doc) {
      doc.downloadCount = (doc.downloadCount || 0) + 1;
      this.setStoredData(STORAGE_KEYS.DOCS, docs);
      if (user) {
        this.logActivity({
          action: 'Tải xuống',
          documentId: doc.id,
          documentTitle: doc.title,
          userEmail: user.email,
          userName: user.name,
          userRole: user.role,
          details: `Tải tệp đính kèm (${doc.fileFormat} - ${doc.fileSize})`,
        });
      }
    }
  }

  // Bookmarks
  public static getBookmarks(): string[] {
    return this.getStoredData<string[]>(STORAGE_KEYS.BOOKMARKS, ['doc-001', 'doc-002']);
  }

  public static toggleBookmark(docId: string): boolean {
    const bookmarks = this.getBookmarks();
    const exists = bookmarks.includes(docId);
    let updated: string[];
    if (exists) {
      updated = bookmarks.filter((id) => id !== docId);
    } else {
      updated = [...bookmarks, docId];
    }
    this.setStoredData(STORAGE_KEYS.BOOKMARKS, updated);
    return !exists;
  }

  // Audit Logs
  public static getAuditLogs(): AuditLog[] {
    const logs = this.getStoredData<AuditLog[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
    let hasChanges = false;
    const updatedLogs = logs.map((log) => {
      if (log.userName && log.userName.includes('Nguyễn Tuấn Linh')) {
        hasChanges = true;
        return {
          ...log,
          userName: log.userName.replace('Nguyễn Tuấn Linh', 'Trương Tuấn Linh'),
        };
      }
      return log;
    });

    if (hasChanges) {
      this.setStoredData(STORAGE_KEYS.AUDIT, updatedLogs);
    }
    return updatedLogs;
  }

  public static logActivity(entry: Omit<AuditLog, 'id' | 'timestamp'> & { timestamp?: string }): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: entry.timestamp || new Date().toLocaleString('vi-VN'),
    };
    logs.unshift(newLog);
    // keep max 200 logs
    if (logs.length > 200) logs.pop();
    this.setStoredData(STORAGE_KEYS.AUDIT, logs);
  }

  // Notifications
  public static getNotifications(): NotificationItem[] {
    return this.getStoredData<NotificationItem[]>(STORAGE_KEYS.NOTIFS, INITIAL_NOTIFICATIONS);
  }

  public static markNotificationAsRead(id: string): void {
    const notifs = this.getNotifications();
    const target = notifs.find((n) => n.id === id);
    if (target) {
      target.isRead = true;
      this.setStoredData(STORAGE_KEYS.NOTIFS, notifs);
    }
  }

  public static markAllNotificationsRead(): void {
    const notifs = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    this.setStoredData(STORAGE_KEYS.NOTIFS, notifs);
  }

  public static addNotification(notif: Omit<NotificationItem, 'id' | 'isRead'>): void {
    const notifs = this.getNotifications();
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      isRead: false,
    };
    notifs.unshift(newNotif);
    this.setStoredData(STORAGE_KEYS.NOTIFS, notifs);
  }

  // User Collections
  public static getUserCollections(): UserCollection[] {
    return this.getStoredData<UserCollection[]>(STORAGE_KEYS.COLLECTIONS, [
      {
        id: 'col-1',
        name: 'Hồ sơ Chuyển đổi số Tỉnh ủy 2026',
        description: 'Tập hợp đề án, kế hoạch và quy chế số hóa hoạt động Đảng bộ Cà Mau',
        documentIds: ['doc-002', 'doc-001'],
        createdAt: '2026-02-15',
      },
      {
        id: 'col-2',
        name: 'Tư liệu Lịch sử Đảng bộ & Bác Hồ',
        description: 'Các tài liệu, chỉ thị học tập Bác và lịch sử cách mạng Đất Mũi',
        documentIds: ['doc-003', 'doc-004', 'doc-010', 'doc-013'],
        createdAt: '2026-03-01',
      },
    ]);
  }

  public static saveUserCollection(collection: UserCollection): void {
    const collections = this.getUserCollections();
    const index = collections.findIndex((c) => c.id === collection.id);
    if (index >= 0) {
      collections[index] = collection;
    } else {
      collections.unshift(collection);
    }
    this.setStoredData(STORAGE_KEYS.COLLECTIONS, collections);
  }

  public static deleteUserCollection(id: string): void {
    const collections = this.getUserCollections().filter((c) => c.id !== id);
    this.setStoredData(STORAGE_KEYS.COLLECTIONS, collections);
  }

  // Smart Filename Parser
  public static parseFileName(fileName: string): {
    title: string;
    codeNumber: string;
    documentType: string;
    fileFormat: 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'JPG' | 'PNG' | 'MP4';
    year: string;
  } {
    const ext = fileName.split('.').pop()?.toUpperCase() || 'PDF';
    let cleanName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    cleanName = cleanName.replace(/[_]/g, ' ');

    // Match code pattern e.g. 88-KH-BTGTU or 88-KH/BTGTU or 04-DA-TU
    let codeNumber = '';
    const codeMatch = cleanName.match(/(\d{1,4}[-/][a-zA-Z0-9/-]+)/);
    if (codeMatch) {
      codeNumber = codeMatch[1].replace(/-/g, '/').toUpperCase();
    }

    // Determine document type
    let documentType = 'Công văn';
    const lower = cleanName.toLowerCase();
    if (lower.includes('kế hoạch') || lower.includes('ke hoach') || lower.includes('-kh')) documentType = 'Kế hoạch';
    else if (lower.includes('đề án') || lower.includes('de an') || lower.includes('-da')) documentType = 'Đề án';
    else if (lower.includes('chỉ thị') || lower.includes('chi thi') || lower.includes('-ct')) documentType = 'Chỉ thị';
    else if (lower.includes('nghị quyết') || lower.includes('nghi quyet') || lower.includes('-nq')) documentType = 'Nghị quyết';
    else if (lower.includes('báo cáo') || lower.includes('bao cao') || lower.includes('-bc')) documentType = 'Báo cáo';
    else if (lower.includes('hướng dẫn') || lower.includes('huong dan') || lower.includes('-hd')) documentType = 'Hướng dẫn';
    else if (lower.includes('quyết định') || lower.includes('quyet dinh') || lower.includes('-qd')) documentType = 'Quyết định';
    else if (lower.includes('quy định') || lower.includes('quy dinh')) documentType = 'Quy định';
    else if (lower.includes('thông báo') || lower.includes('thong bao') || lower.includes('-tb')) documentType = 'Thông báo';
    else if (lower.includes('đề cương') || lower.includes('de cuong') || lower.includes('-dc')) documentType = 'Đề cương';
    else if (lower.includes('biểu mẫu') || lower.includes('bieu mau') || lower.includes('-bm')) documentType = 'Biểu mẫu';
    else if (['JPG', 'PNG', 'JPEG'].includes(ext)) documentType = 'Hình ảnh';
    else if (['MP4', 'MOV', 'AVI'].includes(ext)) documentType = 'Video';

    // Year detection
    const yearMatch = cleanName.match(/\b(202[0-9]|201[0-9])\b/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

    const title = cleanName
      .replace(/[-/]\w+/g, '')
      .replace(/\b(202[0-9]|201[0-9])\b/g, '')
      .trim();

    const format = (['PDF', 'DOCX', 'XLSX', 'PPTX', 'JPG', 'PNG', 'MP4'].includes(ext)
      ? ext
      : 'PDF') as any;

    return {
      title: title.length > 5 ? title : `Tài liệu văn bản số ${codeNumber || 'mới'}`,
      codeNumber: codeNumber || '---/BTGTU',
      documentType,
      fileFormat: format,
      year,
    };
  }

  // Duplicate Check
  public static checkDuplicates(codeNumber: string, title: string, excludeId?: string): DocumentItem | null {
    const docs = this.getDocuments();
    const normalizedCode = codeNumber.trim().toLowerCase();
    const normalizedTitle = title.trim().toLowerCase();

    const found = docs.find((d) => {
      if (excludeId && d.id === excludeId) return false;
      const dCode = d.codeNumber.trim().toLowerCase();
      const dTitle = d.title.trim().toLowerCase();
      if (normalizedCode && dCode === normalizedCode && dCode !== '---/btgtu') return true;
      if (normalizedTitle.length > 10 && dTitle === normalizedTitle) return true;
      return false;
    });

    return found || null;
  }

  // Permission Check
  public static canAccessDocument(doc: DocumentItem, userRole: UserRole): boolean {
    if (userRole === 'admin') return true;
    if (userRole === 'editor') return true;
    if (userRole === 'staff') {
      return doc.accessLevel !== 'confidential';
    }
    // Guest
    return doc.accessLevel === 'public';
  }

  public static canEdit(userRole: UserRole): boolean {
    return userRole === 'admin' || userRole === 'editor';
  }

  public static canDelete(userRole: UserRole): boolean {
    return userRole === 'admin';
  }
}
