/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'HR_OFFICER' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
  enrolled?: boolean;
  must_change_password?: boolean;
}

export interface AttendanceRecord {
  id: string;
  username: string;
  date: string;
  time: string;
  type: string;
  status: string;
  timestamp: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'SICK' | 'ANNUAL' | 'PERSONAL';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  pendingLeaves: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  timestamp: string;
  details: string;
  ipAddress: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  employeeCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  color: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'LEAVE' | 'SYSTEM' | 'ALERT' | 'USER';
  severity: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
  read: boolean;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'PENDING';
  type: 'HR_SYSTEM' | 'PAYROLL' | 'COMMUNICATION' | 'SECURITY';
  lastSync?: string;
  icon: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  id_no: string;
  role: string;
  avatar?: string;
}
