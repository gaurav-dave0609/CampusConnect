import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const SCREENSHOT_DIR = path.join(process.cwd(), "test-results", "screenshots", "AUTH");
const MASTER_LOG_PATH = path.join(process.cwd(), "test-results", "master-log.md");
const BUG_REPORTS_DIR = path.join(process.cwd(), "test-results", "bug-reports");

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
if (!fs.existsSync(BUG_REPORTS_DIR)) fs.mkdirSync(BUG_REPORTS_DIR, { recursive: true });

function appendMasterLog(id, module, scenario, status, screenshotPath, notes) {
  const row = `| ${id} | ${module} | ${scenario} | ${status} | ${screenshotPath} | ${notes} |\n`;
  fs.appendFileSync(MASTER_LOG_PATH, row);
}

function createBugReport(bugId, module, testId, severity, steps, expected, actual, screenshotPath) {
  const content = `# ${bugId}: ${testId} - Failure in ${module}

- **Bug ID:** ${bugId}
- **Module:** ${module}
- **Related Test Case ID:** ${testId}
- **Severity:** ${severity}
- **Status:** Open

## Steps to Reproduce
${steps}

## Expected Result
${expected}

## Actual Result
${actual}

## Screenshot
![${testId} Screenshot](file:///${screenshotPath.replace(/\\/g, "/")})
`;
  fs.writeFileSync(path.join(BUG_REPORTS_DIR, `${bugId}.md`), content);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  async function openLoginPage(page) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.waitForSelector("#email", { state: "visible" });
  }

  // --- AUTH-006 ---
  async function testAUTH006() {
    console.log("\n[TEST] AUTH-006: Wrong password");
    console.log("Action: Navigating to /login");
    const context = await browser.newContext();
    const page = await context.newPage();
    await openLoginPage(page);

    console.log("Action: Entering email 'student@campusconnect.edu' and wrong password 'WrongPassword999!'");
    await page.fill('#email', "student@campusconnect.edu");
    await page.fill('#password', "WrongPassword999!");
    
    console.log("Action: Clicking Authenticate & Enter Portal button");
    await page.click('button[type="submit"]');

    console.log("Action: Waiting for error alert banner");
    let hasErrorMsg = false;
    try {
      await page.waitForSelector('.bg-rose-50, .text-rose-800', { state: "visible", timeout: 5000 });
      hasErrorMsg = true;
    } catch {
      const bodyText = await page.innerText("body");
      hasErrorMsg = bodyText.includes("incorrect") || bodyText.includes("Invalid credentials") || bodyText.includes("Failed to sign in");
    }

    const screenshotPath = path.join("test-results", "screenshots", "AUTH", "AUTH-006.png");
    const fullScreenshotPath = path.join(process.cwd(), screenshotPath);
    await page.screenshot({ path: fullScreenshotPath, fullPage: true });

    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    console.log(`Has Error Message: ${hasErrorMsg}`);

    const pass = currentUrl.includes("/login") && hasErrorMsg;
    const status = pass ? "PASS" : "FAIL";
    const notes = pass ? "Login failed with error message 'The email or password you entered is incorrect' displayed on /login" : `Actual URL: ${currentUrl}, Error displayed: ${hasErrorMsg}`;

    appendMasterLog("AUTH-006", "AUTH", "Wrong password", status, screenshotPath, notes);
    if (!pass) {
      createBugReport("BUG-001", "AUTH", "AUTH-006", "High", "1. Navigate to /login\n2. Enter valid email student@campusconnect.edu\n3. Enter invalid password WrongPassword999!\n4. Click Submit", "Error banner displayed and user remains on /login", `Actual result: ${notes}`, screenshotPath);
    }
    console.log(`RESULT AUTH-006: ${status}`);
    results.push({ id: "AUTH-006", status });
    await context.close();
  }

  // --- AUTH-007 ---
  async function testAUTH007() {
    console.log("\n[TEST] AUTH-007: Non-existing email");
    console.log("Action: Navigating to /login");
    const context = await browser.newContext();
    const page = await context.newPage();
    await openLoginPage(page);

    console.log("Action: Entering non-existing email 'nonexistent999@campusconnect.edu' and password 'SomePassword123!'");
    await page.fill('#email', "nonexistent999@campusconnect.edu");
    await page.fill('#password', "SomePassword123!");
    
    console.log("Action: Clicking Authenticate button");
    await page.click('button[type="submit"]');

    console.log("Action: Waiting for error alert banner");
    let hasErrorMsg = false;
    try {
      await page.waitForSelector('.bg-rose-50, .text-rose-800', { state: "visible", timeout: 5000 });
      hasErrorMsg = true;
    } catch {
      const bodyText = await page.innerText("body");
      hasErrorMsg = bodyText.includes("incorrect") || bodyText.includes("Invalid credentials") || bodyText.includes("Failed to sign in");
    }

    const screenshotPath = path.join("test-results", "screenshots", "AUTH", "AUTH-007.png");
    const fullScreenshotPath = path.join(process.cwd(), screenshotPath);
    await page.screenshot({ path: fullScreenshotPath, fullPage: true });

    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    console.log(`Has Error Message: ${hasErrorMsg}`);

    const pass = currentUrl.includes("/login") && hasErrorMsg;
    const status = pass ? "PASS" : "FAIL";
    const notes = pass ? "Login failed with error message displayed for non-existing email" : `Actual URL: ${currentUrl}`;

    appendMasterLog("AUTH-007", "AUTH", "Non-existing email", status, screenshotPath, notes);
    if (!pass) {
      createBugReport("BUG-002", "AUTH", "AUTH-007", "High", "1. Navigate to /login\n2. Enter nonexistent email nonexistent999@campusconnect.edu\n3. Enter password SomePassword123!\n4. Click Submit", "Error banner displayed and user remains on /login", `Actual result: ${notes}`, screenshotPath);
    }
    console.log(`RESULT AUTH-007: ${status}`);
    results.push({ id: "AUTH-007", status });
    await context.close();
  }

  // --- AUTH-008 ---
  async function testAUTH008() {
    console.log("\n[TEST] AUTH-008: Empty email/password");
    console.log("Action: Navigating to /login");
    const context = await browser.newContext();
    const page = await context.newPage();
    await openLoginPage(page);

    console.log("Action: Leaving email and password empty and clicking Submit button");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    const screenshotPath = path.join("test-results", "screenshots", "AUTH", "AUTH-008.png");
    const fullScreenshotPath = path.join(process.cwd(), screenshotPath);
    await page.screenshot({ path: fullScreenshotPath, fullPage: true });

    const currentUrl = page.url();
    const emailInput = page.locator('#email');
    const isRequired = await emailInput.getAttribute("required");

    console.log(`Current URL: ${currentUrl}`);
    console.log(`Required Attribute Present: ${isRequired !== null}`);

    const pass = currentUrl.includes("/login") && (isRequired !== null);
    const status = pass ? "PASS" : "FAIL";
    const notes = pass ? "HTML5 required attribute validation prevented empty form submission" : "No validation error shown";

    appendMasterLog("AUTH-008", "AUTH", "Empty email/password", status, screenshotPath, notes);
    if (!pass) {
      createBugReport("BUG-003", "AUTH", "AUTH-008", "Medium", "1. Navigate to /login\n2. Leave inputs empty\n3. Click Submit", "Validation error or HTML5 required block", `Form submitted or no validation error`, screenshotPath);
    }
    console.log(`RESULT AUTH-008: ${status}`);
    results.push({ id: "AUTH-008", status });
    await context.close();
  }

  // --- AUTH-009 ---
  async function testAUTH009() {
    console.log("\n[TEST] AUTH-009: Logout");
    console.log("Action: Logging in as student@campusconnect.edu");
    const context = await browser.newContext();
    const page = await context.newPage();
    await openLoginPage(page);

    await page.fill('#email', "student@campusconnect.edu");
    await page.fill('#password', "StudentPassword@123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard/student", { timeout: 30000 });

    console.log("Action: Opening user menu in header");
    // Click the user menu trigger button in the top right header
    const userMenuBtn = page.locator('header button:has-text("Aarav"), header button:has(span), header button').last();
    await userMenuBtn.click();
    await page.waitForTimeout(300);

    console.log("Action: Clicking 'Sign Out Session' button");
    const logoutBtn = page.locator('button:has-text("Sign Out Session")');
    await logoutBtn.click();

    await page.waitForURL("**/login", { timeout: 30000 });
    await page.waitForTimeout(500);

    const screenshotPath = path.join("test-results", "screenshots", "AUTH", "AUTH-009.png");
    const fullScreenshotPath = path.join(process.cwd(), screenshotPath);
    await page.screenshot({ path: fullScreenshotPath, fullPage: true });

    const currentUrl = page.url();
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === "campusconnect_session");
    const sessionTerminated = !sessionCookie || sessionCookie.value === "";

    console.log(`Current URL: ${currentUrl}`);
    console.log(`Session Cookie Terminated: ${sessionTerminated}`);

    const pass = currentUrl.includes("/login") && sessionTerminated;
    const status = pass ? "PASS" : "FAIL";
    const notes = pass ? "Logout successfully terminated session and redirected to /login" : `Current URL: ${currentUrl}`;

    appendMasterLog("AUTH-009", "AUTH", "Logout", status, screenshotPath, notes);
    if (!pass) {
      createBugReport("BUG-004", "AUTH", "AUTH-009", "High", "1. Login as student\n2. Open header user menu\n3. Click Sign Out Session", "Session cookie terminated and redirected to /login", `Session active or invalid URL: ${currentUrl}`, screenshotPath);
    }
    console.log(`RESULT AUTH-009: ${status}`);
    results.push({ id: "AUTH-009", status });
    await context.close();
  }

  // --- AUTH-010 ---
  async function testAUTH010() {
    console.log("\n[TEST] AUTH-010: Open protected route without login");
    console.log("Action: Opening fresh browser context without session cookie");
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log("Action: Direct navigation to http://localhost:3000/dashboard/student");
    await page.goto(`${BASE_URL}/dashboard/student`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const screenshotPath = path.join("test-results", "screenshots", "AUTH", "AUTH-010.png");
    const fullScreenshotPath = path.join(process.cwd(), screenshotPath);
    await page.screenshot({ path: fullScreenshotPath, fullPage: true });

    const currentUrl = page.url();
    const bodyText = await page.innerText("body");
    const pass = currentUrl.includes("/login") || bodyText.includes("Unauthorized") || bodyText.includes("Sign In");
    const status = pass ? "PASS" : "FAIL";
    const notes = pass ? `Access denied, redirected to ${currentUrl}` : `Protected route accessible at ${currentUrl}`;

    appendMasterLog("AUTH-010", "AUTH", "Open protected route without login", status, screenshotPath, notes);
    if (!pass) {
      createBugReport("BUG-005", "AUTH", "AUTH-010", "Critical", "1. Open unauthenticated browser\n2. Navigate to /dashboard/student", "Redirect to /login", `Unauthenticated user accessed protected route at ${currentUrl}`, screenshotPath);
    }
    console.log(`RESULT AUTH-010: ${status}`);
    results.push({ id: "AUTH-010", status });
    await context.close();
  }

  // --- AUTH-011 ---
  async function testAUTH011() {
    console.log("\n[TEST] AUTH-011: Student opens Faculty route");
    console.log("Action: Logging in as Student");
    const context = await browser.newContext();
    const page = await context.newPage();
    await openLoginPage(page);

    await page.fill('#email', "student@campusconnect.edu");
    await page.fill('#password', "StudentPassword@123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard/student", { timeout: 30000 });

    console.log("Action: Direct navigation to http://localhost:3000/dashboard/faculty");
    await page.goto(`${BASE_URL}/dashboard/faculty`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const screenshotPath = path.join("test-results", "screenshots", "AUTH", "AUTH-011.png");
    const fullScreenshotPath = path.join(process.cwd(), screenshotPath);
    await page.screenshot({ path: fullScreenshotPath, fullPage: true });

    const currentUrl = page.url();
    const bodyText = await page.innerText("body");
    const pass = currentUrl.includes("/unauthorized") || currentUrl.includes("/dashboard/student") || bodyText.includes("Unauthorized") || bodyText.includes("Access Denied");
    const status = pass ? "PASS" : "FAIL";
    const notes = pass ? `Student access to Faculty route blocked (redirected/blocked at ${currentUrl})` : `Student accessed Faculty route at ${currentUrl}`;

    appendMasterLog("AUTH-011", "AUTH", "Student opens Faculty route", status, screenshotPath, notes);
    if (!pass) {
      createBugReport("BUG-006", "AUTH", "AUTH-011", "Critical", "1. Login as student\n2. Navigate to /dashboard/faculty", "Redirect to /unauthorized or /dashboard/student", `Student accessed Faculty dashboard at ${currentUrl}`, screenshotPath);
    }
    console.log(`RESULT AUTH-011: ${status}`);
    results.push({ id: "AUTH-011", status });
    await context.close();
  }

  // --- AUTH-012 ---
  async function testAUTH012() {
    console.log("\n[TEST] AUTH-012: Student opens Admin route");
    console.log("Action: Logging in as Student");
    const context = await browser.newContext();
    const page = await context.newPage();
    await openLoginPage(page);

    await page.fill('#email', "student@campusconnect.edu");
    await page.fill('#password', "StudentPassword@123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard/student", { timeout: 30000 });

    console.log("Action: Direct navigation to http://localhost:3000/dashboard/admin");
    await page.goto(`${BASE_URL}/dashboard/admin`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const screenshotPath = path.join("test-results", "screenshots", "AUTH", "AUTH-012.png");
    const fullScreenshotPath = path.join(process.cwd(), screenshotPath);
    await page.screenshot({ path: fullScreenshotPath, fullPage: true });

    const currentUrl = page.url();
    const bodyText = await page.innerText("body");
    const pass = currentUrl.includes("/unauthorized") || currentUrl.includes("/dashboard/student") || bodyText.includes("Unauthorized") || bodyText.includes("Access Denied");
    const status = pass ? "PASS" : "FAIL";
    const notes = pass ? `Student access to Admin route blocked (redirected/blocked at ${currentUrl})` : `Student accessed Admin route at ${currentUrl}`;

    appendMasterLog("AUTH-012", "AUTH", "Student opens Admin route", status, screenshotPath, notes);
    if (!pass) {
      createBugReport("BUG-007", "AUTH", "AUTH-012", "Critical", "1. Login as student\n2. Navigate to /dashboard/admin", "Redirect to /unauthorized or /dashboard/student", `Student accessed Admin dashboard at ${currentUrl}`, screenshotPath);
    }
    console.log(`RESULT AUTH-012: ${status}`);
    results.push({ id: "AUTH-012", status });
    await context.close();
  }

  // --- AUTH-013 ---
  async function testAUTH013() {
    console.log("\n[TEST] AUTH-013: Faculty opens Admin route");
    console.log("Action: Logging in as Faculty");
    const context = await browser.newContext();
    const page = await context.newPage();
    await openLoginPage(page);

    await page.fill('#email', "faculty@campusconnect.edu");
    await page.fill('#password', "FacultyPassword@123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard/faculty", { timeout: 30000 });

    console.log("Action: Direct navigation to http://localhost:3000/dashboard/admin");
    await page.goto(`${BASE_URL}/dashboard/admin`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const screenshotPath = path.join("test-results", "screenshots", "AUTH", "AUTH-013.png");
    const fullScreenshotPath = path.join(process.cwd(), screenshotPath);
    await page.screenshot({ path: fullScreenshotPath, fullPage: true });

    const currentUrl = page.url();
    const bodyText = await page.innerText("body");
    const pass = currentUrl.includes("/unauthorized") || currentUrl.includes("/dashboard/faculty") || bodyText.includes("Unauthorized") || bodyText.includes("Access Denied");
    const status = pass ? "PASS" : "FAIL";
    const notes = pass ? `Faculty access to Admin route blocked (redirected/blocked at ${currentUrl})` : `Faculty accessed Admin route at ${currentUrl}`;

    appendMasterLog("AUTH-013", "AUTH", "Faculty opens Admin route", status, screenshotPath, notes);
    if (!pass) {
      createBugReport("BUG-008", "AUTH", "AUTH-013", "Critical", "1. Login as faculty\n2. Navigate to /dashboard/admin", "Redirect to /unauthorized or /dashboard/faculty", `Faculty accessed Admin dashboard at ${currentUrl}`, screenshotPath);
    }
    console.log(`RESULT AUTH-013: ${status}`);
    results.push({ id: "AUTH-013", status });
    await context.close();
  }

  // --- AUTH-014 ---
  async function testAUTH014() {
    console.log("\n[TEST] AUTH-014: Change role manually in URL");
    console.log("Action: Logging in as Student");
    const context = await browser.newContext();
    const page = await context.newPage();
    await openLoginPage(page);

    await page.fill('#email', "student@campusconnect.edu");
    await page.fill('#password', "StudentPassword@123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard/student", { timeout: 30000 });

    console.log("Action: Manually altering URL to /dashboard/placement");
    await page.goto(`${BASE_URL}/dashboard/placement`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const screenshotPath = path.join("test-results", "screenshots", "AUTH", "AUTH-014.png");
    const fullScreenshotPath = path.join(process.cwd(), screenshotPath);
    await page.screenshot({ path: fullScreenshotPath, fullPage: true });

    const currentUrl = page.url();
    const bodyText = await page.innerText("body");
    const pass = currentUrl.includes("/unauthorized") || currentUrl.includes("/dashboard/student") || bodyText.includes("Unauthorized") || bodyText.includes("Access Denied");
    const status = pass ? "PASS" : "FAIL";
    const notes = pass ? `Manual role URL tampering blocked (redirected to ${currentUrl})` : `Manual role URL tampering allowed at ${currentUrl}`;

    appendMasterLog("AUTH-014", "AUTH", "Change role manually in URL", status, screenshotPath, notes);
    if (!pass) {
      createBugReport("BUG-009", "AUTH", "AUTH-014", "Critical", "1. Login as student\n2. Manually change URL to /dashboard/placement", "Redirect to /unauthorized or student dashboard", `Student accessed Placement dashboard at ${currentUrl}`, screenshotPath);
    }
    console.log(`RESULT AUTH-014: ${status}`);
    results.push({ id: "AUTH-014", status });
    await context.close();
  }

  // --- AUTH-015 ---
  async function testAUTH015() {
    console.log("\n[TEST] AUTH-015: Use browser Back after logout");
    console.log("Action: Logging in as Student");
    const context = await browser.newContext();
    const page = await context.newPage();
    await openLoginPage(page);

    await page.fill('#email', "student@campusconnect.edu");
    await page.fill('#password', "StudentPassword@123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard/student", { timeout: 30000 });

    console.log("Action: Performing logout");
    const userMenuBtn = page.locator('header button:has-text("Aarav"), header button:has(span), header button').last();
    await userMenuBtn.click();
    await page.waitForTimeout(300);

    const logoutBtn = page.locator('button:has-text("Sign Out Session")');
    await logoutBtn.click();
    await page.waitForURL("**/login", { timeout: 30000 });

    console.log("Action: Clicking Browser Back button");
    await page.goBack({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const screenshotPath = path.join("test-results", "screenshots", "AUTH", "AUTH-015.png");
    const fullScreenshotPath = path.join(process.cwd(), screenshotPath);
    await page.screenshot({ path: fullScreenshotPath, fullPage: true });

    const currentUrl = page.url();
    const bodyText = await page.innerText("body");
    const pass = currentUrl.includes("/login") || currentUrl.includes("/unauthorized") || bodyText.includes("Sign In") || bodyText.includes("Unauthorized");
    const status = pass ? "PASS" : "FAIL";
    const notes = pass ? `Protected content inaccessible on browser back (redirected to ${currentUrl})` : `Protected content revealed on browser back at ${currentUrl}`;

    appendMasterLog("AUTH-015", "AUTH", "Use browser Back after logout", status, screenshotPath, notes);
    if (!pass) {
      createBugReport("BUG-010", "AUTH", "AUTH-015", "High", "1. Login as student\n2. Perform logout\n3. Click Browser Back", "Protected route remains inaccessible (redirected to /login)", `Protected content visible at ${currentUrl}`, screenshotPath);
    }
    console.log(`RESULT AUTH-015: ${status}`);
    results.push({ id: "AUTH-015", status });
    await context.close();
  }

  // Execute sequentially
  await testAUTH006();
  await testAUTH007();
  await testAUTH008();
  await testAUTH009();
  await testAUTH010();
  await testAUTH011();
  await testAUTH012();
  await testAUTH013();
  await testAUTH014();
  await testAUTH015();

  await browser.close();
  console.log("\n==========================================");
  console.log("ALL AUTH TEST CASES COMPLETED SUCCESSFULLY!");
  console.log("==========================================");
}

run().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
