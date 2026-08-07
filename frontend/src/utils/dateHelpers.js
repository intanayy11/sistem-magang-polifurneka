/**
 * Centralized date utility helpers for the Polifurneka internship system.
 * All weekday/weekend logic must go through these functions — do not
 * duplicate the logic inline in individual components.
 */

/**
 * Returns true if the given date falls on Saturday (6) or Sunday (0).
 * @param {Date|string} date – a Date object or ISO date string (YYYY-MM-DD)
 */
export function isWeekend(date) {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const day = d.getDay();
  return day === 0 || day === 6;
}

/**
 * Returns true if the given date is a weekday (Monday–Friday).
 * @param {Date|string} date
 */
export function isWorkday(date) {
  return !isWeekend(date);
}

/**
 * Returns today's date as YYYY-MM-DD string using local time (not UTC).
 */
export function todayLocalISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns true if today (local time) is a weekend.
 */
export function isTodayWeekend() {
  return isWeekend(new Date());
}

/**
 * Given a YYYY-MM-DD string, returns the most recent Monday on-or-before it.
 * Useful for setting a safe default workday date.
 * @param {string} isoDate
 * @returns {string} YYYY-MM-DD
 */
export function nearestWorkdayOnOrBefore(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  while (isWeekend(d)) {
    d.setDate(d.getDate() - 1);
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Checks if a task is overdue (past deadline and status is not Selesai or Menunggu Review).
 * Applies to 'Belum Dikerjakan' and 'Perlu Revisi'.
 * @param {string|Date} deadline
 * @param {string} status
 * @returns {boolean}
 */
export function isTaskOverdue(deadline, status) {
  if (!deadline) return false;
  if (status === 'Selesai' || status === 'Menunggu Review') return false;
  return new Date(deadline) < new Date();
}

/**
 * Checks if a peserta's internship period has ended.
 * Returns true if status_aktif is false OR tanggal_selesai_magang is in the past.
 * @param {object} user – the user object from AuthContext (must have status_aktif & tanggal_selesai_magang)
 * @returns {boolean}
 */
export function isMagangSelesai(user) {
  if (!user) return false;
  if (user.status_aktif === false) return true;
  if (user.tanggal_selesai_magang) {
    // Compare today (local) vs tanggal_selesai_magang
    const today = todayLocalISO();
    return today > user.tanggal_selesai_magang;
  }
  return false;
}

