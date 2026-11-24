"use client";
import {
  displayDate,
  money,
  priceHistory,
  snapshot,
  type Account,
  type AllocationSlice,
  type Holding,
  type Transaction,
} from "@data/demo";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  FilePenLine,
  Landmark,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  UsersRound,
  Wallet,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDemo } from "./demo-context";
import {
  Avatar,
  ConfirmDelete,
  Empty,
  Heading,
  HouseholdSelect,
  Modal,
  SectionHead,
  Tabs,
  WaveArt,
} from "./ui";

const swatchPalette = [
  "#203c51",
  "#b8a16c",
  "#8fa99b",
  "#a7b6c6",
  "#dedbce",
  "#5a7d7c",
  "#7b6d8d",
  "#b5856c",
];

export function Metrics() {
  const d = useDemo();
  const c = d.clients.find((x) => x.id === d.selected);
  const value = c?.value ?? d.totalValue;
  const rate = c?.returns ?? d.avgReturn;
  const gain = rate === -100 ? 0 : value - value / (1 + rate / 100);
  const ac = d.accounts.filter((a) => !c || a.clientId === c.id);
  const Icon = c ? Landmark : UsersRound;
  return (
    <div className="metric-grid">
      <div className="metric metric-primary">
        <WaveArt />
        <div className="metric-top">
          <span className="metric-icon">
            <Wallet size={17} />
          </span>
          <span>{c ? "Total portfolio value" : "Assets under management"}</span>
          <button
            className="metric-drill"
            aria-label="View portfolio details"
            onClick={() => {
              d.setPortfolioTab("Holdings");
              d.go("portfolios");
            }}
          >
            <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="metric-value">{money(value)}</div>
        <div className="metric-foot">
          <span className="gain-pill dark-gain">
            <TrendingUp size={12} /> {rate.toFixed(2)}%
          </span>
          <span>vs. last year</span>
        </div>
      </div>
      <div className="metric">
        <div className="metric-top">
          <span className="metric-icon sage-icon">
            <TrendingUp size={18} />
          </span>
          <span>Total investment gain</span>
        </div>
        <div className="metric-value">
          {gain >= 0 ? "+" : "−"}
          {money(Math.abs(gain))}
        </div>
        <div className="metric-foot">
          <span className={rate >= 0 ? "positive" : "negative"}>
            <ArrowUpRight size={13} /> {rate.toFixed(2)}%
          </span>
          <span>total return</span>
        </div>
        <svg className="sparkline" viewBox="0 0 88 33" aria-hidden="true">
          <defs>
            <linearGradient id="spark-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6ea481" stopOpacity=".18" />
              <stop offset="100%" stopColor="#6ea481" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 28 6 25 11 26 17 22 23 24 28 18 32 21 38 18 44 19 51 12 57 15 62 9 67 11 73 6 78 8 87 2V33H0Z"
            fill="url(#spark-gradient)"
          />
          <path
            d="m0 28 6-3 5 1 6-4 6 2 5-6 4 3 6-3 6 1 7-7 6 3 5-6 5 2 6-5 5 2 9-6"
            fill="none"
            stroke="#6a987e"
            strokeWidth="1.8"
          />
        </svg>
      </div>
      <div className="metric household-metric">
        <div className="metric-top">
          <span className="metric-icon gold-icon">
            <Icon size={17} />
          </span>
          <span>{c ? "Connected accounts" : "Client households"}</span>
        </div>
        <div className="household-count">
          <div className="metric-value">{c ? ac.length : d.clients.length}</div>
          <span className="status active-status">
            <i />
            Active
          </span>
        </div>
        <div className="metric-foot">
          <span>
            {c
              ? "One consolidated portfolio"
              : `Across ${d.accounts.length} managed accounts`}
          </span>
        </div>
        {!c && d.clients.length > 0 && (
          <div className="avatar-stack">
            {d.clients.slice(0, 3).map((x) => (
              <Avatar key={x.id} name={x.name} color={x.color} small />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Performance({
  value,
  annualReturn,
}: {
  value: number;
  annualReturn: number;
}) {
  const safeVal = Math.max(0, value);
  const opening = safeVal / (1 + annualReturn / 100);
  const [range, setRange] = useState("1Y");
  const id = useId().replaceAll(":", "");
  const data = useMemo(
    () =>
      priceHistory
        .slice(-({ "1M": 12, "3M": 36, "6M": 72, "1Y": 144 }[range] ?? 144))
        .map((p, i) => ({
          ...p,
          x: i,
          value: Math.round(opening * (1 + ((p.value - 1) * annualReturn) / 12.84)),
          benchmark: Math.round(opening * p.benchmark),
        })),
    [range, opening, annualReturn],
  );
  const ticks =
    range === "1Y"
      ? Array.from({ length: 12 }, (_, i) => i * 12 + 5)
      : range === "1M"
        ? [0, 3, 6, 9, 11]
        : range === "3M"
          ? [0, 6, 12, 18, 24, 30, 35]
          : [0, 12, 24, 36, 48, 60, 71];
  const low = Math.min(...data.map((p) => Math.min(p.value, p.benchmark)));
  const high = Math.max(...data.map((p) => Math.max(p.value, p.benchmark)));
  const span = Math.max(1000, high - low);
  const roughStep = Math.max(1, span / 4);
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const step =
    ([1, 2, 2.5, 5, 10].find((n) => n * magnitude >= roughStep) ?? 10) *
    magnitude;
  const min = Math.max(0, Math.floor(low / step) * step);
  const max = Math.max(min + step, Math.ceil(high / step) * step);
  const yTicks = Array.from(
    { length: Math.min(8, Math.round((max - min) / step) + 1) },
    (_, i) => min + i * step,
  );
  return (
    <section className="panel performance-card">
      <SectionHead title="Portfolio performance">
        <div className="range-tabs">
          {["1M", "3M", "6M", "1Y"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={r === range ? "selected" : ""}
              aria-pressed={r === range}
            >
              {r}
            </button>
          ))}
        </div>
      </SectionHead>
      <div className="chart-legend">
        <span>
          <i />
          Portfolio value
        </span>
        <span>
          <i />
          Benchmark
        </span>
      </div>
      <div
        className="performance-chart"
        role="img"
        aria-label={`Simulated portfolio and benchmark performance over ${range}, ending at ${money(safeVal)}`}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          initialDimension={{ width: 600, height: 181 }}
        >
          <ComposedChart
            data={data}
            margin={{ top: 9, right: 7, bottom: 0, left: -7 }}
          >
            <defs>
              <linearGradient id={`area${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#72958c" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#92ada3" stopOpacity={0.025} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--chart-grid)"
              strokeDasharray="3 4"
            />
            <XAxis
              dataKey="x"
              ticks={ticks}
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(n) =>
                range === "1M"
                  ? `Jun ${data[n]?.day ?? ""}`
                  : range === "3M"
                    ? `${data[n]?.month} ${data[n]?.day}`
                    : (data[n]?.month ?? "")
              }
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              tick={{ fontSize: 10, fill: "var(--muted)" }}
              height={29}
            />
            <YAxis
              domain={[min, max]}
              ticks={yTicks}
              tickFormatter={(n) =>
                n >= 1e6
                  ? `$${Number((n / 1e6).toFixed(2))}M`
                  : `$${Math.round(n / 1000)}K`
              }
              tickLine={false}
              axisLine={false}
              width={49}
              tickMargin={8}
              tick={{ fontSize: 10, fill: "var(--muted)" }}
            />
            <Tooltip
              labelFormatter={(n) => data[Number(n)]?.label ?? ""}
              formatter={(v, name) => [
                money(Number(v)),
                name === "value" ? "Portfolio" : "Benchmark",
              ]}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: 11,
                boxShadow: "0 4px 18px #10243310",
              }}
              labelStyle={{ color: "var(--muted)", marginBottom: 4 }}
            />
            <Area
              type="linear"
              dataKey="value"
              stroke="var(--chart-line)"
              strokeWidth={2.15}
              fill={`url(#area${id})`}
              isAnimationActive={false}
              activeDot={{
                r: 4,
                fill: "#ad955e",
                stroke: "white",
                strokeWidth: 2,
              }}
            />
            <Line
              type="linear"
              dataKey="benchmark"
              stroke="#b49a62"
              strokeWidth={1.65}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-caption">
        <span className="live-dot" /> Historical performance <b>·</b>{" "}
        {range === "1Y"
          ? "Jul 2024 – Jun 2025"
          : range === "6M"
            ? "Jan – Jun 2025"
            : range === "3M"
              ? "Apr – Jun 2025"
              : "Jun 2025"}
      </div>
    </section>
  );
}

function Allocation({ value }: { value: number }) {
  const d = useDemo();
  const [details, setDetails] = useState(false);
  const [editing, setEditing] = useState<AllocationSlice | "new" | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const totalPct = d.allocation.reduce((s, a) => s + a.pct, 0);
  const hovered = active !== null ? d.allocation[active] : undefined;

  return (
    <section className="panel allocation-card">
      <SectionHead title="Asset allocation">
        <button
          className="icon-btn quiet-icon"
          aria-label="View asset allocation details"
          onClick={() => setDetails(true)}
        >
          <Ellipsis size={19} />
        </button>
      </SectionHead>
      <div className="allocation-content">
        <div className="donut-wrap">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            initialDimension={{ width: 156, height: 156 }}
          >
            <PieChart>
              <Pie
                data={d.allocation}
                dataKey="pct"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="98%"
                innerRadius="67%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={1.5}
                stroke="none"
                isAnimationActive={false}
                onMouseLeave={() => setActive(null)}
                onMouseEnter={(_, i) => setActive(i)}
              >
                {d.allocation.map((a, i) => (
                  <Cell
                    key={a.id}
                    fill={a.color}
                    opacity={active === null || active === i ? 1 : 0.7}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <strong>
              {hovered ? hovered.pct : totalPct}
              <small>%</small>
            </strong>
            <span>
              {hovered ? hovered.name.toUpperCase() : "ALLOCATED"}
            </span>
          </div>
        </div>
        <div className="allocation-legend">
          {d.allocation.map((a, i) => (
            <button
              key={a.id}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => setDetails(true)}
            >
              <i style={{ background: a.color }} />
              <span>{a.name}</span>
              <strong>{a.pct}%</strong>
            </button>
          ))}
        </div>
      </div>
      <div className="allocation-foot">
        <span>
          <ShieldCheck size={14} />
        </span>{" "}
        Diversified across {d.allocation.length} asset{" "}
        {d.allocation.length === 1 ? "class" : "classes"}
      </div>
      {details && (
        <Modal
          title="Allocation breakdown"
          subtitle={
            d.isAdmin
              ? "Add, edit, or delete asset class weights across this session."
              : "Illustrative market value by asset class."
          }
          onClose={() => {
            setDetails(false);
            setEditing(null);
          }}
        >
          {d.allocation.map((a) => (
            <div className="detail-row" key={a.id}>
              <span>
                <i className="color-dot" style={{ background: a.color }} />
                {a.name} · {a.pct}%
              </span>
              <div className="row-actions">
                <strong>{money((value * a.pct) / 100)}</strong>
                {d.isAdmin && (
                  <>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Edit allocation ${a.name}`}
                      onClick={() => setEditing(a)}
                    >
                      <FilePenLine size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn danger-icon"
                      aria-label={`Delete allocation ${a.name}`}
                      onClick={() => {
                        d.setAllocation((p) => p.filter((x) => x.id !== a.id));
                        setActive(null);
                        d.log("Delete", `Removed allocation class: ${a.name}`);
                        d.notify(`${a.name} removed from allocation`);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          <div className="detail-row total">
            <span>Total portfolio ({totalPct}%)</span>
            <strong>{money(value)}</strong>
          </div>
          {d.isAdmin && !editing && (
            <button
              type="button"
              className="btn primary full-width"
              onClick={() => setEditing("new")}
            >
              <Plus size={14} />
              Add asset class
            </button>
          )}
          {d.isAdmin && editing && (
            <form
              className="form-stack inline-subform"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const name = String(fd.get("name")).trim();
                const pct = Math.max(0, Math.min(100, Number(fd.get("pct")) || 0));
                const color = String(fd.get("color")) || "#203c51";
                if (!name) return;
                if (editing === "new") {
                  d.setAllocation((p) => [
                    ...p,
                    { id: crypto.randomUUID(), name, pct, color },
                  ]);
                  d.log("Edit", `Added asset class: ${name} (${pct}%)`);
                  d.notify(`Added ${name} allocation`);
                } else {
                  d.setAllocation((p) =>
                    p.map((x) =>
                      x.id === editing.id ? { ...x, name, pct, color } : x,
                    ),
                  );
                  d.log("Edit", `Updated asset class: ${name} (${pct}%)`);
                  d.notify(`Updated ${name} allocation`);
                }
                setEditing(null);
              }}
            >
              <p className="mini-label">
                {editing === "new" ? "NEW ASSET CLASS" : `EDIT ${editing.name.toUpperCase()}`}
              </p>
              <div className="form-two">
                <label>
                  Asset class
                  <input
                    required
                    name="name"
                    maxLength={40}
                    defaultValue={editing === "new" ? "" : editing.name}
                    placeholder="e.g. Private credit"
                  />
                </label>
                <label>
                  Allocation (%)
                  <input
                    required
                    type="number"
                    name="pct"
                    min="0"
                    max="100"
                    step="1"
                    defaultValue={editing === "new" ? 5 : editing.pct}
                  />
                </label>
              </div>
              <label>
                Color
                <select
                  name="color"
                  defaultValue={
                    editing === "new"
                      ? swatchPalette[d.allocation.length % swatchPalette.length]
                      : editing.color
                  }
                >
                  {[
                    ["#203c51", "Deep navy"],
                    ["#b8a16c", "Muted gold"],
                    ["#8fa99b", "Soft sage"],
                    ["#a7b6c6", "Slate blue"],
                    ["#dedbce", "Warm stone"],
                    ["#5a7d7c", "Harbor teal"],
                    ["#7b6d8d", "Plum slate"],
                    ["#b5856c", "Muted bronze"],
                  ].map(([hex, label]) => (
                    <option key={hex} value={hex}>
                      {label}
                    </option>
                  ))}
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
                  {editing === "new" ? "Add slice" : "Save slice"}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </section>
  );
}

export function Charts() {
  const d = useDemo();
  const household = d.clients.find((c) => c.id === d.selected);
  const v = household?.value ?? d.totalValue;
  return (
    <div className="analytics-grid">
      <Performance value={v} annualReturn={household?.returns ?? d.avgReturn} />
      <Allocation value={v} />
    </div>
  );
}

function Briefing() {
  const d = useDemo();
  const inScope = (record: { clientId: string }) =>
    d.selected === "all" || record.clientId === d.selected;
  const open = d.tasks.filter((t) => !t.done && inScope(t)).length;
  const reviews = d.meetings.filter(inScope).length;
  return (
    <section className="briefing-card">
      <div className="brief-orbits" aria-hidden="true">
        {Array.from({ length: 13 }, (_, i) => (
          <i key={i} style={{ width: 48 + i * 13, height: 48 + i * 13 }} />
        ))}
        <Sparkles size={31} strokeWidth={1} />
      </div>
      <div className="brief-label">
        <Sparkles size={14} /> VESTTARA INTELLIGENCE
      </div>
      <h2>Your daily briefing</h2>
      <p>
        {d.role === "Client"
          ? `Your household has ${reviews} upcoming ${reviews === 1 ? "review" : "reviews"}. Explore your balances and prepare for your next conversation.`
          : `You have ${open} open ${open === 1 ? "task" : "tasks"} and ${reviews} upcoming ${reviews === 1 ? "review" : "reviews"}. Get a focused summary of your next steps.`}
      </p>
      <button onClick={() => d.go("assistant")}>
        Ask the assistant <ArrowRight size={15} />
      </button>
      <div className="brief-bottom">
        <i /> Powered by demo intelligence
      </div>
    </section>
  );
}

function HouseholdTable() {
  const d = useDemo();
  const visible = d.clients
    .filter((c) => d.selected === "all" || d.selected === c.id)
    .slice(0, 4);
  return (
    <section className="panel household-panel">
      <SectionHead
        title={
          d.selected === "all" ? "Household portfolios" : "Household portfolio"
        }
      >
        <div className="row-actions">
          {d.isAdmin && (
            <button
              className="icon-btn"
              aria-label="Add household"
              title="Add household"
              onClick={() => d.setDialog({ kind: "client" })}
            >
              <Plus size={15} />
            </button>
          )}
          <button
            className="text-btn"
            onClick={() => {
              d.setCrmTab("Households");
              d.go("crm");
            }}
          >
            View all <ArrowUpRight size={13} />
          </button>
        </div>
      </SectionHead>
      {visible.length ? (
        <div className="table-wrap">
          <table className="portfolio-mini">
            <thead>
              <tr>
                <th>Household</th>
                <th>Portfolio value</th>
                <th>1Y return</th>
                <th aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id}>
                  <td>
                    <button
                      className="person-cell"
                      onClick={() => {
                        d.setSelected(c.id);
                        d.go("portfolios");
                      }}
                    >
                      <Avatar name={c.name} color={c.color} />
                      <span>
                        <strong>{c.name}</strong>
                        <small>
                          {d.accounts.filter((a) => a.clientId === c.id).length}{" "}
                          accounts
                        </small>
                      </span>
                    </button>
                  </td>
                  <td className="number">{money(c.value)}</td>
                  <td>
                    <span className="return-text">
                      <ArrowUpRight size={12} />
                      {c.returns.toFixed(2)}%
                    </span>
                  </td>
                  <td>
                    <button
                      className="row-open"
                      onClick={() => {
                        d.setSelected(c.id);
                        d.go("portfolios");
                      }}
                      aria-label={`Open ${c.name}'s portfolio`}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title="No households yet"
          text="Use + to add your first household."
        />
      )}
    </section>
  );
}

export function Dashboard() {
  const d = useDemo();
  const isClient = d.role === "Client";
  const cs = d.clients.find((c) => c.id === d.selected);
  return (
    <>
      <Heading
        eyebrow={
          isClient
            ? "PRIVATE CLIENT WORKSPACE"
            : `${d.role.toUpperCase()} WORKSPACE`
        }
        title={isClient ? "Your wealth overview" : "Portfolio overview"}
        description={
          isClient
            ? "Your complete financial picture, in one place."
            : d.isAdmin
              ? "Full administrator mode — add, edit, or delete records in every module."
              : "A consolidated view of your practice, portfolios, and priorities."
        }
      >
        <div className="date-label">
          <CalendarDays size={15} />
          Jun 30, 2025
        </div>
        <HouseholdSelect />
      </Heading>
      <Metrics />
      <Charts />
      <div className="lower-grid">
        {isClient ? (
          <section className="panel">
            <SectionHead title="Your accounts">
              <button
                className="text-btn"
                onClick={() => {
                  d.setPortfolioTab("Accounts");
                  d.go("portfolios");
                }}
              >
                View all <ArrowUpRight size={13} />
              </button>
            </SectionHead>
            <div className="padded">
              {d.accounts
                .filter((a) => a.clientId === d.selected)
                .map((a) => (
                  <div className="detail-row" key={a.id}>
                    <span>
                      <Landmark size={16} />
                      {a.type} <small>••{a.last4}</small>
                    </span>
                    <strong>{money(a.balance)}</strong>
                  </div>
                ))}
            </div>
          </section>
        ) : (
          <HouseholdTable />
        )}
        <Briefing />
      </div>
      <div className="lower-grid">
        <section className="panel">
          <SectionHead
            title={isClient ? "Recent transactions" : "Today’s priorities"}
          >
            <div className="row-actions">
              {d.isAdmin && (
                <button
                  className="icon-btn"
                  aria-label="Add task"
                  title="Add task"
                  onClick={() => d.setDialog({ kind: "task" })}
                >
                  <Plus size={15} />
                </button>
              )}
              <button
                className="text-btn"
                onClick={() => {
                  if (isClient) {
                    d.setPortfolioTab("Transactions");
                    d.go("portfolios");
                  } else {
                    d.setCrmTab("Tasks");
                    d.go("crm");
                  }
                }}
              >
                View all <ArrowUpRight size={13} />
              </button>
            </div>
          </SectionHead>
          <div className="padded">
            {isClient
              ? d.transactions
                  .filter((t) => t.clientId === d.selected)
                  .slice(0, 3)
                  .map((t) => (
                    <div className="detail-row" key={t.id}>
                      <span>{t.description}</span>
                      <strong>{money(t.amount, 2)}</strong>
                    </div>
                  ))
              : d.tasks
                  .filter((t) => !cs || t.clientId === cs.id)
                  .slice(0, 3)
                  .map((t) => (
                    <label
                      className={`task-line ${t.done ? "done" : ""}`}
                      key={t.id}
                    >
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() =>
                          d.setTasks((s) =>
                            s.map((x) =>
                              x.id === t.id ? { ...x, done: !x.done } : x,
                            ),
                          )
                        }
                      />
                      <span>
                        <strong>{t.title}</strong>
                        <small>{displayDate(t.due)}</small>
                      </span>
                      <span
                        className={`status ${t.priority === "High" ? "sand" : "neutral"}`}
                      >
                        {t.priority}
                      </span>
                    </label>
                  ))}
            {!isClient && !d.tasks.some((t) => !cs || t.clientId === cs.id) && (
              <Empty
                title="A clear task list"
                text="No tasks for this household."
              />
            )}
          </div>
        </section>
        <section className="panel">
          <SectionHead title="Upcoming meetings">
            <button
              className="icon-btn"
              aria-label="Book a meeting"
              onClick={() => d.setDialog({ kind: "meeting" })}
            >
              <Plus size={16} />
            </button>
          </SectionHead>
          <div className="padded">
            {d.meetings
              .filter((m) => !cs || m.clientId === cs.id)
              .slice(0, 2)
              .map((m) => (
                <button
                  className="meeting-preview"
                  onClick={() => d.go("calendar")}
                  key={m.id}
                >
                  <span className="date-tile">
                    <small>
                      {new Date(m.date + "T12:00:00").toLocaleString("en-US", {
                        month: "short",
                      })}
                    </small>
                    <b>{Number(m.date.slice(-2))}</b>
                  </span>
                  <span>
                    <strong>{m.title}</strong>
                    <small>
                      {m.time} · {m.kind}
                    </small>
                  </span>
                </button>
              ))}
            {!d.meetings.some((m) => !cs || m.clientId === cs.id) && (
              <Empty
                title="No upcoming meetings"
                text="Use + to schedule a review."
              />
            )}
          </div>
        </section>
      </div>
    </>
  );
}

type PortfolioDelete =
  | { kind: "holding"; item: Holding }
  | { kind: "account"; item: Account }
  | { kind: "transaction"; item: Transaction };

export function Portfolios() {
  const d = useDemo();
  const [search, setSearch] = useState("");
  const [pg, setPg] = useState(0);
  const [holdingModal, setHoldingModal] = useState<Holding | "new" | null>(
    null,
  );
  const [accountModal, setAccountModal] = useState<Account | "new" | null>(
    null,
  );
  const [txModal, setTxModal] = useState<Transaction | "new" | null>(null);
  const [deleting, setDeleting] = useState<PortfolioDelete | null>(null);

  const c = d.clients.find((x) => x.id === d.selected);
  const val = c?.value ?? d.totalValue;
  const ac = d.accounts.filter((a) => !c || a.clientId === c.id);
  const tx = d.transactions.filter(
    (t) =>
      (!c || t.clientId === c.id) &&
      `${t.type} ${t.id} ${t.date} ${t.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const h = d.holdings.filter((item) =>
    `${item.symbol} ${item.name} ${item.asset}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const accountRows = ac.filter((a) =>
    `${a.type} ${a.last4} ${a.custodian} ${d.clients.find((x) => x.id === a.clientId)?.name ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const page = Math.min(pg, Math.max(0, Math.ceil(tx.length / 10) - 1));
  const tab = d.portfolioTab;

  function exportCsv() {
    const rows =
      tab === "Holdings"
        ? [
            ["Symbol", "Holding", "Weight", "Value"],
            ...h.map((item) => [
              item.symbol,
              item.name,
              item.weight,
              Math.round((val * item.weight) / 100),
            ]),
          ]
        : tab === "Accounts"
          ? [
              ["Account", "Last 4", "Balance"],
              ...accountRows.map((a) => [a.type, a.last4, a.balance]),
            ]
          : [
              ["Date", "Transaction", "Type", "Amount"],
              ...tx.map((t) => [t.date, t.id, t.type, t.amount]),
            ];
    const url = URL.createObjectURL(
      new Blob(
        [
          rows
            .map((r) =>
              r
                .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
                .join(","),
            )
            .join("\n"),
        ],
        { type: "text/csv;charset=utf-8;" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `vesttara-demo-${tab.toLowerCase()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    d.notify("Demo export downloaded");
  }

  function handleConfirmDelete(target: PortfolioDelete) {
    if (target.kind === "holding") {
      d.setHoldings((p) => p.filter((x) => x.id !== target.item.id));
      d.log("Delete", `Deleted holding: ${target.item.symbol}`);
      d.notify(`${target.item.symbol} deleted`);
    } else if (target.kind === "account") {
      const next = d.accounts.filter((x) => x.id !== target.item.id);
      d.setAccounts(next);
      d.syncClientTotals(next, [target.item.clientId]);
      d.log(
        "Delete",
        `Deleted account: ${target.item.type} (••${target.item.last4})`,
      );
      d.notify("Account deleted and totals updated");
    } else {
      d.setTransactions((p) => p.filter((x) => x.id !== target.item.id));
      d.log("Delete", `Deleted transaction: ${target.item.id}`);
      d.notify("Transaction deleted");
    }
  }

  return (
    <>
      <Heading
        eyebrow="PORTFOLIO WORKSPACE"
        title={c ? c.household : "Investment portfolios"}
        description={
          c
            ? `${c.name} · ${c.risk} profile · Client since ${c.joined}`
            : d.isAdmin
              ? "Add, edit, or delete holdings, managed accounts, allocations, and transactions."
              : "Review consolidated positions, accounts, and portfolio activity."
        }
      >
        <HouseholdSelect />
        <button className="btn" onClick={exportCsv}>
          <ArrowDownToLine size={15} />
          Export {tab.toLowerCase()}
        </button>
      </Heading>
      <Metrics />
      <Charts />
      <section className="panel">
        <div className="list-toolbar">
          <Tabs
            items={["Holdings", "Accounts", "Transactions"]}
            value={tab}
            onChange={(s) => {
              d.setPortfolioTab(s);
              setSearch("");
              setPg(0);
            }}
          />
          <div className="toolbar-right">
            <div className="search-input compact-search">
              <Search size={15} />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPg(0);
                }}
                placeholder={`Search ${tab.toLowerCase()}…`}
                aria-label={`Search ${tab}`}
              />
            </div>
            {d.isAdmin && tab === "Holdings" && (
              <button
                className="btn primary"
                onClick={() => setHoldingModal("new")}
              >
                <Plus size={14} />
                Add holding
              </button>
            )}
            {d.isAdmin && tab === "Accounts" && (
              <button
                className="btn primary"
                onClick={() => setAccountModal("new")}
              >
                <Plus size={14} />
                Add account
              </button>
            )}
            {d.isAdmin && tab === "Transactions" && (
              <button
                className="btn primary"
                onClick={() => setTxModal("new")}
              >
                <Plus size={14} />
                Add transaction
              </button>
            )}
          </div>
        </div>
        {tab === "Holdings" ? (
          h.length ? (
            <div className="table-wrap">
              <table className="responsive-table">
                <thead>
                  <tr>
                    {[
                      "Holding",
                      "Asset class",
                      "Portfolio weight",
                      "Market value",
                      "Day change",
                      ...(d.isAdmin ? [""] : []),
                    ].map((t, i) => (
                      <th key={i}>{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {h.map((x) => (
                    <tr key={x.id}>
                      <td data-label="Holding">
                        <div className="table-title">
                          <b className="ticker">{x.symbol}</b>
                          <strong>{x.name}</strong>
                        </div>
                      </td>
                      <td data-label="Asset class">{x.asset}</td>
                      <td data-label="Weight">{x.weight}%</td>
                      <td data-label="Value" className="number">
                        {money((val * x.weight) / 100)}
                      </td>
                      <td
                        data-label="Day change"
                        className={x.change < 0 ? "negative" : "positive"}
                      >
                        {x.change > 0 ? "+" : ""}
                        {x.change.toFixed(2)}%
                      </td>
                      {d.isAdmin && (
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-btn"
                              aria-label={`Edit holding ${x.symbol}`}
                              onClick={() => setHoldingModal(x)}
                            >
                              <FilePenLine size={15} />
                            </button>
                            <button
                              className="icon-btn danger-icon"
                              aria-label={`Delete holding ${x.symbol}`}
                              onClick={() =>
                                setDeleting({ kind: "holding", item: x })
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty />
          )
        ) : tab === "Accounts" ? (
          accountRows.length ? (
            <div className="account-grid">
              {accountRows.map((a) => (
                <article className="account-card" key={a.id}>
                  <div className="account-card-head">
                    <span className="metric-icon gold-icon">
                      <Landmark size={18} />
                    </span>
                    {d.isAdmin && (
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          aria-label={`Edit account ${a.type} ${a.last4}`}
                          onClick={() => setAccountModal(a)}
                        >
                          <FilePenLine size={14} />
                        </button>
                        <button
                          className="icon-btn danger-icon"
                          aria-label={`Delete account ${a.type} ${a.last4}`}
                          onClick={() =>
                            setDeleting({ kind: "account", item: a })
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <small>
                    {d.clients.find((x) => x.id === a.clientId)?.name ??
                      "Household"}
                  </small>
                  <h3>{a.type}</h3>
                  <p>
                    {a.custodian} · ••{a.last4}
                  </p>
                  <strong>{money(a.balance)}</strong>
                </article>
              ))}
            </div>
          ) : (
            <Empty />
          )
        ) : tx.length ? (
          <>
            <div className="table-wrap">
              <table className="responsive-table">
                <thead>
                  <tr>
                    {[
                      "Activity",
                      "Date",
                      "Account",
                      "Type",
                      "Amount",
                      ...(d.isAdmin ? [""] : []),
                    ].map((t, i) => (
                      <th key={i}>{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tx.slice(page * 10, page * 10 + 10).map((t) => {
                    const last4 = d.accounts.find(
                      (a) => a.id === t.accountId,
                    )?.last4;
                    return (
                      <tr key={t.id}>
                        <td data-label="Activity">
                          <strong>{t.description}</strong>
                          <small className="block-muted">{t.id}</small>
                        </td>
                        <td data-label="Date">{displayDate(t.date)}</td>
                        <td data-label="Account">
                          {last4 ? `••${last4}` : "—"}
                        </td>
                        <td data-label="Type">
                          <span className="status neutral">{t.type}</span>
                        </td>
                        <td data-label="Amount" className="number">
                          {t.type === "Purchase" || t.type === "Distribution"
                            ? "−"
                            : "+"}
                          {money(t.amount, 2)}
                        </td>
                        {d.isAdmin && (
                          <td>
                            <div className="row-actions">
                              <button
                                className="icon-btn"
                                aria-label={`Edit transaction ${t.id}`}
                                onClick={() => setTxModal(t)}
                              >
                                <FilePenLine size={15} />
                              </button>
                              <button
                                className="icon-btn danger-icon"
                                aria-label={`Delete transaction ${t.id}`}
                                onClick={() =>
                                  setDeleting({ kind: "transaction", item: t })
                                }
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>
                {page * 10 + 1}–{Math.min(page * 10 + 10, tx.length)} of{" "}
                {tx.length} transactions
              </span>
              <button
                className="icon-btn"
                aria-label="Previous transaction page"
                disabled={!page}
                onClick={() => setPg(page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="icon-btn"
                aria-label="Next transaction page"
                disabled={(page + 1) * 10 >= tx.length}
                onClick={() => setPg(page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <Empty />
        )}
      </section>

      {holdingModal && (
        <Modal
          title={holdingModal === "new" ? "Add holding" : "Edit holding"}
          subtitle="Saved to this demo session only."
          onClose={() => setHoldingModal(null)}
        >
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const symbol = String(fd.get("symbol")).trim().toUpperCase();
              const name = String(fd.get("name")).trim();
              const asset = String(fd.get("asset")).trim();
              const weight = Math.max(0, Math.min(100, Number(fd.get("weight")) || 0));
              const change = Number(fd.get("change")) || 0;
              if (!symbol || !name) return;
              if (holdingModal === "new") {
                d.setHoldings((p) => [
                  { id: crypto.randomUUID(), symbol, name, asset, weight, change },
                  ...p,
                ]);
                d.log("Edit", `Added holding: ${symbol} (${name})`);
                d.notify(`${symbol} added to holdings`);
              } else {
                d.setHoldings((p) =>
                  p.map((x) =>
                    x.id === holdingModal.id
                      ? { ...x, symbol, name, asset, weight, change }
                      : x,
                  ),
                );
                d.log("Edit", `Updated holding: ${symbol}`);
                d.notify(`${symbol} updated`);
              }
              setHoldingModal(null);
            }}
          >
            <div className="form-two">
              <label>
                Ticker symbol
                <input
                  autoFocus
                  required
                  name="symbol"
                  maxLength={10}
                  defaultValue={
                    holdingModal === "new" ? "" : holdingModal.symbol
                  }
                  placeholder="e.g. VTI"
                />
              </label>
              <label>
                Asset class
                <select
                  name="asset"
                  defaultValue={
                    holdingModal === "new"
                      ? (d.allocation[0]?.name ?? "U.S. equities")
                      : holdingModal.asset
                  }
                >
                  {Array.from(
                    new Set([
                      ...d.allocation.map((a) => a.name),
                      "U.S. equities",
                      "Fixed income",
                      "Int’l equities",
                      "Alternatives",
                      "Cash",
                    ]),
                  ).map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Holding name
              <input
                required
                name="name"
                maxLength={100}
                defaultValue={holdingModal === "new" ? "" : holdingModal.name}
                placeholder="e.g. Vesttara Dividend Index Fund"
              />
            </label>
            <div className="form-two">
              <label>
                Portfolio weight (%)
                <input
                  required
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  name="weight"
                  defaultValue={holdingModal === "new" ? 5 : holdingModal.weight}
                />
              </label>
              <label>
                Day change (%)
                <input
                  required
                  type="number"
                  step="0.01"
                  min="-50"
                  max="50"
                  name="change"
                  defaultValue={
                    holdingModal === "new" ? 0.85 : holdingModal.change
                  }
                />
              </label>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setHoldingModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary">
                <Check size={14} />
                {holdingModal === "new" ? "Add holding" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {accountModal && (
        <Modal
          title={accountModal === "new" ? "Add account" : "Edit account"}
          subtitle="Recalculates the linked household balance and overall AUM."
          onClose={() => setAccountModal(null)}
        >
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const clientId = String(fd.get("clientId"));
              const type = String(fd.get("type")).trim();
              const custodian = String(fd.get("custodian")).trim();
              const last4 = String(fd.get("last4")).trim().slice(0, 4) || "0000";
              const balance = Math.max(0, Math.round(Number(fd.get("balance")) || 0));
              if (!type || !custodian || !clientId) return;
              if (accountModal === "new") {
                const created: Account = {
                  id: `acc-${crypto.randomUUID().slice(0, 6)}`,
                  clientId,
                  type,
                  custodian,
                  last4,
                  balance,
                };
                const next = [created, ...d.accounts];
                d.setAccounts(next);
                d.syncClientTotals(next, [clientId]);
                d.log("Edit", `Added account: ${type} (••${last4})`);
                d.notify("Account added and AUM updated");
              } else {
                const prevClient = accountModal.clientId;
                const next = d.accounts.map((a) =>
                  a.id === accountModal.id
                    ? { ...a, clientId, type, custodian, last4, balance }
                    : a,
                );
                d.setAccounts(next);
                d.syncClientTotals(next, [prevClient, clientId]);
                d.log("Edit", `Updated account: ${type} (••${last4})`);
                d.notify("Account updated and AUM recalculated");
              }
              setAccountModal(null);
            }}
          >
            <label>
              Household
              <select
                name="clientId"
                defaultValue={
                  accountModal === "new"
                    ? (c?.id ?? d.clients[0]?.id ?? "c1")
                    : accountModal.clientId
                }
              >
                {d.clients.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.name} · {cl.household}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-two">
              <label>
                Account type
                <input
                  required
                  name="type"
                  maxLength={60}
                  defaultValue={
                    accountModal === "new" ? "Roth IRA" : accountModal.type
                  }
                  placeholder="Traditional IRA, 401(k), Trust…"
                />
              </label>
              <label>
                Last 4 digits
                <input
                  required
                  name="last4"
                  maxLength={4}
                  defaultValue={
                    accountModal === "new" ? "8420" : accountModal.last4
                  }
                />
              </label>
            </div>
            <div className="form-two">
              <label>
                Custodian
                <input
                  required
                  name="custodian"
                  maxLength={60}
                  defaultValue={
                    accountModal === "new"
                      ? "Northline Custody"
                      : accountModal.custodian
                  }
                />
              </label>
              <label>
                Balance ($)
                <input
                  required
                  type="number"
                  step="1"
                  min="0"
                  max="999999999"
                  name="balance"
                  defaultValue={
                    accountModal === "new" ? 250000 : accountModal.balance
                  }
                />
              </label>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setAccountModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary">
                <Check size={14} />
                {accountModal === "new" ? "Add account" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {txModal && (
        <Modal
          title={
            txModal === "new" ? "Add transaction" : `Edit ${txModal.id}`
          }
          subtitle="Saved to this demo session only."
          onClose={() => setTxModal(null)}
        >
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const accountId = String(fd.get("accountId"));
              const acct = d.accounts.find((a) => a.id === accountId);
              const type = String(fd.get("type"));
              const description = String(fd.get("description")).trim();
              const amount = Math.max(0, Number(fd.get("amount")) || 0);
              const date = String(fd.get("date")) || snapshot;
              if (!description) return;
              if (txModal === "new") {
                const newId = `TX-${5201 + d.transactions.length}`;
                d.setTransactions((p) => [
                  {
                    id: newId,
                    clientId: acct?.clientId ?? c?.id ?? d.clients[0]?.id ?? "c1",
                    accountId,
                    type,
                    description,
                    amount: Math.round(amount * 100) / 100,
                    date,
                  },
                  ...p,
                ]);
                d.log("Edit", `Added transaction: ${newId} (${description})`);
                d.notify("Transaction added");
              } else {
                d.setTransactions((p) =>
                  p.map((x) =>
                    x.id === txModal.id
                      ? {
                          ...x,
                          accountId,
                          clientId: acct?.clientId ?? x.clientId,
                          type,
                          description,
                          amount: Math.round(amount * 100) / 100,
                          date,
                        }
                      : x,
                  ),
                );
                d.log("Edit", `Updated transaction: ${txModal.id}`);
                d.notify("Transaction updated");
              }
              setTxModal(null);
            }}
          >
            <label>
              Description
              <input
                autoFocus
                required
                name="description"
                maxLength={100}
                defaultValue={
                  txModal === "new" ? "Quarterly dividend" : txModal.description
                }
              />
            </label>
            <label>
              Account
              <select
                name="accountId"
                defaultValue={
                  txModal === "new"
                    ? (ac[0]?.id ?? d.accounts[0]?.id ?? "")
                    : txModal.accountId
                }
              >
                {d.accounts.map((a) => {
                  const owner =
                    d.clients.find((cl) => cl.id === a.clientId)?.name ?? "";
                  return (
                    <option key={a.id} value={a.id}>
                      {owner} · {a.type} (••{a.last4})
                    </option>
                  );
                })}
              </select>
            </label>
            <div className="form-two">
              <label>
                Type
                <select
                  name="type"
                  defaultValue={txModal === "new" ? "Contribution" : txModal.type}
                >
                  <option>Dividend</option>
                  <option>Contribution</option>
                  <option>Purchase</option>
                  <option>Distribution</option>
                </select>
              </label>
              <label>
                Amount ($)
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  max="999999999"
                  name="amount"
                  defaultValue={txModal === "new" ? 2500 : txModal.amount}
                />
              </label>
            </div>
            <label>
              Date
              <input
                required
                type="date"
                name="date"
                defaultValue={txModal === "new" ? snapshot : txModal.date}
              />
            </label>
            <div className="form-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setTxModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary">
                <Check size={14} />
                {txModal === "new" ? "Add transaction" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDelete
          title={
            deleting.kind === "holding"
              ? `Delete ${deleting.item.symbol}?`
              : deleting.kind === "account"
                ? `Delete ${deleting.item.type}?`
                : `Delete ${deleting.item.id}?`
          }
          message={
            deleting.kind === "holding"
              ? `Removes ${deleting.item.name} (${deleting.item.symbol}) from the holdings table.`
              : deleting.kind === "account"
                ? `Removes ${deleting.item.type} (••${deleting.item.last4}) with balance ${money(deleting.item.balance)} and updates household AUM.`
                : `Removes "${deleting.item.description}" (${money(deleting.item.amount, 2)}) from the ledger.`
          }
          onConfirm={() => handleConfirmDelete(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
