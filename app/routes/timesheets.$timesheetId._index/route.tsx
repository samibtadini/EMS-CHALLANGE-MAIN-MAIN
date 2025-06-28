import { Form, redirect, useParams, useActionData } from "react-router";
import { getDB } from "~/db/getDB";

export async function action({ request, params }: any) {
  const db = await getDB();
  const timesheetId = parseInt(params.timesheetId, 10);

  if (!timesheetId) {
    throw new Error("Timesheet ID is required");
  }

  const formData = await request.formData();
  
  const formatForDB = (datetimeLocal: string) => {
    return datetimeLocal.replace('T', ' ') + ':00';
  };

  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;

  if (new Date(startTime) >= new Date(endTime)) {
    return {
      error: "End time must be after start time"
    };
  }

  await db.run(
    "UPDATE timesheets SET start_time = ?, end_time = ? WHERE id = ?",
    formatForDB(startTime),
    formatForDB(endTime),
    timesheetId
  );

  return redirect(`/employees/${timesheetId}`);
}

export default function CreateTimesheet() {
  const { timesheetId } = useParams();
  const actionData = useActionData() as { error?: string };

  const getCurrentDatetime = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const defaultStart = getCurrentDatetime();
  const defaultEnd = new Date(new Date(defaultStart).getTime() + 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h2 className="h4 mb-0">
            {timesheetId ? `Edit Timesheet #${timesheetId}` : "Create New Timesheet"}
          </h2>
        </div>
        
        <div className="card-body">
          <Form method="post">
            {actionData?.error && (
              <div className="alert alert-danger mb-4">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {actionData.error}
              </div>
            )}
            
            <div className="mb-3">
              <label className="form-label">Start Time</label>
              <input 
                type="datetime-local" 
                name="start_time" 
                className="form-control"
                required
                defaultValue={defaultStart}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label">End Time</label>
              <input 
                type="datetime-local" 
                name="end_time" 
                className="form-control"
                required
                defaultValue={defaultEnd}
                min={defaultStart}
              />
            </div>
            
            <div className="d-flex justify-content-end gap-2">
              <a 
                href={`/employees/${timesheetId}`} 
                className="btn btn-outline-secondary"
              >
                Cancel
              </a>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                <i className="bi bi-save me-2"></i>
                Save Timesheet
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}