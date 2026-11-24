"use client";
import { avatarColors, snapshot, stages, type Stage } from "@data/demo";
import { Check, Info } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useDemo, type DialogKind } from "./demo-context";
import { Modal } from "./ui";

export function WorkspaceForms() {
  const d = useDemo();
  if (!d.dialog) return null;
  const fallbackClient = d.clients[0]?.id ?? "c1";
  const resolvedClient =
    d.dialog.clientId ?? (d.selected !== "all" ? d.selected : fallbackClient);
  return (
    <Editor
      key={d.dialog.kind + resolvedClient + (d.dialog.date ?? "")}
      kind={d.dialog.kind}
      clientId={resolvedClient}
    />
  );
}

function Editor({ kind, clientId }: { kind: DialogKind; clientId: string }) {
  const d = useDemo();
  const names: Partial<Record<DialogKind, string>> = {
    task: "Add a task",
    note: "Add a note",
    meeting: "Book a meeting",
    lead: "Add a lead",
    client: "Add household",
  };
  const [error, setError] = useState("");
  const [date, setDate] = useState(
    d.dialog?.date && d.dialog.date >= snapshot ? d.dialog.date : "2025-07-02",
  );
  const [time, setTime] = useState("11:00");

  if (!names[kind]) return null;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const str = (key: string) => String(fd.get(key) ?? "").trim();
    const id = crypto.randomUUID();
    const c = d.role === "Client" ? d.selected : str("clientId");
    const title = str("title");
    if (!title) {
      setError("Please enter a title or name.");
      return;
    }
    if (kind === "note" && !str("body")) {
      setError("Please add some note text.");
      return;
    }
    if (
      kind === "meeting" &&
      d.meetings.some((m) => m.date === date && m.time === time)
    ) {
      setError("That time is already booked. Please choose another slot.");
      return;
    }
    if (kind === "client") {
      const household =
        str("household") ||
        `${title.split(" ").slice(-1)[0] || title} household`;
      const email =
        str("email") ||
        `${title.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@example.com`;
      const value = Math.max(0, Number(str("value")) || 0);
      const returns = Number(str("returns")) || 10.5;
      const risk = str("risk") || "Balanced";
      const location = str("location") || "Austin, TX";
      const joined = str("joined") || "2025";
      const color = str("color") || "sage";
      const newId = `c-${id.slice(0, 6)}`;
      d.setClients((p) => [
        {
          id: newId,
          name: title,
          household,
          email,
          value,
          returns,
          color,
          advisorId: "a1",
          risk,
          joined,
          location,
        },
        ...p,
      ]);
      if (value > 0) {
        d.setAccounts((p) => [
          {
            id: `acc-${id.slice(0, 6)}`,
            clientId: newId,
            type: "Taxable brokerage",
            balance: value,
            last4: String(Math.floor(1000 + Math.random() * 8999)),
            custodian: "Northline Custody",
          },
          ...p,
        ]);
      }
      d.log("Edit", `Added household: ${household} (${title})`);
      d.setDialog(null);
      d.notify(`${household} added`);
      return;
    }
    if (kind === "task")
      d.setTasks((p) => [
        {
          id,
          clientId: c,
          title,
          due: str("due"),
          priority: str("priority") === "High" ? "High" : "Normal",
          done: false,
        },
        ...p,
      ]);
    if (kind === "note")
      d.setNotes((p) => [
        { id, clientId: c, title, body: str("body"), date: snapshot },
        ...p,
      ]);
    if (kind === "meeting")
      d.setMeetings((p) =>
        [...p, { id, clientId: c, title, date, time, kind: str("kind") }].sort(
          (a, b) => (a.date + a.time).localeCompare(b.date + b.time),
        ),
      );
    if (kind === "lead")
      d.setLeads((p) => [
        ...p,
        {
          id,
          name: title,
          topic: str("topic"),
          value: Math.max(0, Number(str("value")) || 0),
          stage: str("stage") as Stage,
          color: "sand",
        },
      ]);
    d.log(
      "Edit",
      `${kind === "meeting" ? "Booked meeting" : "Added " + kind}: ${title}`,
    );
    d.setDialog(null);
    d.notify(
      kind === "meeting"
        ? "Meeting booked in your demo calendar"
        : `${kind[0].toUpperCase() + kind.slice(1)} added to the CRM`,
    );
  }

  return (
    <Modal
      title={names[kind] ?? "Edit item"}
      subtitle="Saved to this demo session only."
      onClose={() => d.setDialog(null)}
    >
      <form className="form-stack" onSubmit={submit}>
        <label>
          {kind === "lead" || kind === "client"
            ? "Full name"
            : kind === "meeting"
              ? "Meeting title"
              : kind === "task"
                ? "Task title"
                : "Note title"}
          <input
            autoFocus
            name="title"
            required
            maxLength={120}
            defaultValue={kind === "meeting" ? "Portfolio review" : ""}
            placeholder={
              kind === "task"
                ? "e.g. Follow up on the quarterly review"
                : kind === "note"
                  ? "e.g. Retirement planning discussion"
                  : kind === "client"
                    ? "e.g. Hannah Sterling"
                    : "Enter a name"
            }
          />
        </label>
        {kind === "client" && (
          <>
            <div className="form-two">
              <label>
                Household name
                <input
                  name="household"
                  maxLength={100}
                  placeholder="e.g. Sterling household"
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="hannah.sterling@example.com"
                />
              </label>
            </div>
            <div className="form-two">
              <label>
                Initial portfolio value ($)
                <input
                  name="value"
                  type="number"
                  step="1"
                  min="0"
                  max="999999999"
                  required
                  defaultValue="1250000"
                />
              </label>
              <label>
                1Y return (%)
                <input
                  name="returns"
                  type="number"
                  step="0.01"
                  min="-99"
                  max="200"
                  required
                  defaultValue="11.50"
                />
              </label>
            </div>
            <div className="form-two">
              <label>
                Risk profile
                <select name="risk" defaultValue="Balanced">
                  <option>Balanced</option>
                  <option>Growth</option>
                  <option>Conservative</option>
                </select>
              </label>
              <label>
                Location
                <input
                  name="location"
                  maxLength={80}
                  defaultValue="Austin, TX"
                />
              </label>
            </div>
            <div className="form-two">
              <label>
                Client since (year)
                <input
                  name="joined"
                  maxLength={4}
                  defaultValue="2025"
                />
              </label>
              <label>
                Avatar theme
                <select name="color" defaultValue="sage">
                  {avatarColors.map((col) => (
                    <option key={col} value={col}>
                      {col[0].toUpperCase() + col.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </>
        )}
        {kind !== "lead" && kind !== "client" && d.role !== "Client" && (
          <label>
            Household
            <select name="clientId" defaultValue={clientId}>
              {d.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.household}
                </option>
              ))}
            </select>
          </label>
        )}
        {kind === "task" && (
          <div className="form-two">
            <label>
              Due date
              <input
                name="due"
                type="date"
                required
                defaultValue="2025-07-02"
              />
            </label>
            <label>
              Priority
              <select name="priority">
                <option>Normal</option>
                <option>High</option>
              </select>
            </label>
          </div>
        )}
        {kind === "note" && (
          <label>
            Note
            <textarea
              name="body"
              required
              rows={5}
              maxLength={4000}
              placeholder="Record the discussion, context, and next steps…"
            />
          </label>
        )}
        {kind === "meeting" && (
          <>
            <div className="form-two">
              <label>
                Date
                <input
                  name="date"
                  type="date"
                  min={snapshot}
                  required
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setError("");
                  }}
                />
              </label>
              <label>
                Time · Eastern
                <select
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setError("");
                  }}
                >
                  {[
                    "09:00",
                    "09:30",
                    "10:00",
                    "10:30",
                    "11:00",
                    "11:30",
                    "13:00",
                    "13:30",
                    "14:00",
                    "14:30",
                    "15:00",
                    "15:30",
                    "16:00",
                  ].map((t) => (
                    <option
                      key={t}
                      disabled={d.meetings.some(
                        (m) => m.date === date && m.time === t,
                      )}
                    >
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Meeting type
              <select name="kind">
                <option>Video call</option>
                <option>Office meeting</option>
                <option>Phone call</option>
              </select>
            </label>
            <div className="form-hint">
              <Info size={15} />
              30-minute meetings. No invitation or external calendar event is
              sent.
            </div>
          </>
        )}
        {kind === "lead" && (
          <>
            <label>
              Planning interest
              <input
                required
                name="topic"
                placeholder="e.g. Retirement planning"
                maxLength={100}
              />
            </label>
            <div className="form-two">
              <label>
                Estimated assets ($)
                <input
                  name="value"
                  type="number"
                  step="1"
                  required
                  min="0"
                  max="999999999"
                  defaultValue="500000"
                />
              </label>
              <label>
                Pipeline stage
                <select name="stage">
                  {stages.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
          </>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button
            type="button"
            className="btn"
            onClick={() => d.setDialog(null)}
          >
            Cancel
          </button>
          <button type="submit" className="btn primary">
            <Check size={15} />
            {kind === "meeting"
              ? "Confirm booking"
              : kind === "lead"
                ? "Add lead"
                : kind === "client"
                  ? "Add household"
                  : `Save ${kind}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
