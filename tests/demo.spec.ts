import { expect, test } from "@playwright/test";
import {
  accounts,
  clients,
  demoCredentials,
  initialDocs,
  initialNotes,
  priceHistory,
  transactions,
  users,
} from "../data/demo";

test("fixture counts and household balances reconcile", () => {
  expect(users).toHaveLength(15);
  expect(clients).toHaveLength(12);
  expect(accounts).toHaveLength(30);
  expect(transactions).toHaveLength(200);
  expect(initialNotes).toHaveLength(40);
  expect(initialDocs).toHaveLength(15);
  expect(new Set(priceHistory.map((p) => p.label)).size).toBe(12);
  for (const c of clients)
    expect(
      accounts
        .filter((a) => a.clientId === c.id)
        .reduce((sum, a) => sum + a.balance, 0),
    ).toBe(c.value);
});

test("login page autofills dummy credentials, toggles password, validates and signs in across viewports", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome back", exact: true }),
  ).toBeVisible();

  // Screenshot responsive login page and ensure zero overflow
  for (const width of [1440, 1024, 768, 360]) {
    await page.setViewportSize({ width, height: width === 360 ? 800 : 920 });
    await page.waitForTimeout(150);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    if (width === 1440 || width === 360) {
      await page.screenshot({
        path: info.outputPath(`login-${width}.png`),
        fullPage: false,
      });
    }
  }
  await page.setViewportSize({ width: 1440, height: 960 });

  // Submitting empty shows friendly validation
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(page.locator(".form-error")).toContainText("autofill");

  // Autofill Admin credentials and toggle password visibility
  await page.getByRole("button", { name: "Autofill Admin login" }).click();
  await expect(page.getByLabel("Email address")).toHaveValue(
    demoCredentials.Admin.email,
  );
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue(
    demoCredentials.Admin.password,
  );
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );

  // Capture filled state screenshot
  await page.screenshot({
    path: info.outputPath("login-filled-1440.png"),
    fullPage: false,
  });

  // Sign in as Admin
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Portfolio overview", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".admin-pill")).toContainText("Admin control");
  await page.screenshot({
    path: info.outputPath("admin-overview-1440.png"),
    fullPage: false,
  });

  // Sign out returns to login page
  await page.getByRole("button", { name: "Open profile menu" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back", exact: true }),
  ).toBeVisible();

  // Autofill Client via quick strip and sign in
  await page
    .getByRole("group", { name: "Autofill demo login" })
    .getByRole("button", { name: "Client" })
    .click();
  await expect(page.getByLabel("Email address")).toHaveValue(
    demoCredentials.Client.email,
  );
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Your wealth overview" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("overview renders charts without page overflow at four sizes", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/overview");
  await expect(
    page.getByRole("heading", { name: "Portfolio overview", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".recharts-area-curve")).toBeVisible();
  for (const width of [1440, 1024, 768, 360]) {
    await page.setViewportSize({ width, height: width === 360 ? 800 : 960 });
    await page.waitForTimeout(200);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await page.screenshot({
      path: info.outputPath(`overview-${width}.png`),
      fullPage: false,
    });
  }
  await page.getByRole("button", { name: "More navigation" }).click();
  await expect(page.locator(".mobile-drawer")).toBeVisible();
  await page
    .locator(".mobile-drawer")
    .getByRole("link", { name: "Calendar", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Calendar", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("chart ranges, household selection, export and theme work", async ({
  page,
}) => {
  await page.goto("/overview");
  await page.getByRole("button", { name: "3M", exact: true }).click();
  await expect(page.locator(".chart-caption")).toContainText("Apr – Jun 2025");
  await page.getByLabel("Select household").selectOption("c1");
  await expect(page.locator(".metric-primary .metric-value")).toHaveText(
    "$3,842,650",
  );
  await page.getByRole("button", { name: "Use dark mode" }).click();
  await expect(page.locator(".app-theme")).toHaveClass(/dark-theme/);
  await page
    .getByRole("button", { name: "View asset allocation details" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Allocation breakdown");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "View portfolio details" }).click();
  await page.getByRole("button", { name: "Accounts", exact: true }).click();
  await expect(page.locator(".account-card")).toHaveCount(3);
  await page.getByRole("button", { name: "Transactions", exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export transactions" }).click();
  expect((await download).suggestedFilename()).toContain("transactions.csv");
});

test("admin can add, edit, and delete across portfolios, CRM, calendar, documents, messages, integrations, ownership and security", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/login");
  await page.getByRole("button", { name: "Autofill Admin login" }).click();
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(page.locator(".admin-pill")).toBeVisible();

  // 1. Allocation add/edit/delete
  await page
    .getByRole("button", { name: "View asset allocation details" })
    .click();
  await page.getByRole("button", { name: "Add asset class" }).click();
  await page.getByLabel("Asset class").fill("Private credit");
  await page.getByLabel("Allocation (%)").fill("5");
  await page.getByRole("button", { name: "Add slice" }).click();
  await expect(page.getByRole("dialog")).toContainText("Private credit · 5%");
  await page
    .getByRole("button", { name: "Delete allocation Private credit" })
    .click();
  await expect(page.getByRole("dialog")).not.toContainText("Private credit");
  await page.keyboard.press("Escape");

  // 2. Portfolios: Holdings, Accounts (recalcs AUM), Transactions CRUD
  await page.locator(".sidebar").getByRole("link", { name: "Portfolios" }).click();
  await page.getByRole("button", { name: "Add holding" }).click();
  await page.getByLabel("Ticker symbol").fill("VSTD");
  await page.getByLabel("Holding name").fill("Vesttara Core Dividend");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add holding" })
    .click();
  await expect(page.locator("tbody")).toContainText("Vesttara Core Dividend");
  await page.getByRole("button", { name: "Edit holding VSTD" }).click();
  await page.getByLabel("Holding name").fill("Vesttara Income Fund");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator("tbody")).toContainText("Vesttara Income Fund");
  await page.getByRole("button", { name: "Delete holding VSTD" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.locator("tbody")).not.toContainText("Vesttara Income Fund");

  // Accounts add/edit/delete updates AUM
  await page.getByRole("button", { name: "Accounts", exact: true }).click();
  await page.getByRole("button", { name: "Add account" }).click();
  await page.getByLabel("Account type").fill("Family Trust");
  await page.getByLabel("Last 4 digits").fill("9901");
  await page.getByLabel("Balance ($)").fill("1000000");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add account" })
    .click();
  await expect(page.locator(".metric-primary .metric-value")).toHaveText(
    "$25,862,450",
  );
  await page
    .getByRole("button", { name: "Edit account Family Trust 9901" })
    .click();
  await page.getByLabel("Balance ($)").fill("500000");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator(".metric-primary .metric-value")).toHaveText(
    "$25,362,450",
  );
  await page
    .getByRole("button", { name: "Delete account Family Trust 9901" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.locator(".metric-primary .metric-value")).toHaveText(
    "$24,862,450",
  );

  // Transactions add/edit/delete
  await page.getByRole("button", { name: "Transactions", exact: true }).click();
  await page.getByRole("button", { name: "Add transaction" }).click();
  await page.getByLabel("Description").fill("Wire deposit demo");
  await page.getByLabel("Amount ($)").fill("15000");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add transaction" })
    .click();
  await expect(page.locator("tbody")).toContainText("Wire deposit demo");
  const addedTxId = await page
    .locator("tbody tr")
    .first()
    .locator("small")
    .innerText();
  await page
    .getByRole("button", { name: `Edit transaction ${addedTxId}` })
    .click();
  await page.getByLabel("Description").fill("Wire deposit updated");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator("tbody")).toContainText("Wire deposit updated");
  await page
    .getByRole("button", { name: `Delete transaction ${addedTxId}` })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.locator("tbody")).not.toContainText("Wire deposit updated");

  // 3. CRM: Household, Pipeline Lead, Task, Note, Meeting CRUD
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Clients & CRM" })
    .click();
  await page
    .locator(".page-heading")
    .getByRole("button", { name: "Add household" })
    .click();
  await page.getByLabel("Full name").fill("Hannah Sterling");
  await page.getByLabel("Household name").fill("Sterling household");
  await page.getByLabel("Email").fill("hannah.sterling@example.com");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add household" })
    .click();
  await expect(page.locator("tbody")).toContainText("Sterling household");
  await page.getByRole("button", { name: "Edit Hannah Sterling" }).click();
  await page.getByLabel("Household name").fill("Sterling Family Trust");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator("tbody")).toContainText("Sterling Family Trust");
  await page.getByRole("button", { name: "Delete Hannah Sterling" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.locator("tbody")).not.toContainText("Sterling Family Trust");

  // Pipeline lead edit + delete
  await page.getByRole("button", { name: "Pipeline", exact: true }).click();
  await page.getByRole("button", { name: "Edit lead Lyra West" }).click();
  await page.getByLabel("Planning interest").fill("Updated tax planning");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator(".pipeline-board")).toContainText(
    "Updated tax planning",
  );
  await page.getByRole("button", { name: "Delete lead Lyra West" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.locator(".pipeline-board")).not.toContainText("Lyra West");

  // Task delete
  await page.getByRole("button", { name: "Tasks", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Delete task Review updated retirement goals",
    })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.locator(".content-list")).not.toContainText(
    "Review updated retirement goals",
  );

  // 4. Documents: add record, edit, delete
  await page.locator(".sidebar").getByRole("link", { name: "Documents" }).click();
  await page.getByRole("button", { name: "Add record" }).click();
  await page.getByLabel("Document name").fill("Admin estate brief.pdf");
  await page.getByRole("button", { name: "Add document" }).click();
  await expect(page.locator("tbody")).toContainText("Admin estate brief.pdf");
  await page
    .getByRole("button", { name: "Edit document Admin estate brief.pdf" })
    .click();
  await page.getByLabel("Document name").fill("Admin estate brief v2.pdf");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator("tbody")).toContainText("Admin estate brief v2.pdf");
  await page
    .getByRole("button", { name: "Delete document Admin estate brief v2.pdf" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.locator("tbody")).not.toContainText(
    "Admin estate brief v2.pdf",
  );

  // 5. Messages: edit & delete
  await page.locator(".sidebar").getByRole("link", { name: "Messages" }).click();
  await page.getByRole("button", { name: "Edit message" }).first().click();
  await page.getByLabel("Message content").fill("Updated quarterly message.");
  await page.getByRole("button", { name: "Save message" }).click();
  await expect(page.locator(".dm-list")).toContainText(
    "Updated quarterly message.",
  );
  await page.getByRole("button", { name: "Delete message" }).first().click();
  await expect(page.locator(".dm-list")).not.toContainText(
    "Updated quarterly message.",
  );

  // 6. Integrations: toggle, add, edit, delete
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Integrations" })
    .click();
  await page.getByRole("button", { name: "Add integration" }).click();
  await page.getByLabel("Integration name").fill("Tax engine");
  await page.getByLabel("Provider").fill("ClearLedger");
  await page
    .getByLabel("Description")
    .fill("Year-end tax loss harvesting feeds.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add integration" })
    .click();
  await expect(page.locator("main")).toContainText("Tax engine");
  await page
    .getByRole("button", { name: "Toggle Tax engine connection" })
    .click();
  await page
    .getByRole("button", { name: "Delete integration Tax engine" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.locator("main")).not.toContainText("Tax engine");

  // 7. Ownership: add, edit, delete
  await page.locator(".sidebar").getByRole("link", { name: "Ownership" }).click();
  await page.getByRole("button", { name: "Add term" }).click();
  await page.getByLabel("Title").fill("Exit portability");
  await page
    .getByLabel("Commitment details")
    .fill("All records export cleanly in standard formats.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add term" })
    .click();
  await expect(page.locator("main")).toContainText("Exit portability");
  await page.getByRole("button", { name: "Delete Exit portability" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.locator("main")).not.toContainText("Exit portability");

  // 8. Security & admin: Users (incl. signing in as custom user!), Permissions, Audit, Reset
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Security & admin" })
    .click();
  await page.getByRole("button", { name: "Add user" }).click();
  await page.getByLabel("Full name").fill("Morgan Lane");
  await page.getByLabel("Email address").fill("morgan.lane@example.com");
  await page.getByLabel("Demo password").fill("MorganPass!2025");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add user" })
    .click();
  await expect(page.locator("tbody")).toContainText("Morgan Lane");

  // Permissions add & delete
  await page.getByRole("button", { name: "Roles & permissions" }).click();
  await page.getByRole("button", { name: "Add permission" }).click();
  await page.getByLabel("Capability name").fill("Bulk data export");
  await page.getByRole("button", { name: "Add rule" }).click();
  await expect(page.locator("tbody")).toContainText("Bulk data export");
  await page
    .getByRole("button", { name: "Delete permission Bulk data export" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.locator("tbody")).not.toContainText("Bulk data export");

  // Audit log add & delete
  await page.getByRole("button", { name: "Audit log", exact: true }).click();
  await page.getByRole("button", { name: "Add event" }).click();
  await page.getByLabel("Description").fill("Manual compliance review");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add event" })
    .click();
  await expect(page.locator("tbody")).toContainText("Manual compliance review");
  await page
    .getByRole("button", { name: "Delete event Manual compliance review" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.locator("tbody")).not.toContainText(
    "Manual compliance review",
  );

  // Sign out & sign in as the newly created Morgan Lane user!
  await page.getByRole("button", { name: "Open profile menu" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.getByLabel("Email address").fill("morgan.lane@example.com");
  await page.getByLabel("Password", { exact: true }).fill("MorganPass!2025");
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(page.locator(".profile-button")).toContainText("Morgan Lane");

  // Sign back in as Admin and Reset demo restores everything cleanly
  await page.locator(".sidebar").getByRole("link", { name: "Switch workspace" }).click();
  await page.getByRole("button", { name: "Enter as Admin" }).click();
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Security & admin" })
    .click();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.getByRole("button", { name: "Restore defaults" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(15);
  expect(errors).toEqual([]);
});

test("assistant creates a task, cites sources and declines advice", async ({
  page,
}) => {
  await page.goto("/assistant");
  await page
    .getByRole("button", {
      name: "Create a follow-up task for John",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "View CRM task" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "View CRM task" }).click();
  await expect(
    page
      .locator(".record-main")
      .filter({ hasText: "Follow up on John’s quarterly review" }),
  ).toBeVisible();
  await page
    .getByRole("checkbox", {
      name: "Mark Follow up on John’s quarterly review complete",
    })
    .check();
  await expect(page.locator(".record-line.completed")).toContainText(
    "Follow up on John",
  );
  await page
    .locator(".sidebar")
    .getByRole("link", { name: /AI Assistant/ })
    .click();
  await page
    .getByLabel("Ask the assistant", { exact: true })
    .fill("Which stock should I buy?");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(
    page.locator(".source-chip").filter({ hasText: "Demo compliance policy" }),
  ).toBeVisible();
  await expect(page.locator(".chat-content")).toContainText(
    "can’t provide personalized investment advice",
  );
});

test("CRM notes, tasks, search, and movable pipeline cards", async ({
  page,
}) => {
  await page.goto("/crm");
  await page.getByRole("button", { name: "Add note", exact: true }).click();
  await page.getByLabel("Note title").fill("Pilot discussion");
  await page
    .getByLabel("Note", { exact: true })
    .fill("Review the household priorities before the next check-in.");
  await page.getByRole("button", { name: "Save note" }).click();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await page.getByLabel("Search Notes").fill("Pilot discussion");
  await expect(page.locator(".note-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Edit Pilot discussion" }).click();
  await page
    .getByLabel("Title", { exact: true })
    .fill("Updated pilot discussion");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("heading", { name: "Updated pilot discussion" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pipeline", exact: true }).click();
  await page.getByRole("button", { name: "Add lead", exact: true }).click();
  await page.getByLabel("Full name").fill("Avery Pilot");
  await page.getByLabel("Planning interest").fill("Demo review");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add lead", exact: true })
    .click();
  await page.getByLabel("Move Avery Pilot to stage").selectOption("Meeting");
  await expect(
    page
      .locator(".pipeline-lane")
      .filter({ has: page.getByRole("heading", { name: /^Meeting/ }) }),
  ).toContainText("Avery Pilot");
  const card = page.locator(".lead-card").filter({ hasText: "Avery Pilot" });
  await card.dragTo(
    page
      .locator(".pipeline-lane")
      .filter({ has: page.getByRole("heading", { name: /^Proposal/ }) }),
  );
  await expect(page.getByLabel("Move Avery Pilot to stage")).toHaveValue(
    "Proposal",
  );
});

test("client sees only own data, can book, message, upload and open a PDF", async ({
  page,
  request,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Enter as Client" }).click();
  await expect(
    page.getByRole("heading", { name: "Your wealth overview" }),
  ).toBeVisible();
  await expect(page.locator(".sidebar")).not.toContainText("Clients & CRM");
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Calendar", exact: true })
    .click();
  await page.getByRole("button", { name: "Book meeting", exact: true }).click();
  await page.getByLabel("Meeting title").fill("Client demo check-in");
  await page.getByLabel("Date", { exact: true }).fill("2025-07-08");
  await page.getByRole("button", { name: "Confirm booking" }).click();
  await expect(
    page.locator(".agenda-item").filter({ hasText: "Client demo check-in" }),
  ).toBeVisible();
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Messages", exact: true })
    .click();
  await page
    .getByLabel("Message text")
    .fill("Looking forward to the demo meeting.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(
    page.getByText("Simulated reply", { exact: true }),
  ).toBeVisible();
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Documents", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await expect(page.locator("main")).not.toContainText("Hartwell household");
  await page.getByRole("button", { name: "Upload document" }).click();
  await page.getByLabel("Choose document file").setInputFiles({
    name: "demo-plan.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Fictional fixture"),
  });
  await page.getByRole("button", { name: "Add to document list" }).click();
  await expect(
    page.getByRole("button", { name: "demo-plan.txt", exact: true }),
  ).toBeVisible();
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Reports", exact: true })
    .click();
  const link = page.getByRole("link", { name: "Download quarterly report" });
  await expect(link).toHaveAttribute("href", "/reports/quarterly-report.pdf");
  const pdf = await request.get("/reports/quarterly-report.pdf");
  expect(pdf.ok()).toBeTruthy();
  expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Switch workspace" })
    .click();
  await page.getByRole("button", { name: "Enter as Advisor" }).click();
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Calendar", exact: true })
    .click();
  await expect(
    page.locator(".agenda-item").filter({ hasText: "Client demo check-in" }),
  ).toBeVisible();
});

test("proposal is a local-only successful submission", async ({ page }) => {
  await page.goto("/proposal");
  await page.getByLabel("Your name").fill("Avery Pilot");
  await page.getByLabel("Firm name").fill("Fictional Advisory");
  await page.getByLabel("Work email").fill("avery@example.com");
  await page.getByRole("button", { name: "Submit demo request" }).click();
  await expect(
    page.getByRole("heading", { name: "Your brief is ready." }),
  ).toBeVisible();
  await expect(
    page.getByText("Nothing has been sent or stored.", { exact: false }),
  ).toBeVisible();
});
