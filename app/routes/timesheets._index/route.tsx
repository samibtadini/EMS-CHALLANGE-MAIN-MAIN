import { useLoaderData } from "react-router";
import { useState } from "react";
import { getDB } from "~/db/getDB";

export async function loader() {
  const db = await getDB();
  const timesheetsAndEmployees = await db.all(
    "SELECT timesheets.*, employees.full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id"
  );

  return { timesheetsAndEmployees };
}

export default function TimesheetsPage() {
  const { timesheetsAndEmployees } = useLoaderData() as { timesheetsAndEmployees: any[] };
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h1 className="h4 mb-0">Timesheets</h1>
          <div className="btn-group" role="group">
            <button 
              className={`btn ${viewMode === 'table' ? 'btn-light' : 'btn-outline-light'}`}
              onClick={() => setViewMode('table')}
            >
              <i className="bi bi-table"></i> Table View
            </button>
            <a 
              href="/timesheets/calendar" 
              className={`btn ${viewMode === 'calendar' ? 'btn-light' : 'btn-outline-light'}`}
            >
              <i className="bi bi-calendar-week"></i> Calendar View
            </a>
          </div>
        </div>

        <div className="card-body">
          {viewMode === 'table' ? (
            <div className="table-responsive">
             <table className="table table-striped table-hover table-bordered">
                <thead>
                  <tr>
                    <th>Timesheet ID</th>
                    <th>Employee</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Hours</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheetsAndEmployees.map((timesheet) => {
                    // Calculate hours worked
                    const start = new Date(timesheet.start_time);
                    const end = new Date(timesheet.end_time);
                    const hours = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2);
                    
                    return (
                      <tr key={timesheet.id}>
                        <td>#{timesheet.id}</td>
                        <td>
                          <a href={`/employees/${timesheet.employee_id}`}>
                            {timesheet.full_name}
                          </a>
                        </td>
                        <td>{new Date(timesheet.start_time).toLocaleString()}</td>
                        <td>{new Date(timesheet.end_time).toLocaleString()}</td>
                        <td>{hours} hrs</td>
                        <td>
                          <a 
                            href={`/timesheets/${timesheet.id}`} 
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-eye"></i> View
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="alert alert-info">
                <h4 className="alert-heading">Calendar View</h4>
                <p>
                  To implement the calendar view, see{' '}
                  <a 
                    href="https://schedule-x.dev/docs/frameworks/react" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="alert-link"
                  >
                    Schedule X React documentation
                  </a>.
                </p>
                <hr />
                <p className="mb-0">
                  Currently showing table view. Click "Calendar View" to navigate to the calendar page.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="card-footer bg-light">
          <div className="d-flex justify-content-between">
            <a href="/employees" className="btn btn-outline-secondary">
              <i className="bi bi-people"></i> View Employees
            </a>
            <a href="/timesheets/new" className="btn btn-primary">
              <i className="bi bi-plus-circle"></i> New Timesheet
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}