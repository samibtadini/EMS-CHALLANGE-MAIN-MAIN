import { Form, redirect, useActionData, useLoaderData } from "react-router";
import { getDB } from "~/db/getDB";

export async function action({ request }: any) {
  const db = await getDB();
  const formData = await request.formData();
  
  const employeeId = formData.get('employee_id');
  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;

  // Validate inputs
  if (!employeeId) {
    return { error: "Employee selection is required" };
  }

  if (new Date(startTime) >= new Date(endTime)) {
    return { error: "End time must be after start time" };
  }

  // Format for database
  const formatForDB = (datetimeLocal: string) => {
    return datetimeLocal.replace('T', ' ') + ':00';
  };

  await db.run(
    "INSERT INTO timesheets (employee_id, start_time, end_time) VALUES (?, ?, ?)",
    employeeId,
    formatForDB(startTime),
    formatForDB(endTime)
  );

  return redirect(`/employees/${employeeId}`);
}

export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT id, full_name FROM employees ORDER BY full_name");
  return { employees };
}

export default function CreateTimesheet() {
  const { employees } = useLoaderData() as { employees: Array<{id: number, full_name: string}> };
  const actionData = useActionData() as { error?: string };

  // Helper to get current datetime in format for datetime-local input
  const getCurrentDatetime = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  // Set default end time to 1 hour after start time
  const defaultStart = getCurrentDatetime();
  const defaultEnd = new Date(new Date(defaultStart).getTime() + 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h2 className="h4 mb-0">Create New Timesheet</h2>
        </div>
        
        <div className="card-body">
          <Form method="post">
            {actionData?.error && (
              <div className="alert alert-danger mb-4">
                {actionData.error}
              </div>
            )}
            
            <div className="mb-3">
              <label className="form-label">Employee:</label>
              <select 
                name="employee_id" 
                className="form-select"
                required
              >
                <option value="">Select Employee</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Start Time:</label>
              <input 
                type="datetime-local" 
                name="start_time" 
                className="form-control"
                required
                defaultValue={defaultStart}
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label">End Time:</label>
              <input 
                type="datetime-local" 
                name="end_time" 
                className="form-control"
                required
                defaultValue={defaultEnd}
                min={defaultStart}
              />
            </div>
            
            <div className="d-flex justify-content-end">
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Save Timesheet
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}