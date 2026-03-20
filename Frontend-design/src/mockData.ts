import { User, AttendanceRecord, LeaveRequest, DashboardStats, AuditLog, Shift, Notification, Integration, ProjectMember } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@hu-iot.edu', role: 'ADMIN', department: 'IT Administration' },
  { id: '2', name: 'HR Officer', email: 'hr@hu-iot.edu', role: 'HR_OFFICER', department: 'Human Resources' },
  { id: '3', name: 'Elsaye Arba', email: 'elsaye@hu-iot.edu', role: 'EMPLOYEE', department: 'Computer Science' },
  { id: '4', name: 'Destaye Andegna', email: 'destaye@hu-iot.edu', role: 'EMPLOYEE', department: 'Computer Science' },
  { id: '5', name: 'Biruk Bedilu', email: 'biruk@hu-iot.edu', role: 'EMPLOYEE', department: 'Computer Science' },
];

export const MOCK_STATS: DashboardStats = {
  totalEmployees: 156,
  presentToday: 142,
  absentToday: 8,
  lateToday: 6,
  pendingLeaves: 12,
};

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', userId: '3', date: '2026-03-19', checkIn: '08:00 AM', checkOut: '05:00 PM', status: 'ON_TIME', workHours: 8 },
  { id: 'a2', userId: '4', date: '2026-03-19', checkIn: '08:15 AM', checkOut: '05:15 PM', status: 'LATE', workHours: 8 },
  { id: 'a3', userId: '5', date: '2026-03-19', checkIn: '07:55 AM', checkOut: '04:55 PM', status: 'ON_TIME', workHours: 8 },
  { id: 'a4', userId: '3', date: '2026-03-18', checkIn: '08:05 AM', checkOut: '05:05 PM', status: 'ON_TIME', workHours: 8 },
];

export const MOCK_LEAVES: LeaveRequest[] = [
  { 
    id: 'l1', 
    userId: '3', 
    userName: 'Elsaye Arba', 
    type: 'ANNUAL', 
    startDate: '2026-04-01', 
    endDate: '2026-04-05', 
    reason: 'Family vacation', 
    status: 'PENDING', 
    submittedAt: '2026-03-15' 
  },
  { 
    id: 'l2', 
    userId: '4', 
    userName: 'Destaye Andegna', 
    type: 'SICK', 
    startDate: '2026-03-20', 
    endDate: '2026-03-21', 
    reason: 'Medical checkup', 
    status: 'APPROVED', 
    submittedAt: '2026-03-18' 
  },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log1',
    userId: '1',
    userName: 'Admin User',
    action: 'UPDATE_ROLE',
    resource: 'User: Biruk Bedilu',
    timestamp: '2026-03-19 10:30 AM',
    details: 'Changed role from EMPLOYEE to HR_OFFICER',
    ipAddress: '192.168.1.105'
  },
  {
    id: 'log2',
    userId: '1',
    userName: 'Admin User',
    action: 'SET_POLICY',
    resource: 'Attendance Policy',
    timestamp: '2026-03-19 09:15 AM',
    details: 'Updated late arrival threshold to 15 minutes',
    ipAddress: '192.168.1.105'
  },
  {
    id: 'log3',
    userId: '2',
    userName: 'HR Officer',
    action: 'APPROVE_LEAVE',
    resource: 'Leave: Destaye Andegna',
    timestamp: '2026-03-18 04:45 PM',
    details: 'Approved sick leave for 2 days',
    ipAddress: '192.168.1.112'
  },
  {
    id: 'log4',
    userId: '1',
    userName: 'Admin User',
    action: 'SYSTEM_CONFIG',
    resource: 'Biometric Device',
    timestamp: '2026-03-18 11:00 AM',
    details: 'Re-calibrated facial recognition sensor',
    ipAddress: '192.168.1.105'
  }
];

export const MOCK_SHIFTS: Shift[] = [
  { id: '1', name: 'Morning Shift', startTime: '08:00 AM', endTime: '04:00 PM', employeeCount: 45, status: 'ACTIVE', color: 'bg-blue-500' },
  { id: '2', name: 'Afternoon Shift', startTime: '04:00 PM', endTime: '12:00 AM', employeeCount: 32, status: 'ACTIVE', color: 'bg-amber-500' },
  { id: '3', name: 'Night Shift', startTime: '12:00 AM', endTime: '08:00 AM', employeeCount: 18, status: 'ACTIVE', color: 'bg-slate-800' },
  { id: '4', name: 'Weekend Shift', startTime: '09:00 AM', endTime: '05:00 PM', employeeCount: 12, status: 'INACTIVE', color: 'bg-emerald-500' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'New Leave Request', message: 'Elsaye Arba has submitted a new leave request.', timestamp: '10 mins ago', type: 'LEAVE', severity: 'INFO', read: false },
  { id: '2', title: 'System Maintenance', message: 'The biometric terminal will be offline for 15 mins at 2:00 PM.', timestamp: '2 hours ago', type: 'SYSTEM', severity: 'WARNING', read: false },
  { id: '3', title: 'Attendance Alert', message: '5 employees are marked as late today.', timestamp: '5 hours ago', type: 'ALERT', severity: 'ERROR', read: true },
  { id: '4', title: 'Profile Updated', message: 'Your profile information has been successfully updated.', timestamp: '1 day ago', type: 'USER', severity: 'SUCCESS', read: true },
  { id: '5', title: 'Shift Reassignment', message: 'You have been reassigned to the Morning Shift.', timestamp: '2 days ago', type: 'SYSTEM', severity: 'INFO', read: true },
];

export const MOCK_INTEGRATIONS: Integration[] = [
  { id: '1', name: 'Payroll System API', description: 'Sync attendance data with finance', status: 'CONNECTED', type: 'PAYROLL', lastSync: '2026-03-18 23:59:01', icon: 'Shield' },
  { id: '2', name: 'ERP Integration', description: 'Connect with University ERP', status: 'PENDING', type: 'HR_SYSTEM', icon: 'Users' },
  { id: '3', name: 'Slack Notifications', description: 'Send alerts to staff channels', status: 'DISCONNECTED', type: 'COMMUNICATION', icon: 'Bell' },
  { id: '4', name: 'Email Gateway', description: 'Institutional email notifications', status: 'CONNECTED', type: 'COMMUNICATION', lastSync: '2026-03-19 08:00:00', icon: 'FileText' },
];

export const MOCK_PROJECT_MEMBERS: ProjectMember[] = [
  { id: '1', name: 'ELSAYE ARBA', id_no: '0486/15', role: 'Lead Developer' },
  { id: '2', name: 'DESTAYE ANDEGNA', id_no: '0431/15', role: 'UI/UX Designer' },
  { id: '3', name: 'BIRUK BEDILU', id_no: '0325/15', role: 'Backend Engineer' },
  { id: '4', name: 'KALEB WONDIMU', id_no: '0800/15', role: 'System Analyst' },
  { id: '5', name: 'ADAN MOHAMED', id_no: '1671/15', role: 'QA Engineer' },
];
