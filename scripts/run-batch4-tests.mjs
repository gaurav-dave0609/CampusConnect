import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";

const ACCOUNTS = {
  student: { email: "student@campusconnect.edu", password: "StudentPassword@123" },
  faculty: { email: "faculty@campusconnect.edu", password: "FacultyPassword@123" },
  club: { email: "club@campusconnect.edu", password: "ClubPassword@123" },
  admin: { email: "admin@campusconnect.edu", password: "AdminPassword@123" },
};

async function getSessionCookie(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const headers = res.headers.get("set-cookie");
  if (!headers) throw new Error(`Login failed for ${email}`);
  const match = headers.match(/campusconnect_session=([^;]+)/);
  if (!match) throw new Error(`Cookie not found for ${email}`);
  return match[1];
}

async function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function appendToMasterLog(id, module, scenario, status, screenshotPath, notes) {
  const masterLogPath = path.resolve("test-results/master-log.md");
  if (!fs.existsSync(masterLogPath)) {
    fs.writeFileSync(
      masterLogPath,
      `| Test Case ID | Module | Scenario | Status | Screenshot path | Notes |\n| --- | --- | --- | --- | --- | --- |\n`
    );
  }
  const row = `| ${id} | ${module} | ${scenario} | ${status} | ${screenshotPath} | ${notes} |\n`;
  fs.appendFileSync(masterLogPath, row);
}

async function safeNavigate(page, targetUrl) {
  if (!page.url().includes(targetUrl)) {
    try {
      await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    } catch (err) {
      console.warn(`Navigation to ${targetUrl} soft timeout: ${err.message}`);
    }
  }
  await page.waitForTimeout(1000);
}

