# BloodLink Test Cases

## 1. Unit Test Cases

| Test Case ID | Module | Title | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| **UT-001** | Matching Engine | Recency Penalty Calc | Input donor who donated 28 days ago. | Returns exact penalty of 12.5 (25 * (1 - 28/56)). | Pass |
| **UT-002** | Matching Engine | Exact Match Bonus | Evaluate O+ donor for O+ request. | Exact Match score component = 100. | Pass |
| **UT-003** | Matching Engine | Compatible Match | Evaluate O- donor for O+ request. | Exact Match score component = 0. | Pass |
| **UT-004** | Matching Engine | Haversine Calc | Input Nasr City (30.0511, 31.3456) & Heliopolis (30.0866, 31.3225). | Returns correct distance ~4.5 km. | Pass |
| **UT-005** | Inventory | Threshold Status | Set inventory for A+ to 15 units. | Status property updates to `Critical`. | Pass |
| **UT-006** | Auth | Password Hashing | Register user with password "staff123". | Database saves bcrypt hash, not plaintext. | Pass |

## 2. Integration Test Cases

| Test Case ID | Module | Title | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| **IT-001** | Emergencies & Notifications | Emergency triggers Notifications | 1. Create a `Critical` emergency request.<br>2. Check Notifications table. | System generates "Emergency" type notifications for matched donors. | Pass |
| **IT-002** | Inventory & Donors | Replenish from Donation | 1. Mark donor donation complete.<br>2. Check Inventory count. | Inventory count for the specific blood type increments by 1. | Pass |
| **IT-003** | Auth & API Guard | Protect Private Endpoints | 1. Send `GET /api/donors` without JWT.<br>2. Observe response. | Returns `401 Unauthorized`. | Pass |
| **IT-004** | API | Emergency Matching Workflow | 1. POST `/api/emergencies`.<br>2. GET `/api/emergencies/:id/match`. | Returns a sorted list of donors descending by composite score. | Pass |

## 3. System / E2E Test Cases

| Test Case ID | Module | Title | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| **E2E-001** | Frontend/Backend | Admin Login Flow | 1. Navigate to `/login`.<br>2. Enter `admin@bloodlink.org` / `admin123`.<br>3. Click Login. | Redirected to `/dashboard`, JWT token in localStorage, user profile loaded in Navbar. | Pass |
| **E2E-002** | Frontend/Backend | Create & Resolve Emergency | 1. Login as Admin.<br>2. Go to `/emergencies`.<br>3. Click "New Request".<br>4. Fill form (A+, High, 5 units).<br>5. Click "Find Matches".<br>6. Mark as Resolved. | UI updates correctly, Toast notifications show success for each step, request status in DB changes to Resolved. | Pass |
| **E2E-003** | Frontend/Backend | Toggle Donor Availability | 1. Go to `/donors`.<br>2. Find a donor with "Available" status.<br>3. Click toggle switch to "Unavailable". | Toast says "Status updated", UI shows red "Unavailable" badge, Database is updated. | Pass |
