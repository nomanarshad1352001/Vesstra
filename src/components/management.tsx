"use client";
import {
  avatarColors,
  demoCredentials,
  type AuditEntry,
  type Integration,
  type Role,
  type UserRecord,
} from "@data/demo";
import {
  permissionLevels,
  type OwnershipCard,
  type PermissionRow,
} from "@data/platform";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Blocks,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Cloud,
  Code2,
  Copy,
  FilePenLine,
  FolderClosed,
  GitBranch,
  KeyRound,
  Landmark,
  Mail,
  Minus,
  Play,
  Plus,
  Power,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { useDemo } from "./demo-context";
import { Avatar, ConfirmDelete, Empty, Heading, Modal, Tabs } from "./ui";

type AdminDelete =
  | { kind: "user"; item: UserRecord }
  | { kind: "permission"; item: PermissionRow }
  | { kind: "audit"; item: AuditEntry }
  | { kind: "clearAudit" };

export function Admin() {
  const d = useDemo();
  const [tab, setTab] = useState("Users");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [inspectUser, setInspectUser] = useState<UserRecord | null>(null);
  const [userModal, setUserModal] = useState<UserRecord | "new" | null>(null);
  const [permModal, setPermModal] = useState<PermissionRow | "new" | null>(
    null,
  );
  const [auditModal, setAuditModal] = useState<AuditEntry | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminDelete | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const list = d.users.filter(
    (u) =>
      (filter === "All" || u.role === filter) &&
      `${u.name} ${u.email} ${u.role} ${u.status}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  const logs = d.audit.filter(
    (a) =>
      (filter === "All" || a.event === filter) &&
      `${a.actor} ${a.event} ${a.detail}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );

  function handleDelete(target: AdminDelete) {
    if (target.kind === "user") {
      d.setUsers((p) => p.filter((x) => x.id !== target.item.id));
      d.log("Delete", `Deleted user: ${target.item.name} (${target.item.role})`);
      d.notify(`${target.item.name} removed from directory`);
    } else if (target.kind === "permission") {
      d.setPermissions((p) => p.filter((x) => x.id !== target.item.id));
      d.log("Delete", `Removed permission rule: ${target.item.name}`);
      d.notify("Permission rule deleted");
    } else if (target.kind === "audit") {
      d.setAudit((p) => p.filter((x) => x.id !== target.item.id));
      d.notify("Audit entry deleted");
    } else {
      d.setAudit([]);
      d.notify("Audit log cleared");
    }
  }

  return (
    <>
      <Heading
        eyebrow="ADMINISTRATION"
        title="Security & admin"
        description="Add, edit, or delete users, permissions, and audit entries across this session."
      >
        <button className="btn" onClick={() => setConfirmReset(true)}>
          <RotateCcw size={14} />
          Reset demo
        </button>
        <button className="btn" onClick={() => d.go("ownership")}>
          <KeyRound size={14} />
          Ownership
        </button>
      </Heading>
      <div className="info-strip">
        <ShieldCheck size={17} />
        <span>
          <strong>Full admin control enabled.</strong> You can add, edit, and
          delete users (including their demo login passwords), permissions,
          audit entries, portfolios, households, CRM items, documents, messages,
          calendar meetings, ownership notes, and integrations. Everything stays
          in React state.
        </span>
      </div>
      <section className="panel">
        <div className="tab-bar">
          <Tabs
            items={["Users", "Roles & permissions", "Audit log"]}
            value={tab}
            onChange={(s) => {
              setTab(s);
              setQ("");
              setFilter("All");
            }}
          />
        </div>
        {tab !== "Roles & permissions" ? (
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
              <select
                className="field-select"
                aria-label={
                  tab === "Users" ? "Filter by role" : "Filter by event"
                }
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {(tab === "Users"
                  ? ["All", "Admin", "Advisor", "Client"]
                  : ["All", "Login", "View", "Edit", "Delete"]
                ).map((v) => (
                  <option key={v} value={v}>
                    {v === "All"
                      ? `All ${tab === "Users" ? "roles" : "events"}`
                      : v}
                  </option>
                ))}
              </select>
              {tab === "Users" ? (
                <button
                  className="btn primary"
                  onClick={() => setUserModal("new")}
                >
                  <UserPlus size={14} />
                  Add user
                </button>
              ) : (
                <>
                  <button
                    className="btn"
                    disabled={!d.audit.length}
                    onClick={() => setDeleting({ kind: "clearAudit" })}
                  >
                    <Trash2 size={14} />
                    Clear log
                  </button>
                  <button
                    className="btn primary"
                    onClick={() => setAuditModal("new")}
                  >
                    <Plus size={14} />
                    Add event
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}

        {tab === "Users" ? (
          list.length ? (
            <div className="table-wrap">
              <table className="responsive-table">
                <thead>
                  <tr>
                    {["User", "Email", "Role", "Status", ""].map((t, i) => (
                      <th key={i}>{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((u) => {
                    const isSelf = u.id === d.activeUserId;
                    return (
                      <tr key={u.id}>
                        <td data-label="User">
                          <button
                            className="person-cell"
                            onClick={() => setInspectUser(u)}
                          >
                            <Avatar name={u.name} color={u.color} />
                            <span>
                              <strong>{u.name}</strong>
                              {isSelf && <small>Current session</small>}
                            </span>
                          </button>
                        </td>
                        <td data-label="Email">{u.email}</td>
                        <td data-label="Role">
                          <span
                            className={`status ${u.role === "Admin" ? "lilac" : u.role === "Advisor" ? "sand" : "neutral"}`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td data-label="Status">
                          <span
                            className={`status ${u.status === "Active" ? "active-status" : u.status === "Invited" ? "sand" : "rose"}`}
                          >
                            {u.status === "Active" && <i />}
                            {u.status}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-btn"
                              aria-label={`Edit user ${u.name}`}
                              onClick={() => setUserModal(u)}
                            >
                              <FilePenLine size={15} />
                            </button>
                            <button
                              className="icon-btn danger-icon"
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? "Cannot delete active account"
                                  : `Delete ${u.name}`
                              }
                              aria-label={`Delete user ${u.name}`}
                              onClick={() =>
                                setDeleting({ kind: "user", item: u })
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                            <button
                              className="icon-btn"
                              aria-label={`Inspect ${u.name}`}
                              onClick={() => setInspectUser(u)}
                            >
                              <ChevronRight size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty />
          )
        ) : tab === "Audit log" ? (
          logs.length ? (
            <div className="table-wrap">
              <table className="responsive-table">
                <thead>
                  <tr>
                    {["Event", "Actor", "Description", "Time", ""].map(
                      (s, i) => (
                        <th key={i}>{s}</th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((a) => (
                    <tr key={a.id}>
                      <td data-label="Event">
                        <span
                          className={`status ${
                            a.event === "Delete"
                              ? "rose"
                              : a.event === "Edit"
                                ? "sand"
                                : a.event === "Login"
                                  ? "sage"
                                  : "blue"
                          }`}
                        >
                          {a.event}
                        </span>
                      </td>
                      <td data-label="Actor">{a.actor}</td>
                      <td data-label="Description">{a.detail}</td>
                      <td data-label="Time">{a.time}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-btn"
                            aria-label={`Edit event ${a.detail}`}
                            onClick={() => setAuditModal(a)}
                          >
                            <FilePenLine size={14} />
                          </button>
                          <button
                            className="icon-btn danger-icon"
                            aria-label={`Delete event ${a.detail}`}
                            onClick={() =>
                              setDeleting({ kind: "audit", item: a })
                            }
                          >
                            <Trash2 size={14} />
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
              title="No audit events"
              text="Add an event or interact with the workspace to see entries here."
            />
          )
        ) : (
          <>
            <div className="permission-intro permission-bar">
              <div className="permission-bar-left">
                <ShieldCheck size={22} />
                <div>
                  <h3>Role-based access overview</h3>
                  <p>
                    Scoped client views, an advisor workspace, and full
                    administrator edit control.
                  </p>
                </div>
              </div>
              <button
                className="btn primary"
                onClick={() => setPermModal("new")}
              >
                <Plus size={14} />
                Add permission
              </button>
            </div>
            {d.permissions.length ? (
              <div className="table-wrap">
                <table className="responsive-table permissions">
                  <thead>
                    <tr>
                      <th>Capability</th>
                      <th>Admin</th>
                      <th>Advisor</th>
                      <th>Client</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {d.permissions.map((p) => (
                      <tr key={p.id}>
                        <td data-label="Capability">
                          <strong>{p.name}</strong>
                        </td>
                        {(["Admin", "Advisor", "Client"] as Role[]).map((r) => (
                          <td data-label={r} key={r}>
                            <span
                              className={
                                p[r] === "No access"
                                  ? "muted-indicator"
                                  : "permission-value"
                              }
                            >
                              {p[r] === "No access" ? (
                                <Minus size={13} />
                              ) : (
                                <Check size={13} />
                              )}{" "}
                              {p[r]}
                            </span>
                          </td>
                        ))}
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-btn"
                              aria-label={`Edit permission ${p.name}`}
                              onClick={() => setPermModal(p)}
                            >
                              <FilePenLine size={14} />
                            </button>
                            <button
                              className="icon-btn danger-icon"
                              aria-label={`Delete permission ${p.name}`}
                              onClick={() =>
                                setDeleting({ kind: "permission", item: p })
                              }
                            >
                              <Trash2 size={14} />
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
                title="No permission rules"
                text="Click Add permission to create a capability row."
              />
            )}
          </>
        )}
      </section>

      {inspectUser && (
        <Modal title="User profile" onClose={() => setInspectUser(null)}>
          <div className="contact-hero">
            <Avatar name={inspectUser.name} color={inspectUser.color} />
            <div>
              <h3>{inspectUser.name}</h3>
              <span>
                {inspectUser.role} workspace · {inspectUser.status}
              </span>
            </div>
          </div>
          <div className="detail-row">
            <span>Email</span>
            <strong>{inspectUser.email}</strong>
          </div>
          <div className="detail-row">
            <span>Demo password</span>
            <strong>
              <code>{inspectUser.password}</code>
            </strong>
          </div>
          <div className="detail-row">
            <span>Access scope</span>
            <strong>
              {inspectUser.role === "Client"
                ? "Own household"
                : inspectUser.role === "Admin"
                  ? "Full admin (add, edit & delete)"
                  : "Advisory practice"}
            </strong>
          </div>
          <div className="form-actions">
            {inspectUser.id !== d.activeUserId && (
              <button
                className="btn danger"
                onClick={() => {
                  const target = inspectUser;
                  setInspectUser(null);
                  setDeleting({ kind: "user", item: target });
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
            <button
              className="btn primary"
              onClick={() => {
                const target = inspectUser;
                setInspectUser(null);
                setUserModal(target);
              }}
            >
              <FilePenLine size={14} />
              Edit user
            </button>
          </div>
        </Modal>
      )}

      {userModal && (
        <Modal
          title={userModal === "new" ? "Add user" : "Edit user"}
          subtitle="Demo credentials saved in session — usable on the Login page right away."
          onClose={() => setUserModal(null)}
        >
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get("name")).trim();
              const email = String(fd.get("email")).trim();
              const role = String(fd.get("role")) as Role;
              const password =
                String(fd.get("password")).trim() ||
                demoCredentials[role].password;
              const status = String(fd.get("status")) as UserRecord["status"];
              const color = String(fd.get("color")) || "sage";
              if (!name || !email) return;
              if (userModal === "new") {
                const created: UserRecord = {
                  id: `u-${crypto.randomUUID().slice(0, 6)}`,
                  name,
                  email,
                  role,
                  password,
                  status,
                  color,
                };
                d.setUsers((p) => [created, ...p]);
                d.log("Edit", `Added ${role.toLowerCase()} user: ${name}`);
                d.notify(`${name} added to directory`);
              } else {
                d.setUsers((p) =>
                  p.map((u) =>
                    u.id === userModal.id
                      ? { ...u, name, email, role, password, status, color }
                      : u,
                  ),
                );
                d.log("Edit", `Updated user: ${name}`);
                d.notify(`${name} updated`);
              }
              setUserModal(null);
            }}
          >
            <label>
              Full name
              <input
                autoFocus
                required
                name="name"
                maxLength={100}
                defaultValue={userModal === "new" ? "" : userModal.name}
                placeholder="e.g. Morgan Lane"
              />
            </label>
            <label>
              Email address
              <input
                required
                type="email"
                name="email"
                defaultValue={userModal === "new" ? "" : userModal.email}
                placeholder="morgan.lane@example.com"
              />
            </label>
            <div className="form-two">
              <label>
                Role
                <select
                  name="role"
                  defaultValue={userModal === "new" ? "Advisor" : userModal.role}
                >
                  <option value="Admin">Admin</option>
                  <option value="Advisor">Advisor</option>
                  <option value="Client">Client</option>
                </select>
              </label>
              <label>
                Status
                <select
                  name="status"
                  defaultValue={
                    userModal === "new" ? "Active" : userModal.status
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Invited">Invited</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </label>
            </div>
            <div className="form-two">
              <label>
                Demo password
                <input
                  required
                  name="password"
                  maxLength={64}
                  defaultValue={
                    userModal === "new"
                      ? demoCredentials.Advisor.password
                      : userModal.password
                  }
                />
              </label>
              <label>
                Avatar theme
                <select
                  name="color"
                  defaultValue={userModal === "new" ? "blue" : userModal.color}
                >
                  {avatarColors.map((col) => (
                    <option key={col} value={col}>
                      {col[0].toUpperCase() + col.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setUserModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary">
                <Check size={14} />
                {userModal === "new" ? "Add user" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {permModal && (
        <Modal
          title={permModal === "new" ? "Add permission rule" : "Edit permission"}
          subtitle="Updates the role access matrix for this demo session."
          onClose={() => setPermModal(null)}
        >
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get("name")).trim();
              const Admin = String(fd.get("Admin"));
              const Advisor = String(fd.get("Advisor"));
              const Client = String(fd.get("Client"));
              if (!name) return;
              if (permModal === "new") {
                d.setPermissions((p) => [
                  ...p,
                  { id: crypto.randomUUID(), name, Admin, Advisor, Client },
                ]);
                d.log("Edit", `Added permission rule: ${name}`);
                d.notify("Permission rule added");
              } else {
                d.setPermissions((p) =>
                  p.map((x) =>
                    x.id === permModal.id
                      ? { ...x, name, Admin, Advisor, Client }
                      : x,
                  ),
                );
                d.log("Edit", `Updated permission rule: ${name}`);
                d.notify("Permission rule updated");
              }
              setPermModal(null);
            }}
          >
            <label>
              Capability name
              <input
                autoFocus
                required
                name="name"
                maxLength={100}
                defaultValue={permModal === "new" ? "" : permModal.name}
                placeholder="e.g. Export quarterly reports"
              />
            </label>
            {(["Admin", "Advisor", "Client"] as Role[]).map((r) => (
              <label key={r}>
                {r} access
                <select
                  name={r}
                  defaultValue={
                    permModal === "new"
                      ? r === "Admin"
                        ? "Full access"
                        : r === "Advisor"
                          ? "All households"
                          : "No access"
                      : permModal[r]
                  }
                >
                  {permissionLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <div className="form-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setPermModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary">
                <Check size={14} />
                {permModal === "new" ? "Add rule" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {auditModal && (
        <Modal
          title={auditModal === "new" ? "Add audit event" : "Edit audit event"}
          subtitle="Demonstration log entry stored in this session only."
          onClose={() => setAuditModal(null)}
        >
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const event = String(fd.get("event")) as AuditEntry["event"];
              const actor = String(fd.get("actor")).trim();
              const detail = String(fd.get("detail")).trim();
              const time = String(fd.get("time")).trim() || "This session";
              if (!actor || !detail) return;
              if (auditModal === "new") {
                d.setAudit((p) => [
                  { id: crypto.randomUUID(), event, actor, detail, time },
                  ...p,
                ]);
                d.notify("Audit event added");
              } else {
                d.setAudit((p) =>
                  p.map((x) =>
                    x.id === auditModal.id
                      ? { ...x, event, actor, detail, time }
                      : x,
                  ),
                );
                d.notify("Audit event updated");
              }
              setAuditModal(null);
            }}
          >
            <div className="form-two">
              <label>
                Event type
                <select
                  name="event"
                  defaultValue={auditModal === "new" ? "Edit" : auditModal.event}
                >
                  <option value="Login">Login</option>
                  <option value="View">View</option>
                  <option value="Edit">Edit</option>
                  <option value="Delete">Delete</option>
                </select>
              </label>
              <label>
                Time label
                <input
                  required
                  name="time"
                  maxLength={40}
                  defaultValue={
                    auditModal === "new" ? "This session" : auditModal.time
                  }
                />
              </label>
            </div>
            <label>
              Actor
              <input
                required
                name="actor"
                maxLength={80}
                defaultValue={
                  auditModal === "new" ? d.profile.name : auditModal.actor
                }
              />
            </label>
            <label>
              Description
              <input
                autoFocus
                required
                name="detail"
                maxLength={160}
                defaultValue={auditModal === "new" ? "" : auditModal.detail}
                placeholder="e.g. Verified quarterly export controls"
              />
            </label>
            <div className="form-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setAuditModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary">
                <Check size={14} />
                {auditModal === "new" ? "Add event" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDelete
          title={
            deleting.kind === "clearAudit"
              ? "Clear audit log?"
              : deleting.kind === "user"
                ? `Delete ${deleting.item.name}?`
                : deleting.kind === "permission"
                  ? "Delete permission rule?"
                  : "Delete audit event?"
          }
          message={
            deleting.kind === "clearAudit"
              ? "Clears all entries from the session audit log."
              : deleting.kind === "user"
                ? `Removes ${deleting.item.name} (${deleting.item.email}) from the workspace directory.`
                : deleting.kind === "permission"
                  ? `Removes "${deleting.item.name}" from the permissions matrix.`
                  : `Removes "${deleting.item.detail}" from the audit log.`
          }
          confirmLabel={deleting.kind === "clearAudit" ? "Clear log" : "Delete"}
          onConfirm={() => handleDelete(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}

      {confirmReset && (
        <Modal
          title="Reset all demo data?"
          subtitle="Restores every module to the initial June 30, 2025 snapshot."
          onClose={() => setConfirmReset(false)}
        >
          <p className="confirm-copy">
            Any users, households, accounts, holdings, tasks, notes, documents,
            messages, permissions, integrations, and ownership changes from this
            session will be reset to defaults.
          </p>
          <div className="form-actions">
            <button className="btn" onClick={() => setConfirmReset(false)}>
              Keep edits
            </button>
            <button
              className="btn primary"
              onClick={() => {
                d.resetDemo();
                setConfirmReset(false);
              }}
            >
              <RotateCcw size={14} />
              Restore defaults
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export function Ownership() {
  const d = useDemo();
  const [modal, setModal] = useState<OwnershipCard | "new" | null>(null);
  const [deleting, setDeleting] = useState<OwnershipCard | null>(null);
  const iconSet = [GitBranch, Cloud, KeyRound, BookOpen];

  return (
    <>
      <Heading
        eyebrow="PLATFORM OWNERSHIP"
        title="Your platform. Your control."
        description="A proposed delivery model built around a clean, client-owned handoff."
      >
        {d.isAdmin && (
          <button className="btn primary" onClick={() => setModal("new")}>
            <Plus size={14} />
            Add term
          </button>
        )}
      </Heading>
      <div className="ownership-banner">
        <KeyRound size={30} strokeWidth={1.3} />
        <div>
          <h2>Built for your firm, not rented from a developer.</h2>
          <p>
            These are proposed production commitments, not claims about security
            in this demo.
          </p>
        </div>
      </div>
      <div className="feature-grid two-col">
        {d.ownership.map((o, i) => {
          const Icon = iconSet[i % iconSet.length];
          return (
            <article className="panel feature-card" key={o.id}>
              <div className="integration-top">
                <span className="feature-icon">
                  <Icon size={22} />
                </span>
                {d.isAdmin && (
                  <div className="row-actions">
                    <button
                      className="icon-btn"
                      aria-label={`Edit ${o.title}`}
                      onClick={() => setModal(o)}
                    >
                      <FilePenLine size={15} />
                    </button>
                    <button
                      className="icon-btn danger-icon"
                      aria-label={`Delete ${o.title}`}
                      onClick={() => setDeleting(o)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
              <h3>{o.title}</h3>
              <p>{o.body}</p>
            </article>
          );
        })}
      </div>
      <button className="btn primary" onClick={() => d.go("approach")}>
        Explore the delivery approach
        <ArrowRight size={15} />
      </button>

      {modal && (
        <Modal
          title={modal === "new" ? "Add ownership term" : "Edit ownership term"}
          onClose={() => setModal(null)}
        >
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const title = String(fd.get("title")).trim();
              const body = String(fd.get("body")).trim();
              if (!title || !body) return;
              if (modal === "new") {
                d.setOwnership((p) => [
                  ...p,
                  { id: crypto.randomUUID(), title, body },
                ]);
                d.log("Edit", `Added ownership term: ${title}`);
                d.notify("Ownership term added");
              } else {
                d.setOwnership((p) =>
                  p.map((x) =>
                    x.id === modal.id ? { ...x, title, body } : x,
                  ),
                );
                d.log("Edit", `Updated ownership term: ${title}`);
                d.notify("Ownership term updated");
              }
              setModal(null);
            }}
          >
            <label>
              Title
              <input
                autoFocus
                required
                name="title"
                maxLength={80}
                defaultValue={modal === "new" ? "" : modal.title}
                placeholder="e.g. Data export guarantee"
              />
            </label>
            <label>
              Commitment details
              <textarea
                required
                name="body"
                rows={4}
                maxLength={1000}
                defaultValue={modal === "new" ? "" : modal.body}
                placeholder="Describe what stays under the client’s control…"
              />
            </label>
            <div className="form-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary">
                <Check size={14} />
                {modal === "new" ? "Add term" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDelete
          title={`Delete "${deleting.title}"?`}
          message="Removes this ownership commitment card from the session."
          onConfirm={() => {
            d.setOwnership((p) => p.filter((x) => x.id !== deleting.id));
            d.log("Delete", `Deleted ownership term: ${deleting.title}`);
            d.notify("Ownership term deleted");
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}

const integrationIcons = {
  custodian: Landmark,
  crm: UsersRound,
  email: Mail,
  calendar: CalendarDays,
  documents: FolderClosed,
  custom: Blocks,
} as const;

export function Integrations() {
  const d = useDemo();
  const [detail, setDetail] = useState<Integration | null>(null);
  const [modal, setModal] = useState<Integration | "new" | null>(null);
  const [deleting, setDeleting] = useState<Integration | null>(null);

  function toggleConnected(item: Integration) {
    const nextState = !item.connected;
    d.setIntegrations((p) =>
      p.map((x) => (x.id === item.id ? { ...x, connected: nextState } : x)),
    );
    if (detail?.id === item.id) {
      setDetail({ ...item, connected: nextState });
    }
    d.log(
      "Edit",
      `${nextState ? "Connected" : "Disconnected"} integration: ${item.name}`,
    );
    d.notify(
      `${item.name} marked as ${nextState ? "Connected" : "Not connected"}`,
    );
  }

  return (
    <>
      <Heading
        eyebrow="CONNECTED WORKSPACE"
        title="Integrations"
        description={
          d.isAdmin
            ? "Add, configure, toggle, or delete simulated practice integrations."
            : "A preview of the systems that bring your practice together."
        }
      >
        <button className="btn" onClick={() => d.go("api-docs")}>
          <Code2 size={15} />
          API documentation
        </button>
        {d.isAdmin && (
          <button className="btn primary" onClick={() => setModal("new")}>
            <Plus size={15} />
            Add integration
          </button>
        )}
      </Heading>
      <div className="info-strip">
        <Blocks size={17} />
        <span>
          <strong>Integration preview.</strong> All connection states are
          simulated. No credentials, network requests, or external data feeds.
        </span>
      </div>
      <div className="feature-grid">
        {d.integrations.map((it) => {
          const Icon = integrationIcons[it.icon] ?? Blocks;
          return (
            <article className="panel integration-card" key={it.id}>
              <div className="integration-top">
                <span className="feature-icon">
                  <Icon size={22} />
                </span>
                <span
                  className={`status ${it.connected ? "active-status" : "neutral"}`}
                >
                  {it.connected && <i />}
                  {it.connected ? "Connected" : "Not connected"}
                </span>
              </div>
              <h3>{it.name}</h3>
              <p>{it.description}</p>
              <div className="integration-foot">
                <small>{it.provider}</small>
                <div className="row-actions">
                  {d.isAdmin && (
                    <>
                      <button
                        className="icon-btn"
                        aria-label={`Toggle ${it.name} connection`}
                        title={it.connected ? "Disconnect" : "Connect"}
                        onClick={() => toggleConnected(it)}
                      >
                        <Power size={14} />
                      </button>
                      <button
                        className="icon-btn"
                        aria-label={`Edit integration ${it.name}`}
                        onClick={() => setModal(it)}
                      >
                        <FilePenLine size={14} />
                      </button>
                      <button
                        className="icon-btn danger-icon"
                        aria-label={`Delete integration ${it.name}`}
                        onClick={() => setDeleting(it)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                  <button
                    aria-label={`View ${it.name} integration`}
                    className="text-btn"
                    onClick={() => setDetail(it)}
                  >
                    Details
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        <button className="api-link-card" onClick={() => d.go("api-docs")}>
          <Code2 size={24} />
          <h3>Developer reference</h3>
          <p>Explore sample requests, response shapes, and household scopes.</p>
          <strong>
            View API docs
            <ArrowRight size={14} />
          </strong>
        </button>
      </div>
      {detail && (
        <Modal
          title={detail.name}
          subtitle="Simulated integration configuration"
          onClose={() => setDetail(null)}
        >
          <div className="detail-row">
            <span>Provider</span>
            <strong>{detail.provider}</strong>
          </div>
          <div className="detail-row">
            <span>Demo state</span>
            <span
              className={`status ${detail.connected ? "active-status" : "neutral"}`}
            >
              {detail.connected ? "Connected" : "Not connected"}
            </span>
          </div>
          <div className="detail-row">
            <span>Mode</span>
            <strong>
              {d.isAdmin
                ? "Local fixture · admin toggle enabled"
                : "Local fixture · read only"}
            </strong>
          </div>
          <p className="form-hint">
            {detail.description} A production connection would require provider
            approval, client-owned credentials, and a separate integration
            review.
          </p>
          {d.isAdmin && (
            <div className="form-actions wrap">
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
                  setModal(target);
                }}
              >
                <FilePenLine size={14} />
                Edit
              </button>
              <button
                className="btn primary"
                onClick={() => toggleConnected(detail)}
              >
                <Power size={14} />
                {detail.connected ? "Mark disconnected" : "Mark connected"}
              </button>
            </div>
          )}
          <button
            className="btn full-width"
            onClick={() => {
              setDetail(null);
              d.go("api-docs");
            }}
          >
            View sample API contract
            <ArrowRight size={14} />
          </button>
        </Modal>
      )}
      {modal && (
        <Modal
          title={modal === "new" ? "Add integration" : "Edit integration"}
          subtitle="Simulated connector stored in this session only."
          onClose={() => setModal(null)}
        >
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get("name")).trim();
              const provider = String(fd.get("provider")).trim();
              const description = String(fd.get("description")).trim();
              const icon = String(fd.get("icon")) as Integration["icon"];
              const connected = fd.get("connected") === "true";
              if (!name || !provider || !description) return;
              if (modal === "new") {
                d.setIntegrations((p) => [
                  ...p,
                  {
                    id: crypto.randomUUID(),
                    name,
                    provider,
                    description,
                    icon,
                    connected,
                  },
                ]);
                d.log("Edit", `Added integration: ${name} (${provider})`);
                d.notify(`${name} integration added`);
              } else {
                d.setIntegrations((p) =>
                  p.map((x) =>
                    x.id === modal.id
                      ? { ...x, name, provider, description, icon, connected }
                      : x,
                  ),
                );
                d.log("Edit", `Updated integration: ${name}`);
                d.notify(`${name} updated`);
              }
              setModal(null);
            }}
          >
            <div className="form-two">
              <label>
                Integration name
                <input
                  autoFocus
                  required
                  name="name"
                  maxLength={60}
                  defaultValue={modal === "new" ? "" : modal.name}
                  placeholder="e.g. Tax reporting"
                />
              </label>
              <label>
                Provider
                <input
                  required
                  name="provider"
                  maxLength={60}
                  defaultValue={modal === "new" ? "" : modal.provider}
                  placeholder="e.g. ClearLedger"
                />
              </label>
            </div>
            <div className="form-two">
              <label>
                Category icon
                <select
                  name="icon"
                  defaultValue={modal === "new" ? "custom" : modal.icon}
                >
                  <option value="custodian">Custodian</option>
                  <option value="crm">CRM</option>
                  <option value="email">Email</option>
                  <option value="calendar">Calendar</option>
                  <option value="documents">Documents</option>
                  <option value="custom">Other service</option>
                </select>
              </label>
              <label>
                Connection status
                <select
                  name="connected"
                  defaultValue={
                    modal === "new" ? "true" : String(modal.connected)
                  }
                >
                  <option value="true">Connected</option>
                  <option value="false">Not connected</option>
                </select>
              </label>
            </div>
            <label>
              Description
              <textarea
                required
                name="description"
                rows={3}
                maxLength={400}
                defaultValue={modal === "new" ? "" : modal.description}
                placeholder="Describe what data or workflow this connects…"
              />
            </label>
            <div className="form-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary">
                <Check size={14} />
                {modal === "new" ? "Add integration" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <ConfirmDelete
          title={`Delete ${deleting.name}?`}
          message={`Removes the ${deleting.provider} connector card from this demo session.`}
          onConfirm={() => {
            d.setIntegrations((p) => p.filter((x) => x.id !== deleting.id));
            d.log("Delete", `Deleted integration: ${deleting.name}`);
            d.notify(`${deleting.name} removed`);
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}

export function ApiDocs() {
  const d = useDemo();
  const [tab, setTab] = useState("Portfolio");
  const [ran, setRan] = useState(false);
  const sampleClient = d.clients[0];
  const cid = sampleClient?.id ?? "c1";
  const url =
    tab === "Portfolio"
      ? `/v1/households/${cid}/portfolio`
      : tab === "Transactions"
        ? `/v1/households/${cid}/transactions?limit=2`
        : `/v1/households/${cid}/meetings`;
  const response =
    tab === "Portfolio"
      ? {
          demo: true,
          household_id: cid,
          as_of: "2025-06-30",
          currency: "USD",
          total_value: sampleClient?.value ?? 0,
          accounts: d.accounts
            .filter((a) => a.clientId === cid)
            .map((a) => ({ id: a.id, type: a.type, balance: a.balance })),
        }
      : tab === "Transactions"
        ? {
            demo: true,
            data: d.transactions
              .filter((t) => t.clientId === cid)
              .slice(0, 2),
          }
        : { demo: true, data: d.meetings.filter((m) => m.clientId === cid) };
  const code = JSON.stringify(response, null, 2);

  return (
    <>
      <Heading
        eyebrow="DEVELOPER REFERENCE"
        title="API documentation"
        description="Illustrative contracts for a future integration. These endpoints do not exist."
      >
        <button className="btn" onClick={() => d.go("integrations")}>
          <ArrowLeft size={14} />
          Integrations
        </button>
      </Heading>
      <section className="panel">
        <div className="tab-bar">
          <Tabs
            items={["Portfolio", "Transactions", "Meetings"]}
            value={tab}
            onChange={(s) => {
              setTab(s);
              setRan(false);
            }}
          />
        </div>
        <div className="api-content">
          <span className="mini-label">SAMPLE REQUEST</span>
          <div className="endpoint">
            <span className="status sage">GET</span>
            <code>{url}</code>
          </div>
          <p>
            The production design would derive household access from a verified
            identity. This example reads a local fixture; it does not send an
            HTTP request.
          </p>
          <div className="code-block">
            <pre>{`GET ${url} HTTP/1.1\nAccept: application/json\nX-Demo-Mode: example-only`}</pre>
          </div>
          <div className="api-result-head">
            <h3>{ran ? "Local example response" : "Response preview"}</h3>
            <button className="btn" onClick={() => setRan(true)}>
              <Play size={13} />
              {ran ? "Run again" : "Run local example"}
            </button>
          </div>
          {ran && (
            <div className="status active-status">
              <Check size={12} />
              200 OK · simulated response
            </div>
          )}
          <div className="code-block">
            <button
              className="copy-btn"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(code);
                  d.notify("Sample response copied");
                } catch {
                  d.notify(
                    "Clipboard is unavailable. Select the example to copy it.",
                  );
                }
              }}
            >
              <Copy size={13} />
              Copy
            </button>
            <pre>{code}</pre>
          </div>
        </div>
      </section>
    </>
  );
}
