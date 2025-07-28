import { useState, useEffect } from "react";



/*
<TimeDisplay /> 
// shows current local date & time, updates every second

<TimeDisplay format="date" /> 
// shows only the date like "Jul 25, 2025"

<TimeDisplay format="time" refreshInterval={60000} /> 
// shows only time, updates every minute

<TimeDisplay date={someTimestamp} format="datetime" locale="de-DE" />
// shows date & time for a specific timestamp with German locale
*/


interface TimeDisplayProps {
  /**
   * Optional date or timestamp to display.
   * If not provided, the current date/time (new Date()) is used.
   */
  date?: Date | number;

  /**
   * Controls how the date is formatted:
   * - "date" = only the date (e.g. Jul 25, 2025)
   * - "time" = only the time (e.g. 14:53:10)
   * - "datetime" = full date and time (e.g. Jul 25, 2025, 14:53:10)
   * Default is "datetime".
   */
  format?: "date" | "time" | "datetime";

  /**
   * Optional locale string (e.g. "en-US", "de-DE").
   * If not provided, the browser’s default locale is used.
   */
  locale?: string;

  /**
   * How often the displayed time should update (in milliseconds).
   * For example:
   * - 1000 = updates every second (default)
   * - 60000 = updates every minute
   * If omitted, defaults to 1000ms (1 second).
   */
  refreshInterval?: number;
}


export function TimeDisplay({
  date,
  format = "datetime",
  locale,
  refreshInterval = 1000,
}: TimeDisplayProps) {
  /**
   * Returns the date to be displayed.
   * - If a `date` prop is provided, it's converted to a Date object.
   * - If not, it defaults to the current date and time (new Date()).
   */
  const getInitialDate = () => (date ? new Date(date) : new Date());



const [now, setNow] = useState(getInitialDate)

useEffect(() => {
    // if date prop changes, reset now immediately
    setNow(getInitialDate());

    // Set up interval to update
    const timer = setInterval(() => {
        setNow(getInitialDate());
    }, refreshInterval);

    return() => clearInterval(timer)
}, [date, refreshInterval]);

// Choose formatting function based on format prop
  const formatted =
    format === "date"
      ? now.toLocaleDateString(locale, {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : format === "time"
      ? now.toLocaleTimeString(locale)
      : now.toLocaleString(locale);

  return <span>{formatted}</span>;
}