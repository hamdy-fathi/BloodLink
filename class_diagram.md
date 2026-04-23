# BloodLink — Core Domain Class Diagram

## Visual Export (Dark Theme)

![Class Diagram PNG](file:///C:/Users/PC/.gemini/antigravity/brain/14f45ad4-61e9-4ac3-8ccb-e9a221f22c8c/class_diagram.png)

> [!NOTE]
> The diagram has been exported with white lines on a dark background to match the project's aesthetic.

## Mermaid Class Diagram

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#e11d48', 'edgeLabelBackground':'#18181b', 'tertiaryColor': '#27272a' }}}%%
classDiagram
    direction TB

    class User {
        +String id
        +String name
        +String email
        +String phone
        +UserRole role
        +String avatar
        +String hospital
        +Date joinedAt
        +login(email, password) User
        +logout() void
        +updateProfile(data) void
    }

    class UserRole {
        <<enumeration>>
        admin
        staff
        manager
        donor
    }

    class Donor {
        +BloodType bloodType
        +int age
        +Date lastDonation
        +int totalDonations
        +float reliability
        +boolean available
        +String city
        +boolean eligible
        +toggleAvailability() void
        +checkEligibility() boolean
    }

    class BloodInventoryItem {
        +String id
        +BloodType type
        +int units
        +InventoryStatus status
        +String trend
        +boolean critical
        +int expiringIn48h
        +DateTime lastUpdated
        +updateUnits(count) void
        +checkExpiry() void
    }

    class InventoryStatus {
        <<enumeration>>
        Healthy
        Warning
        Critical
    }

    class BloodType {
        <<enumeration>>
        O+
        O-
        A+
        A-
        B+
        B-
        AB+
        AB-
    }

    class EmergencyRequest {
        +String id
        +String hospitalId
        +String department
        +BloodType requiredType
        +int unitsNeeded
        +UrgencyLevel urgency
        +DateTime createdAt
        +float distance
        +matchDonors() Donor[]
        +notifyMatched() void
    }

    class UrgencyLevel {
        <<enumeration>>
        Critical
        High
        Medium
        Low
    }

    class Notification {
        +String id
        +NotificationType type
        +String title
        +String message
        +DateTime timestamp
        +boolean read
        +markAsRead() void
        +dismiss() void
    }

    class NotificationType {
        <<enumeration>>
        emergency
        shortage
        donation
        system
        transfer
    }

    class Hospital {
        +String id
        +String name
        +String department
        +String city
        +float latitude
        +float longitude
        +requestBlood(type, units) EmergencyRequest
    }

    class DonationRecord {
        +String id
        +String donorId
        +BloodType bloodType
        +int unitsDonated
        +DateTime donationDate
        +String collectionCenter
        +boolean successful
    }

    class TransferRecord {
        +String id
        +String fromHospitalId
        +String toHospitalId
        +BloodType bloodType
        +int units
        +DateTime dispatchedAt
        +DateTime estimatedArrival
        +TransferStatus status
    }

    class TransferStatus {
        <<enumeration>>
        Pending
        InTransit
        Delivered
        Cancelled
    }

    class CompatibilityEngine {
        +checkCompatibility(donor, request) float
        +rankDonors(request) Donor[]
        +calculateReliabilityScore(donor) float
        +estimateArrivalTime(donor, hospital) int
    }

    %% ── Relationships ──

    User <|-- Donor
    User "1" --> "1" UserRole : has
    User "1" --> "0..*" Notification : receives

    Donor "1" --> "1" BloodType : has
    Donor "1" --> "0..*" DonationRecord : completes
    Donor "0..*" --> "0..*" EmergencyRequest : matched to

    BloodInventoryItem "1" --> "1" BloodType : categorized by
    BloodInventoryItem "1" --> "1" InventoryStatus : has

    Hospital "1" --> "0..*" EmergencyRequest : creates
    Hospital "1" --> "0..*" BloodInventoryItem : manages
    Hospital "1" --> "0..*" User : employs

    EmergencyRequest "1" --> "1" BloodType : requires
    EmergencyRequest "1" --> "1" UrgencyLevel : has
    EmergencyRequest "1" --> "0..*" Notification : triggers

    Notification "1" --> "1" NotificationType : has

    TransferRecord "1" --> "1" Hospital : from
    TransferRecord "1" --> "1" Hospital : to
    TransferRecord "1" --> "1" BloodType : contains
    TransferRecord "1" --> "1" TransferStatus : has

    CompatibilityEngine ..> Donor : analyzes
    CompatibilityEngine ..> EmergencyRequest : processes
    CompatibilityEngine ..> BloodType : validates
```

## Entity Summary

| Entity | Description |
|---|---|
| **User** | System operator (admin, staff, manager, donor role) |
| **Donor** | Registered blood donor with eligibility & availability tracking |
| **BloodInventoryItem** | Blood stock per type with status, trends, and expiry alerts |
| **EmergencyRequest** | Hospital blood request with urgency and donor matching |
| **Hospital** | Medical facility creating requests and managing inventory |
| **Notification** | System alert (emergency, shortage, donation, transfer, system) |
| **DonationRecord** | Historical log of each completed donation |
| **TransferRecord** | Inter-hospital blood transfer with dispatch and delivery tracking |
| **CompatibilityEngine** | Service class for donor-request matching and ranking |

## Key Relationships

- A **Hospital** manages multiple **BloodInventoryItems** and creates **EmergencyRequests**
- An **EmergencyRequest** triggers **Notifications** and is matched to compatible **Donors**
- A **Donor** has a **BloodType** and accumulates **DonationRecords** over time
- **TransferRecords** track blood shipments between two **Hospitals**
- The **CompatibilityEngine** ranks **Donors** against **EmergencyRequests** using blood type compatibility, reliability, and proximity

## Architecture Review Notes

1.  **Inheritance Strategy**: `User <|-- Donor` is implemented to ensure Donors can take advantage of all User-level features (Authentication, Profile Management, Notifications) without duplicating core identity fields (Name, Email, Phone).
2.  **Normalization**: The `Donor` entity now only stores medical and donor-specific transactional data (Blood Type, Reliability, Donation History).
3.  **Notification Pipeline**: `Notification` is linked to the base `User` class, allowing both Staff and Donors to receive system alerts through the same channel.
4.  **Mock Alignment**: The model is 1:1 with the current React Context and TypeScript types, ensuring a smooth transition to the NestJS/MongoDB backend.
