/**
 * Helper to generate 1-click Google Calendar web links and downloadable .ics files (Apple Calendar / Outlook)
 */

export interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM or HH:MM:SS
  durationMinutes?: number;
}

/**
 * Generate Google Calendar Web URL
 */
export function getGoogleCalendarUrl(event: CalendarEventData): string {
  const duration = event.durationMinutes || 60;
  
  // Format date + time into ISO string format YYYYMMDDTHHMMSS
  const timePart = event.timeSlot.length === 5 ? `${event.timeSlot}:00` : event.timeSlot;
  const startDt = new Date(`${event.date}T${timePart}`);
  
  if (isNaN(startDt.getTime())) return "#";

  const endDt = new Date(startDt.getTime() + duration * 60 * 1000);

  const formatIsoStr = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const startIso = formatIsoStr(startDt);
  const endIso = formatIsoStr(endDt);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startIso}/${endIso}`,
    details: event.description,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate & Download .ics file for Apple Calendar / Outlook
 */
export function downloadIcsFile(event: CalendarEventData): void {
  const duration = event.durationMinutes || 60;
  const timePart = event.timeSlot.length === 5 ? `${event.timeSlot}:00` : event.timeSlot;
  const startDt = new Date(`${event.date}T${timePart}`);

  if (isNaN(startDt.getTime())) return;

  const endDt = new Date(startDt.getTime() + duration * 60 * 1000);

  const formatIcsDt = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bicicletas Paysandú//Taller App//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `SUMMARY:${event.title.replace(/\n/g, " ")}`,
    `DESCRIPTION:${event.description.replace(/\n/g, " ")}`,
    `LOCATION:${event.location.replace(/\n/g, " ")}`,
    `DTSTART:${formatIcsDt(startDt)}`,
    `DTEND:${formatIcsDt(endDt)}`,
    `STATUS:CONFIRMED`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Turno_Bicicletas_Paysandu_${event.date}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
