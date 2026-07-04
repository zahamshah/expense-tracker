import { TIME_ZONE } from "@/lib/constants";

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  weekday: "short",
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  month: "short",
  year: "numeric",
});

export function formatDisplayDate(date: Date | string) {
  return dateFormatter.format(new Date(date));
}

export function formatMonthLabel(date: Date | string) {
  return monthFormatter.format(new Date(date));
}

export function formatDateInput(date: Date | string) {
  const parts = getZonedParts(new Date(date));
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(
    parts.day,
  ).padStart(2, "0")}`;
}

export function dateInputToUtcDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return zonedDateTimeToUtc(year, month, day, 0, 0, 0);
}

export function startOfTodayInLondon(now = new Date()) {
  const parts = getZonedParts(now);
  return zonedDateTimeToUtc(parts.year, parts.month, parts.day, 0, 0, 0);
}

export function startOfTomorrowInLondon(now = new Date()) {
  return addDaysInLondon(startOfTodayInLondon(now), 1);
}

export function startOfWeekInLondon(now = new Date()) {
  const today = startOfTodayInLondon(now);
  const weekday = getZonedParts(today).weekday;
  const mondayOffset = weekdayToMondayOffset(weekday);
  return addDaysInLondon(today, -mondayOffset);
}

export function startOfMonthInLondon(now = new Date()) {
  const parts = getZonedParts(now);
  return zonedDateTimeToUtc(parts.year, parts.month, 1, 0, 0, 0);
}

export function addDaysInLondon(date: Date, days: number) {
  const parts = getZonedParts(date);
  const shifted = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return zonedDateTimeToUtc(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
    parts.hour,
    parts.minute,
    parts.second,
  );
}

export function addMonthsInLondon(date: Date, months: number) {
  const parts = getZonedParts(date);
  const shifted = new Date(Date.UTC(parts.year, parts.month - 1 + months, 1));
  return zonedDateTimeToUtc(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    1,
    parts.hour,
    parts.minute,
    parts.second,
  );
}

export function monthKey(date: Date | string) {
  const parts = getZonedParts(new Date(date));
  return `${parts.year}-${String(parts.month).padStart(2, "0")}`;
}

export function getZonedParts(date: Date): ZonedParts {
  const values: Record<string, string> = {};

  for (const part of dateTimeFormatter.formatToParts(date)) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
    weekday: values.weekday,
  };
}

function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const guessedParts = getZonedParts(utcGuess);
  const guessedAsUtc = Date.UTC(
    guessedParts.year,
    guessedParts.month - 1,
    guessedParts.day,
    guessedParts.hour,
    guessedParts.minute,
    guessedParts.second,
  );
  const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const offset = guessedAsUtc - utcGuess.getTime();

  return new Date(desiredAsUtc - offset);
}

function weekdayToMondayOffset(weekday: string) {
  const offsets: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };

  return offsets[weekday] ?? 0;
}
