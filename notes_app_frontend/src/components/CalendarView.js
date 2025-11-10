import React, { useEffect, useMemo, useState } from 'react';

/**
 * CalendarView
 * A self-contained calendar component with month/week/day views, navigation,
 * and click-to-select dates. Pure front-end and monochrome themed via parent styles.
 */

// Helpers
const startOfDay = (d) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};
const addDays = (d, n) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
};
const addMonths = (d, n) => {
  const dt = new Date(d);
  dt.setMonth(dt.getMonth() + n);
  return dt;
};
const addWeeks = (d, n) => addDays(d, n * 7);

const getMonthGrid = (anchor) => {
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const startWeekday = firstOfMonth.getDay(); // 0=Sun
  const gridStart = addDays(firstOfMonth, -startWeekday);
  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const day = addDays(gridStart, i);
    days.push(day);
  }
  return days;
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const fmtLong = (d) =>
  d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

// PUBLIC_INTERFACE
export default function CalendarView() {
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem('calendar-view') || 'month'; // 'month' | 'week' | 'day'
    } catch {
      return 'month';
    }
  });
  const [current, setCurrent] = useState(() => startOfDay(new Date()));
  const [selected, setSelected] = useState(() => {
    try {
      const raw = localStorage.getItem('calendar-selected');
      return raw ? startOfDay(new Date(raw)) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('calendar-view', view);
    } catch {
      // ignore
    }
  }, [view]);

  useEffect(() => {
    try {
      localStorage.setItem('calendar-selected', selected ? selected.toISOString() : '');
    } catch {
      // ignore
    }
  }, [selected]);

  // Navigation handlers
  // PUBLIC_INTERFACE
  const goToday = () => setCurrent(startOfDay(new Date()));
  // PUBLIC_INTERFACE
  const goPrev = () => {
    if (view === 'month') setCurrent((c) => startOfDay(addMonths(c, -1)));
    else if (view === 'week') setCurrent((c) => startOfDay(addWeeks(c, -1)));
    else setCurrent((c) => startOfDay(addDays(c, -1)));
  };
  // PUBLIC_INTERFACE
  const goNext = () => {
    if (view === 'month') setCurrent((c) => startOfDay(addMonths(c, 1)));
    else if (view === 'week') setCurrent((c) => startOfDay(addWeeks(c, 1)));
    else setCurrent((c) => startOfDay(addDays(c, 1)));
  };

  const monthDays = useMemo(() => getMonthGrid(current), [current]);

  const weekDays = useMemo(() => {
    const weekday = current.getDay();
    const start = addDays(current, -weekday);
    return new Array(7).fill(0).map((_, i) => addDays(start, i));
  }, [current]);

  return (
    <div className="calendar-wrap">
      <div className="calendar-toolbar">
        <div className="left">
          <button className="ocean-btn secondary" onClick={goPrev} aria-label="Previous">
            ‹
          </button>
          <button className="ocean-btn" onClick={goToday} aria-label="Today">
            Today
          </button>
          <button className="ocean-btn secondary" onClick={goNext} aria-label="Next">
            ›
          </button>
        </div>
        <div className="center">
          <div className="calendar-title" aria-live="polite">
            {view === 'month' &&
              current.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            {view === 'week' &&
              `Week of ${fmtLong(weekDays[0])} – ${fmtLong(weekDays[6])}`}
            {view === 'day' && fmtLong(current)}
          </div>
        </div>
        <div className="right" role="tablist" aria-label="Calendar view">
          <button
            className={`ocean-btn ${view === 'month' ? 'primary' : 'secondary'}`}
            onClick={() => setView('month')}
            role="tab"
            aria-selected={view === 'month'}
          >
            Month
          </button>
          <button
            className={`ocean-btn ${view === 'week' ? 'primary' : 'secondary'}`}
            onClick={() => setView('week')}
            role="tab"
            aria-selected={view === 'week'}
          >
            Week
          </button>
          <button
            className={`ocean-btn ${view === 'day' ? 'primary' : 'secondary'}`}
            onClick={() => setView('day')}
            role="tab"
            aria-selected={view === 'day'}
          >
            Day
          </button>
        </div>
      </div>

      {view === 'month' && (
        <div className="calendar-grid" role="grid" aria-label="Month view">
          <div className="calendar-grid-head" role="row">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="calendar-grid-headcell" role="columnheader">
                {d}
              </div>
            ))}
          </div>
          <div className="calendar-grid-body">
            {monthDays.map((day, idx) => {
              const isCurrentMonth = day.getMonth() === current.getMonth();
              const isToday = isSameDay(day, new Date());
              const isSelected = selected && isSameDay(day, selected);
              return (
                <button
                  key={day.toISOString() + idx}
                  className={[
                    'calendar-cell',
                    isCurrentMonth ? '' : 'muted',
                    isToday ? 'today' : '',
                    isSelected ? 'selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setSelected(startOfDay(day))}
                  aria-label={fmtLong(day)}
                  aria-pressed={!!isSelected}
                >
                  <span className="date-num">{day.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === 'week' && (
        <div className="calendar-week" role="grid" aria-label="Week view">
          <div className="calendar-grid-head" role="row">
            {weekDays.map((d) => (
              <div key={d.toISOString()} className="calendar-grid-headcell" role="columnheader">
                {d.toLocaleDateString(undefined, { weekday: 'short' })}
                <span className="date-inline"> {d.getDate()}</span>
              </div>
            ))}
          </div>
          <div className="calendar-grid-body week">
            {weekDays.map((d) => {
              const isToday = isSameDay(d, new Date());
              const isSelected = selected && isSameDay(d, selected);
              return (
                <button
                  key={d.toISOString()}
                  className={['calendar-cell', 'week', isToday ? 'today' : '', isSelected ? 'selected' : '']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setSelected(startOfDay(d))}
                  aria-label={fmtLong(d)}
                  aria-pressed={!!isSelected}
                >
                  <span className="date-num">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === 'day' && (
        <div className="calendar-day" role="region" aria-label="Day view">
          <div className="calendar-day-card">
            <div className="calendar-day-date">{fmtLong(current)}</div>
            <div className="calendar-day-body">
              <p className="calendar-day-placeholder">No events. Click on other dates to select.</p>
              <button className="ocean-btn" onClick={() => setSelected(startOfDay(current))}>
                Select this day
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
