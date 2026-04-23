# BloodLink — Core Sequence Diagrams

This document outlines the primary operational workflows of the BloodLink platform.

## 1. Emergency Matching & Notification Flow
This flow tracks the process from a hospital emergency request to donor notification.

![Emergency Matching Flow](file:///C:/Users/PC/.gemini/antigravity/brain/14f45ad4-61e9-4ac3-8ccb-e9a221f22c8c/sequence_emergency.png)

> [!NOTE]
> This diagram illustrates the real-time coordination between hospitals and the donor network.

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#e11d48', 'edgeLabelBackground':'#18181b', 'tertiaryColor': '#27272a' }}}%%
sequenceDiagram
    autonumber
    participant H as Hospital Staff
    participant S as System (Backend)
    participant E as Compatibility Engine
    participant D as Donor (User)

    H->>S: Create Emergency Request (Type O-, 6 Units)
    S->>S: Validate Inventory & Urgency
    S->>E: Trigger Matching Algorithm
    E->>E: Filter eligible donors by BloodType
    E->>E: Rank by Distance & Reliability
    E-->>S: List of Top Matches
    S->>D: Push Notification (Emergency Alert)
    D->>S: View Details & Accept
    S->>H: Update Request Status (Matched)
    S->>D: Provide GPS/Hospital Directions
```

## 2. Donation & Inventory Update
Records a successful blood donation and updates the global inventory.

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#e11d48', 'edgeLabelBackground':'#18181b', 'tertiaryColor': '#27272a' }}}%%
sequenceDiagram
    autonumber
    participant D as Donor
    participant S as Center Staff
    participant SY as System
    participant I as Inventory Management

    D->>S: Arrive for Appointment
    S->>SY: Verify Identity/Eligibility
    SY-->>S: Eligible (Last donation > 3 months)
    S->>S: Collect Blood Unit
    S->>SY: Record Donation (Units, Type, Center)
    SY->>I: Increment Units for BloodType
    I->>I: Check Shortage Thresholds
    SY->>D: Add Reliability Points & Send Thank You
```

## 3. Inter-Hospital Blood Transfer
Handles the logistics of moving stock between facilities.

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#e11d48', 'edgeLabelBackground':'#18181b', 'tertiaryColor': '#27272a' }}}%%
sequenceDiagram
    autonumber
    participant HA as Requesting Hospital (A)
    participant SY as System
    participant HB as Source Hospital (B)
    participant L as Logistics/Courier

    HA->>SY: Request Stock Transfer (10u O+)
    SY->>HB: Notify of Internal Request
    HB->>SY: Approve & Pack Dispatch
    SY->>SY: Create TransferRecord (In Transit)
    SY->>HA: Notify Displacement
    L->>HA: Deliver Blood
    HA->>SY: Confirm Receipt
    SY->>SY: Update Inventory (A: +10, B: -10)
    SY->>SY: Close TransferRecord (Delivered)
```

## Review Summary

- **Auth Integration**: Since `Donor` inherits from `User`, the push notifications and "View Details" actions directly hit the shared Notification/User modules.
- **Latency Control**: The `CompatibilityEngine` decoupling allows for asynchronous processing during high-volume emergencies.
- **Audit Trail**: Every flow generates a record (EmergencyRecord, DonationRecord, TransferRecord) for accountability.
