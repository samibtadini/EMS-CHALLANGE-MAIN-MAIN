import { useLoaderData } from "react-router";
import { getDB } from "~/db/getDB";

export async function loader({ params }: any) {
  const db = await getDB();
  const employeeId = parseInt(params.employeeId, 10);

  if (isNaN(employeeId)) {
    throw new Error("Invalid employee ID");
  }
  const employee = await db.get("SELECT * FROM employees WHERE id = ?", employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }
  return { employee };
}

export default function EmployeePage() {
  const { employee } = useLoaderData() as { employee: any };
  
  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0">Employee Details</h1>
            <a 
              href={`/employees/${employee.id}/edit`} 
              className="btn btn-light btn-sm"
            >
              <i className="bi bi-pencil-square"></i> Edit
            </a>
          </div>
        </div>
        
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 text-center mb-4 mb-md-0">
              <img 
                src={employee.photo_path} 
                alt={`${employee.full_name}'s photo`} 
                className="img-thumbnail rounded-circle"
                style={{ width: '200px', height: '200px', objectFit: 'cover' }}
              />
            </div>
            
            <div className="col-md-8">
              <h2 className="h3 mb-3">{employee.full_name}</h2>
              
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Employee ID:</strong> {employee.id}</p>
                  <p><strong>Email:</strong> {employee.email}</p>
                  <p><strong>Phone:</strong> {employee.phone}</p>
                  <p><strong>Department:</strong> {employee.department}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Job Title:</strong> {employee.job_title}</p>
                  <p><strong>Salary:</strong> {employee.salary}</p>
                  <p><strong>Date of Birth:</strong> {employee.date_of_birth}</p>
                  <p><strong>Start Date:</strong> {employee.start_date}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <a 
                  href={employee.cv_path} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary me-2"
                >
                  <i className="bi bi-file-earmark-person"></i> My Resume
                </a>
                <a 
                  href={employee.id_path} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-person-badge"></i> Identity
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-footer bg-light">
          <div className="d-flex justify-content-between">
            <a href="/employees" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left"></i> Back to Employees
            </a>
            <div>
              <a href="/employees/new" className="btn btn-outline-success me-2">
                <i className="bi bi-plus-circle"></i> New Employee
              </a>
              <a href={`/timesheets/${employee.id}`} className="btn btn-outline-info">
                <i className="bi bi-calendar-check"></i> Timesheets
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}