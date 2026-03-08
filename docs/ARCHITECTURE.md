# MineralView Phase 1 Architecture

This document describes the frontend architecture of the MineralView Phase 1 application.

The Phase 1 system introduces an intelligence-first experience for mineral owners while preserving transparent access to the deterministic mineral datasets that power the platform.

The application is designed to support multiple user personas while maintaining a single unified data infrastructure.

The repository contains the frontend structure required to implement the Phase 1 MineralView experience and integrate it with the existing backend services.

---

# Platform Model

The Phase 1 application is organized around three primary interaction environments.

Owner Intelligence  
Explore (Data Explorer)  
Advanced View

Each environment serves a different level of user sophistication while operating on top of the same deterministic mineral data layer.

Owner Intelligence provides interpretation and explanation.

Explore exposes the underlying mineral datasets.

Advanced View provides deeper analytics for professional users and advanced mineral owners.

---

# User Personas

The platform supports three primary personas.

### Mineral Owners

Primary audience of the platform.

Typical behavior:

- monitoring activity affecting their minerals
- understanding royalty changes
- learning about nearby drilling or production

Mineral owners primarily interact through the **Owner Intelligence** experience.

---

### Advanced Mineral Owners

More technically engaged users who want deeper visibility into the underlying datasets.

Typical behavior:

- exploring production data
- inspecting nearby well activity
- reviewing operator behavior

These users move between **Owner Intelligence** and **Explore**.

---

### Professional Users

Industry participants who require more detailed analysis.

Examples include:

- mineral buyers
- land professionals
- analysts
- operators

Professional users access **Advanced View** and deeper data exploration tools.

---

# Application Structure

The frontend is implemented using a modular React / TypeScript architecture.


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


This structure separates the core product surfaces while maintaining a shared design system and data access layer.

---

# Core Product Surfaces

## Owner Intelligence

Owner Intelligence is the primary experience for mineral owners.

It focuses on explaining what is happening with a user's minerals rather than requiring users to interpret complex industry datasets.

Typical outputs include:

- explanations of production changes
- summaries of nearby drilling activity
- contextual insights about operators
- monitoring summaries

The intelligence layer presents evidence through simplified charts and indicators while linking to underlying datasets for verification.

---

## Explore (Data Explorer)

Explore provides direct access to the datasets that power the intelligence system.

Users can inspect:

- mineral ownership information
- well activity
- production time series
- geographic activity through maps
- regulatory reports and filings

Explore acts as the verification layer for the platform.

---

## Advanced View

Advanced View provides deeper analytics tools designed for professional users and advanced mineral owners.

Capabilities include:

- deeper production analysis
- expanded activity tracking
- portfolio-level exploration
- more detailed filtering and inspection tools

This environment allows the platform to support professional workflows without complicating the default owner experience.

---

# Persistent Intelligence Layer

A key architectural principle is that the intelligence system remains accessible throughout the application.

Users can explore production data, maps, and activity feeds while the intelligence system remains available to interpret what the user is viewing.

This design allows the platform to function as a continuous intelligence environment rather than a static dashboard.

---

# Routing and Access Control

The application includes persona-aware routing components.

Examples include:

ProtectedRoute.tsx  
ProfessionalRoute.tsx

These components control access to specific parts of the application based on user permissions and persona type.

This ensures advanced tools can be introduced without complicating the default experience for mineral owners.

---

# Data Layer Architecture

All frontend data requests pass through a centralized service layer.


src/lib/dataService.ts


The data service acts as the adapter between the frontend and backend APIs.

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

Mock datasets are currently used during development.

These responses can be replaced with real API calls without modifying the frontend components.

---

# Backend Integration

The frontend architecture is designed to integrate with the existing MineralView backend services.

Typical service mappings include:

| Frontend Service | Backend API |
|------------------|-------------|
| getUserProfile | MViewPortalAPI |
| getMyMinerals | MViewPortalAPI |
| getActivityFeed | MViewCerebroAPI |
| getProductionSeries | MViewCerebroAPI |
| getDeclineSummary | MViewCerebroAPI |
| getWellSummary | MViewCerebroAPI |
| getMapFeatures | MViewMapAPI |
| searchWells | MViewMapAPI / Cerebro |
| getReportsIndex | PresentationSiteAPI |
| getReportDetail | PresentationSiteAPI |

Because all data requests pass through the data service layer, backend integration requires modifying only the service functions rather than the UI components.

---

# Document Upload System

The application includes support for document uploads through the Intelligence interface.

Users may upload:

- royalty statements
- operator communications
- mineral ownership documents

Uploaded documents are currently processed through placeholder parsing logic that returns structured summaries.

This architecture prepares the system for future automated document analysis.

---

# System Flow


Users
│
├── Mineral Owners
├── Advanced Owners
└── Professional Users
│
▼
MineralView Phase 1 Frontend
│
├── Owner Intelligence
├── Explore
├── Advanced View
└── Settings
│
▼
src/lib/dataService.ts
│
├── MViewPortalAPI
├── MViewCerebroAPI
├── MViewMapAPI
└── PresentationSiteAPI


---

# Current Implementation Status

The repository currently includes:

- Owner Intelligence interface
- Explore data environment
- Advanced View for professional users
- persona-aware routing
- centralized data service layer
- mock mineral datasets
- interactive production charts
- map-based exploration tools
- document upload interface

---

# Fastest Path to Production

The fastest path to production implementation is:

1. Keep the existing frontend architecture intact.
2. Replace mock responses in `dataService.ts`.
3. Connect service functions to the appropriate backend APIs.
4. Normalize outputs in the service layer.
5. Enable authentication and persona-based permissions.

Because the application is already structured around a centralized data adapter, backend integration can occur without restructuring the UI.

This allows the Phase 1 system to move from development to production rapidly.