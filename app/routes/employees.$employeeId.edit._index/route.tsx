import { Form, useLoaderData, redirect, useActionData } from "react-router";
import { getDB } from "~/db/getDB";
import { handleFileUpload } from "~/utils/fileUpload";

type FormErrors = {
  full_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  job_title?: string;
  department?: string;
  salary?: string;
  start_date?: string;
  photo?: string;
  cv?: string;
  id_document?: string;
};

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

export async function action({ request, params }: any) {
  const db = await getDB();
  const formData = await request.formData();
  
  const employeeId = parseInt(params.employeeId, 10);
  const currentEmployee = await db.get("SELECT * FROM employees WHERE id = ?", employeeId);
  
  if (!currentEmployee) {
    throw new Error("Employee not found");
  }


  const full_name = formData.get("full_name")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const date_of_birth = formData.get("date_of_birth")?.toString() || "";
  const job_title = formData.get("job_title")?.toString() || "";
  const department = formData.get("department")?.toString() || "";
  const salary = formData.get("salary")?.toString() || "";
  const start_date = formData.get("start_date")?.toString() || "";
  
  
  const photo = formData.get("photo") as File | null;
  const cv = formData.get("cv") as File | null;
  const id_document = formData.get("id_document") as File | null;

 
  const errors: FormErrors = {};
  if (!full_name.trim()) errors.full_name = "Full name is required";
  if (!email.trim()) errors.email = "Email is required";
  if (!job_title.trim()) errors.job_title = "Job title is required";
  if (!department.trim()) errors.department = "Department is required";
  if (!salary.trim()) errors.salary = "Salary is required";
  if (!start_date.trim()) errors.start_date = "Start date is required";

  
  let photoPath = currentEmployee.photo_path;
  let cvPath = currentEmployee.cv_path;
  let idDocumentPath = currentEmployee.id_path;

  try {
    if (photo && photo.size > 0) {
      photoPath = await handleFileUpload(photo, 'photo');
    }
    if (cv && cv.size > 0) {
      cvPath = await handleFileUpload(cv, 'cv');
    }
    if (id_document && id_document.size > 0) {
      idDocumentPath = await handleFileUpload(id_document, 'id');
    }
  } catch (error) {
    errors.photo = "Failed to upload profile image";
    errors.cv = "Failed to upload CV";
    errors.id_document = "Failed to upload ID document";
    return { errors };
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  
  await db.run(
    `UPDATE employees SET
      full_name = ?,
      email = ?,
      phone = ?,
      date_of_birth = ?,
      job_title = ?,
      department = ?,
      salary = ?,
      start_date = ?,
      photo_path = ?,
      cv_path = ?,
      id_path = ?
    WHERE id = ?`,
    [
      full_name, 
      email, 
      phone, 
      date_of_birth, 
      job_title, 
      department, 
      salary, 
      start_date,
      photoPath,
      cvPath,
      idDocumentPath,
      employeeId
    ]
  );

  return redirect(`/employees/${employeeId}`);
}

export default function EditEmployeePage() {
  const { employee } = useLoaderData() as { employee: any };
  const actionData = useActionData() as { errors?: FormErrors };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h1 className="h4 mb-0">Edit Employee: {employee.full_name}</h1>
        </div>
        
        <div className="card-body">
          <Form method="post" encType="multipart/form-data">
            <div className="row">
              <div className="col-md-6">
               
                <div className="mb-4">
                  <h3 className="h5 mb-3 text-primary">Personal Information</h3>
                  
                  <div className="mb-3">
                    <label htmlFor="full_name" className="form-label">Full Name*</label>
                    <input
                      type="text"
                      className={`form-control ${actionData?.errors?.full_name ? 'is-invalid' : ''}`}
                      name="full_name"
                      id="full_name"
                      defaultValue={employee.full_name}
                      required
                    />
                    {actionData?.errors?.full_name && (
                      <div className="invalid-feedback">{actionData.errors.full_name}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email*</label>
                    <input
                      type="email"
                      className={`form-control ${actionData?.errors?.email ? 'is-invalid' : ''}`}
                      name="email"
                      id="email"
                      defaultValue={employee.email}
                      required
                    />
                    {actionData?.errors?.email && (
                      <div className="invalid-feedback">{actionData.errors.email}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input
                      type="tel"
                      className={`form-control ${actionData?.errors?.phone ? 'is-invalid' : ''}`}
                      name="phone"
                      id="phone"
                      defaultValue={employee.phone}
                    />
                    {actionData?.errors?.phone && (
                      <div className="invalid-feedback">{actionData.errors.phone}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="date_of_birth" className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className={`form-control ${actionData?.errors?.date_of_birth ? 'is-invalid' : ''}`}
                      name="date_of_birth"
                      id="date_of_birth"
                      defaultValue={employee.date_of_birth}
                    />
                    {actionData?.errors?.date_of_birth && (
                      <div className="invalid-feedback">{actionData.errors.date_of_birth}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-4">
                  <h3 className="h5 mb-3 text-primary">Employment Information</h3>
                  
                  <div className="mb-3">
                    <label htmlFor="job_title" className="form-label">Job Title*</label>
                    <input
                      type="text"
                      className={`form-control ${actionData?.errors?.job_title ? 'is-invalid' : ''}`}
                      name="job_title"
                      id="job_title"
                      defaultValue={employee.job_title}
                      required
                    />
                    {actionData?.errors?.job_title && (
                      <div className="invalid-feedback">{actionData.errors.job_title}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="department" className="form-label">Department*</label>
                    <input
                      type="text"
                      className={`form-control ${actionData?.errors?.department ? 'is-invalid' : ''}`}
                      name="department"
                      id="department"
                      defaultValue={employee.department}
                      required
                    />
                    {actionData?.errors?.department && (
                      <div className="invalid-feedback">{actionData.errors.department}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="salary" className="form-label">Salary*</label>
                    <input
                      type="number"
                      className={`form-control ${actionData?.errors?.salary ? 'is-invalid' : ''}`}
                      name="salary"
                      id="salary"
                      defaultValue={employee.salary}
                      step="0.01"
                      min="0"
                      required
                    />
                    {actionData?.errors?.salary && (
                      <div className="invalid-feedback">{actionData.errors.salary}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="start_date" className="form-label">Start Date*</label>
                    <input
                      type="date"
                      className={`form-control ${actionData?.errors?.start_date ? 'is-invalid' : ''}`}
                      name="start_date"
                      id="start_date"
                      defaultValue={employee.start_date}
                      required
                    />
                    {actionData?.errors?.start_date && (
                      <div className="invalid-feedback">{actionData.errors.start_date}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="h5 mb-3 text-primary">Documents</h3>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="photo" className="form-label">Profile Photo</label>
                  {employee.photo_path && (
                    <div className="mb-2">
                      <p className="small text-muted">Current Photo:</p>
                      <img
                        src={employee.photo_path}
                        alt="Profile"
                        className="img-thumbnail mb-2"
                        style={{ maxWidth: "150px", maxHeight: "150px" }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    className={`form-control ${actionData?.errors?.photo ? 'is-invalid' : ''}`}
                    name="photo"
                    id="photo"
                    accept="image/*"
                  />
                  {actionData?.errors?.photo && (
                    <div className="invalid-feedback">{actionData.errors.photo}</div>
                  )}
                </div>
                
                <div className="col-md-4 mb-3">
                  <label htmlFor="cv" className="form-label">CV (PDF/DOC)</label>
                  {employee.cv_path && (
                    <div className="mb-2">
                      <p className="small text-muted">Current CV:</p>
                      <a
                        href={employee.cv_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="bi bi-download"></i> Download CV
                      </a>
                    </div>
                  )}
                  <input
                    type="file"
                    className={`form-control ${actionData?.errors?.cv ? 'is-invalid' : ''}`}
                    name="cv"
                    id="cv"
                    accept=".pdf,.doc,.docx"
                  />
                  {actionData?.errors?.cv && (
                    <div className="invalid-feedback">{actionData.errors.cv}</div>
                  )}
                </div>
                
                <div className="col-md-4 mb-3">
                  <label htmlFor="id_document" className="form-label">ID Document (PDF/Image)</label>
                  {employee.id_path && (
                    <div className="mb-2">
                      <p className="small text-muted">Current ID Document:</p>
                      <a
                        href={employee.id_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="bi bi-download"></i> Download ID
                      </a>
                    </div>
                  )}
                  <input
                    type="file"
                    className={`form-control ${actionData?.errors?.id_document ? 'is-invalid' : ''}`}
                    name="id_document"
                    id="id_document"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {actionData?.errors?.id_document && (
                    <div className="invalid-feedback">{actionData.errors.id_document}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="d-flex justify-content-between mt-4">
              <a href={`/employees/${employee.id}`} className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left"></i> Cancel
              </a>
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-save"></i> Save Changes
              </button>
            </div>
          </Form>
        </div>
      </div>
      
      <div className="mt-3">
        <ul className="nav">
          <li className="nav-item">
            <a href="/employees" className="nav-link">All Employees</a>
          </li>
          <li className="nav-item">
            <a href="/employees/new" className="nav-link">New Employee</a>
          </li>
          <li className="nav-item">
            <a href={`/timesheets/${employee.id}`} className="nav-link">Timesheets</a>
          </li>
        </ul>
      </div>
    </div>
  );
}