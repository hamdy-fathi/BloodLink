# BloodLink Bug Reports

## 1. Bug Report Template

**Bug ID:** BL-BUG-[Number]
**Title:** [Short, descriptive title]
**Reported By:** [QA Engineer Name]
**Date:** [Date]
**Severity:** [Critical / High / Medium / Low]
**Environment:** [e.g., Windows 11, Chrome v120, Local DB]

**Description:**
[Detailed description of what the bug is]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[What should have happened]

**Actual Result:**
[What actually happened]

**Attachments:**
[Links to screenshots, logs, or network traces]

---

## 2. Sample Bugs

### Sample Bug 1
**Bug ID:** BL-BUG-041
**Title:** Matching Engine Recency Penalty applying incorrectly for >56 days
**Reported By:** QA Automation
**Date:** 2026-05-01
**Severity:** High
**Environment:** Windows 10, Backend Test Env (Jest)

**Description:**
The Matching Engine v2 applies a negative penalty for donors who donated 60 days ago, even though the safety window is 56 days. The penalty should be 0.

**Steps to Reproduce:**
1. Run the Matching Engine algorithm unit test `UT-001`.
2. Input a donor with `lastDonation = current_date - 60 days`.
3. Check the calculated score.

**Expected Result:**
Recency Penalty should be 0. Total score should not be degraded by recency.

**Actual Result:**
Recency Penalty calculated as `25 * (1 - 60/56) = -1.78`, incorrectly adding points or subtracting an invalid amount depending on absolute value checks.

**Attachments:**
`jest_output_recency_test.log`

---

### Sample Bug 2
**Bug ID:** BL-BUG-042
**Title:** Inventory allows negative values when resolving emergencies
**Reported By:** QA Manual
**Date:** 2026-05-01
**Severity:** Critical
**Environment:** macOS Sonoma, Safari 17, Staging

**Description:**
When an emergency request is marked as resolved and requires 10 units, but the inventory only has 5 units available, the system deducts 10 units resulting in a -5 inventory count.

**Steps to Reproduce:**
1. Set O- inventory to 5 units.
2. Create an Emergency Request for 10 units of O-.
3. Match donors and mark the request as "Resolved" (which deducts from inventory).
4. Navigate back to the Inventory Dashboard.

**Expected Result:**
The system should either block the resolution if inventory is insufficient or require manual override. Inventory should never be negative.

**Actual Result:**
O- inventory displays `-5 units`.

**Attachments:**
`screenshot_negative_inventory.png`

---

### Sample Bug 3
**Bug ID:** BL-BUG-043
**Title:** Toast notification overlaps with Navbar on mobile screens
**Reported By:** UI/UX Team
**Date:** 2026-05-01
**Severity:** Low
**Environment:** iOS 17, Chrome Mobile

**Description:**
On smaller screens (< 768px), the top-right aligned Toast notifications obscure the mobile hamburger menu icon, preventing users from opening the navigation until the toast disappears.

**Steps to Reproduce:**
1. Open BloodLink on a mobile device (or responsive emulator).
2. Perform an action that triggers a toast (e.g., toggle donor availability).
3. Attempt to click the top-right hamburger menu.

**Expected Result:**
Toast should appear below the navbar or at the bottom of the screen on mobile devices.

**Actual Result:**
Toast renders at `top-4 right-4` with `z-index: 50`, fully covering the menu icon.

**Attachments:**
`mobile_toast_overlap.png`
