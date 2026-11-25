'use strict';

const TIMEZONE = 'Asia/Ho_Chi_Minh';
const DAY_MS = 86400000;
const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

function dateKey(value = new Date()) {
  const d = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(d.getTime())) throw new Error('Thời gian không hợp lệ.');
  const p = Object.fromEntries(formatter.formatToParts(d).map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value && value >= '1900-01-01' && value <= '2199-12-31';
}
function addDays(value, amount) {
  const d = new Date(`${value}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + amount);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) { return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / DAY_MS); }
function validTime(value) { return typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value); }
function timeMinutes(value) { const [h, m] = value.split(':').map(Number); return h * 60 + m; }
function minuteTime(value) { return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`; }
function localMinute(now = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now).map(x => [x.type, x.value]));
  return Number(p.hour) * 60 + Number(p.minute);
}
function nextDate(base, repeat, today, monthAnchor = Number(base.slice(-2))) {
  let candidate = base;
  const after = base > today ? base : today;
  if (repeat === 'monthly') {
    let [y, m] = base.split('-').map(Number);
    do {
      m += 1;
      if (m === 13) { m = 1; y += 1; }
      const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
      candidate = `${y}-${String(m).padStart(2, '0')}-${String(Math.min(monthAnchor, last)).padStart(2, '0')}`;
    } while (candidate <= after);
  } else {
    do {
      candidate = addDays(candidate, repeat === 'weekly' ? 7 : 1);
      if (repeat === 'weekdays') {
        while ([0, 6].includes(new Date(`${candidate}T12:00:00Z`).getUTCDay())) candidate = addDays(candidate, 1);
      }
    } while (candidate <= after);
  }
  return candidate;
}

module.exports = { TIMEZONE, dateKey, validDate, addDays, daysBetween, validTime, timeMinutes, minuteTime, localMinute, nextDate };
