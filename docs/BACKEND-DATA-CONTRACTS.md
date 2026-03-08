# Backend Data Contracts

This document defines the data structures exchanged between the MineralView frontend application and backend APIs.

The goal is to ensure that frontend components receive predictable data structures regardless of how backend systems evolve.

All frontend components consume data through the centralized service adapter:

src/lib/dataService.ts

The data service normalizes backend responses into the shapes described in this document.

---

# Design Principles

Backend APIs should follow three principles.

## Deterministic Data

All primary mineral data must come from deterministic industry datasets.

Examples include:

- production data
- well metadata
- drilling activity
- operator information
- regulatory filings

AI systems may interpret the data but must not generate primary data.

---

## Stable Response Shapes

Frontend components should rely on stable response shapes.

If backend systems evolve, transformations should occur inside the data service layer rather than in UI components.

---

## Context-Aware Queries

Many requests are scoped to the user's minerals or geographic context.

Backend APIs should support filtering by:

- user mineral ownership
- geographic region
- well identifiers
- operator identifiers

---

# User Profile

Represents the authenticated user.

Used to determine mineral ownership context and persona access.

### Endpoint

Portal API

### Response Shape

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
Mineral Ownership

Represents minerals owned by the user.

Endpoint

Portal API

Response Shape
{
  "minerals": [
    {
      "mineralId": "string",
      "county": "string",
      "state": "string",
      "basin": "string",
      "acreage": 12.5,
      "operator": "string",
      "primaryWellId": "string"
    }
  ]
}
Activity Feed

Represents operational events affecting nearby wells.

Endpoint

Cerebro API

Response Shape
{
  "events": [
    {
      "eventId": "string",
      "wellId": "string",
      "eventType": "permit | drilling | completion | production_start",
      "operator": "string",
      "date": "ISO_DATE",
      "description": "string"
    }
  ]
}
Production Series

Monthly production time series for a well.

Endpoint

Cerebro API

Response Shape
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
Decline Summary

Simplified decline curve data used by charts.

Endpoint

Cerebro API

Response Shape
{
  "wellId": "string",
  "initialProductionRate": 1250,
  "currentProductionRate": 320,
  "declineRate": 0.18,
  "estimatedRemainingReserves": 240000
}
Well Summary

Metadata describing a specific well.

Endpoint

Cerebro API

Response Shape
{
  "wellId": "string",
  "name": "string",
  "operator": "string",
  "county": "string",
  "state": "string",
  "status": "drilling | producing | shut_in",
  "spudDate": "ISO_DATE",
  "completionDate": "ISO_DATE"
}
Map Features

Geospatial wells and activity data.

Endpoint

Map API

Response Shape
{
  "features": [
    {
      "wellId": "string",
      "name": "string",
      "operator": "string",
      "lat": 30.145,
      "lng": -97.432,
      "status": "producing | drilling"
    }
  ]
}
Well Search

Search wells by name, operator, or region.

Endpoint

Map API or Cerebro API

Response Shape
{
  "results": [
    {
      "wellId": "string",
      "name": "string",
      "operator": "string",
      "county": "string",
      "state": "string"
    }
  ]
}
Reports and Filings

Regulatory documents associated with wells.

Endpoint

Presentation API

Response Shape
{
  "reports": [
    {
      "reportId": "string",
      "title": "string",
      "date": "ISO_DATE",
      "type": "completion_report | permit | production_report",
      "url": "string"
    }
  ]
}
Document Upload Response

Response returned after uploading a royalty statement or similar document.

Endpoint

Document Processing Service (future)

Response Shape
{
  "documentId": "string",
  "parsedSummary": {
    "operator": "string",
    "wellName": "string",
    "productionVolume": 1234,
    "royaltyAmount": 5432
  }
}
Frontend Normalization Example

Backend responses should be normalized inside the service adapter.

Example flow:

Backend Response
↓
dataService.ts transformation
↓
Normalized frontend object
↓
UI Components

This ensures UI components remain stable even if backend APIs evolve.

Summary

The backend data contracts define the deterministic datasets that power the MineralView platform.

These contracts support three major product environments:

Owner Intelligence
Explore
Advanced View

All frontend components rely on these structured data contracts through the centralized service layer.

This architecture ensures the platform can evolve while maintaining a stable and predictable frontend system.