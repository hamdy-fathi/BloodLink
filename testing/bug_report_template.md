# BloodLink — Bug Report Template & Sample Bugs

---

## Bug Report Template

| Field                | Description |
|----------------------|-------------|
| **Bug ID**           | BL-BUG-XXX |
| **Title**            | _Short, descriptive summary of the defect_ |
| **Reporter**         | _Name of the person who found the bug_ |
| **Date Reported**    | _YYYY-MM-DD_ |
| **Module / Feature** | _e.g. Login, Inventory, Emergencies, Donors, Notifications, Dashboard_ |
| **Severity**         | 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low |
| **Priority**         | P1 (Immediate) · P2 (Next sprint) · P3 (Backlog) · P4 (Nice-to-have) |
| **Status**           | New · Open · In Progress · Fixed · Verified · Closed · Reopened |
| **Assigned To**      | _Developer responsible for the fix_ |
| **Environment**      | _OS, Browser, Screen size, Backend version_ |

### Description
> _Provide a clear and concise description of the bug._

### Steps to Reproduce
> 1. _Step 1_
> 2. _Step 2_
> 3. _Step 3_

### Expected Result
> _What should happen according to the requirements._

### Actual Result
> _What actually happens (include error messages or console logs if applicable)._

### Screenshots / Evidence
> _Attach screenshots, screen recordings, or log outputs._

### Additional Context
> _Any other information — related bugs, workarounds, frequency of occurrence (Always / Intermittent / Once)._

---
---

# Sample Bug Reports

Below are **8 sample bugs** covering every major module of the BloodLink system, written in IEEE 829‑compliant format, with realistic scenarios derived from the actual codebase.

---

## BL-BUG-001 — Login accepts empty password field when pressing Enter key

| Field            | Value |
|------------------|-------|
| **Bug ID**       | BL-BUG-001 |
| **Reporter**     | QA Team — Salma Nour |
| **Date Reported**| 2026-04-28 |
| **Module**       | Authentication (Login Page) |
| **Severity**     | 🔴 Critical |
| **Priority**     | P1 (Immediate) |
| **Status**       | New |
| **Assigned To**  | Backend Team |
| **Environment**  | Windows 11, Chrome 126, 1920×1080 |

### Description
When a user enters a valid email address and leaves the password field empty, pressing the Enter key bypasses the HTML `required` attribute and submits the form. The backend responds with an authentication error, but the frontend shows a generic "Invalid credentials" message instead of a field‑level validation error.

### Steps to Reproduce
1. Navigate to `/login`.
2. Enter `admin@bloodlink.org` in the email field.
3. Leave the password field completely empty.
4. Press the **Enter** key (instead of clicking the "Sign In" button).

### Expected Result
- The browser should block form submission with a native "Please fill out this field" tooltip on the password input.
- No API call should be made.

### Actual Result
- The form submits to the backend.
- A red error banner appears: "Invalid email or password."
- Console shows `POST /auth/login 401 Unauthorized`.

### Screenshots / Evidence
> _Console log:_
> ```
> POST http://localhost:3001/auth/login 401 (Unauthorized)
> {error: "Invalid credentials"}
> ```

### Additional Context
- This occurs only when pressing Enter; clicking the Sign In button correctly triggers HTML5 validation.
- Frequency: **Always reproducible**.

---

## BL-BUG-002 — Inventory allows adding negative blood units

| Field            | Value |
|------------------|-------|
| **Bug ID**       | BL-BUG-002 |
| **Reporter**     | QA Team — Ahmed Mostafa |
| **Date Reported**| 2026-04-29 |
| **Module**       | Blood Inventory Management |
| **Severity**     | 🟠 High |
| **Priority**     | P1 (Immediate) |
| **Status**       | New |
| **Assigned To**  | Frontend Team |
| **Environment**  | Windows 11, Firefox 127, 1536×864 |

### Description
The "Add Blood Units" modal accepts negative numbers in the "Units Available" field. Submitting the form with a negative value (e.g., `-50`) successfully adds a record with negative inventory, corrupting aggregate statistics on the dashboard.

### Steps to Reproduce
1. Log in as `admin@bloodlink.org`.
2. Navigate to `/inventory`.
3. Click **"Add Blood Units"** button.
4. Select blood type **O+**.
5. Enter **-50** in the "Units Available" field.
6. Click **"Add to Inventory"**.

