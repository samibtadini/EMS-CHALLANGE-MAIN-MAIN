import { useLoaderData } from "react-router"
import { getDB } from "~/db/getDB"

export async function loader() {
  const db = await getDB()
  const employees = await db.all("SELECT * FROM employees;")

  return { employees }
}

export default function EmployeesPage() {
  const { employees } = useLoaderData()
  return (
    <div className="container mt-4">
      <div className="row">
        {employees.map((employee: any) => (
          <div key={employee.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">Employee #{employee.id}</h5>
              </div>
              <div className="card-body">
                <div className="text-center mb-3">
                  <img 
                    src={employee.photo_path} 
                    alt="Employee Photo" 
                    className="img-thumbnail rounded-circle" 
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                  />
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item"><strong>Full Name:</strong> {employee.full_name}</li>
                  <li className="list-group-item"><strong>Email:</strong> {employee.email}</li>
                  <li className="list-group-item"><strong>Department:</strong> {employee.department}</li>
                  <li className="list-group-item"><strong>Job Title:</strong> {employee.job_title}</li>
                  <li className="list-group-item"><strong>Salary:</strong> {employee.salary}</li>
                  <li className="list-group-item"><strong>Date of Birth:</strong> {employee.date_of_birth}</li>
                  <li className="list-group-item"><strong>Phone:</strong> {employee.phone}</li>
                  <li className="list-group-item"><strong>Created At:</strong> {employee.start_date}</li>
                </ul>
              </div>
              <div className="card-footer">
                <div className="d-flex justify-content-between">
                  <a href={employee.cv_path} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">My Resume</a>
                  <a href={employee.id_path} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">Identity</a>
                  <a href={`/employees/${employee.id}`} className="btn btn-sm btn-primary">View Details</a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <hr className="my-4" />
      
      <div className="d-flex justify-content-center gap-3 mb-4">
        <a href="/employees/new" className="btn btn-success">New Employee</a>
        <a href="/timesheets/" className="btn btn-info">Timesheets</a>
      </div>
    </div>
  )
}