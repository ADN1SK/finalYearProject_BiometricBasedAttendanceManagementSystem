# Goal Description
The objective is to make the configured policies "functional" by integrating them into the core attendance validation logic. This ensures that rules defined in the dashboard (like Grace Periods) are automatically applied when an employee marks their attendance.

## Proposed Changes

### Backend Utilities
#### [NEW] backend_django/leave/utils.py
- Create a [PolicyResolver](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/backend_django/leave/utils.py#6-71) class or set of helper functions:
  - [get_active_policy(name, department=None)](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/backend_django/leave/utils.py#12-36): Fetches a policy by name, with fallback to global if department-specific isn't found.
  - `is_within_grace_period(shift_start, check_in_time, grace_minutes)`: Helper for late-arrival logic.

### HR Group and Permission Synchronization
#### [MODIFY] backend_django/accounts/models.py
- Import `Group` and `Permission`.
- Update `User.save()` to synchronize "HR" role with "HR_MANAGEMENT" group.
- Grant `view_attendancerecord` and `change_attendancerecord` to the group.

### Attendance Integration
#### [MODIFY] backend_django/attendance/views.py
- Import the policy resolver.
- In [mark_attendance](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/backend_django/attendance/views.py#150-340), fetch the `Grace Period` policy.
- Adjust the `status` (ON_TIME vs LATE) based on the policy's [value](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/backend_django/leave/utils.py#37-50) (e.g., if grace period is 15 mins, a 9:10 AM clock-in for a 9:00 AM shift is ON_TIME).

### Reporting Integration
#### [MODIFY] backend_django/reporting/views.py (Future)
- Use policies like `Holiday Premium Pay` or `Overtime Protocol` to calculate total payable hours.

### External Integration Hub
#### [MODIFY] [views.py](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/backend_django/accounts/views.py)
Implementation of integration management logic:
- `api_list_integrations`: Returns current status of all third-party connectors.
- `api_toggle_integration`: handles the "Connect/Disconnect" flow for specific external systems.

#### [MODIFY] [urls.py](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/backend_django/accounts/urls.py)
Routing for integration management:
- `/api/integrations/`: Fetch all connectors.
- `/api/integrations/<id>/toggle/`: Update connection status.

#### [MODIFY] [ExternalIntegrationView.tsx](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/Frontend-design/src/views/ExternalIntegrationView.tsx)
- Integrate `useEffect` to fetch live data from the backend.
- Replace static cards with reactive components that handle "Sync" and "Connection Toggle" events.

## Verification Plan
### Automated Tests
- Create a test case where a user logs in 5 minutes late with a 15-minute grace period policy active. Verify the status is `ON_TIME`.
- Disable the policy and verify the status becomes `LATE`.
- `python manage.py shell -c "from accounts.models import User; u = User.objects.get(username='hr'); print(u.groups.all())"`
