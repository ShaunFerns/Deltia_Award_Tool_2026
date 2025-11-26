# DELTA Framework Evaluation Tool (High-Fidelity Prototype)

This is a comprehensive high-fidelity frontend prototype for the DELTA Framework Evaluation Tool. It supports a dual-level enhancement process:
1.  **Module Level**: Module owners assess modules across 5 dimensions (Strategy, Evidence, Design, Practice, Assessment).
2.  **Programme Level**: Programme Chairs synthesise module data, "Take Stock" of the programme, set priorities, develop themes, and create SMART Action Plans.

## 🚀 Key Features

### 🎓 Module Level
*   **Module Context & Metadata**: Captures rich data on policies, teaching approaches, and student partnership.
*   **5-Dimension Evaluation**: Guided wizard for the 5 DELTA dimensions with "Traffic Light" scoring (Developing / Consolidating / Leading).
*   **Evidence Management**: Link evidence (files/URLs) to specific indicators.
*   **Visual Dashboard**: Radar charts and auto-generated narratives based on scoring logic.

### 🏛️ Programme Level (New)
*   **Programme Dashboard**: Aggregated view of all modules within a programme.
*   **Taking Stock**: Structured reflection tool to identify "What we do well" and "Areas for development" across the 5 dimensions.
*   **Priority Setting**: Select key priorities from the "Taking Stock" analysis.
*   **Theme Development**: Group priorities into strategic themes (e.g., "Digital Transformation", "Inclusive Assessment").
*   **Action Planning**: Create SMART goals with Gantt chart visualisation for timeline management.

### 🔐 Role-Based Access Control (RBAC)
*   **Programme Chair**: Full access to Programme Dashboards, Action Plans, and all constituent modules.
*   **Module Lead**: Restricted access to only their assigned modules.

## 👤 Demo Accounts

Use these credentials to test the different roles:

| Role | Username | Password | Name | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Programme Chair** | `demo_team1` | `delta123` | **Dr. Alex Rivera** | 2 Programmes (Arts, Education), Full Programme Dashboard Access |
| **Module Lead** | `demo_team2` | `delta123` | **Prof. Sarah Chen** | 3 Modules only, No Programme Dashboard Access |

## 🛠️ Tech Stack

*   **Framework**: React + Vite
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + Shadcn/UI
*   **Visualization**: Recharts (Radar & Bar charts)
*   **Routing**: Wouter
*   **Icons**: Lucide React
*   **State Management**: React Context + LocalStorage (Persistence)

## 📂 Project Structure

*   `client/src/pages/home.tsx`: Role-aware Landing Page.
*   `client/src/pages/dashboard/`: Programme & Module Dashboards.
*   `client/src/pages/evaluate.tsx`: Module Evaluation Wizard.
*   `client/src/pages/programme-*.tsx`: Programme-level workflows (Taking Stock, Priorities, Action Plan).
*   `client/src/lib/data.tsx`: Central Mock Data Store, Types, and Role Logic.

## ⚠️ Prototype Notes

*   **Frontend Only**: All data is stored in your browser's `localStorage`. Clearing cache will reset the demo.
*   **Irish English**: Spelling follows Irish/UK conventions (e.g., "Programme", "Visualisation", "Operationalise").
*   **Demo Data**: The system auto-seeds realistic demo content if storage is empty.
