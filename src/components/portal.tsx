"use client";
import {
  displayDate,
  money,
  snapshot,
  staff,
  type DirectMessage,
  type DocItem,
  type Meeting,
} from "@data/demo";
import {
  ArrowDownToLine,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FilePenLine,
  FilePlus2,
  FileText,
  FileUp,
  FolderOpen,
  Info,
  LockKeyhole,
  MessageCircle,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDemo } from "./demo-context";
import {
  Avatar,
  ConfirmDelete,
  Empty,
  Heading,
  HouseholdSelect,
  Modal,
  SectionHead,
  WaveArt,
} from "./ui";

const iso = (y: number, m: number, n: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;

export function Calendar() {
  const d = useDemo();
  const [month, setMonth] = useState(new Date(2025, 6, 1));
  const [day, setDay] = useState<string | null>(null);
  const [detail, setDetail] = useState<Meeting | null>(null);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [cancel, setCancel] = useState(false);

  const year = month.getFullYear(),
    m = month.getMonth();
  const first = new Date(year, m, 1).getDay(),
    days = new Date(year, m + 1, 0).getDate();
  const ms = d.meetings.filter(
    (x) => d.selected === "all" || x.clientId === d.selected,
  );
  const visible = ms
    .filter((x) =>
      day ? x.date === day : x.date.startsWith(iso(year, m, 1).slice(0, 7)),
    )
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const move = (n: number) => {
    setMonth(new Date(year, m + n, 1));
    setDay(null);
  };

  return (
    <>
      <Heading
        eyebrow="PLANNING & RELATIONSHIPS"
        title="Calendar"
        description={
          d.isAdmin
            ? "Book, reschedule, edit, or cancel any meeting across the practice."
            : "Make time for the conversations that matter."
        }
      >
        <button
          className="btn primary"
          onClick={() =>
            d.setDialog({ kind: "meeting", date: day ?? undefined })
          }
        >
          <Plus size={15} />
          Book meeting
        </button>
      </Heading>
      <div className="calendar-layout">
        <section className="panel">
          <div className="calendar-top">
            <h2>
              {month.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div>
              <button
                className="icon-btn"
                aria-label="Previous month"
                onClick={() => move(-1)}
              >
                <ChevronLeft size={17} />
              </button>
              <button
                className="btn"
                onClick={() => {
                  setMonth(new Date(2025, 5, 1));
                  setDay(snapshot);
                }}
              >
                Demo today
              </button>
              <button
                className="icon-btn"
                aria-label="Next month"
                onClick={() => move(1)}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
          <div className="calendar-week">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {Array.from(
              { length: Math.ceil((first + days) / 7) * 7 },
              (_, i) => {
                const n = i - first + 1;
                const date = iso(year, m, n);
                const count = ms.filter((x) => x.date === date).length;
                return n < 1 || n > days ? (
                  <div className="off-month" key={i} />
                ) : (
                  <button
                    key={i}
                    className={`${day === date ? "picked" : ""} ${date === snapshot ? "today" : ""}`}
                    aria-label={`${displayDate(date)}, ${count} meetings`}
                    onClick={() => setDay(day === date ? null : date)}
                  >
                    <span>{n}</span>
                    {count > 0 && (
                      <small>
                        <i />
                        {count} review{count > 1 ? "s" : ""}
                      </small>
                    )}
                  </button>
                );
              },
            )}
          </div>
          <div className="calendar-hint">
            <i />
            Scheduled meeting <span>All times Eastern</span>
          </div>
        </section>
        <section className="panel agenda">
          <SectionHead title={day ? displayDate(day) : "Monthly agenda"}>
            {day && (
              <button className="text-btn" onClick={() => setDay(null)}>
                Show month
              </button>
            )}
          </SectionHead>
          <div className="padded">
            {d.role !== "Client" && (
              <div className="agenda-filter">
                <HouseholdSelect />
              </div>
            )}
            {visible.length ? (
              visible.map((x) => (
                <button
                  key={x.id}
                  className="agenda-item"
                  onClick={() => {
                    setDetail(x);
                    setCancel(false);
                  }}
                >
                  <span className="mini-label">{displayDate(x.date)}</span>
                  <h3>{x.title}</h3>
                  <p>{d.clients.find((c) => c.id === x.clientId)?.name}</p>
                  <div>
                    <Clock3 size={12} />
                    {x.time} ET <span>·</span>
                    {x.kind}
                  </div>
                </button>
              ))
            ) : (
              <Empty
                icon={CalendarDays}
                title="Your calendar is clear"
                text={
                  day
                    ? "No meetings on this date."
                    : "No meetings for this household this month."
                }
              />
            )}
            <button
              className="btn full-width"
              onClick={() =>
                d.setDialog({ kind: "meeting", date: day ?? undefined })
              }
            >
              <Plus size={14} />
              Book a meeting
            </button>
          </div>
        </section>
      </div>
      {detail && (
        <Modal
          title={cancel ? "Cancel this meeting?" : detail.title}
          subtitle={
            cancel
              ? "This removes the booking from the demo calendar."
              : "Scheduled demo meeting · 30 minutes"
          }
          onClose={() => setDetail(null)}
        >
          <div className="detail-row">
            <span>Household</span>
            <strong>
              {d.clients.find((c) => c.id === detail.clientId)?.household ??
                "Unassigned"}
            </strong>
          </div>
          <div className="detail-row">
            <span>Date & time</span>
            <strong>
              {displayDate(detail.date)} · {detail.time} ET
            </strong>
          </div>
          <div className="detail-row">
            <span>Format</span>
            <strong>{detail.kind}</strong>
          </div>
          <div className="form-actions wrap">
            <button className="btn" onClick={() => setDetail(null)}>
              {cancel ? "Keep meeting" : "Close"}
            </button>
            {d.isAdmin && !cancel && (
              <button
                className="btn"
                onClick={() => {
                  const target = detail;
                  setDetail(null);
                  setEditing(target);
                }}
              >
                <FilePenLine size={14} />
                Edit meeting
              </button>
            )}
            <button
              className="btn danger"
              onClick={() => {
                if (!cancel) {
                  setCancel(true);
                  return;
                }
                d.setMeetings((p) => p.filter((x) => x.id !== detail.id));
                d.log("Delete", `Canceled meeting: ${detail.title}`);
                setDetail(null);
                d.notify("Demo meeting canceled");
              }}
            >
              {cancel ? "Confirm cancellation" : "Cancel booking"}
            </button>
          </div>
        </Modal>
      )}
      {editing && (
        <Modal title="Edit meeting" onClose={() => setEditing(null)}>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const title = String(fd.get("title")).trim();
              if (!title) return;
              const updated: Meeting = {
                ...editing,
                title,
                clientId: String(fd.get("clientId") || editing.clientId),
                date: String(fd.get("date")),
                time: String(fd.get("time")),
                kind: String(fd.get("kind")),
              };
              d.setMeetings((p) =>
                p
                  .map((x) => (x.id === editing.id ? updated : x))
                  .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
              );
              d.log("Edit", `Updated meeting: ${title}`);
              setEditing(null);
              d.notify("Meeting updated");
            }}
          >
            <label>
              Meeting title
              <input
                required
                name="title"
                defaultValue={editing.title}
                maxLength={120}
              />
            </label>
            <label>
              Household
              <select name="clientId" defaultValue={editing.clientId}>
                {d.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.household}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-two">
              <label>
                Date
                <input
                  required
                  type="date"
                  name="date"
                  defaultValue={editing.date}
                />
              </label>
              <label>
                Time · Eastern
                <input
                  required
                  type="time"
                  name="time"
                  defaultValue={editing.time}
                />
              </label>
            </div>
            <label>
              Format
              <select name="kind" defaultValue={editing.kind}>
                <option>Video call</option>
                <option>Office meeting</option>
                <option>Phone call</option>
              </select>
            </label>
            <div className="form-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary">
                <Check size={14} />
                Save changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export function Documents() {
  const d = useDemo();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [detail, setDetail] = useState<DocItem | null>(null);
  const [docModal, setDocModal] = useState<DocItem | "new" | null>(null);
  const [deleting, setDeleting] = useState<DocItem | null>(null);
  const [upload, setUpload] = useState(false);
  const [clientId, setClientId] = useState(
    d.selected === "all" ? (d.clients[0]?.id ?? "c1") : d.selected,
  );
  const [error, setError] = useState("");
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);

  const docs = d.docs.filter(
    (x) =>
      (d.selected === "all" || x.clientId === d.selected) &&
      (cat === "All" || x.category === cat) &&
      `${x.name} ${d.clients.find((c) => c.id === x.clientId)?.name ?? ""}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );

  return (
    <>
      <Heading
        eyebrow="DOCUMENT WORKSPACE"
        title={d.role === "Client" ? "Your documents" : "Document library"}
        description={
          d.isAdmin
            ? "Add, upload, edit, or delete any document record across every household."
            : "Reports, plans, and records, organized by household."
        }
      >
        {d.isAdmin && (
          <button className="btn" onClick={() => setDocModal("new")}>
            <FilePlus2 size={15} />
            Add record
          </button>
        )}
        <button
          className="btn primary"
          onClick={() => {
            setUpload(true);
            setFile(null);
            setError("");
          }}
        >
          <Upload size={15} />
          Upload document
        </button>
      </Heading>
      <div className="info-strip">
        <ShieldCheck size={17} />
        <span>
          <strong>Private demo library.</strong> Only filenames and file sizes
          are kept in this session. No file content is uploaded.
        </span>
      </div>
      <section className="panel">
        <div className="list-toolbar">
          <div className="search-input">
            <Search size={15} />
            <input
              aria-label="Search documents"
              placeholder="Search documents…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="toolbar-right">
            <HouseholdSelect />
            <select
              aria-label="Document category"
              className="field-select"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
            >
              {[
                "All",
                "Report",
                "Agreement",
                "Plan",
                "Meeting notes",
                "Upload",
              ].map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All categories" : s}
                </option>
              ))}
            </select>
          </div>
        </div>
        {docs.length ? (
          <div className="table-wrap">
            <table className="responsive-table">
              <thead>
                <tr>
                  {[
                    "Document",
                    "Household",
                    "Category",
                    "Added",
                    "Size",
                    "",
                  ].map((t, i) => (
                    <th key={i}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((x) => (
                  <tr key={x.id}>
                    <td data-label="Document">
                      <button
                        className="document-title"
                        onClick={() => setDetail(x)}
                      >
                        <span className="file-icon">
                          <FileText size={18} />
                        </span>
                        <strong>{x.name}</strong>
                      </button>
                    </td>
                    <td data-label="Household">
                      {d.clients.find((c) => c.id === x.clientId)?.household ??
                        "Unassigned"}
                    </td>
                    <td data-label="Category">
                      <span className="status neutral">{x.category}</span>
                    </td>
                    <td data-label="Added">{displayDate(x.date)}</td>
                    <td data-label="Size">{x.size}</td>
                    <td>
                      <div className="row-actions">
                        {d.isAdmin && (
                          <>
                            <button
                              aria-label={`Edit document ${x.name}`}
                              className="icon-btn"
                              onClick={() => setDocModal(x)}
                            >
                              <FilePenLine size={15} />
                            </button>
                            <button
                              aria-label={`Delete document ${x.name}`}
                              className="icon-btn danger-icon"
                              onClick={() => setDeleting(x)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                        <button
                          aria-label={`View ${x.name}`}
                          className="icon-btn"
                          onClick={() => setDetail(x)}
                        >
                          <ArrowUpRight size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            icon={FolderOpen}
            title="No documents here"
            text="Try another filter or add a document to the demo library."
          />
        )}
      </section>
      {detail && (
        <Modal title="Document details" onClose={() => setDetail(null)}>
          <div className="source-preview">
            <FileText size={28} />
            <h3>{detail.name}</h3>
            <p>
              {detail.category === "Upload"
                ? "This is a metadata-only entry. The original file has not been uploaded, read, or retained."
                : detail.category === "Report"
                  ? "A sample quarterly summary covering portfolio value, asset allocation, and household activity."
                  : detail.category === "Agreement"
                    ? "Sample policy record: the household’s stated goals, time horizon, and review schedule are documented for advisor discussion."
                    : "Sample planning record: review household goals, document current circumstances, and schedule the next conversation."}
            </p>
          </div>
          <div className="detail-row">
            <span>Household</span>
            <strong>
              {d.clients.find((c) => c.id === detail.clientId)?.household ??
                "Unassigned"}
            </strong>
          </div>
          <div className="detail-row">
            <span>Added</span>
            <strong>
              {displayDate(detail.date)} · {detail.size}
            </strong>
          </div>
          {detail.category === "Report" && (
            <a
              className="btn primary full-width"
              target="_blank"
              rel="noopener noreferrer"
              href="/reports/quarterly-report.pdf"
            >
              <ArrowDownToLine size={15} />
              Open sample report
            </a>
          )}
          {d.isAdmin ? (
            <div className="form-actions">
              <button
                className="btn danger"
                onClick={() => {
                  const target = detail;
                  setDetail(null);
                  setDeleting(target);
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
              <button
                className="btn"
                onClick={() => {
                  const target = detail;
                  setDetail(null);
                  setDocModal(target);
                }}
              >
                <FilePenLine size={14} />
                Edit document
              </button>
            </div>
          ) : (
            detail.category === "Upload" && (
              <button
                className="btn full-width"
                onClick={() => {
                  d.setDocs((p) => p.filter((x) => x.id !== detail.id));
                  setDetail(null);
                  d.notify("File entry removed");
                }}
              >
                Remove entry from list
              </button>
            )
          )}
        </Modal>
      )}
      {docModal && (
        <Modal
          title={docModal === "new" ? "Add document record" : "Edit document"}
          subtitle="Saved to this demo session only."
          onClose={() => setDocModal(null)}
        >
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get("name")).trim();
              const cid = String(fd.get("clientId"));
              const category = String(fd.get("category"));
              const date = String(fd.get("date")) || snapshot;
              const size = String(fd.get("size")).trim() || "180 KB";
              if (!name) return;
              if (docModal === "new") {
                d.setDocs((p) => [
                  { id: crypto.randomUUID(), clientId: cid, name, category, date, size },
                  ...p,
                ]);
                d.log("Edit", `Added document record: ${name}`);
                d.notify("Document added");
              } else {
                d.setDocs((p) =>
                  p.map((x) =>
                    x.id === docModal.id
                      ? { ...x, clientId: cid, name, category, date, size }
                      : x,
                  ),
                );
                d.log("Edit", `Updated document: ${name}`);
                d.notify("Document updated");
              }
              setDocModal(null);
            }}
          >
            <label>
              Document name
              <input
                autoFocus
                required
                name="name"
                maxLength={120}
                defaultValue={docModal === "new" ? "" : docModal.name}
                placeholder="e.g. Estate plan summary.pdf"
              />
            </label>
            <label>
              Household
              <select
                name="clientId"
                defaultValue={
                  docModal === "new"
                    ? d.selected === "all"
                      ? (d.clients[0]?.id ?? "c1")
                      : d.selected
                    : docModal.clientId
                }
              >
                {d.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.household} · {c.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-two">
              <label>
                Category
                <select
                  name="category"
                  defaultValue={docModal === "new" ? "Report" : docModal.category}
                >
                  {["Report", "Agreement", "Plan", "Meeting notes", "Upload"].map(
                    (c) => (
                      <option key={c}>{c}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                File size
                <input
                  required
                  name="size"
                  maxLength={24}
                  defaultValue={docModal === "new" ? "240 KB" : docModal.size}
                />
              </label>
            </div>
            <label>
              Date added
              <input
                required
                type="date"
                name="date"
                defaultValue={docModal === "new" ? snapshot : docModal.date}
              />
            </label>
            <div className="form-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setDocModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary">
                <Check size={14} />
                {docModal === "new" ? "Add document" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <ConfirmDelete
          title="Delete document?"
          message={`Removes "${deleting.name}" from the demo library.`}
          onConfirm={() => {
            d.setDocs((p) => p.filter((x) => x.id !== deleting.id));
            d.log("Delete", `Deleted document: ${deleting.name}`);
            d.notify("Document deleted");
          }}
          onClose={() => setDeleting(null)}
        />
      )}
      {upload && (
        <Modal
          title="Upload a document"
          subtitle="Demonstration only. Nothing leaves your device."
          onClose={() => setUpload(false)}
        >
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              if (!file) {
                setError("Choose a supported file first.");
                return;
              }
              d.setDocs((p) => [
                {
                  id: crypto.randomUUID(),
                  clientId: d.role === "Client" ? d.selected : clientId,
                  name: file.name,
                  size: `${Math.max(1, Math.ceil(file.size / 1024))} KB`,
                  category: "Upload",
                  date: snapshot,
                },
                ...p,
              ]);
              d.log("Edit", `Added document metadata: ${file.name}`);
              setUpload(false);
              setQ("");
              setCat("All");
              if (d.role !== "Client") d.setSelected(clientId);
              d.notify("Document added to the session list");
            }}
          >
            {d.role !== "Client" && (
              <label>
                Household
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  {d.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.household}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="upload-zone">
              <FileUp size={27} />
              <strong>{file ? file.name : "Choose a document"}</strong>
              <span>PDF, Word, Excel, text, or image · up to 10 MB</span>
              <input
                required
                aria-label="Choose document file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (
                    f.size > 10 * 1024 * 1024 ||
                    !/\.(pdf|docx?|xlsx?|txt|png|jpe?g)$/i.test(f.name)
                  ) {
                    setFile(null);
                    setError("Choose a supported file no larger than 10 MB.");
                    e.target.value = "";
                    return;
                  }
                  setFile({ name: f.name, size: f.size });
                  setError("");
                }}
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="btn primary" disabled={!file}>
              <Plus size={15} />
              Add to document list
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

export function Messages() {
  const d = useDemo();
  const [id, setId] = useState(
    d.selected === "all" ? (d.clients[0]?.id ?? "c1") : d.selected,
  );
  const client =
    d.clients.find((c) => c.id === (d.role === "Client" ? d.selected : id)) ??
    d.clients[0];
  const advisor =
    d.users.find((u) => u.id === client?.advisorId) ?? staff[1];
  const [text, setText] = useState("");
  const [replying, setReplying] = useState(false);
  const [editingMsg, setEditingMsg] = useState<DirectMessage | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const from = d.role === "Client" ? "client" : "advisor";
  const ms = client ? d.messages.filter((m) => m.clientId === client.id) : [];

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [ms.length]);

  if (!client) {
    return (
      <>
        <Heading
          eyebrow="CLIENT COMMUNICATIONS"
          title="Messages"
          description="Your conversation, kept together in one place."
        />
        <section className="panel">
          <Empty
            icon={MessageCircle}
            title="No households available"
            text="Add a household in Clients & CRM to message them."
          />
        </section>
      </>
    );
  }

  function send() {
    if (!text.trim() || replying || !client) return;
    const body = text.trim();
    d.setMessages((p) => [
      ...p,
      {
        id: crypto.randomUUID(),
        clientId: client.id,
        from,
        text: body,
        time: "This session",
      },
    ]);
    setText("");
    setReplying(true);
    timer.current = setTimeout(() => {
      d.setMessages((p) => [
        ...p,
        {
          id: crypto.randomUUID(),
          clientId: client.id,
          from: from === "client" ? "advisor" : "client",
          text:
            from === "client"
              ? `Thanks, ${client.name.split(" ")[0]}. Your message is on my review list. We can discuss it at our next meeting.`
              : "Thank you for the update. I’ll review this ahead of our next conversation.",
          time: "Simulated reply",
        },
      ]);
      setReplying(false);
    }, 800);
  }

  return (
    <>
      <Heading
        eyebrow="CLIENT COMMUNICATIONS"
        title="Messages"
        description={
          d.isAdmin
            ? "Send, edit, or delete demo messages in any household thread."
            : "Your conversation, kept together in one place."
        }
      >
        <fieldset disabled={replying}>
          <HouseholdSelect value={client.id} onChange={setId} all={false} />
        </fieldset>
      </Heading>
      <section className="panel message-panel">
        <div className="chat-top">
          <div className="person-cell">
            <Avatar
              name={from === "client" ? advisor.name : client.name}
              color={client.color}
            />
            <div>
              <strong>{from === "client" ? advisor.name : client.name}</strong>
              <small>
                {from === "client" ? "Your wealth advisor" : client.household}
              </small>
            </div>
          </div>
          <span className="status neutral">
            <LockKeyhole size={11} />
            Demo conversation
          </span>
        </div>
        <div className="dm-list" ref={box}>
          {!ms.length && (
            <Empty
              icon={MessageCircle}
              title="Start the conversation"
              text="Send a demo message to this household."
            />
          )}
          {ms.map((m) => (
            <div
              className={`dm ${m.from === from ? "outgoing" : ""}`}
              key={m.id}
            >
              <div className="dm-head">
                <strong>
                  {m.from === from
                    ? "You"
                    : m.from === "advisor"
                      ? advisor.name
                      : client.name}
                </strong>
                {d.isAdmin && (
                  <span className="dm-actions">
                    <button
                      type="button"
                      aria-label="Edit message"
                      onClick={() => setEditingMsg(m)}
                    >
                      <FilePenLine size={12} />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete message"
                      onClick={() => {
                        d.setMessages((p) => p.filter((x) => x.id !== m.id));
                        d.log("Delete", `Deleted message in ${client.household}`);
                        d.notify("Message deleted");
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                )}
              </div>
              <p>{m.text}</p>
              <small>{m.time}</small>
            </div>
          ))}
          {replying && (
            <div
              className="typing-dots"
              aria-label="Preparing simulated reply"
            >
              <i />
              <i />
              <i />
            </div>
          )}
        </div>
        <div className="chat-bottom">
          <form
            className="chat-compose"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              aria-label="Message text"
              maxLength={2000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a message…"
            />
            <button
              disabled={!text.trim() || replying}
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </form>
          <div className="compliance-note">
            <Info size={14} />
            Local demo only. No message or email is sent to a real person.
          </div>
        </div>
      </section>
      {editingMsg && (
        <Modal title="Edit message" onClose={() => setEditingMsg(null)}>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const nextText = String(fd.get("text")).trim();
              if (!nextText) return;
              d.setMessages((p) =>
                p.map((m) =>
                  m.id === editingMsg.id
                    ? { ...m, text: nextText, time: "Edited" }
                    : m,
                ),
              );
              d.log("Edit", `Edited message in ${client.household}`);
              setEditingMsg(null);
              d.notify("Message updated");
            }}
          >
            <label>
              Message content
              <textarea
                autoFocus
                required
                name="text"
                rows={4}
                maxLength={2000}
                defaultValue={editingMsg.text}
              />
            </label>
            <div className="form-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setEditingMsg(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary">
                <Check size={14} />
                Save message
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export function Reports() {
  const d = useDemo();
  const client = d.clients.find((c) => c.id === d.selected) ?? d.clients[0];
  if (!client) {
    return (
      <section className="panel">
        <Empty title="No household found" text="Select or add a household." />
      </section>
    );
  }
  return (
    <>
      <Heading
        eyebrow="CLIENT REPORTING"
        title="Your reports"
        description="A clear record of your portfolio, quarter by quarter."
      />
      <section className="report-hero">
        <WaveArt />
        <span className="brief-label">
          <FileText size={15} />
          QUARTERLY REPORT
        </span>
        <h2>Second quarter, 2025</h2>
        <p>{client.household} · April 1 – June 30, 2025</p>
        <a
          className="btn gold"
          href="/reports/quarterly-report.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ArrowDownToLine size={15} />
          Download quarterly report
        </a>
        <small>Opens an illustrative PDF in a new tab.</small>
      </section>
      <div className="report-stats">
        <div className="panel">
          <small>Closing portfolio value</small>
          <h3>{money(client.value)}</h3>
        </div>
        <div className="panel">
          <small>One-year return</small>
          <h3 className="positive">+{client.returns.toFixed(2)}%</h3>
        </div>
        <div className="panel">
          <small>Linked accounts</small>
          <h3>{d.accounts.filter((a) => a.clientId === client.id).length}</h3>
        </div>
      </div>
      <div className="info-strip">
        <ShieldCheck size={17} />
        This sample report is not an official statement, tax document, or
        investment recommendation.
      </div>
    </>
  );
}
