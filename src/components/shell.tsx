"use client";
import { demoCredentials, displayDate, type Role } from "@data/demo";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Blocks,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  FileText,
  FolderClosed,
  Grid2X2,
  KeyRound,
  Layers3,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Moon,
  PanelLeftClose,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  UsersRound,
  Wand2,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useDemo } from "./demo-context";
import { Avatar, Brand, Empty, Footer, Modal } from "./ui";

export type NavItem = {
  path: string;
  name: string;
  icon: LucideIcon;
  group: string;
};

export function menuFor(role: Role): NavItem[] {
  const items: NavItem[] = [
    { path: "overview", name: "Overview", icon: Grid2X2, group: "Workspace" },
    {
      path: "portfolios",
      name: role === "Client" ? "My portfolio" : "Portfolios",
      icon: BriefcaseBusiness,
      group: "Workspace",
    },
    ...(role !== "Client"
      ? [
          {
            path: "crm",
            name: "Clients & CRM",
            icon: UsersRound,
            group: "Workspace",
          },
        ]
      : []),
    {
      path: "calendar",
      name: "Calendar",
      icon: CalendarDays,
      group: "Workspace",
    },
    ...(role === "Client" || role === "Admin"
      ? [
          {
            path: "messages",
            name: "Messages",
            icon: MessageSquare,
            group: "Workspace",
          },
        ]
      : []),
    ...(role === "Client"
      ? [
          {
            path: "reports",
            name: "Reports",
            icon: FileText,
            group: "Workspace",
          },
        ]
      : []),
    {
      path: "assistant",
      name: "AI Assistant",
      icon: Sparkles,
      group: "Tools & resources",
    },
    {
      path: "documents",
      name: "Documents",
      icon: FolderClosed,
      group: "Tools & resources",
    },
    ...(role !== "Client"
      ? [
          {
            path: "integrations",
            name: "Integrations",
            icon: Blocks,
            group: "Tools & resources",
          },
        ]
      : []),
  ];
  if (role === "Admin")
    items.push(
      {
        path: "admin",
        name: "Security & admin",
        icon: ShieldCheck,
        group: "Administration",
      },
      {
        path: "ownership",
        name: "Ownership",
        icon: LockKeyhole,
        group: "Administration",
      },
    );
  return items;
}

const href = (p: string) => `/${p}`;

