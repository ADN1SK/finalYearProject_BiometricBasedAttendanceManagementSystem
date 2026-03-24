# Implementation Plan: Dynamic Global Configuration

## Goal Description
We will make the "Save Global Config" placeholder functional by building an actual enterprise-tier Settings module within the **System Setup** dashboard.

## Proposed Changes

### Backend (`reporting` app)
Rather than executing a heavy PostgreSQL schema migration just for a few configuration keys, we will implement a robust File-System-based Configuration Store (`backend_django/global_config.json`). This is standard practice for DevOps configuration schemas as it allows settings to be easily version-controlled and deployed.
#### [MODIFY] [reporting/views.py](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/backend_django/reporting/views.py)
- Expose `GET /api/reporting/global-config/` to securely retrieve current system settings.
- Expose `POST /api/reporting/global-config/update/` to securely patch and overwrite settings to the JSON file.

### Frontend ([SystemSetupView.tsx](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/Frontend-design/src/views/SystemSetupView.tsx))
#### [MODIFY] [src/views/SystemSetupView.tsx](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/Frontend-design/src/views/SystemSetupView.tsx)
- Add a new visual section below the Telemetry panels titled **Engine Parameters**.
- Render 3 functional setting controls:
  - `Default Session Timeout` (Numeric Input: minutes)
  - `Strict Check-in Enforcement` (Toggle)
  - `Max Login Attempts` (Numeric Input)
- The **Save Global Config** button will pulse when unsaved changes exist, and `POST` directly to the backend on click.

## Verification Plan
### Manual Verification
1. Navigate to "Workflow & Setup".
2. Change the "Default Session Timeout" parameter.
3. Click "Save Global Config".
4. Refresh the page to verify the configurations securely persisted and reloaded from the backend JSON file natively.
