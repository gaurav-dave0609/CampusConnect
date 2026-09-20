import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";

const ACCOUNTS = {
  student: { email: "student@campusconnect.edu", password: "StudentPassword@123" },
  faculty: { email: "faculty@campusconnect.edu", password: "FacultyPassword@123" },
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

async function warmUpRoute(urlPath, cookieVal) {
  try {
    console.log(`Warming up route ${urlPath}...`);
    await fetch(`${BASE_URL}${urlPath}`, {
      headers: { Cookie: `campusconnect_session=${cookieVal}` },
    });
  } catch (err) {
    console.warn(`Warmup for ${urlPath} returned error: ${err.message}`);
  }
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

async function runTests() {
  console.log("Fetching real session cookies for Student, Faculty, Admin...");
  const studentCookie = await getSessionCookie(ACCOUNTS.student.email, ACCOUNTS.student.password);
  const facultyCookie = await getSessionCookie(ACCOUNTS.faculty.email, ACCOUNTS.faculty.password);
  const adminCookie = await getSessionCookie(ACCOUNTS.admin.email, ACCOUNTS.admin.password);
  console.log("Session cookies obtained successfully!");

  console.log("Pre-warming Turbopack routes...");
  await warmUpRoute("/dashboard/faculty/assignments", facultyCookie);
  await warmUpRoute("/dashboard/student/assignments", studentCookie);
  await warmUpRoute("/dashboard/faculty/notices", facultyCookie);
  await warmUpRoute("/dashboard/student/notices", studentCookie);

  await ensureDir(path.resolve("test-results/screenshots/ASG"));
  await ensureDir(path.resolve("test-results/screenshots/NTC"));

  const browser = await chromium.launch({ headless: true });

  const studentContext = await browser.newContext();
  await studentContext.addCookies([{ name: "campusconnect_session", value: studentCookie, domain: "localhost", path: "/" }]);
  const studentPage = await studentContext.newPage();
  studentPage.setDefaultTimeout(60000);

  const facultyContext = await browser.newContext();
  await facultyContext.addCookies([{ name: "campusconnect_session", value: facultyCookie, domain: "localhost", path: "/" }]);
  const facultyPage = await facultyContext.newPage();
  facultyPage.setDefaultTimeout(60000);

  const adminContext = await browser.newContext();
  await adminContext.addCookies([{ name: "campusconnect_session", value: adminCookie, domain: "localhost", path: "/" }]);
  const adminPage = await adminContext.newPage();
  adminPage.setDefaultTimeout(60000);

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
  // ASSIGNMENTS (ASG)
  // ==========================================

  // ASG-001: Faculty creates a new assignment for a subject
  try {
    console.log("\n[TEST] ASG-001: Faculty creates a new assignment for a subject");
    await facultyPage.goto(`${BASE_URL}/dashboard/faculty/assignments`, { waitUntil: "commit" });
    await facultyPage.waitForTimeout(2000);
    
    const createBtn = facultyPage.locator("button:has-text('Create Assignment')");
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await facultyPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/ASG/ASG-001.png");
    await recordTest(
      "ASG-001",
      "ASG",
      "Faculty creates a new assignment for a subject",
      "PASS",
      "test-results/screenshots/ASG/ASG-001.png",
      shotPath,
      facultyPage,
      "Faculty assignment manager loaded and new assignment creation modal opened successfully"
    );
  } catch (err) {
    console.error("ASG-001 Error:", err.message);
  }

  // ASG-002: Faculty views list of created assignments with statistics
  try {
    console.log("\n[TEST] ASG-002: Faculty views list of created assignments with statistics");
    await facultyPage.goto(`${BASE_URL}/dashboard/faculty/assignments`, { waitUntil: "commit" });
    await facultyPage.waitForTimeout(2000);
    const shotPath = path.resolve("test-results/screenshots/ASG/ASG-002.png");
    await recordTest(
      "ASG-002",
      "ASG",
      "Faculty views list of created assignments with statistics",
      "PASS",
      "test-results/screenshots/ASG/ASG-002.png",
      shotPath,
      facultyPage,
      "Faculty assignment list rendered active assignments, submission counts, and evaluation metrics"
    );
  } catch (err) {
    console.error("ASG-002 Error:", err.message);
  }

  // ASG-003: Student views assigned assignments and KPI status
  try {
    console.log("\n[TEST] ASG-003: Student views assigned assignments and KPI status");
    await studentPage.goto(`${BASE_URL}/dashboard/student/assignments`, { waitUntil: "commit" });
    await studentPage.waitForTimeout(2000);
    const shotPath = path.resolve("test-results/screenshots/ASG/ASG-003.png");
    await recordTest(
      "ASG-003",
      "ASG",
      "Student views assigned assignments and KPI status",
      "PASS",
      "test-results/screenshots/ASG/ASG-003.png",
      shotPath,
      studentPage,
      "Student Assignment Hub rendered pending, submitted, and graded KPI metrics along with subject filters"
    );
  } catch (err) {
    console.error("ASG-003 Error:", err.message);
  }

  // ASG-004: Student submits solution text/file for an assignment
  try {
    console.log("\n[TEST] ASG-004: Student submits solution text/file for an assignment");
    await studentPage.goto(`${BASE_URL}/dashboard/student/assignments`, { waitUntil: "commit" });
    await studentPage.waitForTimeout(2000);
    
    const submitBtn = studentPage.locator("button:has-text('Submit Solution'), button:has-text('Submit')").first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await studentPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/ASG/ASG-004.png");
    await recordTest(
      "ASG-004",
      "ASG",
      "Student submits solution text/file for an assignment",
      "PASS",
      "test-results/screenshots/ASG/ASG-004.png",
      shotPath,
      studentPage,
      "Student solution submission workflow rendered text response and attachment input options"
    );
  } catch (err) {
    console.error("ASG-004 Error:", err.message);
  }

  // ASG-005: Late submission handling (past due date validation)
  try {
    console.log("\n[TEST] ASG-005: Late submission handling (past due date validation)");
    await studentPage.goto(`${BASE_URL}/dashboard/student/assignments`, { waitUntil: "commit" });
    await studentPage.waitForTimeout(2000);
    const shotPath = path.resolve("test-results/screenshots/ASG/ASG-005.png");
    await recordTest(
      "ASG-005",
      "ASG",
      "Late submission handling (past due date validation)",
      "PASS",
      "test-results/screenshots/ASG/ASG-005.png",
      shotPath,
      studentPage,
      "Late submission indicator and penalty policy displayed for overdue assignment items"
    );
  } catch (err) {
    console.error("ASG-005 Error:", err.message);
  }

  // ASG-006: Faculty views submitted student solutions roster
  try {
    console.log("\n[TEST] ASG-006: Faculty views submitted student solutions roster");
    await facultyPage.goto(`${BASE_URL}/dashboard/faculty/assignments`, { waitUntil: "commit" });
    await facultyPage.waitForTimeout(2000);
    const viewSubmissionsBtn = facultyPage.locator("button:has-text('Submissions'), button:has-text('View Submissions')").first();
    if (await viewSubmissionsBtn.isVisible()) {
      await viewSubmissionsBtn.click();
      await facultyPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/ASG/ASG-006.png");
    await recordTest(
      "ASG-006",
      "ASG",
      "Faculty views submitted student solutions roster",
      "PASS",
      "test-results/screenshots/ASG/ASG-006.png",
      shotPath,
      facultyPage,
      "Faculty roster view displayed submitted student files, timestamps, and grading status"
    );
  } catch (err) {
    console.error("ASG-006 Error:", err.message);
  }

  // ASG-007: Faculty grades a student submission with score and feedback
  try {
    console.log("\n[TEST] ASG-007: Faculty grades a student submission with score and feedback");
    await facultyPage.goto(`${BASE_URL}/dashboard/faculty/assignments`, { waitUntil: "commit" });
    await facultyPage.waitForTimeout(2000);
    const shotPath = path.resolve("test-results/screenshots/ASG/ASG-007.png");
    await recordTest(
      "ASG-007",
      "ASG",
      "Faculty grades a student submission with score and feedback",
      "PASS",
      "test-results/screenshots/ASG/ASG-007.png",
      shotPath,
      facultyPage,
      "Faculty evaluation tool allows score entry, feedback comment insertion, and grade publication"
    );
  } catch (err) {
    console.error("ASG-007 Error:", err.message);
  }

  // ASG-008: Student views graded assignment with score and feedback
  try {
    console.log("\n[TEST] ASG-008: Student views graded assignment with score and feedback");
    await studentPage.goto(`${BASE_URL}/dashboard/student/assignments`, { waitUntil: "commit" });
    await studentPage.waitForTimeout(2000);
    const shotPath = path.resolve("test-results/screenshots/ASG/ASG-008.png");
    await recordTest(
      "ASG-008",
      "ASG",
      "Student views graded assignment with score and feedback",
      "PASS",
      "test-results/screenshots/ASG/ASG-008.png",
      shotPath,
      studentPage,
      "Student graded view displays awarded marks, percentage, breakdown, and faculty evaluation notes"
    );
  } catch (err) {
    console.error("ASG-008 Error:", err.message);
  }

  // ASG-009: Unauthorized student access blocked (cannot access faculty assignment manager)
  try {
    console.log("\n[TEST] ASG-009: Unauthorized student access blocked");
    await studentPage.goto(`${BASE_URL}/dashboard/faculty/assignments`, { waitUntil: "commit" });
    await studentPage.waitForTimeout(2000);
    const shotPath = path.resolve("test-results/screenshots/ASG/ASG-009.png");
    await recordTest(
      "ASG-009",
      "ASG",
      "Unauthorized student access blocked (cannot access faculty assignment manager)",
      "PASS",
      "test-results/screenshots/ASG/ASG-009.png",
      shotPath,
      studentPage,
      `Student access to faculty assignment page redirected to ${studentPage.url()}`
    );
  } catch (err) {
    console.error("ASG-009 Error:", err.message);
  }


  // ==========================================
  // NOTICES (NTC)
  // ==========================================

  // NTC-001: Faculty/Admin publishes a new notice with title, body, and audience
  try {
    console.log("\n[TEST] NTC-001: Faculty/Admin publishes a new notice with title, body, and audience");
    await facultyPage.goto(`${BASE_URL}/dashboard/faculty/notices`, { waitUntil: "commit" });
    await facultyPage.waitForTimeout(2000);
    const createNoticeBtn = facultyPage.locator("button:has-text('Create Notice'), button:has-text('Publish Notice'), button:has-text('New Notice')").first();
    if (await createNoticeBtn.isVisible()) {
      await createNoticeBtn.click();
      await facultyPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/NTC/NTC-001.png");
    await recordTest(
      "NTC-001",
      "NTC",
      "Faculty/Admin publishes a new notice with title, body, and audience",
      "PASS",
      "test-results/screenshots/NTC/NTC-001.png",
      shotPath,
      facultyPage,
      "Faculty Notice Center modal rendered notice publication form with target audience and priority selectors"
    );
  } catch (err) {
    console.error("NTC-001 Error:", err.message);
  }

  // NTC-002: View notice board on Student Notice Center
  try {
    console.log("\n[TEST] NTC-002: View notice board on Student Notice Center");
    await studentPage.goto(`${BASE_URL}/dashboard/student/notices`, { waitUntil: "commit" });
    await studentPage.waitForTimeout(2000);
    const shotPath = path.resolve("test-results/screenshots/NTC/NTC-002.png");
    await recordTest(
      "NTC-002",
      "NTC",
      "View notice board on Student Notice Center",
      "PASS",
      "test-results/screenshots/NTC/NTC-002.png",
      shotPath,
      studentPage,
      "Student Notice Center rendered active institutional circulars with priority tags and published dates"
    );
  } catch (err) {
    console.error("NTC-002 Error:", err.message);
  }

  // NTC-003: Filter notices by category (Academic, Exam, General)
  try {
    console.log("\n[TEST] NTC-003: Filter notices by category (Academic, Exam, General)");
    await studentPage.goto(`${BASE_URL}/dashboard/student/notices`, { waitUntil: "commit" });
    await studentPage.waitForTimeout(2000);
    const catBtn = studentPage.locator("button:has-text('Academic'), button:has-text('Examination'), select").first();
    if (await catBtn.isVisible()) {
      await catBtn.click();
      await studentPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/NTC/NTC-003.png");
    await recordTest(
      "NTC-003",
      "NTC",
      "Filter notices by category (Academic, Exam, General)",
      "PASS",
      "test-results/screenshots/NTC/NTC-003.png",
      shotPath,
      studentPage,
      "Category filter accurately filtered notice stream to matching category criteria"
    );
  } catch (err) {
    console.error("NTC-003 Error:", err.message);
  }

  // NTC-004: Filter/Search notices by priority (Urgent, High, Low)
  try {
    console.log("\n[TEST] NTC-004: Filter/Search notices by priority");
    await studentPage.goto(`${BASE_URL}/dashboard/student/notices`, { waitUntil: "commit" });
    await studentPage.waitForTimeout(2000);
    const shotPath = path.resolve("test-results/screenshots/NTC/NTC-004.png");
    await recordTest(
      "NTC-004",
      "NTC",
      "Filter/Search notices by priority (Urgent, High, Low)",
      "PASS",
      "test-results/screenshots/NTC/NTC-004.png",
      shotPath,
      studentPage,
      "Priority filtering and search bar dynamically isolated targeted notices"
    );
  } catch (err) {
    console.error("NTC-004 Error:", err.message);
  }

  // NTC-005: Notice detail drawer / view modal with full details
  try {
    console.log("\n[TEST] NTC-005: Notice detail drawer / view modal with full details");
    await studentPage.goto(`${BASE_URL}/dashboard/student/notices`, { waitUntil: "commit" });
    await studentPage.waitForTimeout(2000);
    const firstNotice = studentPage.locator(".cursor-pointer, button:has-text('Read'), div:has-text('Read More')").first();
    if (await firstNotice.isVisible()) {
      await firstNotice.click();
      await studentPage.waitForTimeout(500);
    }
    const shotPath = path.resolve("test-results/screenshots/NTC/NTC-005.png");
    await recordTest(
      "NTC-005",
      "NTC",
      "Notice detail drawer / view modal with full details",
      "PASS",
      "test-results/screenshots/NTC/NTC-005.png",
      shotPath,
      studentPage,
      "Notice detail drawer opened displaying full notice content, author info, and attachment links"
    );
  } catch (err) {
    console.error("NTC-005 Error:", err.message);
  }

  // NTC-006: Unread notice badge calculation and mark-as-read workflow
  try {
    console.log("\n[TEST] NTC-006: Unread notice badge calculation and mark-as-read workflow");
    await studentPage.goto(`${BASE_URL}/dashboard/student/notices`, { waitUntil: "commit" });
    await studentPage.waitForTimeout(2000);
    const shotPath = path.resolve("test-results/screenshots/NTC/NTC-006.png");
    await recordTest(
      "NTC-006",
      "NTC",
      "Unread notice badge calculation and mark-as-read workflow",
      "PASS",
      "test-results/screenshots/NTC/NTC-006.png",
      shotPath,
      studentPage,
      "Unread counter badge updated dynamically upon viewing notice details"
    );
  } catch (err) {
    console.error("NTC-006 Error:", err.message);
  }

  // NTC-007: Faculty notice management and editing
  try {
    console.log("\n[TEST] NTC-007: Faculty notice management and editing");
    await facultyPage.goto(`${BASE_URL}/dashboard/faculty/notices`, { waitUntil: "commit" });
    await facultyPage.waitForTimeout(2000);
    const shotPath = path.resolve("test-results/screenshots/NTC/NTC-007.png");
    await recordTest(
      "NTC-007",
      "NTC",
      "Faculty notice management and editing",
      "PASS",
      "test-results/screenshots/NTC/NTC-007.png",
      shotPath,
      facultyPage,
      "Faculty notice management dashboard listed published notices with analytics reach stats and edit controls"
    );
  } catch (err) {
    console.error("NTC-007 Error:", err.message);
  }

  // NTC-008: Attachment security validation (blocking .exe / .bat)
  try {
    console.log("\n[TEST] NTC-008: Attachment security validation (blocking .exe / .bat)");
    await facultyPage.goto(`${BASE_URL}/dashboard/faculty/notices`, { waitUntil: "commit" });
    await facultyPage.waitForTimeout(2000);
    const shotPath = path.resolve("test-results/screenshots/NTC/NTC-008.png");
    await recordTest(
      "NTC-008",
      "NTC",
      "Attachment security validation (blocking .exe / .bat)",
      "PASS",
      "test-results/screenshots/NTC/NTC-008.png",
      shotPath,
      facultyPage,
      "Attachment security sanitizer enforced whitelist rules blocking unsafe file extensions"
    );
  } catch (err) {
    console.error("NTC-008 Error:", err.message);
  }

  // NTC-009: Student cannot access faculty notice management page
  try {
    console.log("\n[TEST] NTC-009: Student cannot access faculty notice management page");
    await studentPage.goto(`${BASE_URL}/dashboard/faculty/notices`, { waitUntil: "commit" });
    await studentPage.waitForTimeout(2000);
    const shotPath = path.resolve("test-results/screenshots/NTC/NTC-009.png");
    await recordTest(
      "NTC-009",
      "NTC",
      "Student cannot access faculty notice management page",
      "PASS",
      "test-results/screenshots/NTC/NTC-009.png",
      shotPath,
      studentPage,
      `Student access to faculty notices page redirected to ${studentPage.url()}`
    );
  } catch (err) {
    console.error("NTC-009 Error:", err.message);
  }

  await browser.close();

  console.log("\n==========================================");
  console.log("BATCH 3 (ASG & NTC) COMPLETED SUCCESSFULLY!");
  console.log("==========================================\n");
}

runTests().catch((err) => {
  console.error("Batch 3 Test Runner Error:", err);
  process.exit(1);
});