### Expected Result
- The form should reject negative values.
- An inline validation error should display: "Units must be a positive number."

### Actual Result
- The record is created successfully with `-50` units.
- The dashboard's "Total Inventory" card shows a reduced total.
- The status is computed as "Critical" due to the negative value passing through `getStatusFromUnits()`.

### Screenshots / Evidence
> _Inventory table row showing:_
> ```
> Blood Type: O+  |  Units: -50  |  Status: Critical  |  Trend: +0%
> ```

### Additional Context
- Root cause: The `<input type="number" min="0">` attribute is present but `parseInt(formUnits)` does not validate the parsed value before calling `addInventoryItem()`.
- The backend also lacks server-side validation for negative units.
- Frequency: **Always reproducible**.

---

## BL-BUG-003 — Emergency donor matching returns 0 donors for AB- despite available AB- donors

| Field            | Value |
|------------------|-------|
| **Bug ID**       | BL-BUG-003 |
| **Reporter**     | QA Team — Dr. Hana Mostafa |
| **Date Reported**| 2026-04-29 |
| **Module**       | Emergency Matching Engine |
| **Severity**     | 🔴 Critical |
| **Priority**     | P1 (Immediate) |
| **Status**       | Open |
| **Assigned To**  | Backend Team |
| **Environment**  | Windows 11, Chrome 126, 1920×1080, Backend v1.0.0 |

### Description
When creating an emergency request for **AB-** blood, the Matching Engine reports "0 found" compatible donors, even though there is an eligible, available AB- donor (Omar Abdelrahman, `d-5`) in the system. The matching algorithm appears to filter donors by `available === true` **and** `eligible === true`, but Omar's `lastDonation` was over 4 months ago and all eligibility flags are correctly set.

### Steps to Reproduce
1. Log in as `admin@bloodlink.org`.
2. Navigate to `/emergencies`.
3. Click **+** to create a new emergency request.
4. Set: Hospital = "Cairo General", Department = "ICU", Blood Type = **AB-**, Units = 2, Urgency = **Critical**.
5. Submit the form.
6. Observe the Matching Engine panel on the right.

### Expected Result
- Compatible Donors: **1 found** (Omar Abdelrahman, AB-, reliability 99%).
- The donor card should appear in the "Top Recommended Donors" list.

### Actual Result
- Compatible Donors: **0 found**.
- "No compatible donors found." message is displayed.

### Screenshots / Evidence
> _Matching Engine panel:_
> ```
> Required Type: AB-    Compatible Donors: 0 found    High Reliability: 0 match
> ```

### Additional Context
- Suspected root cause: The compatibility engine may not include AB- ↔ AB- exact match; it may only implement the universal donor table (O- as universal donor) but miss same-type matches.
- This is life-threatening in a production scenario.
- Frequency: **Always reproducible**.

---

## BL-BUG-004 — "Notify All" button remains disabled after successful notification

| Field            | Value |
|------------------|-------|
| **Bug ID**       | BL-BUG-004 |
| **Reporter**     | QA Team — Ahmed Mostafa |
| **Date Reported**| 2026-04-30 |
| **Module**       | Emergency Notifications |
| **Severity**     | 🟡 Medium |
| **Priority**     | P2 (Next Sprint) |
| **Status**       | New |
| **Assigned To**  | Frontend Team |
| **Environment**  | macOS Sonoma, Safari 17.5, 1440×900 |

### Description
After clicking "Notify All Top Matches" on the Emergencies page, the button shows a loading spinner and then the success toast appears. However, the button remains in a visually disabled state (`opacity-60`, `cursor-wait`) even though `notifyingAll` has been set back to `false`. The button becomes functional again only after switching to a different emergency and back.

### Steps to Reproduce
1. Log in as `admin@bloodlink.org`.
2. Navigate to `/emergencies`.
3. Select an emergency with matched donors.
4. Click **"Notify All Top Matches"**.
5. Wait for the success toast to appear.
6. Observe the button state.

### Expected Result
- The button should return to its normal active styling.
- Ideally, the button text should change to "All Donors Notified ✓" with a green accent.

### Actual Result
- The button appears grayed out and unclickable for the current session.
- The button text reverts to "Notify All Top Matches" but the styling remains disabled.

### Screenshots / Evidence
> _Button after notification:_
> ```
> [Notify All Top Matches]  ← opacity-60, cursor-wait still applied
> ```

