# Implementation Plan: Dynamic Workflow & Setup

## Goal Description
Currently, the "Workflow & Setup" page relies on hardcoded operational workflows (like Backup and Maintenance) and redirects users to the standard Django Admin interface to manage actual [Workflow](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/backend_django/accounts/models.py#113-117) models. We will upgrade the React UI so that administrators can dynamically fetch, create, edit, and delete real Custom Workflows directly from the dashboard, eliminating the jarring context switch to the standard Django Admin.

## Proposed Changes

### Backend (`accounts` app)
We will expose dedicated CRUD endpoints for the [Workflow](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/backend_django/accounts/models.py#113-117) model.
#### [MODIFY] [accounts/urls.py](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/backend_django/accounts/urls.py)
- Expose new paths:
  - `GET /api/workflows/`
  - `POST /api/workflows/create/`
  - `PATCH /api/workflows/<uuid>/update/`
  - `DELETE /api/workflows/<uuid>/delete/`

#### [MODIFY] [accounts/views.py](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/backend_django/accounts/views.py)
- Add the corresponding view functions for the new Workflow endpoints to safely serialize/deserialize [Workflow](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/backend_django/accounts/models.py#113-117) data and ensure robust operation.

### Frontend (`Frontend-design`)
We will transform the Workflow page.
#### [MODIFY] [src/views/SystemSetupView.tsx](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/Frontend-design/src/views/SystemSetupView.tsx)
- **Dynamic Fetching**: Replace the standard Django Admin redirect button with an "Add Custom Workflow" interface.
- **Dynamic List**: We will introduce a new section below the hardcoded "Operational Workflows" to display "Custom Workflows" fetched from the database. 
- **Action Menu**: Add "Edit" and "Delete" dropdowns for custom workflows, just like the User Management feature.
- **Workflow Modals**: Construct beautiful UI modals for `Create Workflow` and `Edit Workflow`, letting users define the workflow name and steps (rendered cleanly via JSON strings or step-builders).

## Verification Plan
### Manual Verification
1. Navigate to "System Setup".
2. View the new "Custom Workflows" section loading from the DB.
3. Click "Add Custom Workflow", enter a name and steps, and save. Verify it populates the UI without a reload.
4. Edit the newly created workflow and save. 
5. Delete the workflow and ensure it is removed properly.
6. Verify the operational workflows (Biometric Sync, Database Maintenance, etc.) remain intact and functional.
