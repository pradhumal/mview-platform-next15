# MineralView Phase 1 Application

This repository contains the Phase 1 frontend architecture for the **MineralView platform**.

Phase 1 introduces the core **Owner Intelligence** experience while maintaining transparent access to the deterministic mineral datasets that power the platform.

The application helps mineral owners understand activity affecting their assets while still allowing advanced users and professionals to explore the underlying data directly.

The repository includes:

- the frontend application architecture
- persona-aware routing
- the intelligence interaction model
- backend integration documentation
- platform data contracts and system documentation

The goal of Phase 1 is to establish the **Owner Intelligence product surface** while preserving access to underlying mineral datasets through structured exploration tools.

---

# Getting Started

## Install dependencies

```bash
npm install
Run the development server
npm run dev

The application will start locally at:

http://localhost:8080

The development server is powered by Vite.

Platform Overview

The Phase 1 application is organized around three primary product surfaces.

Owner Intelligence

The primary product experience.

Owner Intelligence interprets deterministic mineral datasets and presents them in a clear explanation-driven interface designed for mineral owners.

The system helps users understand:

activity near their minerals

production trends

operator behavior

changes that may affect royalty payments

Evidence and supporting data remain accessible through links to the Explore environment.

Explore (Data Explorer)

Explore provides direct access to the mineral datasets used by the intelligence system.

Users can inspect:

mineral ownership information

well activity

production data

geographic activity through maps

regulatory reports and filings

Explore acts as the verification layer for the platform's intelligence outputs.

Advanced View

Advanced View provides deeper analytics tools for professional users and advanced mineral owners.

Capabilities include:

deeper production analysis

expanded activity tracking

portfolio-level exploration

advanced filtering and inspection tools

This environment allows the platform to support professional workflows without complicating the default owner experience.

Repository Architecture

The frontend application is implemented using a modular React + TypeScript architecture.

src
├── components
│   ├── intelligence
│   ├── explore
│   ├── advanced
│   └── ui
│
├── pages
│
├── routes
│
├── lib
│   ├── dataService.ts
│   └── mock
│
├── hooks
│
└── styles

The application uses:

reusable UI components

persona-aware routing

a centralized data access layer

modular page surfaces

Data Layer Architecture

All application data requests pass through the centralized data service:

src/lib/dataService.ts

This service acts as the adapter between the frontend and backend APIs.

Typical service functions include:

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

Mock datasets are currently used during development and can be replaced with backend API responses without modifying UI components.

Backend Integration

The frontend architecture is designed to integrate with the existing MineralView backend services.

Frontend Service	Backend API
getUserProfile	MViewPortalAPI
getMyMinerals	MViewPortalAPI
getActivityFeed	MViewCerebroAPI
getProductionSeries	MViewCerebroAPI
getDeclineSummary	MViewCerebroAPI
getWellSummary	MViewCerebroAPI
getMapFeatures	MViewMapAPI
searchWells	MViewMapAPI / Cerebro
getReportsIndex	PresentationSiteAPI
getReportDetail	PresentationSiteAPI

Because all data access occurs through the service layer, backend integration requires modifying only the service functions.

Persona-Aware Platform Design

The application supports multiple user personas.

Primary personas include:

Mineral Owners

Advanced Mineral Owners

Professional Users

Routing components such as:

ProtectedRoute.tsx
ProfessionalRoute.tsx

control access to advanced tools while preserving a simple experience for mineral owners.

Document Upload Capability

The application supports document uploads through the intelligence interface.

Examples include:

royalty statements

operator communications

mineral ownership documents

Uploaded documents are parsed into structured summaries.

This architecture prepares the platform for future document analysis features.

Documentation

Detailed system documentation is located in the /docs directory.

Start with:

docs/ARCHITECTURE.md

docs/PLATFORM-DIAGRAM.md

docs/INTEGRATION-MAP.md

Additional documentation includes:

Continuous Intelligence architecture

Frontend component map

Backend data contracts

Product surfaces

Platform data model

Intelligence platform implementation roadmap

Implementation Readiness

The repository already includes the core frontend architecture required for the MineralView Phase 1 application.

Current capabilities include:

Owner Intelligence interface

Explore data environment

Advanced View analytics surface

persona-aware routing

continuous intelligence interaction model

centralized data service architecture

mock mineral datasets

document upload interface

Because the application routes all data through a centralized service layer, connecting real backend APIs can be done quickly without restructuring the frontend.

This allows the Phase 1 system to move from prototype to production with minimal architectural changes.