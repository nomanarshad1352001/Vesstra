"use client";
import { demoReply, suggestions } from "@data/assistant";
import { type ChatMessage } from "@data/demo";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  CheckCheck,
  ChevronDown,
  FileText,
  ListTodo,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDemo } from "./demo-context";
import { Avatar, Empty, Heading, HouseholdSelect, Modal } from "./ui";

export function Assistant() {
  const d = useDemo();
  const [clientId, setClientId] = useState(
    d.selected === "all" ? (d.clients[0]?.id ?? "c1") : d.selected,
  );
  const client =
    d.clients.find(
      (c) => c.id === (d.role === "Client" ? d.selected : clientId),
    ) ?? d.clients[0];
  const key = `${d.role}:${client?.id ?? "none"}`;
  const chat = d.conversations[key] ?? [];
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState("");
  const [clear, setClear] = useState(false);
  const [source, setSource] = useState<ChatMessage["source"]>();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const locked = useRef(false);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (area.current) area.current.scrollTop = area.current.scrollHeight;
  }, [chat.length, typing, busy]);

  if (!client) {
    return (
      <>
        <Heading
          eyebrow="VESTTARA INTELLIGENCE"
          title="AI Assistant"
          description="A source-backed perspective on your workspace. Simulated, not live AI."
        />
        <section className="panel">
          <Empty
            icon={Sparkles}
            title="No households yet"
            text="Add a household in Clients & CRM to ask the assistant about a portfolio."
          />
        </section>
      </>
    );
  }

  function send(raw: string) {
    const q = raw.trim();
    if (!q || locked.current || !client) return;
    locked.current = true;
    setText("");
    setBusy(true);
    setTyping("");
    const user: ChatMessage = { id: crypto.randomUUID(), who: "user", text: q };
    d.setConversations((p) => ({ ...p, [key]: [...(p[key] ?? []), user] }));
    const reply = demoReply(
      q,
      client,
      d.role,
      d.notes,
      d.meetings,
      d.tasks,
      d.clients,
      d.accounts,
      d.allocation,
    );
    let count = -30;
    timer.current = setInterval(() => {
      count += 9;
      if (count <= 0) return;
      setTyping(reply.text.slice(0, count));
      if (count >= reply.text.length) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        const msg: ChatMessage = {
          id: crypto.randomUUID(),
          who: "assistant",
          text: reply.text,
          source: reply.source,
          task: !!reply.taskFor,
        };
        d.setConversations((p) => ({ ...p, [key]: [...(p[key] ?? []), msg] }));
        if (reply.taskFor) {
          const c = d.clients.find((c) => c.id === reply.taskFor) ?? client;
          d.setTasks((p) => [
            {
              id: crypto.randomUUID(),
              clientId: c.id,
              title: `Follow up on ${c.name.split(" ")[0]}’s quarterly review`,
              due: "2025-07-02",
              priority: "Normal",
              done: false,
            },
            ...p,
          ]);
          d.log("Edit", `Assistant created a follow-up task for ${c.name}`);
          d.notify("Follow-up task added to CRM");
        }
        setBusy(false);
        setTyping("");
        locked.current = false;
      }
    }, 24);
  }

  const questions =
    d.role === "Client"
      ? [
          "Summarize my portfolio",
          "What did we discuss last meeting?",
          "When is my next meeting?",
        ]
      : suggestions;

  return (
    <>
      <Heading
        eyebrow="VESTTARA INTELLIGENCE"
        title="AI Assistant"
        description="A source-backed perspective on your workspace. Simulated, not live AI."
      >
        <fieldset disabled={busy}>
          <HouseholdSelect
            all={false}
            value={client.id}
            onChange={setClientId}
          />
        </fieldset>
      </Heading>
      <section className="panel assistant-panel">
        <div className="chat-top">
          <div className="assistant-identity">
            <span className="assistant-mark">
              <Sparkles size={20} />
            </span>
            <div>
              <strong>Vesttara Assistant</strong>
              <small>
                <i />
                {busy ? "Preparing a response" : "Ready to help"}
              </small>
            </div>
          </div>
          <button
            className="btn subtle-btn"
            disabled={!chat.length || busy}
            onClick={() => setClear(true)}
          >
            <RotateCcw size={13} />
            New chat
          </button>
        </div>
        <div className="chat-content" ref={area}>
          {!chat.length ? (
            <motion.div
              className="assistant-welcome"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="welcome-spark">
                <Sparkles size={30} strokeWidth={1.3} />
              </div>
              <div className="eyebrow">YOUR INTELLIGENCE WORKSPACE</div>
              <h2>What would you like to explore?</h2>
              <p>
                Ask about the {client.household}’s portfolio, meeting notes, or
                next steps.
              </p>
              <div className="prompt-grid">
                {questions.map((q, i) => {
                  const Icon = [TrendingUp, MessageSquare, ListTodo][i];
                  return (
                    <button key={q} onClick={() => send(q)}>
                      <Icon size={19} />
                      <span>{q}</span>
                      <ArrowUpRight size={13} />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="chat-messages">
              {chat.map((m) => (
                <div className={`chat-message ${m.who}`} key={m.id}>
                  {m.who === "assistant" ? (
                    <span className="chat-avatar">
                      <Sparkles size={16} />
                    </span>
                  ) : (
                    <Avatar small name={d.profile.name} color={d.profile.color} />
                  )}
                  <div>
                    <strong>
                      {m.who === "assistant"
                        ? "Vesttara Assistant"
                        : d.profile.name}
                    </strong>
                    <div className="message-body">{m.text}</div>
                    {m.source && (
                      <div className="source-section">
                        <small>SOURCES</small>
                        <button
                          className="source-chip"
                          onClick={() => setSource(m.source)}
                        >
                          <FileText size={12} />
                          {m.source.name}
                          <ChevronDown size={12} />
                        </button>
                        <p>{m.source.snippet}</p>
                      </div>
                    )}
                    {m.task && (
                      <button
                        className="text-btn"
                        onClick={() => {
                          d.setCrmTab("Tasks");
                          d.go("crm");
                        }}
                      >
                        <CheckCheck size={14} />
                        View CRM task
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="chat-message assistant">
                  <span className="chat-avatar">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <strong>Vesttara Assistant</strong>
                    {typing ? (
                      <div className="message-body typing-cursor">{typing}</div>
                    ) : (
                      <div
                        className="typing-dots"
                        aria-label="Assistant typing"
                      >
                        <i />
                        <i />
                        <i />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="chat-bottom">
          {chat.length > 0 && (
            <div className="quick-prompts">
              {questions.slice(0, 2).map((q) => (
                <button disabled={busy} key={q} onClick={() => send(q)}>
                  {q}
                  <ArrowUpRight size={11} />
                </button>
              ))}
            </div>
          )}
          <form
            className="chat-compose"
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
          >
            <input
              aria-label="Ask the assistant"
              placeholder="Ask about a portfolio, meeting, or task…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              disabled={busy}
            />
            <button
              type="submit"
              disabled={!text.trim() || busy}
              aria-label="Send question"
            >
              <ArrowUp size={19} />
            </button>
          </form>
          <div className="compliance-note">
            <ShieldCheck size={14} />
            <span>
              Information only. The assistant does not provide personal
              investment advice.
            </span>
          </div>
        </div>
      </section>
      {source && (
        <Modal
          title="Source reference"
          subtitle="A local, illustrative workspace record."
          onClose={() => setSource(undefined)}
        >
          <div className="source-preview">
            <FileText size={25} />
            <h3>{source.name}</h3>
            <p>{source.snippet}</p>
          </div>
        </Modal>
      )}
      {clear && (
        <Modal
          title="Start a new chat?"
          subtitle="This will clear the conversation for this household. Tasks already created will remain in the CRM."
          onClose={() => setClear(false)}
        >
          <div className="form-actions">
            <button className="btn" onClick={() => setClear(false)}>
              Keep conversation
            </button>
            <button
              className="btn primary"
              onClick={() => {
                d.setConversations((p) => ({ ...p, [key]: [] }));
                setClear(false);
              }}
            >
              Start new chat
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
