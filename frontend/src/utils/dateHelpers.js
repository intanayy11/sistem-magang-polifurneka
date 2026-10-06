
export function isWeekend(date) {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function isWorkday(date) {
  return !isWeekend(date);
}

export function todayLocalISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isTodayWeekend() {
  return isWeekend(new Date());
}

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

export function isTaskOverdue(deadline, status) {
  if (!deadline) return false;
  if (status === 'Selesai' || status === 'Menunggu Review') return false;
  return new Date(deadline) < new Date();
}

export function isMagangSelesai(user) {
  if (!user) return false;
  if (user.status_aktif === false) return true;
  if (user.tanggal_selesai_magang) {
    const today = todayLocalISO();
    return today > user.tanggal_selesai_magang;
  }
  return false;
}

export function dalamGracePeriodRevisi(user) {
  if (!user) return false;
  if (user.status_aktif === false) return false;
  if (!user.tanggal_selesai_magang) return true;

  const today = todayLocalISO();
  const d = new Date(user.tanggal_selesai_magang + 'T00:00:00');
  d.setDate(d.getDate() + 3);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const graceEnd = `${y}-${m}-${day}`;

  return today <= graceEnd;
}

