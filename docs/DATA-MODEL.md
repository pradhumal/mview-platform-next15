# Data Model

This document defines the core data entities used across the MineralView platform.

The purpose of this model is to establish a shared language for frontend, backend, data, and product teams.

The MineralView platform is built on deterministic mineral datasets.

These datasets power three major product surfaces:

Owner Intelligence  
Explore  
Advanced View

The entities described here represent the core objects the platform uses to interpret mineral ownership, production, activity, and geographic context.

---

# Design Principles

The MineralView data model follows several principles.

## Deterministic First

Primary mineral data must come from deterministic industry datasets.

Examples include:

- production records
- well metadata
- operator activity
- mineral ownership records
- regulatory filings
- geospatial well data

AI may interpret or summarize this data, but it must not generate primary data.

---

## Shared Entities Across Surfaces

The same core entities are used across:

- Owner Intelligence
- Explore
- Advanced View

This ensures the platform remains consistent across user experiences.

---

## Stable Frontend Contracts

Backend systems may have different schemas internally.

Frontend systems should consume normalized data objects through the centralized service layer.

This keeps UI components stable even if backend sources evolve.

---

# Core Entities

The MineralView platform is built around the following primary entities.

- User
- Mineral Asset
- Well
- Operator
- Production Series
- Activity Event
- Map Feature
- Report / Filing
- Document Upload
- Intelligence Insight

---

# User

Represents an authenticated platform user.

Users have persona context that affects routing, feature access, and explanation depth.

## Fields

