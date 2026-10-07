/**
 * Chuyển đổi định dạng ngày sang dạng chuẩn Việt Nam: ngày/tháng/năm (DD/MM/YYYY)
 * Ví dụ: '2026-08-10' -> '10/08/2026'
 *         '2026-03-01' -> '01/03/2026'
 */
export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();

  // Nếu đã ở dạng ngày/tháng/năm thì giữ nguyên
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/');
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }

  // Tách ngày từ chuẩn YYYY-MM-DD hoặc ISO datetime
  const dateOnly = trimmed.split('T')[0];
  const parts = dateOnly.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (year.length === 4 && month && day) {
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
  }

  // Thử parse qua Date
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return dateStr;
};
