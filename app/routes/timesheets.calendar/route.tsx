import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "@schedule-x/theme-default/dist/index.css";
import { useEffect, useState } from "react";
import { getDB } from "~/db/getDB";
import { useLoaderData } from "react-router";

export async function loader() {
  const db = await getDB();
  const timesheetsAndEmployees = await db.all(
    "SELECT timesheets.*, employees.full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id"
  );
  return { timesheetsAndEmployees };
}

function CalendarApp() {
  const eventsService = useState(() => createEventsServicePlugin())[0];
  const { timesheetsAndEmployees } = useLoaderData();

const events = timesheetsAndEmployees.map((timesheet: { id: { toString: () => any; }; full_name: any; start_time: any; end_time: any; }) => {
// Format to 'YYYY-MM-DD HH:mm'
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const start = formatDate(timesheet.start_time);
  const end = formatDate(timesheet.end_time);

  return {
    id: timesheet.id.toString(),
    title: `${timesheet.full_name}`,
    start: start,
    end: end,
    description: `Employee: ${timesheet.full_name}`,
    calendarId: 'work'
  };
});

  const calendar = useCalendarApp({
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
    events: events,
    plugins: [eventsService],
  });

  useEffect(() => {
    // get all events
    eventsService.getAll();
  }, []);

  return (
    <div>
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}

export default CalendarApp;