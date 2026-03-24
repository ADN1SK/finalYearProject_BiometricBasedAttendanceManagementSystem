# Workflow Setup & Operational Telemetry Documentation

This document outlines the professional enhancements made to the **Workflow & Setup** module in the Biometric Attendance Management System (BBEAMS), with a deep dive into the newly engineered System Backup feature.

---

## 1. Dynamic Custom Workflows
The system configuration dashboard was completely decoupled from the boilerplate Django Admin interface. Administrators can now dynamically **Create, Edit, and Delete** custom workflows directly from the React dashboard [SystemSetupView.tsx](file:///c:/Users/Admin/OneDrive/Desktop/FourthSem1/FinalyearProject/backup2/finalYearProject_BiometricBasedAttendanceManagementSystem/Frontend-design/src/views/SystemSetupView.tsx).
- **API Integration**: Linked directly to four dedicated JSON REST endpoints (`/accounts/api/workflows/`).
- **Interactive UI**: Utilizes Framer Motion modals to securely pass structured JSON parameters for custom background operations.

## 2. Real-Time Engine Telemetry
The System Status panel acts as a live heartbeat monitor for the deployment environment.
- **API Latency Calculation**: Network requests are wrapped in a high-fidelity Javascript timestamp (`performance.now()`) to measure the precise millisecond latency between React and Django.
- **Engine Uptime Tracking**: The Django environment now instantiates a persistent memory clock upon boot up, dynamically streaming process uptimes natively to the dashboard.

---

## 3. Professional Database Integrations
System maintenance hooks (previously placeholders) now securely execute heavy-duty backend tasks.
- **Database Maintenance**: Purges dead tuples by momentarily suspending standard Django ORM transaction wrappers to issue native PostgreSQL `VACUUM ANALYZE` operations via the `connection.cursor()`.

> [!IMPORTANT]
> The most critical upgrade to system stability is the newly implemented **System Backup Engine**.

---

# Focus: System Backup Engine

## Mechanism & Architecture
When triggered via the **"System Backup"** button on the UI, the Django backend uses Python's low-level `subprocess` module to spin up an isolated worker environment. 
- It clones the server session environment and securely injects the production database password straight into memory (`env['PGPASSWORD']`).
- It triggers a raw Linux/Windows-native `pg_dump` execution against the active `BBEAMS` PostgreSQL instance.
- To prevent environment crashes due to unexpected pathing, the module actively hunts common installation directories (e.g. `C:\Program Files\PostgreSQL\18\bin\`) to dynamically link the `pg_dump.exe` executable if it was omitted from the System PATH variables.

## Storage Profile
The generated backups use the native PostgreSQL "custom" compressed archive format (`-F c`). This format is specifically designed for robustness and can selectively restore individual tables, data, or schema using `pg_restore`. 
- **Storage Location**: `BBEAMS_PROJECT_ROOT/backend_django/backups/`.
- **Naming Pattern**: `bbeams_backup_YYYYMMDD_HHMMSS.sql` (e.g. `bbeams_backup_20260324_042815.sql`).

## Enterprise Advantages

1. **Disaster Recovery Preparedness**
   The primary advantage of automated `pg_dump` backups is absolute reliability. Even if the entire host server or OS burns down, taking this `.sql` file to *any* other computer and running `pg_restore` will resurrect the entire system's history—attendances, mapped biometrics, workflows, and settings—perfectly intact.
2. **One-Click Administration**
   Instead of requiring a DevOps engineer to SSH into the server and run PostgreSQL queries manually, any authorized HR Superuser can instantly generate state snapshots directly from their browser prior to running potentially dangerous bulk updates.
3. **Data Portability**
   Since the backup relies cleanly on standard `pg_dump` formatting, the data is entirely agnostic. The organization can migrate their attendance system from a local Windows PC deployment up to an enterprise AWS Relational Database Service (RDS) effortlessly utilizing these exact generated schema files.

> [!TIP]
> **Best Practice**: System administrators should trigger a system backup immediately before executing the **Log Sanitization** or **Database Maintenance** routines to preserve a 100% rollback capability.
