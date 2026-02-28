/**
 * @ottabase/ottadate — Date utility helpers
 *
 * Thin wrappers around date-fns for common calendar operations.
 * All internal dates use JS Date objects; conversion to/from unix timestamps
 * happens at the boundary (getValue / setValue / onChange).
 */

import {
    addMonths,
    addYears,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format as fnsFormat,
    getDate,
    getHours,
    getMinutes,
    getMonth,
    getSeconds,
    getYear,
    isAfter,
    isBefore,
    isSameDay,
    isSameMonth,
    isValid,
    isWithinInterval,
    setDate,
    setHours,
    setMinutes,
    setMonth,
    setSeconds,
    setYear,
    startOfMonth,
    startOfWeek,
    subMonths,
    subYears,
} from 'date-fns';
import type { OttaDateConfig, TimestampFormat } from './types';

// ---------------------------------------------------------------------------
// Config defaults
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: Required<
    Pick<
        OttaDateConfig,
        | 'timezone'
        | 'timestampFormat'
        | 'locale'
        | 'firstDayOfWeek'
        | 'displayFormat'
        | 'timeDisplayFormat'
        | 'classPrefix'
        | 'inline'
        | 'placeholder'
        | 'disabled'
    >
> = {
    timezone: 'auto',
    timestampFormat: 'unix',
    locale: 'en-US',
    firstDayOfWeek: 1,
    displayFormat: 'MMM d, yyyy',
    timeDisplayFormat: 'HH:mm',
    classPrefix: 'ottadate',
    inline: false,
    placeholder: 'Select date…',
    disabled: false,
};

/** Merge user config with defaults */
export function resolveConfig<T extends OttaDateConfig>(options: T): T & typeof DEFAULT_CONFIG {
    return { ...DEFAULT_CONFIG, ...options };
}

// ---------------------------------------------------------------------------
// Timezone helpers
// ---------------------------------------------------------------------------

/** Detect the user's IANA timezone from the browser */
export function detectTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
        return 'UTC';
    }
}

/** Resolve 'auto' to the user's detected timezone */
export function resolveTimezone(tz: string | 'auto'): string {
    return tz === 'auto' ? detectTimezone() : tz;
}

// ---------------------------------------------------------------------------
// Timestamp conversion — boundary layer (external ↔ internal Date)
// ---------------------------------------------------------------------------

/**
 * Convert an external value to a JS Date.
 * Handles unix seconds, ISO strings, and Date objects.
 */
export function toDate(value: number | string | Date | null | undefined): Date | null {
    if (value == null) return null;
    if (value instanceof Date) return isValid(value) ? value : null;
    if (typeof value === 'string') {
        const d = new Date(value);
        return isValid(d) ? d : null;
    }
    if (typeof value === 'number') {
        // Unix seconds → ms
        const d = new Date(value * 1000);
        return isValid(d) ? d : null;
    }
    return null;
}

/** Convert a JS Date back to the configured output format */
export function fromDate(date: Date | null, format: TimestampFormat): number | string | Date | null {
    if (!date || !isValid(date)) return null;
    switch (format) {
        case 'unix':
            return Math.floor(date.getTime() / 1000);
        case 'iso':
            return date.toISOString();
        case 'date':
            return date;
        default:
            return Math.floor(date.getTime() / 1000);
    }
}

// ---------------------------------------------------------------------------
// Calendar grid helpers
// ---------------------------------------------------------------------------

/**
 * Build the 6-week calendar grid for a given month.
 * Returns a flat array of Date objects (always 42 days for consistent grid).
 */
export function buildCalendarGrid(year: number, month: number, weekStartsOn: 0 | 1 = 1): Date[] {
    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(monthStart);
    const gridStart = startOfWeek(monthStart, { weekStartsOn });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn });

    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

    // Pad to 42 days (6 rows × 7 cols) for consistent grid height
    while (days.length < 42) {
        const lastDay = days[days.length - 1];
        days.push(new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1));
    }
    return days;
}

/** Get short weekday labels, respecting weekStartsOn */
export function getWeekdayLabels(weekStartsOn: 0 | 1 = 1): string[] {
    const labels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    if (weekStartsOn === 1) {
        return [...labels.slice(1), labels[0]];
    }
    return labels;
}

/** Generate array of month names */
export function getMonthNames(): string[] {
    return [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
}

/** Generate array of abbreviated month names */
export function getMonthNamesShort(): string[] {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

/** Format a date using date-fns format string */
export function formatDate(date: Date | null, formatStr: string): string {
    if (!date || !isValid(date)) return '';
    return fnsFormat(date, formatStr);
}

/** Format a date for display with user's timezone context */
export function formatDisplay(date: Date | null, displayFormat: string): string {
    return formatDate(date, displayFormat);
}

/** Format time portion */
export function formatTime(date: Date | null, timeFormat: string): string {
    return formatDate(date, timeFormat);
}

// ---------------------------------------------------------------------------
// Date comparison helpers
// ---------------------------------------------------------------------------

export {
    addMonths,
    addYears,
    getDate,
    getHours,
    getMinutes,
    getMonth,
    getSeconds,
    getYear,
    isAfter,
    isBefore,
    isSameDay,
    isSameMonth,
    isValid,
    isWithinInterval,
    setDate,
    setHours,
    setMinutes,
    setMonth,
    setSeconds,
    setYear,
    subMonths,
    subYears,
};

// ---------------------------------------------------------------------------
// Constraint helpers
// ---------------------------------------------------------------------------

/** Check if a date is within min/max bounds */
export function isDateInBounds(date: Date, minDate?: Date | null, maxDate?: Date | null): boolean {
    if (minDate && isBefore(date, minDate)) return false;
    if (maxDate && isAfter(date, maxDate)) return false;
    return true;
}

// ---------------------------------------------------------------------------
// Hour/minute/second generation helpers
// ---------------------------------------------------------------------------

/** Generate hours array (0–23) */
export function getHoursList(): number[] {
    return Array.from({ length: 24 }, (_, i) => i);
}

/** Generate minutes array with step */
export function getMinutesList(step: number = 1): number[] {
    const mins: number[] = [];
    for (let i = 0; i < 60; i += step) {
        mins.push(i);
    }
    return mins;
}

/** Generate seconds array */
export function getSecondsList(): number[] {
    return Array.from({ length: 60 }, (_, i) => i);
}

/** Pad a number to 2 digits */
export function pad2(n: number): string {
    return n.toString().padStart(2, '0');
}

/** Format hour for 12h display */
export function formatHour12(hour: number): string {
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${h} ${ampm}`;
}

// ---------------------------------------------------------------------------
// Year range helper
// ---------------------------------------------------------------------------

/** Generate a range of years around a center year */
export function getYearRange(centerYear: number, range: number = 10): number[] {
    const start = centerYear - range;
    const end = centerYear + range;
    const years: number[] = [];
    for (let y = start; y <= end; y++) {
        years.push(y);
    }
    return years;
}
