// src/types/index.ts

export interface Department {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: number | null;
  role: string;
  position: string;
  date_of_joining: string;
  date_of_birth: string;
  address: string;
  salary: number;
  is_admin: boolean;
  status: string;
  created_at: string;
  departments?: Department;
}

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  notes: string;
  created_at: string;
  employees?: Employee;
}

export interface Leave {
  id: number;
  employee_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: string;
  approved_by: number | null;
  created_at: string;
  employees?: Employee;
}

export interface Payroll {
  id: number;
  employee_id: number;
  month: string;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: string;
  created_at: string;
  employees?: Employee;
}