export function Shell({
  page,
  children,
}: {
  page: string;
  children: ReactNode;
}) {
  const d = useDemo();
  const [mobile, setMobile] = useState(false);
  const [popup, setPopup] = useState("");
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const headRef = useRef<HTMLDivElement>(null);
  const items = menuFor(d.role);
  const activePage = page === "root" ? "overview" : page;
  const pageName =
    items.find((x) => x.path === activePage)?.name ??
    {
      "api-docs": "API documentation",
      ownership: "Ownership",
      admin: "Security & admin",
      messages: "Messages",
      reports: "Reports",
    }[activePage] ??
    "Workspace";

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setQuery("");
        setSearch((s) => !s);
      }
      if (e.key === "Escape") {
        setPopup("");
        setMobile(false);
      }
    };
    const click = (e: MouseEvent) => {
      if (!headRef.current?.contains(e.target as Node)) setPopup("");
    };
    window.addEventListener("keydown", key);
    window.addEventListener("click", click);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("click", click);
    };
  }, []);

  const nav = (p: string) => {
    setMobile(false);
    setPopup("");
    setSearch(false);
    d.go(p);
  };
  const toggle = (v: string) => setPopup((n) => (n === v ? "" : v));

  const navContent = (
    <>
      <div className="sidebar-brand">
        <Link href="/overview" aria-label="Vesttara overview">
          <Brand />
        </Link>
        <button
          className="icon-btn mobile-close"
          onClick={() => setMobile(false)}
          aria-label="Close navigation"
        >
          <PanelLeftClose size={19} />
        </button>
      </div>
      <div className="sidebar-nav">
        {Array.from(new Set(items.map((i) => i.group))).map((group) => (
          <div className="nav-group" key={group}>
            <div className="nav-heading">{group}</div>
            {items
              .filter((x) => x.group === group)
              .map(({ path, name, icon: Icon }) => (
                <Link
                  className={`nav-link ${activePage === path ? "active" : ""}`}
                  aria-current={activePage === path ? "page" : undefined}
                  href={href(path)}
                  key={path}
                  onClick={() => setMobile(false)}
                >
                  <Icon size={18} strokeWidth={1.65} />
                  <span>{name}</span>
                  {path === "assistant" && <em className="ai-tag">AI</em>}
                  {activePage === path && <i className="active-dot" />}
                </Link>
              ))}
          </div>
        ))}
      </div>
      <div className="sidebar-bottom">
        <Link href="/platform" className="tour-card">
          <span className="tour-icon">
            <Compass size={20} strokeWidth={1.5} />
          </span>
          <span>
            <strong>Explore Vesttara</strong>
            <small>Platform tour & approach</small>
          </span>
          <ArrowUpRight size={13} />
        </Link>
        <Link className="switch-role" href="/login">
          <ArrowLeftRight size={16} />
          <span>Switch workspace</span>
          <ChevronRight size={13} />
        </Link>
      </div>
    </>
  );

  const hits = items.filter((i) =>
    i.name.toLowerCase().includes(query.toLowerCase()),
  );
  const people =
    d.role === "Client"
      ? []
      : d.clients
          .filter((c) =>
            `${c.name} ${c.household}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .slice(0, 4);

  const scopedMeetings = d.meetings.filter(
    (m) => d.role !== "Client" || m.clientId === d.selected,
  );

  return (
    <div className="workspace">
      <a className="skip" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">{navContent}</aside>
      {mobile && (
        <div className="drawer-backdrop" onClick={() => setMobile(false)}>
          <aside
            className="mobile-drawer"
            aria-label="Navigation"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </aside>
        </div>
      )}
      <div className="workspace-body">
        <header className="topbar" ref={headRef}>
          <div className="breadcrumb">
            <Layers3 size={15} />
            <span>Workspace</span>
            <b>/</b>
            <strong>{pageName}</strong>
          </div>
          <div className="mobile-brand">
            <Link href="/overview" aria-label="Vesttara overview">
              <Brand small />
            </Link>
          </div>
          <div className="topbar-tools">
            {d.isAdmin ? (
              <span className="admin-pill" title="Add, edit, and delete enabled across every page">
                <ShieldCheck size={12} />
                Admin control
              </span>
            ) : (
              <span className="demo-pill">
                <i />
                Demo mode
              </span>
            )}
            <div className="header-separator" />
            <button
              title="Search workspace (⌘K)"
              aria-label="Search workspace"
              className="icon-btn search-top"
              onClick={() => {
                setSearch(true);
                setQuery("");
              }}
            >
              <Search size={17} />
            </button>
            <button
              title="Toggle light and dark mode"
              aria-label={d.dark ? "Use light mode" : "Use dark mode"}
              className="icon-btn"
              onClick={() => d.setDark(!d.dark)}
            >
              {d.dark ? <Moon size={17} /> : <Sun size={18} />}
            </button>
            <div className="popover-wrap">
              <button
                className="icon-btn notification-btn"
                aria-label="Notifications"
                aria-expanded={popup === "notifications"}
                onClick={() => toggle("notifications")}
              >
                <Bell size={17} />
                {!d.notificationsRead && <i />}
              </button>
              {popup === "notifications" && (
                <div className="popover notification-pop">
                  <div className="popover-title">
                    <h3>Notifications</h3>
                    <button
                      className="text-btn"
                      onClick={() => d.setNotificationsRead(true)}
                    >
                      {d.notificationsRead ? (
                        <>
                          <Check size={13} /> All read
                        </>
                      ) : (
                        "Mark all read"
                      )}
                    </button>
                  </div>
                  <button
                    className="notification-item"
                    onClick={() => nav("documents")}
                  >
                    <FileText size={18} />
                    <span>
                      <strong>Quarterly report is ready</strong>
                      <small>Your June report is in Documents.</small>
                    </span>
                  </button>
                  <button
                    className="notification-item"
                    onClick={() => nav("calendar")}
                  >
                    <CalendarDays size={18} />
                    <span>
                      <strong>Upcoming portfolio review</strong>
                      <small>
                        {scopedMeetings[0]
                          ? `${displayDate(scopedMeetings[0].date)} · ${scopedMeetings[0].time}`
                          : "No upcoming reviews. Open the calendar to book."}
                      </small>
                    </span>
                  </button>
                </div>
              )}
            </div>
            <div className="header-separator profile-separator" />
            <div className="popover-wrap">
              <button
                className="profile-button"
                aria-label="Open profile menu"
                aria-expanded={popup === "profile"}
                onClick={() => toggle("profile")}
              >
                <Avatar name={d.profile.name} color={d.profile.color} />
                <span>
                  <strong>{d.profile.name}</strong>
                  <small>
                    {d.role === "Advisor"
                      ? "Wealth advisor"
                      : d.role === "Admin"
                        ? "Administrator"
                        : "Private client"}
                  </small>
                </span>
                <ChevronDown size={13} />
              </button>
              {popup === "profile" && (
                <div className="popover profile-pop">
                  <div className="profile-info">
                    <strong>{d.profile.name}</strong>
                    <small>{d.profile.email}</small>
                  </div>
                  <button onClick={() => nav("login")}>
                    <ArrowLeftRight size={16} />
                    Switch account
                  </button>
                  <button onClick={() => nav("platform")}>
                    <Compass size={16} />
                    Platform tour
                  </button>
                  <button
                    onClick={() => {
                      setPopup("");
                      d.signOut();
                    }}
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {children}
        </main>
        <Footer />
      </div>
      <nav className="bottom-tabs" aria-label="Mobile navigation">
        {[
          items[0],
          items[1],
          items.find(
            (x) => x.path === (d.role === "Client" ? "messages" : "crm"),
          )!,
          items.find((x) => x.path === "assistant")!,
        ].map(({ path, name, icon: Icon }) => (
          <Link
            key={path}
            href={href(path)}
            className={activePage === path ? "active" : ""}
          >
            <Icon size={19} />
            <span>
              {path === "crm"
                ? "CRM"
                : path === "assistant"
                  ? "Assistant"
                  : name}
            </span>
          </Link>
        ))}
        <button onClick={() => setMobile(true)} aria-label="More navigation">
          <Menu size={19} />
          <span>More</span>
        </button>
      </nav>
      {search && (
        <Modal title="Search workspace" onClose={() => setSearch(false)}>
          <div className="search-input">
            <Search size={17} />
            <input
              autoFocus
              placeholder="Find a page or household…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button aria-label="Clear search" onClick={() => setQuery("")}>
                <X size={15} />
              </button>
            )}
          </div>
          <div className="command-results">
            {hits.length > 0 && <p className="mini-label">PAGES</p>}
            {hits.map(({ path, name, icon: Icon }) => (
              <button key={path} onClick={() => nav(path)}>
                <Icon size={17} />
                {name}
                <ChevronRight size={14} />
              </button>
            ))}
            {people.length > 0 && <p className="mini-label">HOUSEHOLDS</p>}
            {people.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  d.setSelected(c.id);
                  nav("portfolios");
                }}
              >
                <Avatar name={c.name} small color={c.color} />
                {c.name}
                <ChevronRight size={14} />
              </button>
            ))}
            {!hits.length && !people.length && <Empty />}
          </div>
        </Modal>
      )}
    </div>
  );
}

export function Login() {
  const d = useDemo();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [filledRole, setFilledRole] = useState<Role | null>(null);
  const [error, setError] = useState("");
  const submitRef = useRef<HTMLButtonElement>(null);

  // Pull live default accounts for Admin/Advisor/Client so autofill still works
  // even after an Admin edits Robin/Adrian/John's credentials in-session.
  const presetFor = (role: Role) => {
    const base = demoCredentials[role];
    const match =
      d.users.find((u) => u.email.toLowerCase() === base.email.toLowerCase()) ??
      d.users.find((u) => u.role === role && u.status === "Active");
    return {
      role,
      name: match?.name ?? base.name,
      email: match?.email ?? base.email,
      password: match?.password ?? base.password,
      summary: base.summary,
    };
  };

  function autofill(role: Role) {
    const p = presetFor(role);
    setEmail(p.email);
    setPassword(p.password);
    setFilledRole(role);
    setError("");
    submitRef.current?.focus();
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = d.signInWithCredentials(email, password);
    if (!res.ok) {
      setError(res.error);
    }
  }

  const roleMeta: { role: Role; icon: LucideIcon; tag?: string }[] = [
    { role: "Admin", icon: ShieldCheck, tag: "Full edit" },
    { role: "Advisor", icon: BriefcaseBusiness },
    { role: "Client", icon: UsersRound },
  ];

  return (
    <div className="login-page">
      <header>
        <Brand />
        <div className="login-header-tools">
          <button
            title="Toggle light and dark mode"
            aria-label={d.dark ? "Use light mode" : "Use dark mode"}
            className="icon-btn"
            onClick={() => d.setDark(!d.dark)}
          >
            {d.dark ? <Moon size={17} /> : <Sun size={18} />}
          </button>
          <Link href="/platform" className="text-btn">
            Platform tour <ArrowUpRight size={15} />
          </Link>
        </div>
      </header>
      <main className="login-layout">
        <div className="login-intro">
          <WaveArtLocal />
          <div className="eyebrow">
            <span />
            VESTTARA DEMO
          </div>
          <h1>
            A considered approach
            <br />
            to wealth.
          </h1>
          <p>
            One connected workspace for advisors, administrators, and the
            families they serve. Autofill any demo account to sign in instantly.
          </p>
          <div className="login-credentials-box">
            <div className="login-cred-head">
              <KeyRound size={13} />
              <span>DEMO ACCOUNTS · ONE-CLICK AUTOFILL</span>
            </div>
            {roleMeta.map(({ role, icon: Icon, tag }) => {
              const p = presetFor(role);
              const isSelected = filledRole === role;
              return (
                <div
                  key={role}
                  className={`cred-row ${isSelected ? "is-filled" : ""}`}
                >
                  <span className="cred-icon">
                    <Icon size={16} />
                  </span>
                  <div className="cred-info">
                    <div className="cred-title">
                      <strong>{role}</strong>
                      {tag && <em>{tag}</em>}
                    </div>
                    <small>{p.email}</small>
                    <small className="cred-summary">{p.summary}</small>
                  </div>
                  <button
                    type="button"
                    className={`autofill-btn ${isSelected ? "filled" : ""}`}
                    aria-label={`Autofill ${role} login`}
                    onClick={() => autofill(role)}
                  >
                    {isSelected ? (
                      <>
                        <Check size={13} />
                        Filled
                      </>
                    ) : (
                      <>
                        <Wand2 size={13} />
                        Autofill
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="login-signature">
            <ShieldCheck size={16} /> Private by design. Yours by ownership.
          </div>
        </div>
        <div className="login-options">
          <div className="login-card">
            <div className="eyebrow">
              <span />
              SIGN IN TO WORKSPACE
            </div>
            <h2>Welcome back</h2>
            <p>
              Enter demo credentials below, or pick a role to autofill and sign
              in.
            </p>
            <div className="autofill-strip" role="group" aria-label="Autofill demo login">
              <span>Quick autofill:</span>
              {(["Admin", "Advisor", "Client"] as Role[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`autofill-chip ${filledRole === role ? "active" : ""}`}
                  onClick={() => autofill(role)}
                >
                  <Wand2 size={12} />
                  {role}
                </button>
              ))}
            </div>
            <form className="form-stack login-form" onSubmit={handleSubmit} noValidate>
              <div className="login-field">
                <label htmlFor="login-email">Email address</label>
                <div className="input-with-icon">
                  <Mail size={15} />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="robin.vale@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFilledRole(null);
                      setError("");
                    }}
                  />
                </div>
              </div>
              <div className="login-field">
                <label htmlFor="login-password">Password</label>
                <div className="input-with-icon">
                  <LockKeyhole size={15} />
                  <input
                    id="login-password"
                    name="password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter dummy password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFilledRole(null);
                      setError("");
                    }}
                  />
                  <button
                    type="button"
                    className="pwd-toggle"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    onClick={() => setShowPwd((s) => !s)}
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {filledRole && (
                <div className="autofill-banner" role="status">
                  <Check size={14} />
                  <span>
                    <strong>{filledRole}</strong> demo login autofilled
                    {filledRole === "Admin"
                      ? " — full add, edit & delete permissions."
                      : "."}
                  </span>
                </div>
              )}
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <button
                ref={submitRef}
                type="submit"
                className="btn primary login-submit"
              >
                Sign in to workspace
                <ArrowRight size={15} />
              </button>
            </form>
            <div className="login-divider">
              <span>Or enter directly</span>
            </div>
            <div className="quick-enter-grid">
              {(["Admin", "Advisor", "Client"] as Role[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  className="btn quick-enter-btn"
                  onClick={() => d.enter(role)}
                >
                  Enter as {role}
                </button>
              ))}
            </div>
            <div className="login-note">
              <BookOpen size={14} /> Fictional credentials only. Changes stay in
              this browser session and reset on refresh.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function WaveArtLocal() {
  return (
    <div className="login-orbits" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <i key={i} style={{ width: 130 + i * 28, height: 130 + i * 28 }} />
      ))}
    </div>
  );
}
