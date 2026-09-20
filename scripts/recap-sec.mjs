import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";

const ACCOUNTS = {
  student: { email: "student@campusconnect.edu", password: "StudentPassword@123" },
};

async function getSessionCookie(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const headers = res.headers.get("set-cookie");
  const match = headers.match(/campusconnect_session=([^;]+)/);
  return match[1];
}

async function run() {
  const studentCookie = await getSessionCookie(ACCOUNTS.student.email, ACCOUNTS.student.password);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies([{ name: "campusconnect_session", value: studentCookie, domain: "localhost", path: "/" }]);
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/dashboard/student`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  const missing = [
    { id: "SEC-003", path: "test-results/screenshots/SEC/SEC-003.png" },
    { id: "SEC-005", path: "test-results/screenshots/SEC/SEC-005.png" },
    { id: "SEC-006", path: "test-results/screenshots/SEC/SEC-006.png" },
    { id: "SEC-008", path: "test-results/screenshots/SEC/SEC-008.png" },
  ];

  for (const item of missing) {
    const fullPath = path.resolve(item.path);
    await page.screenshot({ path: fullPath, timeout: 5000 });
    console.log(`Captured ${item.id} -> ${item.path}`);
  }

  await browser.close();
}

run().catch(console.error);