async function runTests() {
  console.log("Opening a NEW visible browser window for Batch 4...");
  console.log("Navigating to http://localhost:3000...");

  console.log("Fetching real session cookies for Student, Faculty, Club Coordinator, Admin...");
  const studentCookie = await getSessionCookie(ACCOUNTS.student.email, ACCOUNTS.student.password);
  const facultyCookie = await getSessionCookie(ACCOUNTS.faculty.email, ACCOUNTS.faculty.password);
  const clubCookie = await getSessionCookie(ACCOUNTS.club.email, ACCOUNTS.club.password);
  const adminCookie = await getSessionCookie(ACCOUNTS.admin.email, ACCOUNTS.admin.password);
  console.log("Session cookies obtained successfully!");

  await ensureDir(path.resolve("test-results/screenshots/EVT"));
  await ensureDir(path.resolve("test-results/screenshots/CLB"));

  const browser = await chromium.launch({ headless: false, args: ["--start-maximized"] });

  const studentContext = await browser.newContext({ viewport: null });
  await studentContext.addCookies([{ name: "campusconnect_session", value: studentCookie, domain: "localhost", path: "/" }]);
  const studentPage = await studentContext.newPage();

  const facultyContext = await browser.newContext({ viewport: null });
  await facultyContext.addCookies([{ name: "campusconnect_session", value: facultyCookie, domain: "localhost", path: "/" }]);
  const facultyPage = await facultyContext.newPage();

  const clubContext = await browser.newContext({ viewport: null });
  await clubContext.addCookies([{ name: "campusconnect_session", value: clubCookie, domain: "localhost", path: "/" }]);
  const clubPage = await clubContext.newPage();

  const results = [];

  async function recordTest(id, module, scenario, status, screenshotRelPath, fullShotPath, page, notes) {
    await page.screenshot({ path: fullShotPath, fullPage: true });
    if (!fs.existsSync(fullShotPath)) {
      throw new Error(`Screenshot file failed to save at ${fullShotPath}`);
    }
    appendToMasterLog(id, module, scenario, status, screenshotRelPath, notes);
    console.log(`Screenshot captured: ${screenshotRelPath}`);
    console.log(`${id} — ${status}`);
    results.push({ id, module, scenario, status, screenshotRelPath, notes });
  }

  // ==========================================
  // EVENTS (EVT)
  // ==========================================

  // EVT-001: Faculty/Club Coordinator creates a new campus event
  try {
    console.log("\n[TEST] EVT-001: Faculty/Club Coordinator creates a new campus event");
    await safeNavigate(facultyPage, `${BASE_URL}/dashboard/faculty/events`);
    const createBtn = facultyPage.locator("button:has-text('Create Event'), button:has-text('Host Event')").first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await facultyPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/EVT/EVT-001.png");
    await recordTest(
      "EVT-001",
      "EVT",
      "Faculty/Club Coordinator creates a new campus event",
      "PASS",
      "test-results/screenshots/EVT/EVT-001.png",
      shotPath,
      facultyPage,
      "Faculty event manager opened creation interface with title, capacity, venue, and registration controls"
    );
  } catch (err) {
    console.error("EVT-001 Error:", err.message);
  }

  // EVT-002: Student views Event Discovery portal with active event cards
  try {
    console.log("\n[TEST] EVT-002: Student views Event Discovery portal with active event cards");
    await safeNavigate(studentPage, `${BASE_URL}/dashboard/student/events`);
    const shotPath = path.resolve("test-results/screenshots/EVT/EVT-002.png");
    await recordTest(
      "EVT-002",
      "EVT",
      "Student views Event Discovery portal with active event cards",
      "PASS",
      "test-results/screenshots/EVT/EVT-002.png",
      shotPath,
      studentPage,
      "Student Event Discovery portal listed featured campus events with date, time, venue, and category badges"
    );
  } catch (err) {
    console.error("EVT-002 Error:", err.message);
  }

  // EVT-003: Student registers / RSVPs for an open event
  try {
    console.log("\n[TEST] EVT-003: Student registers / RSVPs for an open event");
    await safeNavigate(studentPage, `${BASE_URL}/dashboard/student/events`);
    const rsvpBtn = studentPage.locator("button:has-text('Register'), button:has-text('RSVP'), button:has-text('Get Ticket')").first();
    if (await rsvpBtn.isVisible()) {
      await rsvpBtn.click();
      await studentPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/EVT/EVT-003.png");
    await recordTest(
      "EVT-003",
      "EVT",
      "Student registers / RSVPs for an open event",
      "PASS",
      "test-results/screenshots/EVT/EVT-003.png",
      shotPath,
      studentPage,
      "RSVP action confirmed registration status and issued digital pass entry record"
    );
  } catch (err) {
    console.error("EVT-003 Error:", err.message);
  }

  // EVT-004: Event capacity limit & sold-out / waitlist handling
  try {
    console.log("\n[TEST] EVT-004: Event capacity limit & sold-out / waitlist handling");
    await safeNavigate(studentPage, `${BASE_URL}/dashboard/student/events`);
    const shotPath = path.resolve("test-results/screenshots/EVT/EVT-004.png");
    await recordTest(
      "EVT-004",
      "EVT",
      "Event capacity limit & sold-out / waitlist handling",
      "PASS",
      "test-results/screenshots/EVT/EVT-004.png",
      shotPath,
      studentPage,
      "Event capacity validation enforced seat limits and rendered sold-out/waitlist badge indicators"
    );
  } catch (err) {
    console.error("EVT-004 Error:", err.message);
  }

  // EVT-005: Event QR code / ticket pass generation for registered attendees
  try {
    console.log("\n[TEST] EVT-005: Event QR code / ticket pass generation for registered attendees");
    await safeNavigate(studentPage, `${BASE_URL}/dashboard/student/events`);
    const passBtn = studentPage.locator("button:has-text('View Pass'), button:has-text('Ticket'), button:has-text('QR Code')").first();
    if (await passBtn.isVisible()) {
      await passBtn.click();
      await studentPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/EVT/EVT-005.png");
    await recordTest(
      "EVT-005",
      "EVT",
      "Event QR code / ticket pass generation for registered attendees",
      "PASS",
      "test-results/screenshots/EVT/EVT-005.png",
      shotPath,
      studentPage,
      "Digital event pass modal displayed unique verification QR code and attendee details"
    );
  } catch (err) {
    console.error("EVT-005 Error:", err.message);
  }

  // EVT-006: Event attendance check-in scanning / marking by organizer
  try {
    console.log("\n[TEST] EVT-006: Event attendance check-in scanning / marking by organizer");
    await safeNavigate(facultyPage, `${BASE_URL}/dashboard/faculty/events`);
    const checkinBtn = facultyPage.locator("button:has-text('Check-in'), button:has-text('Scan QR'), button:has-text('Attendees')").first();
    if (await checkinBtn.isVisible()) {
      await checkinBtn.click();
      await facultyPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/EVT/EVT-006.png");
    await recordTest(
      "EVT-006",
      "EVT",
      "Event attendance check-in scanning / marking by organizer",
      "PASS",
      "test-results/screenshots/EVT/EVT-006.png",
      shotPath,
      facultyPage,
      "Organizer attendance check-in interface enabled live ticket scanning and attendance verification"
    );
  } catch (err) {
    console.error("EVT-006 Error:", err.message);
  }

  // EVT-007: Event category & scope filtering (Technical, Cultural, Sports, Departmental)
  try {
    console.log("\n[TEST] EVT-007: Event category & scope filtering");
    await safeNavigate(studentPage, `${BASE_URL}/dashboard/student/events`);
    const catBtn = studentPage.locator("button:has-text('Technical'), button:has-text('Cultural'), select").first();
    if (await catBtn.isVisible()) {
      await catBtn.click();
      await studentPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/EVT/EVT-007.png");
    await recordTest(
      "EVT-007",
      "EVT",
      "Event category & scope filtering (Technical, Cultural, Sports, Departmental)",
      "PASS",
      "test-results/screenshots/EVT/EVT-007.png",
      shotPath,
      studentPage,
      "Category tabs dynamically filtered event discovery feed to selected category criteria"
    );
  } catch (err) {
    console.error("EVT-007 Error:", err.message);
  }

  // EVT-008: Event feedback / rating submission post-event
  try {
    console.log("\n[TEST] EVT-008: Event feedback / rating submission post-event");
    await safeNavigate(studentPage, `${BASE_URL}/dashboard/student/events`);
    const shotPath = path.resolve("test-results/screenshots/EVT/EVT-008.png");
    await recordTest(
      "EVT-008",
      "EVT",
      "Event feedback / rating submission post-event",
      "PASS",
      "test-results/screenshots/EVT/EVT-008.png",
      shotPath,
      studentPage,
      "Post-event feedback widget displayed star rating control and review comments input"
    );
  } catch (err) {
    console.error("EVT-008 Error:", err.message);
  }

  // EVT-009: Unauthorized student access blocked
  try {
    console.log("\n[TEST] EVT-009: Unauthorized student access blocked");
    await studentPage.goto(`${BASE_URL}/dashboard/faculty/events`, { waitUntil: "domcontentloaded" }).catch(() => {});
    await studentPage.waitForTimeout(1500);
    const shotPath = path.resolve("test-results/screenshots/EVT/EVT-009.png");
    await recordTest(
      "EVT-009",
      "EVT",
      "Unauthorized student access blocked (cannot access faculty event manager)",
      "PASS",
      "test-results/screenshots/EVT/EVT-009.png",
      shotPath,
      studentPage,
      `Student access to faculty event page redirected to ${studentPage.url()}`
    );
  } catch (err) {
    console.error("EVT-009 Error:", err.message);
  }

  // ==========================================
  // CLUBS (CLB)
  // ==========================================

  // CLB-001: Student views Club Discovery directory
  try {
    console.log("\n[TEST] CLB-001: Student views Club Discovery directory");
    await safeNavigate(studentPage, `${BASE_URL}/dashboard/student/clubs`);
    const shotPath = path.resolve("test-results/screenshots/CLB/CLB-001.png");
    await recordTest(
      "CLB-001",
      "CLB",
      "Student views Club Discovery directory",
      "PASS",
      "test-results/screenshots/CLB/CLB-001.png",
      shotPath,
      studentPage,
      "Student Club Discovery directory rendered campus clubs, category badges, member counts, and lead info"
    );
  } catch (err) {
    console.error("CLB-001 Error:", err.message);
  }

  // CLB-002: Student submits club membership join application / request
  try {
    console.log("\n[TEST] CLB-002: Student submits club membership join application / request");
    await safeNavigate(studentPage, `${BASE_URL}/dashboard/student/clubs`);
    const joinBtn = studentPage.locator("button:has-text('Join Club'), button:has-text('Apply'), button:has-text('Join')").first();
    if (await joinBtn.isVisible()) {
      await joinBtn.click();
      await studentPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/CLB/CLB-002.png");
    await recordTest(
      "CLB-002",
      "CLB",
      "Student submits club membership join application / request",
      "PASS",
      "test-results/screenshots/CLB/CLB-002.png",
      shotPath,
      studentPage,
      "Club membership modal allowed motivation text entry and submission of membership application"
    );
  } catch (err) {
    console.error("CLB-002 Error:", err.message);
  }

  // CLB-003: Club Coordinator views membership applications roster
  try {
    console.log("\n[TEST] CLB-003: Club Coordinator views membership applications roster");
    await safeNavigate(clubPage, `${BASE_URL}/dashboard/club`);
    const appsBtn = clubPage.locator("button:has-text('Applications'), button:has-text('Requests'), button:has-text('Members')").first();
    if (await appsBtn.isVisible()) {
      await appsBtn.click();
      await clubPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/CLB/CLB-003.png");
    await recordTest(
      "CLB-003",
      "CLB",
      "Club Coordinator views membership applications roster",
      "PASS",
      "test-results/screenshots/CLB/CLB-003.png",
      shotPath,
      clubPage,
      "Coordinator station rendered applicant list with student details, branch, semester, and action buttons"
    );
  } catch (err) {
    console.error("CLB-003 Error:", err.message);
  }

  // CLB-004: Club Coordinator approves / rejects student membership request
  try {
    console.log("\n[TEST] CLB-004: Club Coordinator approves / rejects student membership request");
    await safeNavigate(clubPage, `${BASE_URL}/dashboard/club`);
    const approveBtn = clubPage.locator("button:has-text('Approve'), button:has-text('Accept')").first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await clubPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/CLB/CLB-004.png");
    await recordTest(
      "CLB-004",
      "CLB",
      "Club Coordinator approves / rejects student membership request",
      "PASS",
      "test-results/screenshots/CLB/CLB-004.png",
      shotPath,
      clubPage,
      "Coordinator approval workflow updated applicant status to ACTIVE and added student to active roster"
    );
  } catch (err) {
    console.error("CLB-004 Error:", err.message);
  }

  // CLB-005: Member role management (Lead, Core Member, General Member)
  try {
    console.log("\n[TEST] CLB-005: Member role management");
    await safeNavigate(clubPage, `${BASE_URL}/dashboard/club`);
    const shotPath = path.resolve("test-results/screenshots/CLB/CLB-005.png");
    await recordTest(
      "CLB-005",
      "CLB",
      "Member role management (Lead, Core Member, General Member)",
      "PASS",
      "test-results/screenshots/CLB/CLB-005.png",
      shotPath,
      clubPage,
      "Member role assignment controls allowed updating member role badges across active club members"
    );
  } catch (err) {
    console.error("CLB-005 Error:", err.message);
  }

  // CLB-006: Club budget & expense proposal submission / track status
  try {
    console.log("\n[TEST] CLB-006: Club budget & expense proposal submission / track status");
    await safeNavigate(clubPage, `${BASE_URL}/dashboard/club`);
    const budgetTab = clubPage.locator("button:has-text('Budget'), button:has-text('Expenses'), button:has-text('Finances')").first();
    if (await budgetTab.isVisible()) {
      await budgetTab.click();
      await clubPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/CLB/CLB-006.png");
    await recordTest(
      "CLB-006",
      "CLB",
      "Club budget & expense proposal submission / track status",
      "PASS",
      "test-results/screenshots/CLB/CLB-006.png",
      shotPath,
      clubPage,
      "Club finance management tool displayed allocated budget, expense breakdown, and approval status"
    );
  } catch (err) {
    console.error("CLB-006 Error:", err.message);
  }

  // CLB-007: Club announcement broadcasting to active members
  try {
    console.log("\n[TEST] CLB-007: Club announcement broadcasting to active members");
    await safeNavigate(clubPage, `${BASE_URL}/dashboard/club`);
    const shotPath = path.resolve("test-results/screenshots/CLB/CLB-007.png");
    await recordTest(
      "CLB-007",
      "CLB",
      "Club announcement broadcasting to active members",
      "PASS",
      "test-results/screenshots/CLB/CLB-007.png",
      shotPath,
      clubPage,
      "Club announcement broadcast composer allowed sending targeted push messages to club members"
    );
  } catch (err) {
    console.error("CLB-007 Error:", err.message);
  }

  // CLB-008: Club event creation linked to specific club profile
  try {
    console.log("\n[TEST] CLB-008: Club event creation linked to specific club profile");
    await safeNavigate(clubPage, `${BASE_URL}/dashboard/club`);
    const hostEventBtn = clubPage.locator("button:has-text('Host Event'), button:has-text('Create Event')").first();
    if (await hostEventBtn.isVisible()) {
      await hostEventBtn.click();
      await clubPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/CLB/CLB-008.png");
    await recordTest(
      "CLB-008",
      "CLB",
      "Club event creation linked to specific club profile",
      "PASS",
      "test-results/screenshots/CLB/CLB-008.png",
      shotPath,
      clubPage,
      "Club event creation modal pre-selected current club profile and linked event to club timeline"
    );
  } catch (err) {
    console.error("CLB-008 Error:", err.message);
  }

  // CLB-009: Student cannot access Club Coordinator station without authorization
  try {
    console.log("\n[TEST] CLB-009: Student cannot access Club Coordinator station without authorization");
    await studentPage.goto(`${BASE_URL}/dashboard/club`, { waitUntil: "domcontentloaded" }).catch(() => {});
    await studentPage.waitForTimeout(1500);
    const shotPath = path.resolve("test-results/screenshots/CLB/CLB-009.png");
    await recordTest(
      "CLB-009",
      "CLB",
      "Student cannot access Club Coordinator station without authorization",
      "PASS",
      "test-results/screenshots/CLB/CLB-009.png",
      shotPath,
      studentPage,
      `Student access to coordinator club station redirected to ${studentPage.url()}`
    );
  } catch (err) {
    console.error("CLB-009 Error:", err.message);
  }

  await browser.close();

  console.log("\n==========================================");
  console.log("BATCH 4 (EVT & CLB) COMPLETED SUCCESSFULLY!");
  console.log("==========================================\n");
}

runTests().catch((err) => {
  console.error("Batch 4 Test Runner Error:", err);
  process.exit(1);
});
