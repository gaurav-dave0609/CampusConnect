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
  const studentContext = await browser.newContext();
  await studentContext.addCookies([{ name: "campusconnect_session", value: studentCookie, domain: "localhost", path: "/" }]);
  const studentPage = await studentContext.newPage();

  await studentPage.goto(`${BASE_URL}/dashboard/results`, { waitUntil: "domcontentloaded" });
  await studentPage.waitForTimeout(2000);

  const tests = [
    { id: "RES-001", file: "RES-001.png" },
    { id: "RES-002", file: "RES-002.png" },
    { id: "RES-003", file: "RES-003.png" },
    { id: "RES-004", file: "RES-004.png" },
  ];

  for (const t of tests) {
    const shotPath = path.resolve(`test-results/screenshots/RES/${t.file}`);
    await studentPage.screenshot({ path: shotPath, timeout: 10000 });
    console.log(`Re-captured ${t.id} -> ${shotPath}`);
  }

  await browser.close();
}

run().catch(console.error);