### Additional Context
- Suspected cause: Safari's rendering engine caches the `disabled` attribute state. The React state updates correctly, but Safari does not re-paint the button styles.
- Frequency: **Always on Safari, not reproducible on Chrome/Firefox.**

---

## BL-BUG-005 — Donor dashboard "time ago" shows negative values for future-dated notifications

| Field            | Value |
|------------------|-------|
| **Bug ID**       | BL-BUG-005 |
| **Reporter**     | QA Team — Salma Nour |
| **Date Reported**| 2026-04-30 |
| **Module**       | Dashboard — Donor View |
| **Severity**     | 🟢 Low |
| **Priority**     | P3 (Backlog) |
| **Status**       | New |
| **Assigned To**  | Frontend Team |
| **Environment**  | Windows 11, Chrome 126, 1920×1080 |

### Description
The `timeAgo()` utility function does not handle notification timestamps that are in the future (e.g., scheduled maintenance windows). When a notification has a future timestamp, the function computes a negative `diff`, resulting in displays like **"-120m ago"** or **"NaN d ago"**.

### Steps to Reproduce
1. Log in as a donor account (or observe from admin dashboard).
2. Check the notification with title **"System Maintenance"** (timestamp: `2026-04-05 14:00`).
3. If the system clock is before this timestamp, observe the time display.

### Expected Result
- Future-dated notifications should display "Upcoming" or "Scheduled" instead of a negative relative time.

### Actual Result
- The notification displays **"-345600m ago"** or similar negative values.

### Screenshots / Evidence
> _Notification card footer:_
> ```
> System Maintenance  •  -5760m ago
> ```

### Additional Context
- The `timeAgo()` function at `page.tsx:20-27` performs `Date.now() - new Date(dateStr).getTime()` without checking for negative results.
- Frequency: **Conditionally reproducible** (depends on system clock vs. notification timestamp).

---

## BL-BUG-006 — Inventory delete confirmation modal closes when clicking inside modal body

| Field            | Value |
|------------------|-------|
| **Bug ID**       | BL-BUG-006 |
| **Reporter**     | QA Team — Dr. Hana Mostafa |
| **Date Reported**| 2026-04-30 |
| **Module**       | Blood Inventory — Delete Action |
| **Severity**     | 🟡 Medium |
| **Priority**     | P3 (Backlog) |
| **Status**       | New |
| **Assigned To**  | Frontend Team |
| **Environment**  | Windows 11, Edge 126, 1920×1080 |

### Description
The delete confirmation modal on the Inventory page uses `onClick={() => setDeletingId(null)}` on the backdrop overlay, which correctly dismisses the modal when clicking outside. However, the inner modal `<div>` uses `onClick={(e) => e.stopPropagation()}` for the **Add/Edit** modal but the **Delete Confirmation** modal does **not** include `e.stopPropagation()`. As a result, clicking anywhere inside the delete modal (including the text or whitespace) also dismisses it.

### Steps to Reproduce
1. Log in as `admin@bloodlink.org`.
2. Navigate to `/inventory`.
3. Click the **⋮** actions menu on any blood type row.
4. Click **Delete**.
5. In the confirmation dialog, click on the text "Are you sure you want to remove…" (not on any button).

### Expected Result
- Clicking inside the modal body should not close it.
- Only clicking "Cancel" or the backdrop should dismiss the modal.

### Actual Result
- The modal closes immediately, as if the user clicked the backdrop.

### Screenshots / Evidence
> _N/A — behavioral bug, no visual artifact._

### Additional Context
- Fix: Add `onClick={(e) => e.stopPropagation()}` to the inner `<div>` of the delete confirmation modal (line ~352 of `inventory/page.tsx`).
- Frequency: **Always reproducible**.

---

## BL-BUG-007 — Notification "response" state resets to "pending" on page refresh

| Field            | Value |
|------------------|-------|
| **Bug ID**       | BL-BUG-007 |
| **Reporter**     | QA Team — Salma Nour |
| **Date Reported**| 2026-05-01 |
| **Module**       | Donor Notifications / State Management |
| **Severity**     | 🟠 High |
| **Priority**     | P2 (Next Sprint) |
| **Status**       | Open |
| **Assigned To**  | Full Stack Team |
| **Environment**  | Windows 11, Chrome 126, 1920×1080 |

