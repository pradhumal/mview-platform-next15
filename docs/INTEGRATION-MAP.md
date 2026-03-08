# MineralView Phase 1 Integration Map

This document describes how the Phase 1 frontend application integrates with the existing MineralView backend services.

The frontend architecture is intentionally designed to minimize coupling between UI components and backend systems.

All frontend requests pass through a centralized data service layer that acts as the adapter between the application and backend APIs.

This allows the frontend to evolve independently while backend services can change without requiring UI refactoring.

---

# Integration Overview

The MineralView Phase 1 system integrates four major backend service families.

MViewPortalAPI  
MViewCerebroAPI  
MViewMapAPI  
PresentationSiteAPI

Each backend system provides a specific category of data used by the frontend application.

The centralized data service layer routes requests to the appropriate API.

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
├── PortalAPI
├── CerebroAPI
├── MapAPI
└── PresentationSiteAPI


---

# Backend Service Responsibilities

## MViewPortalAPI

The Portal API manages user accounts and mineral ownership context.

Typical responsibilities:

- user authentication
- user profiles
- mineral ownership records
- user portfolio data
- user preferences

Frontend service functions that map to Portal API:


getUserProfile()
getMyMinerals()


Portal API establishes the user's identity and mineral portfolio context.

---

## MViewCerebroAPI

Cerebro provides deterministic intelligence datasets related to wells, production, and operational activity.

Typical responsibilities:

- well activity data
- drilling and completion events
- production time series
- decline curve calculations
- well summaries
- activity intelligence signals

Frontend service functions that map to Cerebro:


getActivityFeed()
getProductionSeries(wellId)
getDeclineSummary(wellId)
getWellSummary(wellId)


Cerebro powers both the Intelligence interface and the Explore data environment.

---

## MViewMapAPI

The Map API provides geospatial datasets used by the platform.

Typical responsibilities:

- well locations
- basin and county data
- nearby activity layers
- geospatial filtering
- map feature queries

Frontend service functions that map to Map API:


getMapFeatures(bounds, filters)
searchWells(query)


These endpoints support both the Explore map experience and geographic context inside the Intelligence layer.

---

## PresentationSiteAPI

The Presentation Site API provides structured content and regulatory filings.

Typical responsibilities:

- reports
- filings
- educational content
- supporting reference material

Frontend service functions that map to this API:


getReportsIndex()
getReportDetail(reportId)


This content appears in the Explore environment.

---

# Data Service Layer

All frontend requests pass through a centralized adapter:


src/lib/dataService.ts


The data service provides a stable interface between UI components and backend APIs.

Benefits of this architecture:

- UI components remain backend-agnostic
- backend changes require minimal frontend changes
- data normalization occurs in one location
- integration testing is simplified

The service layer currently returns mock datasets during development.

These mock responses simulate the structure of expected backend responses.

---

# Integration Strategy

The fastest path to connecting the frontend to production data is:

1. Keep the existing UI architecture intact.
2. Replace mock responses inside `dataService.ts`.
3. Implement API requests to the appropriate backend services.
4. Normalize backend responses into the structures expected by UI components.

Example transformation:


Backend Response
│
▼
dataService.ts transformation
│
▼
Normalized frontend object
│
▼
UI Components


This approach isolates backend complexity from the user interface.

---

# Authentication Integration

Authentication is expected to be handled through the Portal API.

Typical flow:


User Login
│
▼
Portal API Authentication
│
▼
User session token
│
▼
Frontend stores session
│
▼
Subsequent requests include auth header


Persona access rules are then applied through frontend routing components such as:


ProtectedRoute.tsx
ProfessionalRoute.tsx


These components control access to Advanced View and professional features.

---

# Intelligence Layer Integration

The Intelligence interface consumes deterministic datasets provided by backend services.

Typical data sources include:

- production time series
- well activity events
- operator behavior
- geographic context

The frontend intelligence components interpret these datasets and present simplified explanations.

Evidence links connect the intelligence insights to Explore pages where users can inspect the underlying data.

---

# Document Processing Integration

The Phase 1 system includes entry points for document uploads.


uploadStatement()


Uploaded documents may include:

- royalty statements
- operator communications
- mineral ownership documents

Phase 1 uses placeholder parsing logic.

Future versions may connect this endpoint to a document processing service that extracts structured data from uploaded documents.

---

# Implementation Priority

To move from the current repository to a production system:

1. Connect Portal API for authentication and mineral ownership.
2. Connect Cerebro API for production and activity data.
3. Connect Map API for geospatial exploration.
4. Connect Presentation API for reports and filings.

The centralized service layer ensures these integrations can occur without modifying UI components.

---

# Implementation Readiness

The Phase 1 frontend repository already contains:

- the Owner Intelligence interface
- Explore data navigation
- Advanced View analytics interface
- persona-aware routing
- centralized data adapter
- mock datasets
- document upload entry points

Because the architecture isolates backend dependencies inside the data service layer, production integration can occur rapidly without restructuring the application.