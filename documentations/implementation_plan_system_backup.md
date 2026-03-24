# Implementation Plan: Professional Operational Workflows

## Goal Description
We need to replace the placeholder API logic in `/api/reporting/system-operation/<op_name>` with actual Python code that interacts with the operating system and PostgreSQL database engine to perform professional-grade database maintenance and system backups.

## Proposed Changes

### Backend ([reporting/views.py](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/backend_django/reporting/views.py))
We will update the [system_operation](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/backend_django/reporting/views.py#185-193) view handler.

#### [MODIFY] [reporting/views.py](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/backend_django/reporting/views.py)
- Import `subprocess`, [os](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/Frontend-design/src/views/SystemSetupView.tsx#122-126), `shutil`, and `datetime`.
- Define a secure backup directory dynamically (`BASE_DIR / 'backups'`).
- **If `op_name == 'db_maintenance'`**:
  - Since PostgreSQL `VACUUM` commands cannot be executed inside standard Django transaction blocks natively without altering isolation levels, we will use Python's `subprocess.run` to call `vacuumdb` or use `psql` to execute `VACUUM ANALYZE`. 
  - *Alternatively*, we can set Django's database connection to autocommit momentarily to run `with connection.cursor() as cursor: cursor.execute("VACUUM ANALYZE;")` directly. We will use the native Python/Django `autocommit` approach as it is cleaner and doesn't rely on `psql` being in the OS PATH.
- **If `op_name == 'system_backup'`**:
  - Create a timestamped folder inside `backups/`.
  - Use `subprocess.run` with `pg_dump` to export the `BBEAMS` database to a `.sql` file.
  - Optional: Use `shutil.make_archive` to zip the `media/` directory (where user biometric enrollment images might be stored) alongside the `.sql` dump.
  - Return the path/status to the frontend dashboard. 

## Verification Plan

### Manual Verification
1. Navigate to the Workflow & Setup dashboard as a superuser.
2. Click the **Database Maintenance** workflow. Wait for the engine to execute the `VACUUM ANALYZE` command directly on PostgreSQL. The UI should display a success message confirming X tables were optimized.
3. Click the **System Backup** workflow. Watch the UI spin. Navigate to the Django project folder (`backend_django/backups/`) and verify that a new timestamped PostgreSQL `.sql` dump has been generated successfully.
