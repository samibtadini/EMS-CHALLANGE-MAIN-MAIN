
-- This file contains the SQL schema, it drops all tables and recreates them

DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS timesheets;

-- To add a field to a table do
-- CREATE TABLE table_name (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     nullable_field TEXT,
--     non_nullable_field TEXT NOT NULL,
--     numeric_field INTEGER,
--     unique_field TEXT UNIQUE,
--     unique_non_nullable_field TEXT NOT NULL UNIQUE,
--     date_field DATE,
--     datetime_field DATETIME
-- );

-- Create employees table
CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,  
    email TEXT NOT NULL UNIQUE,
    phone TEXT UNIQUE,
    date_of_birth TEXT,
    job_title TEXT NOT NULL,
    department TEXT NOT NULL,
    salary REAL NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    photo_path TEXT,
    cv_path TEXT,
    id_path TEXT
);

-- Create timesheets table
CREATE TABLE timesheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Rest of the fields
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    employee_id INTEGER NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);


ALTER TABLE employees ADD COLUMN photo_path TEXT;
ALTER TABLE employees ADD COLUMN cv_path TEXT;

