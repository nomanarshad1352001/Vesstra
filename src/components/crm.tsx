"use client";
import {
  avatarColors,
  compact,
  displayDate,
  money,
  stages,
  type Client,
  type Lead,
  type Meeting,
  type Note,
  type Stage,
  type Task,
} from "@data/demo";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FilePenLine,
  FileText,
  GripVertical,
  Mail,
  MapPin,
  MessageSquare,
  NotebookPen,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { useDemo } from "./demo-context";
import { Avatar, ConfirmDelete, Empty, Heading, Modal, Tabs } from "./ui";

type DeleteTarget =
  | { kind: "client"; item: Client }
  | { kind: "lead"; item: Lead }
  | { kind: "task"; item: Task }
  | { kind: "note"; item: Note }
  | { kind: "meeting"; item: Meeting };

export function CRM() {
  const d = useDemo();
  const tab = d.crmTab;
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [person, setPerson] = useState<Client | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null);
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null);
  const [drag, setDrag] = useState("");
  const [drop, setDrop] = useState("");
  const [noteLimit, setNoteLimit] = useState(8);

  const match = (s: string) => s.toLowerCase().includes(q.toLowerCase());
  const personName = (id: string) =>
    d.clients.find((c) => c.id === id)?.name ?? "Unassigned";

  const people = d.clients.filter(
    (c) =>
      match(`${c.name} ${c.household} ${c.email} ${c.location}`) &&
      (filter === "All" || c.risk === filter),
  );
  const tasks = d.tasks.filter(
    (t) =>
      match(t.title + personName(t.clientId)) &&
      (filter === "All" || (filter === "Completed" ? t.done : !t.done)),
  );
  const notes = d.notes.filter((n) =>
    match(n.title + n.body + personName(n.clientId)),
  );
  const meetings = d.meetings.filter((m) =>
    match(m.title + personName(m.clientId)),
  );
  const leads = d.leads.filter((l) => match(l.name + l.topic));
  const timeline = [
    ...d.audit.map((a) => ({
      id: "a-" + a.id,
      title: a.detail,
      detail: a.actor,
      date: a.time,
      icon: Clock3,
    })),
    ...d.notes.slice(0, 8).map((n) => ({
      id: n.id,
      title: n.title,
      detail: personName(n.clientId),
      date: displayDate(n.date),
      icon: NotebookPen,
    })),
  ].filter((a) => match(a.title + a.detail));

  function selectTab(s: string) {
    d.setCrmTab(s);
    setFilter("All");
    setQ("");
  }

  function move(id: string, stage: Stage) {
    d.setLeads((p) => p.map((l) => (l.id === id ? { ...l, stage } : l)));
    setDrop("");
    setDrag("");
    d.log("Edit", `Moved pipeline card to ${stage}`);
    d.notify(`Lead moved to ${stage}`);
  }

  function confirmDelete(target: DeleteTarget) {
    if (target.kind === "client") {
      const c = target.item;
      d.setClients((p) => p.filter((x) => x.id !== c.id));
      d.setAccounts((p) => p.filter((x) => x.clientId !== c.id));
      d.setTransactions((p) => p.filter((x) => x.clientId !== c.id));
      d.setNotes((p) => p.filter((x) => x.clientId !== c.id));
      d.setTasks((p) => p.filter((x) => x.clientId !== c.id));
      d.setMeetings((p) => p.filter((x) => x.clientId !== c.id));
      d.setDocs((p) => p.filter((x) => x.clientId !== c.id));
      if (d.selected === c.id) d.setSelected("all");
      if (person?.id === c.id) setPerson(null);
      d.log("Delete", `Deleted household: ${c.household} (${c.name})`);
      d.notify(`${c.household} deleted`);
    } else if (target.kind === "lead") {
      d.setLeads((p) => p.filter((x) => x.id !== target.item.id));
      d.log("Delete", `Deleted pipeline lead: ${target.item.name}`);
      d.notify(`${target.item.name} deleted from pipeline`);
    } else if (target.kind === "task") {
      d.setTasks((p) => p.filter((x) => x.id !== target.item.id));
      d.log("Delete", `Deleted task: ${target.item.title}`);
      d.notify("Task deleted");
    } else if (target.kind === "note") {
      d.setNotes((p) => p.filter((x) => x.id !== target.item.id));
      d.log("Delete", `Deleted note: ${target.item.title}`);
      d.notify("Note deleted");
    } else if (target.kind === "meeting") {
      d.setMeetings((p) => p.filter((x) => x.id !== target.item.id));
      d.log("Delete", `Deleted meeting: ${target.item.title}`);
      d.notify("Meeting deleted");
    }
  }

  return (
    <>
      <Heading
        eyebrow="RELATIONSHIP MANAGEMENT"
        title="Clients & CRM"
        description={
          d.isAdmin
            ? "Add, edit, or delete any household, pipeline card, task, note, or meeting."
            : "The relationships, conversations, and next steps behind every portfolio."
        }
      >
        {d.isAdmin && (
          <button
            className="btn"
            onClick={() => d.setDialog({ kind: "client" })}
          >
            <UserPlus size={15} />
            Add household
          </button>
        )}
        <button className="btn" onClick={() => d.setDialog({ kind: "note" })}>
          <NotebookPen size={15} />
          Add note
        </button>
        <button
          className="btn primary"
          onClick={() => d.setDialog({ kind: "task" })}
        >
          <Plus size={15} />
          Add task
        </button>
      </Heading>
      <div className="summary-strip">
        {[
          {
            icon: UsersRound,
            label: "Active households",
            value: d.clients.length,
            tab: "Households",
          },
          {
            icon: TrendingUp,
            label: "Pipeline value",
            value: compact(
              d.leads
                .filter((l) => l.stage !== "Client")
                .reduce((s, l) => s + l.value, 0),
            ),
            tab: "Pipeline",
          },
          {
            icon: ClipboardCheck,
            label: "Open tasks",
            value: d.tasks.filter((x) => !x.done).length,
            tab: "Tasks",
          },
        ].map(({ icon: Icon, label, value, tab: t }) => (
          <button key={t} onClick={() => selectTab(t)}>
            <span className="summary-icon">
              <Icon size={21} />
            </span>
            <span>
              <small>{label}</small>
              <strong>{value}</strong>
            </span>
            <ArrowUpRight size={14} />
          </button>
        ))}
      </div>
      <section className="panel crm-panel">
        <div className="tab-bar">
          <Tabs
            items={[
              "Households",
              "Pipeline",
              "Contacts",
              "Tasks",
              "Notes",
              "Meetings",
              "Activity",
            ]}
            value={tab}
            onChange={selectTab}
          />
        </div>
        <div className="list-toolbar">
          <div className="search-input">
            <Search size={15} />
            <input
              aria-label={`Search ${tab}`}
              placeholder={`Search ${tab.toLowerCase()}…`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="toolbar-right">
            {(tab === "Households" ||
              tab === "Contacts" ||
              tab === "Tasks") && (
              <select
                className="field-select"
                aria-label="Filter results"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {(tab === "Tasks"
                  ? ["All", "Open", "Completed"]
                  : ["All", "Balanced", "Growth", "Conservative"]
                ).map((s) => (
                  <option key={s} value={s}>
                    {s === "All"
                      ? tab === "Tasks"
                        ? "All statuses"
                        : "All profiles"
                      : s}
                  </option>
                ))}
              </select>
            )}
            {d.isAdmin && (tab === "Households" || tab === "Contacts") && (
              <button
                className="btn"
                onClick={() => d.setDialog({ kind: "client" })}
              >
                <Plus size={14} />
                Add {tab === "Contacts" ? "contact" : "household"}
              </button>
            )}
            {tab === "Pipeline" && (
              <button
                className="btn"
                onClick={() => d.setDialog({ kind: "lead" })}
              >
                <Plus size={14} />
                Add lead
              </button>
            )}
            {tab === "Meetings" && (
              <button
                className="btn"
                onClick={() => d.setDialog({ kind: "meeting" })}
              >
                <Plus size={14} />
                Book meeting
              </button>
            )}
          </div>
        </div>
        {(tab === "Households" || tab === "Contacts") &&
          (people.length ? (
            <div className="table-wrap">
              <table className="responsive-table">
                <thead>
                  <tr>
                    {(tab === "Households"
                      ? [
                          "Household",
                          "Risk profile",
                          "Accounts",
                          "Portfolio value",
                          "1Y return",
                          "",
                        ]
                      : ["Contact", "Email", "Location", "Relationship", ""]
                    ).map((s, i) => (
                      <th key={i}>{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {people.map((c) => (
                    <tr key={c.id}>
                      <td data-label="Household">
                        <button
                          onClick={() => setPerson(c)}
                          className="person-cell"
                        >
                          <Avatar name={c.name} color={c.color} />
                          <span>
                            <strong>
                              {tab === "Contacts" ? c.name : c.household}
                            </strong>
                            <small>
                              {tab === "Contacts" ? c.household : c.name}
                            </small>
                          </span>
                        </button>
                      </td>
                      {tab === "Households" ? (
                        <>
                          <td data-label="Risk profile">
                            <span
                              className={`status ${c.risk === "Growth" ? "sage" : c.risk === "Balanced" ? "sand" : "blue"}`}
                            >
                              {c.risk}
                            </span>
                          </td>
                          <td data-label="Accounts">
                            {
                              d.accounts.filter((a) => a.clientId === c.id)
                                .length
                            }
                          </td>
                          <td className="number" data-label="Portfolio value">
                            {money(c.value)}
                          </td>
                          <td data-label="1Y return">
                            <span className="return-text">
                              <ArrowUpRight size={13} />
                              {c.returns.toFixed(2)}%
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td data-label="Email">{c.email}</td>
                          <td data-label="Location">{c.location}</td>
                          <td data-label="Relationship">
                            Client since {c.joined}
                          </td>
                        </>
                      )}
                      <td>
                        <div className="row-actions">
                          {d.isAdmin && (
                            <>
                              <button
                                className="icon-btn"
                                onClick={() => setEditClient(c)}
                                aria-label={`Edit ${c.name}`}
                                title="Edit household"
                              >
                                <FilePenLine size={15} />
                              </button>
                              <button
                                className="icon-btn danger-icon"
                                onClick={() =>
                                  setDeleting({ kind: "client", item: c })
                                }
                                aria-label={`Delete ${c.name}`}
                                title="Delete household"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                          <button
                            className="icon-btn"
                            onClick={() => setPerson(c)}
                            aria-label={`View ${c.name}`}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty />
          ))}
        {tab === "Pipeline" && (
          <>
            <div className="pipeline-tip">
              <GripVertical size={14} />
              Drag cards between stages, or use the stage selector on a card.
            </div>
            <div className="board-scroll">
              <div className="pipeline-board">
                {stages.map((stage, i) => (
                  <div
                    key={stage}
                    className={`pipeline-lane ${drop === stage ? "drag-over" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDrop(stage);
                    }}
                    onDragLeave={() => setDrop("")}
                    onDrop={(e) => {
                      e.preventDefault();
                      const id = e.dataTransfer.getData("text/plain");
                      if (d.leads.some((l) => l.id === id)) move(id, stage);
                    }}
                  >
                    <h3>
                      <i
                        style={{
                          background: [
                            "#a0b2c4",
                            "#b6a27b",
                            "#b9a4be",
                            "#87a59a",
                            "#294d4a",
                          ][i],
                        }}
                      />
                      {stage}
                      <span>
                        {leads.filter((l) => l.stage === stage).length}
                      </span>
                    </h3>
                    {leads
                      .filter((l) => l.stage === stage)
                      .map((l) => (
                        <article
                          draggable
                          onDragStart={(e) => {
                            setDrag(l.id);
                            e.dataTransfer.setData("text/plain", l.id);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragEnd={() => {
                            setDrag("");
                            setDrop("");
                          }}
                          className={`lead-card ${drag === l.id ? "dragging" : ""}`}
                          key={l.id}
                        >
                          <div className="lead-card-top">
                            <Avatar name={l.name} color={l.color} small />
                            {d.isAdmin ? (
                              <span className="lead-actions">
                                <button
                                  type="button"
                                  className="mini-icon-btn"
                                  aria-label={`Edit lead ${l.name}`}
                                  onClick={() => setEditLead(l)}
                                >
                                  <FilePenLine size={12} />
                                </button>
                                <button
                                  type="button"
                                  className="mini-icon-btn danger-icon"
                                  aria-label={`Delete lead ${l.name}`}
                                  onClick={() =>
                                    setDeleting({ kind: "lead", item: l })
                                  }
                                >
                                  <Trash2 size={12} />
                                </button>
                              </span>
                            ) : (
                              <GripVertical size={13} />
                            )}
                          </div>
                          <strong>{l.name}</strong>
                          <p>{l.topic}</p>
                          <b>{compact(l.value)}</b>
                          <select
                            aria-label={`Move ${l.name} to stage`}
                            value={l.stage}
                            onChange={(e) =>
                              move(l.id, e.target.value as Stage)
                            }
                          >
                            {stages.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </article>
                      ))}
                    {!leads.some((l) => l.stage === stage) && (
                      <div className="lane-empty">No leads in this stage</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {tab === "Tasks" && (
          <div className="content-list">
            {tasks.length ? (
              tasks.map((t) => (
                <div
                  className={`record-line ${t.done ? "completed" : ""}`}
                  key={t.id}
                >
                  <label className="check-area">
                    <input
                      aria-label={`Mark ${t.title} ${t.done ? "incomplete" : "complete"}`}
                      type="checkbox"
                      checked={t.done}
                      onChange={() => {
                        d.setTasks((p) =>
                          p.map((x) =>
                            x.id === t.id ? { ...x, done: !x.done } : x,
                          ),
                        );
                        d.log(
                          "Edit",
                          `${t.done ? "Reopened" : "Completed"} task: ${t.title}`,
                        );
                      }}
                    />
                  </label>
                  <div className="record-main">
                    <strong>{t.title}</strong>
                    <small>
                      {personName(t.clientId)} · Due {displayDate(t.due)}
                    </small>
                  </div>
                  <span
                    className={`status ${t.done ? "sage" : t.priority === "High" ? "sand" : "neutral"}`}
                  >
                    {t.done ? "Complete" : t.priority}
                  </span>
                  <div className="row-actions">
                    <button
                      aria-label={`Edit ${t.title}`}
                      className="icon-btn"
                      onClick={() => setEditTask(t)}
                    >
                      <FilePenLine size={15} />
                    </button>
                    {d.isAdmin && (
                      <button
                        aria-label={`Delete task ${t.title}`}
                        className="icon-btn danger-icon"
                        onClick={() => setDeleting({ kind: "task", item: t })}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <Empty
                title="No matching tasks"
                text="Add a task or change the status filter."
              />
            )}
          </div>
        )}
        {tab === "Notes" && (
          <div className="notes-grid">
            {notes.length ? (
              notes.slice(0, noteLimit).map((n) => (
                <article key={n.id} className="note-card">
                  <div className="note-top">
                    <span>
                      <FileText size={14} />
                      HOUSEHOLD NOTE
                    </span>
                    <div className="row-actions">
                      <button
                        className="icon-btn"
                        aria-label={`Edit ${n.title}`}
                        onClick={() => setEditNote(n)}
                      >
                        <FilePenLine size={14} />
                      </button>
                      {d.isAdmin && (
                        <button
                          className="icon-btn danger-icon"
                          aria-label={`Delete note ${n.title}`}
                          onClick={() =>
                            setDeleting({ kind: "note", item: n })
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <h3>{n.title}</h3>
                  <p>{n.body}</p>
                  <small>
                    {personName(n.clientId)} · {displayDate(n.date)}
                  </small>
                </article>
              ))
            ) : (
              <Empty />
            )}
            {notes.length > noteLimit && (
              <button
                className="btn"
                onClick={() => setNoteLimit((s) => s + 8)}
              >
                Show more notes ({notes.length - noteLimit})
              </button>
            )}
          </div>
        )}
        {tab === "Meetings" && (
          <div className="content-list">
            {meetings.length ? (
              meetings.map((m) => (
                <div className="record-line" key={m.id}>
                  <span className="summary-icon">
                    <CalendarDays size={19} />
                  </span>
                  <div className="record-main">
                    <strong>{m.title}</strong>
                    <small>
                      {personName(m.clientId)} · {displayDate(m.date)} at{" "}
                      {m.time} ET
                    </small>
                  </div>
                  <span className="status neutral">{m.kind}</span>
                  {d.isAdmin && (
                    <div className="row-actions">
                      <button
                        className="icon-btn"
                        aria-label={`Edit meeting ${m.title}`}
                        onClick={() => setEditMeeting(m)}
                      >
                        <FilePenLine size={15} />
                      </button>
                      <button
                        className="icon-btn danger-icon"
                        aria-label={`Delete meeting ${m.title}`}
                        onClick={() =>
                          setDeleting({ kind: "meeting", item: m })
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <Empty />
            )}
          </div>
        )}
        {tab === "Activity" && (
          <div className="timeline">
            {timeline.length ? (
              timeline.map(({ id, title, detail, date, icon: Icon }) => (
                <div className="timeline-item" key={id}>
                  <span>
                    <Icon size={15} />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p>{detail}</p>
                    <small>{date}</small>
                  </div>
                </div>
              ))
            ) : (
              <Empty />
            )}
          </div>
        )}
      </section>

      {person && (
        <Modal
          title={person.household}
          subtitle={`Client relationship since ${person.joined}`}
          onClose={() => setPerson(null)}
        >
          <div className="contact-hero">
            <Avatar name={person.name} color={person.color} />
            <div>
              <h3>{person.name}</h3>
              <span>{person.risk} investment profile</span>
            </div>
          </div>
          <div className="detail-row">
            <span>
              <Mail size={15} />
              Email
            </span>
            <strong>{person.email}</strong>
          </div>
          <div className="detail-row">
            <span>
              <MapPin size={15} />
              Location
            </span>
            <strong>{person.location}</strong>
          </div>
          <div className="detail-row">
            <span>Portfolio value</span>
            <strong>{money(person.value)}</strong>
          </div>
          <div className="detail-row">
            <span>1Y return</span>
            <strong className="positive">+{person.returns.toFixed(2)}%</strong>
          </div>
          <div className="form-actions wrap">
            {d.isAdmin && (
              <>
                <button
                  className="btn danger"
                  onClick={() => {
                    const target = person;
                    setPerson(null);
                    setDeleting({ kind: "client", item: target });
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    const target = person;
                    setPerson(null);
                    setEditClient(target);
                  }}
                >
                  <FilePenLine size={14} />
                  Edit
                </button>
              </>
            )}
            <button
              className="btn"
              onClick={() => {
                d.setDialog({ kind: "note", clientId: person.id });
                setPerson(null);
              }}
            >
              <NotebookPen size={14} />
              Add note
            </button>
            <button
              className="btn"
              onClick={() => {
                d.setSelected(person.id);
                d.go("messages");
              }}
            >
              <MessageSquare size={14} />
              Message
            </button>
            <button
              className="btn primary"
              onClick={() => {
                d.setSelected(person.id);
                d.go("portfolios");
              }}
            >
              View portfolio
              <ArrowRight size={14} />
            </button>
          </div>
        </Modal>
      )}

      {editClient && (
        <Modal
          title="Edit household"
          subtitle="Changes update portfolios, CRM, and metrics across this session."
          onClose={() => setEditClient(null)}
        >
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get("name")).trim();
              const household = String(fd.get("household")).trim();
              const email = String(fd.get("email")).trim();
              const location = String(fd.get("location")).trim();
              const risk = String(fd.get("risk"));
              const joined = String(fd.get("joined")).trim() || editClient.joined;
              const value = Math.max(0, Number(fd.get("value")) || 0);
              const returns = Number(fd.get("returns"));
              const color = String(fd.get("color")) || editClient.color;
              if (!name || !household || !email) return;
              d.setClients((p) =>
                p.map((c) =>
                  c.id === editClient.id
                    ? {
                        ...c,
                        name,
                        household,
                        email,
                        location,
                        risk,
                        joined,
                        value,
                        returns: Number.isNaN(returns) ? c.returns : returns,
                        color,
                      }
                    : c,
                ),
              );
              d.log("Edit", `Updated household: ${household} (${name})`);
              setEditClient(null);
              d.notify(`${household} updated`);
            }}
          >
            <div className="form-two">
              <label>
                Full name
                <input
                  required
                  name="name"
                  defaultValue={editClient.name}
                  maxLength={100}
                />
              </label>
              <label>
                Household name
                <input
                  required
                  name="household"
                  defaultValue={editClient.household}
                  maxLength={100}
                />
              </label>
            </div>
            <div className="form-two">
              <label>
                Email
                <input
                  required
                  type="email"
                  name="email"
                  defaultValue={editClient.email}
                />
              </label>
              <label>
                Location
                <input
                  required
                  name="location"
                  defaultValue={editClient.location}
                  maxLength={80}
                />
              </label>
            </div>
            <div className="form-two">
              <label>
                Portfolio value ($)
                <input
                  required
                  type="number"
                  step="1"
                  min="0"
                  max="999999999"
                  name="value"
                  defaultValue={editClient.value}
                />
              </label>
              <label>
                1Y return (%)
                <input
                  required
                  type="number"
                  step="0.01"
                  min="-99"
                  max="200"
                  name="returns"
                  defaultValue={editClient.returns}
                />
              </label>
            </div>
            <div className="form-two">
              <label>
                Risk profile
                <select name="risk" defaultValue={editClient.risk}>
                  <option>Balanced</option>
                  <option>Growth</option>
                  <option>Conservative</option>
                </select>
              </label>
              <label>
                Client since
                <input
                  name="joined"
                  maxLength={4}
                  defaultValue={editClient.joined}
                />
              </label>
            </div>
            <label>
              Avatar theme
              <select name="color" defaultValue={editClient.color}>
                {avatarColors.map((col) => (
                  <option key={col} value={col}>
                    {col[0].toUpperCase() + col.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-actions">
              <button
                type="button"
                className="btn danger"
                onClick={() => {
                  const target = editClient;
                  setEditClient(null);
                  setDeleting({ kind: "client", item: target });
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
              <button type="submit" className="btn primary">
                <Check size={15} />
                Save changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editLead && (
        <Modal title="Edit pipeline lead" onClose={() => setEditLead(null)}>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get("name")).trim();
              const topic = String(fd.get("topic")).trim();
              const value = Math.max(0, Number(fd.get("value")) || 0);
              const stage = String(fd.get("stage")) as Stage;
              if (!name || !topic) return;
              d.setLeads((p) =>
                p.map((l) =>
                  l.id === editLead.id ? { ...l, name, topic, value, stage } : l,
                ),
              );
              d.log("Edit", `Updated pipeline lead: ${name}`);
              setEditLead(null);
              d.notify("Pipeline lead updated");
            }}
          >
            <label>
              Full name
              <input
                required
                name="name"
                defaultValue={editLead.name}
                maxLength={100}
              />
            </label>
            <label>
              Planning interest
              <input
                required
                name="topic"
                defaultValue={editLead.topic}
                maxLength={100}
              />
            </label>
            <div className="form-two">
              <label>
                Estimated assets ($)
                <input
                  required
                  type="number"
                  step="1"
                  min="0"
                  max="999999999"
                  name="value"
                  defaultValue={editLead.value}
                />
              </label>
              <label>
                Pipeline stage
                <select name="stage" defaultValue={editLead.stage}>
                  {stages.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn danger"
                onClick={() => {
                  const target = editLead;
                  setEditLead(null);
                  setDeleting({ kind: "lead", item: target });
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
              <button type="submit" className="btn primary">
                <Check size={15} />
                Save changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editNote && (
        <Modal title="Edit household note" onClose={() => setEditNote(null)}>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const title = String(fd.get("title")).trim(),
                body = String(fd.get("body")).trim(),
                clientId = String(fd.get("clientId") || editNote.clientId);
              if (!title || !body) return;
              d.setNotes((p) =>
                p.map((n) =>
                  n.id === editNote.id ? { ...n, title, body, clientId } : n,
                ),
              );
              d.log("Edit", `Updated note: ${title}`);
              setEditNote(null);
              d.notify("Note updated");
            }}
          >
            <label>
              Title
              <input
                required
                name="title"
                defaultValue={editNote.title}
                maxLength={120}
              />
            </label>
            {d.isAdmin && (
              <label>
                Household
                <select name="clientId" defaultValue={editNote.clientId}>
                  {d.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.household}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Note
              <textarea
                required
                name="body"
                rows={5}
                defaultValue={editNote.body}
                maxLength={4000}
              />
            </label>
            <div className="form-actions">
              {d.isAdmin && (
                <button
                  type="button"
                  className="btn danger"
                  onClick={() => {
                    const target = editNote;
                    setEditNote(null);
                    setDeleting({ kind: "note", item: target });
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
              <button className="btn primary" type="submit">
                <Check size={15} />
                Save changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editTask && (
        <Modal title="Edit task" onClose={() => setEditTask(null)}>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const title = String(fd.get("title")).trim();
              const clientId = String(fd.get("clientId") || editTask.clientId);
              if (!title) return;
              d.setTasks((p) =>
                p.map((t) =>
                  t.id === editTask.id
                    ? {
                        ...t,
                        title,
                        clientId,
                        due: String(fd.get("due")),
                        priority:
                          fd.get("priority") === "High" ? "High" : "Normal",
                      }
                    : t,
                ),
              );
              d.log("Edit", "Updated task: " + title);
              setEditTask(null);
              d.notify("Task updated");
            }}
          >
            <label>
              Task title
              <input
                required
                name="title"
                defaultValue={editTask.title}
                maxLength={120}
              />
            </label>
            {d.isAdmin && (
              <label>
                Household
                <select name="clientId" defaultValue={editTask.clientId}>
                  {d.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.household}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="form-two">
              <label>
                Due date
                <input
                  required
                  type="date"
                  name="due"
                  defaultValue={editTask.due}
                />
              </label>
              <label>
                Priority
                <select name="priority" defaultValue={editTask.priority}>
                  <option>Normal</option>
                  <option>High</option>
                </select>
              </label>
            </div>
            <div className="form-actions">
              {d.isAdmin && (
                <button
                  type="button"
                  className="btn danger"
                  onClick={() => {
                    const target = editTask;
                    setEditTask(null);
                    setDeleting({ kind: "task", item: target });
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
              <button className="btn primary" type="submit">
                <Check size={15} />
                Save changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editMeeting && (
        <Modal title="Edit meeting" onClose={() => setEditMeeting(null)}>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const title = String(fd.get("title")).trim();
              if (!title) return;
              const next: Meeting = {
                ...editMeeting,
                title,
                clientId: String(fd.get("clientId") || editMeeting.clientId),
                date: String(fd.get("date")),
                time: String(fd.get("time")),
                kind: String(fd.get("kind")),
              };
              d.setMeetings((p) =>
                p
                  .map((m) => (m.id === editMeeting.id ? next : m))
                  .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
              );
              d.log("Edit", `Updated meeting: ${title}`);
              setEditMeeting(null);
              d.notify("Meeting updated");
            }}
          >
            <label>
              Meeting title
              <input
                required
                name="title"
                defaultValue={editMeeting.title}
                maxLength={120}
              />
            </label>
            <label>
              Household
              <select name="clientId" defaultValue={editMeeting.clientId}>
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
                  defaultValue={editMeeting.date}
                />
              </label>
              <label>
                Time · Eastern
                <input
                  required
                  type="time"
                  name="time"
                  defaultValue={editMeeting.time}
                />
              </label>
            </div>
            <label>
              Format
              <select name="kind" defaultValue={editMeeting.kind}>
                <option>Video call</option>
                <option>Office meeting</option>
                <option>Phone call</option>
              </select>
            </label>
            <div className="form-actions">
              <button
                type="button"
                className="btn danger"
                onClick={() => {
                  const target = editMeeting;
                  setEditMeeting(null);
                  setDeleting({ kind: "meeting", item: target });
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
              <button type="submit" className="btn primary">
                <Check size={15} />
                Save changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDelete
          title={
            deleting.kind === "client"
              ? `Delete ${deleting.item.household}?`
              : deleting.kind === "lead"
                ? `Delete ${deleting.item.name}?`
                : `Delete this ${deleting.kind}?`
          }
          message={
            deleting.kind === "client"
              ? `This removes ${deleting.item.name} along with their linked accounts, transactions, notes, tasks, documents, and meetings from the current session.`
              : `This removes "${
                  deleting.kind === "lead"
                    ? deleting.item.name
                    : deleting.item.title
                }" from the current demo session.`
          }
          onConfirm={() => confirmDelete(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
