"use client";
import { media } from "@data/media";
import { approach, faqs, roadmap } from "@data/platform";
import {
  ArrowRight,
  ArrowUpRight,
  Braces,
  Check,
  CheckCheck,
  ChevronDown,
  Layers3,
  LockKeyhole,
  Menu,
  Pause,
  Play,
  ShieldCheck,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useDemo } from "./demo-context";
import { Brand, Footer } from "./ui";
type Photo = typeof media.meeting;
function StockPhoto({ photo }: { photo: Photo }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="stock-photo">
      {!failed && (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 650px) 95vw, 35vw"
          loading="lazy"
          unoptimized
          onError={() => setFailed(true)}
        />
      )}
      <small>{photo.credit}</small>
    </div>
  );
}
export function Marketing({ page }: { page: string }) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="marketing">
      <header className="marketing-header">
        <Link href="/platform">
          <Brand small />
        </Link>
        <nav
          className={menu ? "marketing-nav is-open" : "marketing-nav"}
          aria-label="Platform navigation"
        >
          {[
            ["platform", "Platform"],
            ["approach", "Our approach"],
            ["proposal", "Request a proposal"],
          ].map(([url, name]) => (
            <Link
              key={url}
              href={`/${url}`}
              onClick={() => setMenu(false)}
              className={page === url ? "selected" : ""}
            >
              {name}
            </Link>
          ))}
        </nav>
        <div>
          <Link href="/login" className="btn primary">
            Enter workspace
            <ArrowUpRight size={14} />
          </Link>
          <button
            className="icon-btn marketing-menu"
            aria-label="Toggle platform menu"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>
      {page === "platform" ? (
        <Landing />
      ) : page === "approach" ? (
        <Approach />
      ) : (
        <Proposal />
      )}
      <Footer />
    </div>
  );
}
function Landing() {
  const d = useDemo();
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <main>
      <section
        className="landing-hero"
        style={{
          backgroundImage: `linear-gradient(100deg,#132c40f5,#18334594),url("${media.skyline.src}")`,
        }}
      >
        {!failed && (
          <video
            ref={video}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            poster={media.skyline.src}
            onError={() => setFailed(true)}
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
          >
            <source src={media.video} type="video/mp4" />
          </video>
        )}
        <div className="hero-shade" />
        <div className="landing-hero-content">
          <div className="eyebrow">
            <span />
            VESTTARA WEALTH PLATFORM
          </div>
          <h1>
            A clearer view
            <br />
            of wealth.
          </h1>
          <p>
            Portfolios, relationships, and intelligence. One considered
            workspace for the people behind every financial plan.
          </p>
          <div className="hero-actions">
            <Link className="btn gold" href="/login">
              Explore the demo
              <ArrowRight size={15} />
            </Link>
            <Link className="hero-link" href="/approach">
              Our approach
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <div className="hero-caption">
          <span>Film: {media.skyline.credit}</span>
          {!failed && (
            <button
              aria-label={
                paused ? "Play background video" : "Pause background video"
              }
              onClick={() => {
                if (paused) video.current?.play().catch(() => setFailed(true));
                else video.current?.pause();
              }}
            >
              {paused ? <Play size={13} /> : <Pause size={13} />}
            </button>
          )}
        </div>
      </section>
      <section className="marketing-section">
        <div className="eyebrow">
          <span />
          ONE CONNECTED EXPERIENCE
        </div>
        <div className="marketing-section-title">
          <h2>Built around your practice.</h2>
          <p>Three perspectives on the same trusted workspace.</p>
        </div>
        <div className="marketing-cards">
          {[
            {
              photo: media.laptop,
              title: "A complete portfolio view",
              body: "Understand balances, allocation, and performance across every household.",
              path: "portfolios",
            },
            {
              photo: media.meeting,
              title: "Relationships in context",
              body: "Bring notes, meetings, pipeline, and follow-up tasks into the conversation.",
              path: "crm",
            },
            {
              photo: media.office,
              title: "Intelligence with sources",
              body: "Explore a safe, scripted assistant that turns workspace context into next steps.",
              path: "assistant",
            },
          ].map((c, i) => (
            <article className="marketing-card" key={c.title}>
              <StockPhoto photo={c.photo} />
              <div>
                <span className="mini-label">0{i + 1} / PLATFORM FEATURE</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <button
                  className="text-btn"
                  onClick={() => {
                    if (d.role === "Client") d.enter("Advisor");
                    d.go(c.path);
                  }}
                >
                  Explore feature
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="security-feature">
        <ShieldCheck size={38} strokeWidth={1.1} />
        <div>
          <div className="eyebrow">TRUST BY DESIGN</div>
          <h2>Clear boundaries. Client ownership.</h2>
          <p>
            Separate workspaces, transparent sources, and a proposed handoff
            that keeps code, hosting, and administration with your firm.
            Production controls would be independently validated before launch.
          </p>
          <Link href="/approach" className="text-btn">
            Review the delivery model
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
      <section className="marketing-section">
        <div className="eyebrow">
          <span />
          HOW IT WORKS
        </div>
        <h2>A guided first look.</h2>
        <div className="how-grid">
          {[
            [
              "Choose a workspace",
              "Enter as an advisor, administrator, or client. No account setup required.",
            ],
            [
              "Explore a household",
              "Review sample accounts, allocation, and the latest conversation.",
            ],
            [
              "Connect the next step",
              "Ask the assistant for a follow-up and find the new task in the CRM.",
            ],
          ].map(([title, body], i) => (
            <div key={title}>
              <b>0{i + 1}</b>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="testimonial">
        <StockPhoto photo={media.family} />
        <div>
          <span className="mini-label">ILLUSTRATIVE CLIENT PERSPECTIVE</span>
          <blockquote>
            “My accounts, reports, and next conversation with my advisor, all in
            one place.”
          </blockquote>
          <strong>John Everly</strong>
          <small>Fictional demo household · Not a real endorsement</small>
        </div>
      </section>
      <section className="marketing-section faq">
        <div>
          <div className="eyebrow">
            <span />
            GOOD TO KNOW
          </div>
          <h2>A few common questions.</h2>
        </div>
        <div>
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>
                {f.q}
                <ChevronDown size={16} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="marketing-cta">
        <div>
          <div className="eyebrow">YOUR NEXT CHAPTER</div>
          <h2>Let’s shape your workspace.</h2>
        </div>
        <Link href="/proposal" className="btn gold">
          Request a proposal
          <ArrowRight size={15} />
        </Link>
      </section>
    </main>
  );
}
function Approach() {
  return (
    <main className="approach-page">
      <section className="marketing-intro">
        <div className="eyebrow">
          <span />
          OUR APPROACH
        </div>
        <h1>Build what makes you different.</h1>
        <p>
          Reuse proven foundations. Keep your team in control. A practical
          delivery plan for a client-owned wealth platform.
        </p>
      </section>
      <section className="marketing-section">
        <div className="eyebrow">
          <span />
          DELIVERY STRATEGY
        </div>
        <h2>Build vs. reuse vs. internal.</h2>
        <p className="section-description">
          Open-source components reduce repeated work. AI-assisted development
          supports scaffolding and test drafting, with human review for every
          production change.
        </p>
        <div className="panel table-wrap">
          <table className="responsive-table approach-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th>Build · our work</th>
                <th>Reuse · proven tools</th>
                <th>Internal · your team</th>
              </tr>
            </thead>
            <tbody>
              {approach.map((a) => (
                <tr key={a.capability}>
                  <td data-label="Capability">
                    <strong>{a.capability}</strong>
                  </td>
                  <td data-label="Build">{a.build}</td>
                  <td data-label="Reuse">{a.reuse}</td>
                  <td data-label="Internal">{a.internal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="marketing-section roadmap-section">
        <div className="eyebrow">
          <span />
          ILLUSTRATIVE 90-DAY ROADMAP
        </div>
        <h2>From discovery to a focused pilot.</h2>
        <div className="roadmap-grid">
          {roadmap.map((r) => (
            <article key={r.phase}>
              <div>
                <span>Phase {r.phase}</span>
                <small>{r.days}</small>
              </div>
              <h3>{r.title}</h3>
              <p>{r.body}</p>
              <strong>
                <Check size={14} />
                {r.outcome}
              </strong>
            </article>
          ))}
        </div>
        <p className="fine-print">
          Indicative schedule. Provider access, compliance review, and approved
          scope determine the final delivery dates.
        </p>
      </section>
      <section className="marketing-section">
        <div className="eyebrow">
          <span />
          TEAM & SKILLS
        </div>
        <h2>A focused delivery team.</h2>
        <p className="section-description">
          An illustrative staffing model, finalized with your firm during
          discovery.
        </p>
        <div className="team-grid">
          {[
            {
              name: "Product engineering",
              icon: Braces,
              skills: "Next.js · TypeScript · Integration design",
              body: "Translate business workflows into maintainable, tested software.",
            },
            {
              name: "Experience design",
              icon: Layers3,
              skills: "Design systems · Responsive UI · Research",
              body: "Make complex financial information clear and accessible.",
            },
            {
              name: "Quality & governance",
              icon: ShieldCheck,
              skills: "Testing · Accessibility · Security review",
              body: "Verify workflows, permission boundaries, and release readiness.",
            },
          ].map(({ name, icon: Icon, skills, body }) => (
            <article key={name}>
              <Icon size={24} />
              <h3>{name}</h3>
              <p>{body}</p>
              <small>{skills}</small>
            </article>
          ))}
        </div>
      </section>
      <section className="marketing-cta">
        <div>
          <div className="eyebrow">CLIENT-OWNED DELIVERY</div>
          <h2>Your code. Your hosting. Your access.</h2>
        </div>
        <Link href="/proposal" className="btn gold">
          Request a proposal
          <ArrowRight size={15} />
        </Link>
      </section>
    </main>
  );
}
function Proposal() {
  const [result, setResult] = useState<{
    name: string;
    firm: string;
    focus: string;
    timeline: string;
  } | null>(null);
  return (
    <main className="proposal-layout">
      <div className="proposal-intro">
        <div className="eyebrow">
          <span />
          PARTNER WITH VESTTARA
        </div>
        <h1>
          A platform built
          <br />
          around your firm.
        </h1>
        <p>
          Tell us about the practice you want to support. This sample brief
          demonstrates how a development engagement could begin.
        </p>
        <div className="proposal-points">
          {[
            "A clear discovery and delivery plan",
            "Open-source foundations, tailored workflows",
            "Client-owned code, hosting, and access",
          ].map((t) => (
            <span key={t}>
              <Check size={15} />
              {t}
            </span>
          ))}
        </div>
        <Link href="/approach" className="text-btn">
          View our 90-day approach
          <ArrowUpRight size={14} />
        </Link>
      </div>
      <section className="panel proposal-form">
        {result ? (
          <div className="proposal-success">
            <span>
              <CheckCheck size={30} />
            </span>
            <div className="eyebrow">DEMO SUBMISSION COMPLETE</div>
            <h2>Your brief is ready.</h2>
            <p>
              Thank you, {result.name}. Your sample request for{" "}
              <strong>{result.firm}</strong> has been captured in this session.
            </p>
            <div className="detail-row">
              <span>Focus</span>
              <strong>{result.focus}</strong>
            </div>
            <div className="detail-row">
              <span>Timeline</span>
              <strong>{result.timeline}</strong>
            </div>
            <p className="form-hint">
              Nothing has been sent or stored. No one will contact you as a
              result of this demo.
            </p>
            <button className="btn primary" onClick={() => setResult(null)}>
              Start another brief
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="eyebrow">
              <span />
              DEMO REQUEST
            </div>
            <h2>Request a proposal</h2>
            <p>Use fictional details. This form does not send an email.</p>
            <form
              className="form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                setResult({
                  name: String(fd.get("name")).trim(),
                  firm: String(fd.get("firm")).trim(),
                  focus: String(fd.get("focus")),
                  timeline: String(fd.get("timeline")),
                });
              }}
            >
              <div className="form-two">
                <label>
                  Your name
                  <input
                    name="name"
                    required
                    maxLength={80}
                    placeholder="Avery Hart"
                    pattern=".*\S.*"
                  />
                </label>
                <label>
                  Firm name
                  <input
                    name="firm"
                    required
                    maxLength={100}
                    placeholder="Example Wealth"
                    pattern=".*\S.*"
                  />
                </label>
              </div>
              <label>
                Work email
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="avery@example.com"
                />
              </label>
              <div className="form-two">
                <label>
                  Primary focus
                  <select name="focus">
                    <option>Full wealth platform</option>
                    <option>Advisor CRM</option>
                    <option>Client portal</option>
                    <option>AI assistance</option>
                  </select>
                </label>
                <label>
                  Target timeline
                  <select name="timeline">
                    <option>90-day pilot</option>
                    <option>3–6 months</option>
                    <option>Exploring options</option>
                  </select>
                </label>
              </div>
              <label>
                Your priorities
                <textarea
                  name="goals"
                  rows={4}
                  maxLength={2000}
                  placeholder="Which workflows would you like to improve?"
                />
              </label>
              <button className="btn primary" type="submit">
                Submit demo request
                <ArrowRight size={15} />
              </button>
              <div className="form-hint">
                <LockKeyhole size={13} />
                Session-only submission. No real proposal is sent.
              </div>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
