# Frontend Component Map

This document explains how the frontend components of the MineralView Phase 1 application are organized.

The goal is to make it easy for engineers to understand:

- where key UI features live
- how components connect to the data layer
- how the three primary product surfaces interact

This map focuses on the main application structure rather than every UI component.

---

# Application Layout

The frontend application is structured around three primary product environments.

Owner Intelligence  
Explore  
Advanced View

Each environment is implemented using a combination of pages and reusable components.
src
├── components
│ ├── intelligence
│ ├── explore
│ ├── advanced
│ └── ui
│
├── pages
│
├── routes
│
├── lib
│ ├── dataService.ts
│ └── mock
│
├── hooks
│
└── styles


---

# Owner Intelligence Components

Owner Intelligence provides the primary interpretation interface for mineral owners.

Typical responsibilities include:

- explaining activity affecting a user's minerals
- summarizing production trends
- highlighting nearby drilling activity
- linking explanations to underlying data

Key components typically include:


components/intelligence
│
├── IntelligencePanel
├── TravelingIntelligence
├── FollowUpPrompts
├── EvidenceBlock
├── MiniProductionChart
└── MiniActivityMap


### Responsibilities

**IntelligencePanel**

Primary interface for intelligence responses and insights.

**TravelingIntelligence**

Maintains the continuous intelligence layer as users navigate across the application.

**FollowUpPrompts**

Suggests contextual follow-up questions to help guide exploration.

**EvidenceBlock**

Displays the data signals supporting an intelligence explanation.

**MiniProductionChart**

Shows simplified production trends.

**MiniActivityMap**

Displays nearby activity in a simplified geographic view.

---

# Explore Components

Explore provides access to the deterministic datasets underlying the intelligence system.

Typical pages include:


pages
│
├── ExplorePage
├── MineralsPage
├── MineralDetailPage
├── ActivityPage
├── ProductionPage
├── MapPage
└── ReportsPage


### Responsibilities

**ExplorePage**

Entry point for data exploration.

**MineralsPage**

Shows mineral ownership records.

**MineralDetailPage**

Displays data related to a specific mineral asset.

**ActivityPage**

Shows drilling, completion, and operational events.

**ProductionPage**

Displays production time series.

**MapPage**

Provides geographic exploration of wells and activity.

**ReportsPage**

Displays regulatory filings and related content.

Explore pages serve as the **verification layer** for intelligence insights.

---

# Advanced View Components

Advanced View provides deeper analytics tools for advanced users and professionals.

Example structure:


components/advanced
pages/advanced
│
├── AdvancedViewPage
├── AdvancedActivityPage
├── PortfolioAnalysisPage
└── AdvancedFilters


### Responsibilities

Advanced View allows deeper analysis of deterministic datasets including:

- detailed production analysis
- portfolio-level exploration
- advanced filtering
- deeper inspection of well activity

Advanced View is typically protected behind persona-aware routing.

---

# Shared UI Components

Reusable interface components live in:


components/ui


These components include:

- buttons
- dialogs
- form elements
- layout containers
- modals
- dropdown menus
- alerts
- navigation elements

This shared library ensures consistent design across the platform.

---

# Navigation Components

Navigation components allow users to move between platform surfaces.

Example structure:


components/navigation
│
├── AppLayout
├── DesktopSidebar
├── BottomNav
├── Header
└── NavigationMenu


Responsibilities include:

- switching between Owner Intelligence, Explore, and Advanced View
- managing responsive layouts
- preserving navigation state

---

# Routing and Access Control

Persona-aware routing components live under:


routes


Examples:


ProtectedRoute.tsx
ProfessionalRoute.tsx


These components enforce access rules for different personas.

For example:

- mineral owners access Owner Intelligence and Explore
- advanced owners gain access to deeper analysis tools
- professional users gain access to Advanced View

---

# Data Access Layer

All frontend components retrieve data through the centralized service layer.


src/lib/dataService.ts


This file acts as the adapter between the frontend UI and backend APIs.

Typical functions include:


getUserProfile()
getMyMinerals()
getActivityFeed()
getProductionSeries()
getDeclineSummary()
getWellSummary()
getMapFeatures()
searchWells()
getReportsIndex()
getReportDetail()
uploadStatement()


The service layer currently returns mock datasets during development.

These functions will later be connected to backend APIs.

---

# Data Flow

The component architecture follows a consistent data flow.


Backend APIs
│
▼
dataService.ts
│
▼
Page Components
│
▼
Feature Components
│
▼
UI Components


This layered structure ensures that backend integrations remain isolated from presentation components.

---

# Continuous Intelligence Integration

The Continuous Intelligence Layer interacts with all major product surfaces.


Owner Intelligence
│
▼
Explore
│
▼
Advanced View


The intelligence system preserves context as users move between these environments.

This allows the platform to interpret the data users are viewing rather than requiring users to interpret the data themselves.

For details see:


docs/CONTINUOUS-INTELLIGENCE.md


---

# Implementation Guidance

When extending the frontend system:

1. Add new data calls inside `dataService.ts`.
2. Normalize backend responses inside the service layer.
3. Pass normalized data to page components.
4. Keep UI components presentation-focused.

This ensures that backend integrations do not create tight coupling with UI logic.

---

# Summary

The Phase 1 frontend architecture separates concerns into clear layers:

- product surfaces (Owner Intelligence, Explore, Advanced View)
- reusable UI components
- persona-aware routing
- centralized data access

This structure allows the application to evolve quickly while maintaining a clear separation between frontend UI and backend systems.