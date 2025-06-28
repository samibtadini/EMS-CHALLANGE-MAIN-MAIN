import React from "react";
import { Form, redirect, useActionData, type ActionFunction } from "react-router";
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

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

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
  if (!photo || photo.size <= 0) errors.photo = "Photo is required";
  if (!cv || cv.size <= 0) errors.cv = "CV is required";
  if (!id_document || id_document.size <= 0) errors.id_document = "ID document is required";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  const phoneRegex = /^(\d{3}-\d{3}-\d{4})?$/;
  if (phone && !phoneRegex.test(phone)) {
    errors.phone = "Phone must be in XXX-XXX-XXXX format";
  }

  if (date_of_birth) {
    const dob = new Date(date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    if (age < 18) {
      errors.date_of_birth = "Employee must be at least 18 years old";
    }
  }

  const minWage = 15000;
  const salaryValue = parseFloat(salary);
  if (salary && (isNaN(salaryValue) || salaryValue < minWage)) {
    errors.salary = `Salary must be at least $${minWage}`;
  }

  // Start date validation
  if (start_date) {
    const startDate = new Date(start_date);
    const today = new Date();
    if (startDate > today) {
      errors.start_date = "Start date cannot be in the future";
    }
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values: {
        full_name,
        email,
        phone,
        date_of_birth,
        job_title,
        department,
        salary,
        start_date
      }
    };
  }

  let photo_path, cv_path, id_path;

  try {
    photo_path = await handleFileUpload(photo!, 'photo');
    cv_path = await handleFileUpload(cv!, 'cv');
    id_path = await handleFileUpload(id_document!, 'id');
  } catch (error) {
    return { 
      errors: { 
        photo: error instanceof Error ? error.message : "File upload failed",
        cv: error instanceof Error ? error.message : "File upload failed",
        id_document: error instanceof Error ? error.message : "File upload failed"
      } 
    };
  }

  const db = await getDB();
  await db.run(
    `INSERT INTO employees (
      full_name, 
      email, 
      phone, 
      date_of_birth, 
      job_title, 
      department, 
      salary, 
      start_date, 
      photo_path,
      cv_path,
      id_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      full_name, 
      email, 
      phone, 
      date_of_birth, 
      job_title, 
      department, 
      salary, 
      start_date, 
      photo_path, 
      cv_path,
      id_path
    ]
  );

  return redirect("/employees");
}

export default function NewEmployeePage() {
  const actionData = useActionData() as { errors?: FormErrors };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h1 className="h4 mb-0">Create New Employee</h1>
        </div>
        
        <div className="card-body">
          <Form method="post" encType="multipart/form-data">
            <div className="row">
              <div className="col-md-6">
                <h3 className="h5 mb-3 text-primary">Personal Information</h3>
                
                <div className="mb-3">
                  <label htmlFor="full_name" className="form-label">Full Name*</label>
                  <input
                    type="text"
                    className={`form-control ${actionData?.errors?.full_name ? 'is-invalid' : ''}`}
                    name="full_name"
                    id="full_name"
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
                    placeholder="XXX-XXX-XXXX"
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
                  />
                  {actionData?.errors?.date_of_birth && (
                    <div className="invalid-feedback">{actionData.errors.date_of_birth}</div>
                  )}
                </div>
              </div>
              
              <div className="col-md-6">
                <h3 className="h5 mb-3 text-primary">Professional Information</h3>
                
                <div className="mb-3">
                  <label htmlFor="job_title" className="form-label">Job Title*</label>
                  <input
                    type="text"
                    className={`form-control ${actionData?.errors?.job_title ? 'is-invalid' : ''}`}
                    name="job_title"
                    id="job_title"
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
                    required
                  />
                  {actionData?.errors?.department && (
                    <div className="invalid-feedback">{actionData.errors.department}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="salary" className="form-label">Salary*</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className={`form-control ${actionData?.errors?.salary ? 'is-invalid' : ''}`}
                      name="salary"
                      id="salary"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
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
                    required
                  />
                  {actionData?.errors?.start_date && (
                    <div className="invalid-feedback">{actionData.errors.start_date}</div>
                  )}
                </div>
              </div>
            </div>
  
            <div className="mt-4">
              <h3 className="h5 mb-3 text-primary">Required Documents</h3>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="photo" className="form-label">Employee Photo*</label>
                  <input
                    type="file"
                    className={`form-control ${actionData?.errors?.photo ? 'is-invalid' : ''}`}
                    name="photo"
                    id="photo"
                    accept="image/*"
                    required
                  />
                  <small className="text-muted">Accepted formats: JPG, PNG</small>
                  {actionData?.errors?.photo && (
                    <div className="invalid-feedback">{actionData.errors.photo}</div>
                  )}
                </div>
                
                <div className="col-md-4 mb-3">
                  <label htmlFor="cv" className="form-label">CV/Resume*</label>
                  <input
                    type="file"
                    className={`form-control ${actionData?.errors?.cv ? 'is-invalid' : ''}`}
                    name="cv"
                    id="cv"
                    accept=".pdf,.doc,.docx"
                    required
                  />
                  <small className="text-muted">Accepted formats: PDF, DOC, DOCX</small>
                  {actionData?.errors?.cv && (
                    <div className="invalid-feedback">{actionData.errors.cv}</div>
                  )}
                </div>
                
                <div className="col-md-4 mb-3">
                  <label htmlFor="id_document" className="form-label">ID Document*</label>
                  <input
                    type="file"
                    className={`form-control ${actionData?.errors?.id_document ? 'is-invalid' : ''}`}
                    name="id_document"
                    id="id_document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                  <small className="text-muted">Accepted formats: PDF, JPG, PNG</small>
                  {actionData?.errors?.id_document && (
                    <div className="invalid-feedback">{actionData.errors.id_document}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="d-flex justify-content-between mt-4">
              <a href="/employees" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left"></i> Cancel
              </a>
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-person-plus"></i> Create Employee
              </button>
            </div>
          </Form>
        </div>
      </div>
      
      <div className="mt-3">
        <ul className="nav">
          <li className="nav-item">
            <a href="/employees" className="nav-link">View All Employees</a>
          </li>
          <li className="nav-item">
            <a href="/timesheets" className="nav-link">View Timesheets</a>
          </li>
        </ul>
      </div>
    </div>
  );
}