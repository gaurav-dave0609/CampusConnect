# Automated Suite Results (Batch 0 — Setup)

Recorded execution output on 2026-09-18.

---

## 1. Vitest Unit & Integration Suite (`npm run test`)

- **Status:** PASS
- **Test Files:** 19 passed (19 total)
- **Tests:** 446 passed (446 total)
- **Duration:** 10.00s

```text
 ✓ tests/unit/password.test.ts (2 tests) 343ms
 ✓ tests/integration/exam.test.ts (30 tests) 3440ms
 ✓ tests/integration/club.test.ts (33 tests) 531ms
 ✓ tests/integration/assignment.test.ts (29 tests) 539ms
 ✓ tests/integration/lost-found.test.ts (52 tests) 555ms
 ✓ tests/integration/placement.test.ts (45 tests) 569ms
 ✓ tests/integration/timetable-csp.test.ts (19 tests) 480ms
 ✓ tests/integration/auth-rbac.test.ts (11 tests) 1190ms
 ✓ tests/integration/profile-security.test.ts (13 tests) 420ms
 ✓ tests/integration/notice.test.ts (29 tests) 453ms
 ✓ tests/integration/event.test.ts (33 tests) 451ms
 ✓ tests/integration/admin-academic.test.ts (36 tests) 463ms
 ✓ tests/integration/notifications.test.ts (30 tests) 441ms
 ✓ tests/integration/critical-auth-flow.test.ts (5 tests) 1451ms
 ✓ tests/integration/attendance.test.ts (21 tests) 426ms
 ✓ tests/integration/analytics.test.ts (34 tests) 57ms
 ✓ tests/unit/foundation.test.ts (4 tests) 37ms
 ✓ tests/integration/phase16-final.test.ts (18 tests) 19ms
 ✓ tests/unit/session.test.ts (2 tests) 12ms

 Test Files  19 passed (19)
      Tests  446 passed (446)
   Start at  18:25:42
   Duration  10.00s
```

---

## 2. Live HTTP Verification Suite (`scripts/verify-api.mjs`)

- **Status:** PASS
- **Assertions:** 553 passed / 0 failed (553 total)
- **Target URL:** http://127.0.0.1:3000

```text
==================================================
STARTING LIVE HTTP API VERIFICATION FOR PHASES 2 THROUGH 9
==================================================
...
--- Phase 16 Final Integration, Security & Deployment Tests ---
[PASS] P16_01a: X-Content-Type-Options header is nosniff
[PASS] P16_01b: X-Frame-Options header is SAMEORIGIN
[PASS] P16_01c: Referrer-Policy header is strict-origin-when-cross-origin
[PASS] P16_02: Club Coordinator blocked from student academic results (HTTP 403)
[PASS] P16_03: Placement Officer blocked from student academic transcript (HTTP 403)
[PASS] P16_04: Placement Officer blocked from exporting academic transcript (HTTP 403)
[PASS] P16_05: Nonexistent route triggers HTTP 404
[PASS] P16_06: Unauthorized boundary page renders (HTTP 200)
[PASS] P16_07: Admin system-check returns HTTP 200
[PASS] P16_07b: System health status reports operational
[PASS] P16_08: Assignment upload blocks executable files (HTTP 403)

==================================================
FINAL RESULT: 553 PASSED, 0 FAILED
==================================================
```

---

## 3. TypeScript Check (`npm run type-check`)

- **Status:** PASS
- **Errors:** 0 errors

```text
> campusconnect@0.1.0 type-check
> tsc --noEmit
```

---

## 4. Production Build (`npm run build`)

- **Status:** PASS
- **Routes Generated:** 235+ static and dynamic routes compiled successfully without build errors.

```text
▲ Next.js 16.3.4 (Turbopack)
- Environments: .env
✓ Running next.config.ts took 723ms
✓ Creating an optimized production build
✓ Compiled successfully
```