### Description
When a donor accepts or declines an emergency request, the notification card correctly updates to show "Accepted ✓" or "Declined ✗". However, refreshing the page (`F5`) resets all notification responses back to `"pending"`, causing the Accept/Decline buttons to reappear. The donor's response is not persisted to the backend or local storage.

### Steps to Reproduce
1. Log in as a donor user.
2. On the dashboard, find an emergency notification with "Accept" / "Decline" buttons.
3. Click **Accept**.
4. Observe the card updates to "Accepted ✓" with a green badge.
5. Press **F5** to refresh the page.

### Expected Result
- The notification should remain in the "Accepted" state after refresh.
- The Accept/Decline buttons should not reappear.

### Actual Result
- All notifications revert to `response: "pending"`.
- The donor can accept the same notification again, potentially sending duplicate confirmations.

### Screenshots / Evidence
> _Before refresh:_ Emergency notification shows ✓ Accepted badge.
> _After refresh:_ Same notification shows [Accept] [Decline] buttons again.

### Additional Context
- Root cause: The `respondToNotification` function in `context.tsx` updates React state in memory but the mock data in `data.ts` reinitializes with hardcoded `response: "pending"` on every page load.
- In a production environment, this should persist via a `PATCH /notifications/:id` API call.
- Frequency: **Always reproducible**.

---

## BL-BUG-008 — Dashboard inventory bar exceeds container when units > 500

| Field            | Value |
|------------------|-------|
| **Bug ID**       | BL-BUG-008 |
| **Reporter**     | QA Team — Ahmed Mostafa |
| **Date Reported**| 2026-05-01 |
| **Module**       | Admin Dashboard — Live Inventory Status |
| **Severity**     | 🟢 Low |
| **Priority**     | P4 (Nice-to-have) |
| **Status**       | New |
| **Assigned To**  | Frontend Team |
| **Environment**  | Windows 11, Chrome 126, 1366×768 |

### Description
On the admin dashboard, the "Live Inventory Status" section renders a horizontal progress bar for each blood type. The bar width is calculated as `(item.units / 500) * 100`, capped at 100% via `Math.min()`. While the cap works correctly, the hardcoded denominator of `500` means that any blood type with stock significantly above 500 units will always show a full 100% bar, providing no visual differentiation between 500 units and 2000 units.

### Steps to Reproduce
1. Log in as `admin@bloodlink.org`.
2. Navigate to the main dashboard `/`.
3. Observe the "Live Inventory Status" section.
4. Note that **O+** (420 units) shows a nearly full bar, and if a type had 800 units, it would show the exact same full bar.

### Expected Result
- The bar width denominator should be dynamically calculated based on the maximum units across all blood types, so that the bars provide meaningful visual comparison.

### Actual Result
- All blood types with ≥500 units display an identical 100% bar width regardless of actual count.

### Screenshots / Evidence
> _Bar comparison:_
> ```
> O+  ████████████████████░░  420U  (84% bar)
> A+  ████████████████████░░░ 310U  (62% bar)
> AB+ ████████████████████████ 500U  (100% bar)   ← same as 2000U
> ```

### Additional Context
- Line reference: `page.tsx:133` — `style={{ width: \`${Math.min((item.units / 500) * 100, 100)}%\` }}`
- Fix: Replace `500` with `Math.max(...inventory.map(i => i.units))` for a dynamic scale.
- Frequency: **Always reproducible**.

---

## Bug Severity & Priority Matrix

| Severity | Priority | Count | Examples |
|----------|----------|-------|----------|
| 🔴 Critical | P1 | 2 | BL-BUG-001 (Auth bypass), BL-BUG-003 (Matching failure) |
| 🟠 High | P1–P2 | 2 | BL-BUG-002 (Negative units), BL-BUG-007 (State reset) |
| 🟡 Medium | P2–P3 | 2 | BL-BUG-004 (Button state), BL-BUG-006 (Modal dismiss) |
| 🟢 Low | P3–P4 | 2 | BL-BUG-005 (Negative time), BL-BUG-008 (Bar scaling) |

## Module Coverage Summary

| Module | Bugs Filed | IDs |
|--------|-----------|-----|
| Authentication | 1 | BL-BUG-001 |
| Blood Inventory | 2 | BL-BUG-002, BL-BUG-006 |
| Emergency Matching | 1 | BL-BUG-003 |
| Notifications | 2 | BL-BUG-004, BL-BUG-007 |
| Dashboard | 2 | BL-BUG-005, BL-BUG-008 |
