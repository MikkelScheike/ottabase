/**
 * @ottabase/ottadate — DatePicker
 *
 * Framework-agnostic single date picker. Mounts to a DOM container.
 * Getter/setter works with UTC unix timestamps by default.
 *
 * Usage:
 *   const picker = OttaDate.createDatePicker(container, {
 *       value: 1704067200,
 *       onChange: (ts) => console.log(ts),
 *   });
 */

import type { DatePickerInstance, DatePickerOptions } from '../core/types';
import {
    buildCalendarGrid,
    formatDisplay,
    fromDate,
    getMonthNames,
    getMonthNamesShort,
    getWeekdayLabels,
    getYearRange,
    isDateInBounds,
    isSameDay,
    isSameMonth,
    resolveConfig,
    resolveTimezone,
    toDate,
} from '../core/utils';
import {
    btn,
    clearChildren,
    div,
    el,
    iconCalendar,
    iconChevronLeft,
    iconChevronRight,
    iconX,
    onClickOutside,
    onEscape,
    span,
} from '../dom/helpers';

/** View modes: day grid, month picker, year picker */
type ViewMode = 'days' | 'months' | 'years';

export function createDatePicker(container: HTMLElement, options: DatePickerOptions = {}): DatePickerInstance {
    let config = resolveConfig(options);
    let selectedDate = toDate(config.value);
    let viewDate = selectedDate ? new Date(selectedDate) : new Date();
    let viewMode: ViewMode = 'days';
    let isOpen = false;
    let removeClickOutside: (() => void) | null = null;
    let removeEscapeHandler: (() => void) | null = null;

    const tz = resolveTimezone(config.timezone!);
    const minDate = config.minDate ? toDate(config.minDate as any) : null;
    const maxDate = config.maxDate ? toDate(config.maxDate as any) : null;

    // Root wrapper
    const root = div('ottadate');
    if (config.inline) root.classList.add('ottadate--inline');
    container.appendChild(root);

    // Trigger button
    const trigger = el('button', {
        className: 'ottadate-trigger',
        type: 'button',
        'aria-haspopup': 'dialog',
        'aria-expanded': 'false',
    }) as HTMLButtonElement;

    if (config.disabled) {
        trigger.setAttribute('aria-disabled', 'true');
    }

    const triggerIcon = span('ottadate-trigger-icon', '');
    triggerIcon.innerHTML = iconCalendar();
    const triggerText = span('ottadate-trigger-text', '');
    const triggerClear = el('button', {
        className: 'ottadate-trigger-clear',
        type: 'button',
        'aria-label': 'Clear date',
    });
    triggerClear.innerHTML = iconX();
    triggerClear.style.display = 'none';

    trigger.append(triggerIcon, triggerText, triggerClear);
    if (!config.inline) root.appendChild(trigger);

    // Popover
    const popover = div('ottadate-popover');
    popover.style.display = config.inline ? '' : 'none';

    // If inline, the popover is always visible
    if (config.inline) {
        isOpen = true;
    }

    root.appendChild(popover);

    // --- Rendering functions ---

    function updateTriggerText() {
        if (selectedDate) {
            triggerText.textContent = formatDisplay(selectedDate, config.displayFormat!);
            triggerText.classList.remove('ottadate-trigger-placeholder');
            triggerClear.style.display = '';
        } else {
            triggerText.textContent = config.placeholder!;
            triggerText.classList.add('ottadate-trigger-placeholder');
            triggerClear.style.display = 'none';
        }
    }

    function renderHeader() {
        const header = div('ottadate-header');

        const prevBtn = btn('ottadate-nav-btn', '', () => {
            if (viewMode === 'days') {
                viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
            } else if (viewMode === 'months') {
                viewDate = new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1);
            } else {
                viewDate = new Date(viewDate.getFullYear() - 20, viewDate.getMonth(), 1);
            }
            render();
        });
        prevBtn.innerHTML = iconChevronLeft();

        let titleText: string;
        if (viewMode === 'days') {
            titleText = `${getMonthNames()[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
        } else if (viewMode === 'months') {
            titleText = `${viewDate.getFullYear()}`;
        } else {
            const start = viewDate.getFullYear() - 10;
            const end = viewDate.getFullYear() + 10;
            titleText = `${start} – ${end}`;
        }

        const titleBtn = btn('ottadate-header-title', titleText, () => {
            // Cycle: days → months → years → days
            if (viewMode === 'days') viewMode = 'months';
            else if (viewMode === 'months') viewMode = 'years';
            else viewMode = 'days';
            render();
        });

        const nextBtn = btn('ottadate-nav-btn', '', () => {
            if (viewMode === 'days') {
                viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
            } else if (viewMode === 'months') {
                viewDate = new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1);
            } else {
                viewDate = new Date(viewDate.getFullYear() + 20, viewDate.getMonth(), 1);
            }
            render();
        });
        nextBtn.innerHTML = iconChevronRight();

        header.append(prevBtn, titleBtn, nextBtn);
        return header;
    }

    function renderDayGrid() {
        const fragment = document.createDocumentFragment();

        // Weekday headers
        const weekdaysRow = div('ottadate-weekdays');
        for (const label of getWeekdayLabels(config.firstDayOfWeek)) {
            weekdaysRow.appendChild(span('ottadate-weekday', label));
        }
        fragment.appendChild(weekdaysRow);

        // Day cells
        const daysGrid = div('ottadate-days');
        const days = buildCalendarGrid(viewDate.getFullYear(), viewDate.getMonth(), config.firstDayOfWeek);
        const today = new Date();

        for (const day of days) {
            const dayBtn = btn('ottadate-day', day.getDate().toString(), () => {
                selectDate(day);
            });

            // Outside current month
            if (!isSameMonth(day, viewDate)) {
                dayBtn.classList.add('ottadate-day--outside');
            }

            // Today
            if (isSameDay(day, today)) {
                dayBtn.classList.add('ottadate-day--today');
            }

            // Selected
            if (selectedDate && isSameDay(day, selectedDate)) {
                dayBtn.classList.add('ottadate-day--selected');
            }

            // Disabled (out of bounds)
            if (!isDateInBounds(day, minDate, maxDate)) {
                dayBtn.classList.add('ottadate-day--disabled');
            }

            daysGrid.appendChild(dayBtn);
        }
        fragment.appendChild(daysGrid);

        return fragment;
    }

    function renderMonthGrid() {
        const grid = div('ottadate-months');
        const months = getMonthNamesShort();
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        months.forEach((name, idx) => {
            const monthBtn = btn('ottadate-month-cell', name, () => {
                viewDate = new Date(viewDate.getFullYear(), idx, 1);
                viewMode = 'days';
                render();
            });

            if (viewDate.getFullYear() === currentYear && idx === currentMonth) {
                monthBtn.classList.add('ottadate-month-cell--current');
            }
            if (
                selectedDate &&
                viewDate.getFullYear() === selectedDate.getFullYear() &&
                idx === selectedDate.getMonth()
            ) {
                monthBtn.classList.add('ottadate-month-cell--selected');
            }

            grid.appendChild(monthBtn);
        });

        return grid;
    }

    function renderYearGrid() {
        const grid = div('ottadate-years');
        const years = getYearRange(viewDate.getFullYear(), 10);
        const currentYear = new Date().getFullYear();

        for (const year of years) {
            const yearBtn = btn('ottadate-year-cell', year.toString(), () => {
                viewDate = new Date(year, viewDate.getMonth(), 1);
                viewMode = 'months';
                render();
            });

            if (year === currentYear) {
                yearBtn.classList.add('ottadate-year-cell--current');
            }
            if (selectedDate && year === selectedDate.getFullYear()) {
                yearBtn.classList.add('ottadate-year-cell--selected');
            }

            grid.appendChild(yearBtn);
        }

        return grid;
    }

    function renderFooter() {
        const footer = div('ottadate-footer');

        const todayBtn = btn('ottadate-footer-btn ottadate-footer-btn--primary', 'Today', () => {
            const today = new Date();
            viewDate = new Date(today);
            viewMode = 'days';
            selectDate(today);
        });

        const clearBtn = btn('ottadate-footer-btn', 'Clear', () => {
            selectedDate = null;
            updateTriggerText();
            emitChange();
            render();
        });

        footer.append(todayBtn, clearBtn);
        return footer;
    }

    function render() {
        clearChildren(popover);
        popover.appendChild(renderHeader());

        if (viewMode === 'days') {
            popover.appendChild(renderDayGrid());
        } else if (viewMode === 'months') {
            popover.appendChild(renderMonthGrid());
        } else {
            popover.appendChild(renderYearGrid());
        }

        popover.appendChild(renderFooter());
    }

    // --- Actions ---

    function selectDate(date: Date) {
        selectedDate = date;
        updateTriggerText();
        emitChange();
        render();

        // Close popover after selection (unless inline)
        if (!config.inline) {
            closePicker();
        }
    }

    function emitChange() {
        if (config.onChange) {
            config.onChange(fromDate(selectedDate, config.timestampFormat!));
        }
    }

    function openPicker() {
        if (isOpen || config.disabled) return;
        isOpen = true;
        popover.style.display = '';
        trigger.setAttribute('aria-expanded', 'true');
        viewMode = 'days';
        if (selectedDate) {
            viewDate = new Date(selectedDate);
        }
        render();

        removeClickOutside = onClickOutside(root, closePicker);
        removeEscapeHandler = onEscape(closePicker);
    }

    function closePicker() {
        if (!isOpen || config.inline) return;
        isOpen = false;
        popover.style.display = 'none';
        trigger.setAttribute('aria-expanded', 'false');
        removeClickOutside?.();
        removeEscapeHandler?.();
        removeClickOutside = null;
        removeEscapeHandler = null;
    }

    // --- Event bindings ---

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isOpen) closePicker();
        else openPicker();
    });

    triggerClear.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedDate = null;
        updateTriggerText();
        emitChange();
        if (isOpen) render();
    });

    // --- Initial render ---

    updateTriggerText();
    if (config.inline) {
        render();
    }

    // --- Public API ---

    return {
        open: openPicker,
        close: closePicker,
        toggle() {
            if (isOpen) closePicker();
            else openPicker();
        },
        setValue(value) {
            selectedDate = toDate(value);
            if (selectedDate) viewDate = new Date(selectedDate);
            updateTriggerText();
            if (isOpen) render();
        },
        getValue() {
            return fromDate(selectedDate, config.timestampFormat!);
        },
        setOptions(newOptions) {
            config = resolveConfig({ ...config, ...newOptions });
            if (newOptions.value !== undefined) {
                selectedDate = toDate(newOptions.value);
                if (selectedDate) viewDate = new Date(selectedDate);
            }
            updateTriggerText();
            if (isOpen) render();
        },
        destroy() {
            closePicker();
            root.remove();
        },
        isOpen: () => isOpen,
        element: root,
    };
}
