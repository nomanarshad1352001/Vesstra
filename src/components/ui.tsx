"use client";
import { initials } from "@data/demo";
import {
  ChevronDown,
  Layers3,
  SearchX,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { useDemo } from "./demo-context";

export function Brand({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`brand ${small ? "brand-small" : ""}`}
      aria-label="Vesttara Wealth Platform"
    >
      <svg viewBox="0 0 42 42" fill="none" aria-hidden="true">
        <path d="M2 5.5h9l11.2 25.7-4.4 9.5L2 5.5Z" fill="#b49a64" />
        <path d="M15 5.5h6.6l5.3 12.8-3.4 8L15 5.5Z" fill="#c9b78c" />
        <path d="m31.5 5.5 8.2-3.9L24.2 36l-4.4 6L31.5 5.5Z" fill="#9e8656" />
      </svg>
      <div>
        <span className="wordmark">Vesttara</span>
        {!small && <span className="brand-caption">WEALTH PLATFORM</span>}
      </div>
    </div>
  );
}

export function Avatar({
  name,
  color = "sage",
  small = false,
}: {
  name: string;
  color?: string;
  small?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`avatar ${color} ${small ? "avatar-small" : ""}`}
    >
      {initials(name)}
    </span>
  );
}

export function WaveArt({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`wave-art ${className}`}
      viewBox="0 0 400 200"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {Array.from({ length: 28 }, (_, i) => (
        <path
          key={i}
          d={`M ${-24 + i * 1.4} ${200 + i * 4} C ${40 + i * 2} ${168 + i * 3}, ${76 + i * 2.2} ${91 + i * 3}, ${145 + i} ${111 + i * 3.2} S ${219 + i * 1.6} ${166 + i * 4.6}, ${270 + i * 2} ${100 + i * 2} S 344 ${73 + i * 2.6}, 418 ${-8 + i * 3.2}`}
          stroke="currentColor"
          strokeWidth=".85"
        />
      ))}
    </svg>
  );
}

export function Heading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          <span />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="heading-actions">{children}</div>}
    </div>
  );
}

export function Modal({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      el?.close();
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      aria-label={title}
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="modal-head">
        <div>
          <div className="eyebrow">
            <span />
            VESTTARA WORKSPACE
          </div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button
          className="icon-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function ConfirmDelete({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} subtitle="Removed from this demo session only." onClose={onClose}>
      <p className="confirm-copy">{message}</p>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn danger-solid"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          <Trash2 size={14} />
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function Empty({
  title = "No results found",
  text = "Try a different search or change your filters.",
  icon: Icon = SearchX,
}: {
  title?: string;
  text?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="empty">
      <span>
        <Icon size={25} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <div className="tabs" aria-label="View selector">
      {items.map((v) => (
        <button
          key={v}
          aria-pressed={value === v}
          className={value === v ? "selected" : ""}
          onClick={() => onChange(v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

export function HouseholdSelect({
  all = true,
  value,
  onChange,
}: {
  all?: boolean;
  value?: string;
  onChange?: (s: string) => void;
}) {
  const d = useDemo();
  if (d.role === "Client") return null;
  const current = value ?? d.selected;
  return (
    <label className="select-wrap">
      <Layers3 size={15} />
      <select
        aria-label="Select household"
        value={current}
        onChange={(e) => (onChange ?? d.setSelected)(e.target.value)}
      >
        {all && <option value="all">All households</option>}
        {d.clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.household}
          </option>
        ))}
      </select>
      <ChevronDown size={13} />
    </label>
  );
}

export function Footer() {
  return (
    <footer className="app-footer">
      <span>
        <i />
        Demo only. Dummy data. Not investment advice.
      </span>
      <span>
        Vesttara <b>·</b> Wealth Platform
      </span>
    </footer>
  );
}

export function SectionHead({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {children}
    </div>
  );
}
