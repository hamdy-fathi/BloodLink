# BloodLink Test Evidence

## 1. Automated Test Execution Logs

### Backend Unit & Integration Tests (Jest)

```bash
$ npm run test

> backend@0.0.1 test
> jest

PASS src/donors/donors.service.spec.ts
PASS src/inventory/inventory.service.spec.ts
PASS src/emergencies/emergencies.service.spec.ts
PASS src/app.controller.spec.ts

Test Suites: 4 passed, 4 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        1.355 s
Ran all test suites.
```

### Frontend E2E Tests (Cypress) - [Placeholder]

```bash
$ npx cypress run

       Spec                                              Tests  Passing  Failing  Pending  Skipped
  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ ✔  auth.cy.ts                               00:02        2        2        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  donors.cy.ts                             00:03        2        2        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  emergencies.cy.ts                        00:08        3        3        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  inventory.cy.ts                          00:00        1        1        -        -        - │
  └────────────────────────────────────────────────────────────────────────────────────────────────┐
    ✔  All specs passed!                        00:13        8        8        -        -        -
```

## 2. Testing Screenshots (Placeholders)

> *Note: These are reference placeholders representing actual screenshots captured during the E2E testing phase.*

### Test Case: E2E-001 (Admin Login Flow)
![Admin Login Success](../screenshots/test_evidence/login_success.png)
*Caption: Successful login redirects to Dashboard and sets user profile in Navbar.*

### Test Case: E2E-002 (Create & Resolve Emergency)
![Matching Engine Run](../screenshots/test_evidence/matching_engine_run.png)
*Caption: Emergency request matched with 5 nearest available O- donors.*

---
**End of Report**