```json
{
  "userId": "string",
  "name": "string",
  "email": "string",
  "persona": "owner | advanced_owner | professional",
  "preferences": {
    "units": "bbl | mcf",
    "notificationsEnabled": true
  }
}
Notes

The user entity is primarily sourced from account and ownership systems.

Persona values influence:

surface access

interpretation density

advanced feature visibility

Mineral Asset

Represents a mineral interest associated with a user.

A Mineral Asset is the core ownership object through which the platform personalizes intelligence.

Fields
{
  "mineralId": "string",
  "ownerUserId": "string",
  "county": "string",
  "state": "string",
  "basin": "string",
  "acreage": 12.5,
  "operator": "string",
  "primaryWellId": "string",
  "status": "active | inactive | monitoring"
}
Notes

A mineral asset may be associated with:

one or more wells

one or more operators

a geographic region

nearby activity events

This entity provides the contextual anchor for Owner Intelligence.

Well

Represents a specific well.

Wells are one of the most important entities in the MineralView system because production, drilling activity, location, and filings often connect back to a well.

Fields
{
  "wellId": "string",
  "name": "string",
  "operatorId": "string",
  "operator": "string",
  "county": "string",
  "state": "string",
  "basin": "string",
  "status": "permitted | drilling | completed | producing | shut_in",
  "spudDate": "ISO_DATE",
  "completionDate": "ISO_DATE",
  "apiNumber": "string",
  "lat": 30.145,
  "lng": -97.432
}
Notes

Wells connect to:

production series

activity events

reports and filings

map features

mineral assets

Operator

Represents the company responsible for drilling, producing, or operating wells.

Fields
{
  "operatorId": "string",
  "name": "string",
  "region": "string",
  "activeWellCount": 42,
  "status": "active | inactive"
}
Notes

Operators are important because users often want to understand:

who is active near their minerals

whether an operator is increasing or decreasing activity

how a given operator compares across assets

Production Series

Represents time-series production data for a well.

This entity supports both explanation and visualization.

Fields
{
  "wellId": "string",
  "production": [
    {
      "date": "YYYY-MM",
      "oil": 1243,
      "gas": 3280,
      "water": 100
    }
  ]
}
Notes

Production series may be used to derive:

decline summaries

trend charts

operator performance context

royalty-relevant changes

Production data is a core deterministic dataset.

Decline Summary

Represents a simplified analytical summary derived from production history.

This entity is useful for lightweight analytics, charts, and intelligence interpretation.

Fields
{
  "wellId": "string",
  "initialProductionRate": 1250,
  "currentProductionRate": 320,
  "declineRate": 0.18,
  "estimatedRemainingReserves": 240000
}
Notes

Decline summaries are derived from deterministic production datasets and should remain reproducible.

Activity Event

Represents an operational event affecting a well or nearby area.

Examples include permitting, drilling, completion, recompletion, or production start.

Fields
{
  "eventId": "string",
  "wellId": "string",
  "eventType": "permit | drilling | completion | recompletion | production_start",
  "operatorId": "string",
  "operator": "string",
  "date": "ISO_DATE",
  "description": "string"
}
Notes

Activity events are important for:

monitoring nearby development

explaining production changes

surfacing new activity around a user's minerals

Map Feature

Represents a geospatial object shown in the map interface.

In Phase 1, this primarily includes wells and related activity.

Fields
{
  "featureId": "string",
  "featureType": "well | activity | mineral_asset",
  "wellId": "string",
  "name": "string",
  "operator": "string",
  "lat": 30.145,
  "lng": -97.432,
  "status": "producing | drilling | permitted"
}
Notes

Map features support:

geographic exploration

nearby activity discovery

visual verification of intelligence

Report / Filing

Represents a regulatory document or related filing associated with a well, operator, or activity event.

Fields
{
  "reportId": "string",
  "title": "string",
  "date": "ISO_DATE",
  "type": "completion_report | permit | production_report | filing",
  "url": "string",
  "wellId": "string"
}
Notes

Reports and filings provide reference material and source evidence for platform insights.

Document Upload

Represents a user-uploaded document such as a royalty statement or operator communication.

Fields
{
  "documentId": "string",
  "userId": "string",
  "documentType": "royalty_statement | operator_letter | ownership_document",
  "uploadedAt": "ISO_DATE",
  "parsedSummary": {
    "operator": "string",
    "wellName": "string",
    "productionVolume": 1234,
    "royaltyAmount": 5432
  }
}
Notes

This entity supports user-provided context and future document interpretation workflows.

Intelligence Insight

Represents an interpreted output delivered to the user through Owner Intelligence or the Continuous Intelligence Layer.

This is not a source-of-truth data entity. It is an interpretation entity built on deterministic data.

Fields
{
  "insightId": "string",
  "userId": "string",
  "insightType": "production_change | nearby_activity | operator_update | document_summary",
  "title": "string",
  "summary": "string",
  "supportingEvidence": [
    {
      "type": "production_series | activity_event | report | map_feature",
      "referenceId": "string"
    }
  ],
  "createdAt": "ISO_DATE"
}
Notes

Intelligence insights must always be grounded in deterministic evidence.

They may summarize or contextualize data, but they must not invent primary facts.

Entity Relationships

The platform relies on relationships between core entities.

User
│
└── Mineral Asset
      │
      ├── Well
      │    ├── Production Series
      │    ├── Decline Summary
      │    ├── Activity Event
      │    └── Report / Filing
      │
      ├── Operator
      │
      └── Map Feature

User
│
└── Document Upload
      │
      └── Intelligence Insight

These relationships allow the platform to personalize insights and maintain context across the application.

Product Surface Alignment

Each product surface depends on the same core data model.

Owner Intelligence

Primarily uses:

User

Mineral Asset

Well

Production Series

Activity Event

Intelligence Insight

Explore

Primarily uses:

Mineral Asset

Well

Production Series

Activity Event

Map Feature

Report / Filing

Advanced View

Primarily uses:

Well

Production Series

Decline Summary

Operator

Activity Event

Map Feature

Frontend Usage

The frontend should consume normalized versions of these entities through:

src/lib/dataService.ts

The service layer is responsible for:

transforming backend responses

normalizing fields

preserving stable shapes for UI components

UI components should not contain backend-specific schema logic.

Summary

The MineralView data model defines the shared entities that power the platform.

These entities allow MineralView to connect deterministic industry datasets, user ownership context, and intelligence interpretation into a unified system.

The core value of the platform comes from how these entities work together across:

Owner Intelligence
Explore
Advanced View

This shared model provides the foundation for product development, backend integration, and intelligence workflows.