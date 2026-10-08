import { flushSync } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { asset } from "./asset.js";
import { chatTopics, goals, milestoneGroups, timeline } from "./data.js";
import {
  canvasOrigin,
  canvasScale,
  cardPosition,
  cardSize,
  levelScale,
  maxZoom,
  minZoom,
  typeScale,
  zoomLevel,
} from "./canvas.js";

function runViewTransition(update) {
  if (document.startViewTransition) return document.startViewTransition(update);
  update();
  return null;
}

function formatMoney(amount) {
  if (amount >= 1000) {
    const thousands = Math.round((amount / 1000) * 10) / 10;
    return `£${thousands}k`;
  }
  return `£${amount}`;
}

function GoalCard({ goal, position, level, scale, onOpen, transitioning }) {
  const overview = level === 0;
  const className = [
    "goal-card",
    overview ? "is-overview" : "",
    level === 2 ? "is-focused" : "",
    transitioning ? "is-transitioning" : "",
    `tone-${goal.tone}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={className}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        "--s": scale,
      }}
      data-goal-id={goal.id}
      aria-label={`${goal.title}, ${goal.date}`}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onOpen();
      }}
    >
      <div className="goal-image">
        <div className="goal-shared-media">
          {goal.image && <img src={goal.image} alt="" draggable={false} />}
          {goal.private && (
            <div className="private-badge">
              <img src={asset("assets/ca787.svg")} alt="" />
              <span>Private</span>
            </div>
          )}
        </div>
        <span className="count-badge">{goal.count}</span>
      </div>
      {!overview && (
        <div className="goal-details">
          <div className="goal-summary">
            <h2>{goal.title}</h2>
            <p className="goal-date">{goal.date}</p>
          </div>
          {level === 1 && (
            <div className="progress progress-inline">
              <span>{goal.progress}%</span>
              <div className="progress-track">
                <span style={{ width: `${goal.progress}%` }} />
              </div>
            </div>
          )}
          {level === 2 && (
            <div className="progress progress-focused">
              <div className="goal-funds">
                <span>
                  {formatMoney(goal.funded)} of {formatMoney(goal.target)}
                </span>
                <span>
                  {goal.milestonesDone} of {goal.milestonesTotal} · To-dos
                </span>
              </div>
              <div className="progress progress-inline">
                <span>{goal.progress}%</span>
                <div className="progress-track">
                  <span style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function TimelineCard({ goal, onOpen, transitioning }) {
  const marker = goal.marker;
  return (
    <article
      className={`timeline-card${marker ? " is-marker" : ""} ${transitioning ? "is-transitioning" : ""} timeline-${goal.tone}`}
      role={marker ? undefined : "button"}
      tabIndex={marker ? undefined : 0}
      onClick={marker ? undefined : onOpen}
      onKeyDown={
        marker
          ? undefined
          : (event) => {
              if (event.key === "Enter" || event.key === " ") onOpen();
            }
      }
    >
      {goal.image && (
        <div className="timeline-card-image">
          <img src={goal.image} alt="" />
          {goal.private && (
            <span className="timeline-lock">
              <img src={asset("assets/ca787.svg")} alt="" />
            </span>
          )}
        </div>
      )}
      <div className="timeline-card-details">
        <h3>{goal.title}</h3>
        {!marker && goal.count != null && <span className="timeline-count">{goal.count}</span>}
      </div>
    </article>
  );
}

function Timeline({ onOpenGoal, transitioningGoalKey }) {
  useEffect(() => {
    const scroller = document.querySelector(".timeline-scroll");
    const current = scroller?.querySelector(".season-heading.active");
    const year = current?.closest(".timeline-year");
    if (!scroller || !year) return;
    const top = year.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    scroller.scrollTop = Math.max(0, top - 8);
  }, []);
  return (
    <div className="timeline-scroll">
      <div className="timeline-content">
        {timeline.map((year) => (
          <section className="timeline-year" key={year.year}>
            <h2>{year.year}</h2>
            <div>
              {year.seasons.map((season) => (
                <section className="timeline-season" key={season.name}>
                  <div className={`season-heading ${season.active ? "active" : ""}`}>
                    <img src={season.icon} alt="" />
                    <h3>{season.name}</h3>
                  </div>
                  <div className="season-body">
                    <div className="season-line" />
                    <div className="season-goals">
                      {season.goals.map((goal, index) => {
                        const key = `timeline-${year.year}-${season.name}-${index}`;
                        return (
                          <TimelineCard
                            key={`${goal.title}-${index}`}
                            goal={goal}
                            transitioning={transitioningGoalKey === key}
                            onOpen={() => onOpenGoal(goal, key)}
                          />
                        );
                      })}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function GoalPage({ goal, onClose }) {
  const [openMilestones, setOpenMilestones] = useState(() =>
    milestoneGroups.filter((group) => group.tone === "tracking").map((group) => group.title),
  );
  const milestonesDone = milestoneGroups.filter((group) => group.tone === "done").length;
  const milestonesTotal = milestoneGroups.length;
  const [savedFunds, setSavedFunds] = useState(2000);
  const [goalFunds] = useState(5000);
  const [monthlyFunds, setMonthlyFunds] = useState(100);
  const [editingFunds, setEditingFunds] = useState(false);
  const [savedDraft, setSavedDraft] = useState("2000");
  const [monthlyDraft, setMonthlyDraft] = useState("100");
  const fundsPercent = goalFunds > 0 ? Math.min(100, Math.round((savedFunds / goalFunds) * 100)) : 0;
  const [chat, setChat] = useState(null);
  const openChat = (title) => setChat({ title });
  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    const scroller = target?.closest(".goal-page");
    if (!target || !scroller) return;
    const top = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    scroller.scrollTo({ top: Math.max(0, top - scroller.clientHeight * 0.28), behavior: "smooth" });
  };
  const toggleFundsEdit = () => {
    if (!editingFunds) {
      setSavedDraft(String(savedFunds));
      setMonthlyDraft(String(monthlyFunds));
      setEditingFunds(true);
      return;
    }
    const nextSaved = Number(savedDraft);
    const nextMonthly = Number(monthlyDraft);
    if (Number.isFinite(nextSaved) && nextSaved >= 0) setSavedFunds(nextSaved);
    if (Number.isFinite(nextMonthly) && nextMonthly >= 0) setMonthlyFunds(nextMonthly);
    setEditingFunds(false);
  };
  const toggleMilestone = (title) => {
    setOpenMilestones((current) =>
      current.includes(title) ? current.filter((item) => item !== title) : [...current, title],
    );
  };
  return (
    <div className="goal-page">
      <div className="goal-page-hero">
        <div className="goal-page-shared-media">
          <img
            className="goal-page-hero-background"
            src={goal.image || asset("assets/d90ac.png")}
            alt=""
          />
          <img
            className="goal-page-transition-image"
            src={goal.image || asset("assets/d90ac.png")}
            alt=""
          />
          {goal.private && (
            <span className="goal-page-private">
              <img src={asset("assets/ca787.svg")} alt="" />
              Private
            </span>
          )}
        </div>
        <button className="goal-page-back" onClick={onClose} aria-label="Back">
          <img src={asset("assets/982d7.svg")} alt="" />
        </button>
      </div>
      <div className="goal-page-sheet">
        <div className="goal-page-sheet-backdrop" aria-hidden="true" />
        <section className="goal-page-summary">
          <div className="goal-page-heading">
            <span className="goal-page-date">{goal.date}</span>
            <h1>{goal.title}</h1>
          </div>
          <div className="goal-page-progress">
            <h2>Progress</h2>
            <button
              type="button"
              className="goal-stat-card"
              aria-label="Go to milestones"
              onClick={() => scrollToSection("milestones")}
            >
              <div>
                <span>Milestones achieved</span>
                <strong>{milestonesDone} of {milestonesTotal}</strong>
              </div>
              <div className="goal-dots-row">
                <div className="goal-dots">
                  {Array.from({ length: milestonesTotal }, (_, index) => (
                    <i key={index} className={index < milestonesDone ? "is-filled" : ""} />
                  ))}
                </div>
                <span className="goal-dots-jump" aria-hidden="true">
                  <img src={asset("assets/076ec.svg")} alt="" />
                </span>
              </div>
            </button>
            <button
              type="button"
              className="goal-stat-card"
              aria-label="Go to funds"
              onClick={() => document.getElementById("funds")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              <div>
                <span>Funds</span>
                <strong>{formatMoney(savedFunds)}/{formatMoney(goalFunds)}</strong>
              </div>
              <div className="goal-dots-row">
                <div className="goal-funds-track">
                  <i style={{ width: `${fundsPercent}%` }} />
                </div>
                <span className="goal-dots-jump" aria-hidden="true">
                  <img src={asset("assets/076ec.svg")} alt="" />
                </span>
              </div>
            </button>
          </div>
        </section>
        <div className="goal-page-body">
          <section className="goal-copy-section">
            <h2>The everyday discrete luxury</h2>
            <p>
              Spain · about two weeks in Summer 2027.
              <br />
              Exact dates still open — that’s the next call. A chance to slow down, reset, and make this goal feel real.
            </p>
          </section>
          <section className="goal-copy-section">
            <h2>Next up</h2>
            <div
              className="goal-next-input"
              role="button"
              tabIndex={0}
              onClick={() => openChat("Let’s pick the dates")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") openChat("Let’s pick the dates");
              }}
            >
              <span>Let’s pick the dates</span>
              <span className="goal-next-send" aria-hidden="true">
                <img src={asset("assets/7644f.svg")} alt="" />
              </span>
            </div>
          </section>
          <section className="goal-copy-section">
            <h2>Recommended next steps</h2>
            <div className="recommendation-grid">
              <button className="recommendation-light" onClick={() => openChat("Check leave with work")}>
                <span>Check leave with work</span>
                <img src={asset("assets/eb16c.svg")} alt="" />
              </button>
              <button className="recommendation-dark" onClick={() => openChat("Create an automation for building funds")}>
                <span>Create an automation for building funds</span>
                <img src={asset("assets/eb16c.svg")} alt="" />
              </button>
            </div>
          </section>
          <section className="milestone-panel" id="milestones">
            <div className="funds-heading">
              <h2>Milestones</h2>
              <div className="milestone-count">
                <div className="goal-dots" aria-hidden="true">
                  {Array.from({ length: milestonesTotal }, (_, index) => (
                    <i key={index} className={index < milestonesDone ? "is-filled" : ""} />
                  ))}
                </div>
                <span>{milestonesDone}/{milestonesTotal}</span>
              </div>
            </div>
            {milestoneGroups.map((group) => {
              const open = openMilestones.includes(group.title);
              return (
              <div className={`milestone-group is-${group.tone}${open ? " is-open" : ""}`} key={group.title}>
                <button
                  type="button"
                  className="milestone-group-head"
                  aria-expanded={open}
                  onClick={() => toggleMilestone(group.title)}
                >
                  <span className={`milestone-check ${group.tone === "done" ? "is-done" : ""}`} />
                  <span className="milestone-group-title">{group.title}</span>
                  <span className="milestone-group-meta">
                    <span className="milestone-group-status">{group.tone === "later" ? `${group.status} (${group.items.length})` : group.status}</span>
                    <img
                      className="milestone-toggle"
                      src={asset("assets/076ec.svg")}
                      alt=""
                    />
                  </span>
                </button>
                {open && <div className="milestone-group-body">
                  <span className="milestone-line" />
                  <div className="milestone-cards">
                    {group.items.map((item) => {
                      const CardTag = item.done ? "div" : "button";
                      return (
                      <CardTag
                        key={item.title}
                        type={item.done ? undefined : "button"}
                        className={`milestone-card ${item.done ? "is-done" : "is-open-action"}`}
                        onClick={item.done ? undefined : () => openChat(item.title)}
                      >
                        <span className={`milestone-check ${item.done ? "is-done" : ""}`} />
                        <span className="milestone-card-copy">
                          <span>{item.title}</span>
                          {item.detail && <strong>{item.detail}</strong>}
                        </span>
                        {item.owner === "photo" ? (
                          <img className="milestone-owner is-photo" src={asset("assets/avatar-photo.png")} alt="" />
                        ) : item.owner ? (
                          <span className="milestone-owner">{item.owner}</span>
                        ) : null}
                      </CardTag>
                      );
                    })}
                  </div>
                </div>}
              </div>
              );
            })}
          </section>
          <section className="funds-panel" id="funds">
            <div className="funds-heading">
              <h2>Funds</h2>
              <button
                type="button"
                className="funds-update"
                aria-label="Update funds"
                onClick={() => openChat("Update funds")}
              >
                {editingFunds ? (
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3.2 8.4 6.3 11.5 12.8 4.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="funds-card">
              <div className="funds-row">
                <span>Goal</span>
                <strong>{formatMoney(goalFunds)}</strong>
              </div>
              <div className="funds-row">
                <span>Saved so far</span>
                {editingFunds ? (
                  <input
                    aria-label="Saved so far"
                    inputMode="decimal"
                    value={savedDraft}
                    onChange={(event) => setSavedDraft(event.target.value)}
                  />
                ) : (
                  <strong>{formatMoney(savedFunds)}</strong>
                )}
              </div>
              <div className="funds-row">
                <span>Putting away</span>
                {editingFunds ? (
                  <label className="funds-monthly">
                    <input
                      aria-label="Amount put away each month"
                      inputMode="decimal"
                      value={monthlyDraft}
                      onChange={(event) => setMonthlyDraft(event.target.value)}
                    />
                    <span>/ month</span>
                  </label>
                ) : (
                  <strong>{formatMoney(monthlyFunds)} / month</strong>
                )}
              </div>
              <div className="goal-funds-track">
                <i style={{ width: `${fundsPercent}%` }} />
              </div>
            </div>
          </section>
          <section className="goal-copy-section goal-chat">
            <h2>Chats</h2>
            {chatTopics.map((topic) => (
              <button key={topic} onClick={() => openChat(topic)}>
                <span>{topic}</span>
                <img src={asset("assets/076ec.svg")} alt="" />
              </button>
            ))}
          </section>
        </div>
      </div>
      {chat && <ChatPage chat={chat} goal={goal} onBack={() => setChat(null)} />}
    </div>
  );
}

function ChatPage({ chat, goal, onBack }) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const send = (text) => {
    const message = text.trim();
    if (!message) return;
    setMessages((current) => [
      ...current,
      { from: "user", text: message },
      { from: "kemble", text: "Happy to help with that. Tell me a little more and I’ll pull it together for you." },
    ]);
    setDraft("");
  };
  const started = messages.length > 0;
  return (
    <div className="chat-page" role="dialog" aria-label={chat.title}>
      <div className="chat-page-top">
        <button type="button" className="chat-page-back" aria-label="Back to goal" onClick={onBack}>
          <img src={asset("assets/982d7.svg")} alt="" />
        </button>
        <h1>{chat.title}</h1>
        <p>{goal.title}</p>
      </div>
      <div className="chat-page-thread">
        {messages.map((message, index) => (
          <p key={index} className={`chat-message is-${message.from}`}>
            {message.text}
          </p>
        ))}
      </div>
      <div className="chat-page-input">
        {!started && (
          <div className="chat-page-suggest">
            <span>Start with</span>
            <div className="chat-page-chips">
              <button type="button" onClick={() => send(chat.title)}>
                {chat.title}
              </button>
            </div>
          </div>
        )}
        <form
          className="chat-page-field"
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
        >
          <input
            aria-label="Message"
            placeholder="Message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button
            type="submit"
            className={draft ? "is-ready" : ""}
            aria-label="Send"
          >
            <img src={asset("assets/7644f.svg")} alt="" />
          </button>
        </form>
      </div>
    </div>
  );
}

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <div className="nav-island">
        <button aria-label="Home">
          <img src={asset("assets/64a13.svg")} alt="" />
        </button>
        <button className="active" aria-label="Life goals">
          <img src={asset("assets/9bbf1.svg")} alt="" />
        </button>
        <button aria-label="Finances">
          <img src={asset("assets/46147.svg")} alt="" />
        </button>
      </div>
      <button className="chat" aria-label="Messages">
        <img src={asset("assets/cc1b0.svg")} alt="" />
      </button>
    </nav>
  );
}

export default function App() {
  const viewportRef = useRef(null);
  const pointers = useRef(new Map());
  const gesture = useRef({ type: null });
  const openGoalRef = useRef(() => {});
  const suppressClick = useRef(false);
  const [level, setLevel] = useState(1);
  const [zoom, setZoom] = useState(levelScale[1]);
  const [view, setView] = useState("canvas");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGoal, setOpenGoal] = useState(null);
  const [transitionKey, setTransitionKey] = useState(null);
  const [origin, setOrigin] = useState(() =>
    canvasOrigin(1, typeof window === "undefined" ? 390 : window.innerWidth),
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onWheel = (event) => {
      event.preventDefault();
      const nextZoom = Math.max(
        minZoom,
        Math.min(maxZoom(window.innerWidth), zoom * Math.exp(-event.deltaY * 0.0015)),
      );
      const nextLevel = zoomLevel(level, nextZoom);
      const bounds = viewport.getBoundingClientRect();
      const pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      const currentScale = canvasScale(zoom, level, window.innerWidth);
      const nextScale = canvasScale(nextZoom, nextLevel, window.innerWidth);
      const worldPoint = {
        x: (pointer.x - origin.x) / currentScale,
        y: (pointer.y - origin.y) / currentScale,
      };
      const cards = [...viewport.querySelectorAll(".goal-card")];
      const cardIndex = cards.findIndex((card) => {
        const rect = card.getBoundingClientRect();
        return (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        );
      });
      if (cardIndex >= 0) {
        const rect = cards[cardIndex].getBoundingClientRect();
        const ratio = {
          x: (event.clientX - rect.left) / rect.width,
          y: (event.clientY - rect.top) / rect.height,
        };
        const position = cardPosition(cardIndex, nextLevel, nextScale);
        const size = cardSize[nextLevel];
        setOrigin({
          x: pointer.x - (position.x + ratio.x * size.width) * nextScale,
          y: pointer.y - (position.y + ratio.y * size.height) * nextScale,
        });
      } else {
        setOrigin({
          x: pointer.x - worldPoint.x * nextScale,
          y: pointer.y - worldPoint.y * nextScale,
        });
      }
      setZoom(nextZoom);
      setLevel(nextLevel);
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [level, origin, zoom]);

  useEffect(() => {
    const onResize = () => {
      setOrigin(canvasOrigin(level, window.innerWidth));
      setZoom((current) => Math.min(current, maxZoom(window.innerWidth)));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [level]);

  const pinchDistance = () => {
    const [first, second] = [...pointers.current.values()];
    return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : 0;
  };

  const pinchCenter = () => {
    const [first, second] = [...pointers.current.values()];
    if (!first || !second) return null;
    const bounds = viewportRef.current?.getBoundingClientRect();
    return {
      x: (first.x + second.x) / 2 - (bounds?.left || 0),
      y: (first.y + second.y) / 2 - (bounds?.top || 0),
    };
  };

  const nearestCard = () => {
    const [first, second] = [...pointers.current.values()];
    const viewport = viewportRef.current;
    if (!first || !second || !viewport) return;
    const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
    const bounds = viewport.getBoundingClientRect();
    let closest;
    let distance = Infinity;
    [...viewport.querySelectorAll(".goal-card")].forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const gapToCard = Math.hypot(midpoint.x - center.x, midpoint.y - center.y);
      if (gapToCard < distance) {
        distance = gapToCard;
        closest = {
          index,
          center: { x: center.x - bounds.left, y: center.y - bounds.top },
        };
      }
    });
    return closest;
  };

  const onPointerDown = (event) => {
    const card = event.target.closest(".goal-card");
    if (event.pointerType === "mouse") suppressClick.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);
    if (pointers.current.size === 2) {
      const center = pinchCenter();
      const scale = canvasScale(zoom, level, window.innerWidth);
      const cardHit = nearestCard();
      gesture.current = {
        type: "pinch",
        pinchDistance: pinchDistance(),
        pinchZoom: zoom,
        pinchWorldPoint: center
          ? { x: (center.x - origin.x) / scale, y: (center.y - origin.y) / scale }
          : undefined,
        pinchCardIndex: cardHit?.index,
        pinchLevel: level,
        pinchCardOffset:
          cardHit && center
            ? { x: cardHit.center.x - center.x, y: cardHit.center.y - center.y }
            : undefined,
      };
      return;
    }
    gesture.current = {
      type: "pan",
      last: point,
      cardId: card?.dataset.goalId,
      travel: 0,
    };
  };

  const onPointerMove = (event) => {
    if (!pointers.current.has(event.pointerId)) return;
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);
    if (gesture.current.type === "pinch") {
      const startDistance = gesture.current.pinchDistance || 1;
      const nextZoom = Math.max(
        minZoom,
        Math.min(
          maxZoom(window.innerWidth),
          (gesture.current.pinchZoom || zoom) * (pinchDistance() / startDistance),
        ),
      );
      const nextLevel = zoomLevel(gesture.current.pinchLevel ?? level, nextZoom);
      gesture.current.pinchLevel = nextLevel;
      const center = pinchCenter();
      const worldPoint = gesture.current.pinchWorldPoint;
      const scale = canvasScale(nextZoom, nextLevel, window.innerWidth);
      const cardIndex = gesture.current.pinchCardIndex;
      const cardOffset = gesture.current.pinchCardOffset;
      if (cardIndex !== undefined && center && cardOffset) {
        const position = cardPosition(cardIndex, nextLevel, scale);
        const size = cardSize[nextLevel];
        setOrigin({
          x: center.x + cardOffset.x - (position.x + size.width / 2) * scale,
          y: center.y + cardOffset.y - (position.y + size.height / 2) * scale,
        });
      } else if (center && worldPoint) {
        setOrigin({
          x: center.x - worldPoint.x * scale,
          y: center.y - worldPoint.y * scale,
        });
      }
      setZoom(nextZoom);
      setLevel(nextLevel);
      return;
    }
    const last = gesture.current.last;
    if (!last) return;
    const delta = { x: point.x - last.x, y: point.y - last.y };
    gesture.current.last = point;
    gesture.current.travel = (gesture.current.travel || 0) + Math.hypot(delta.x, delta.y);
    if (gesture.current.type === "pan") {
      setOrigin((current) => ({ x: current.x + delta.x, y: current.y + delta.y }));
    }
  };

  const onPointerUp = (event) => {
    const pinching = gesture.current.type === "pinch";
    const cardId = gesture.current.cardId;
    const travel = gesture.current.travel || 0;
    pointers.current.delete(event.pointerId);
    if (pinching && pointers.current.size < 2) pointers.current.clear();
    if (event.pointerType === "mouse" && cardId && travel < 6) {
      suppressClick.current = true;
      const goal = goals.find((item) => item.id === cardId);
      if (goal) {
        requestAnimationFrame(() => {
          suppressClick.current = false;
          openGoalRef.current(goal);
        });
      }
    }
    if (pointers.current.size === 0) gesture.current = { type: null };
  };

  const openFromCanvas = (goal, key) => {
    setTransitionKey(key);
    requestAnimationFrame(() => {
      runViewTransition(() => {
        flushSync(() => setOpenGoal(goal));
      });
    });
  };

  openGoalRef.current = (goal) => openFromCanvas(goal, `canvas-${goal.id}`);
  const scale = canvasScale(zoom, level, window.innerWidth);
  const fonts = typeScale(zoom, level);

  if (openGoal) {
    return (
      <main className="app-shell">
        <GoalPage
          goal={openGoal}
          onClose={() => {
            const transition = runViewTransition(() => {
              flushSync(() => setOpenGoal(null));
            });
            if (transition) transition.finished.finally(() => setTransitionKey(null));
            else setTransitionKey(null);
          }}
        />
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <p className="date-label">TUE 11 AUGUST</p>
          <h1>Life</h1>
        </div>
        <button
          className="canvas-pill"
          type="button"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <img src={asset("assets/4fb4f.svg")} alt="" />
          <span>{view === "canvas" ? "Canvas" : "Timeline"}</span>
        </button>
      </header>
      {menuOpen && (
        <>
          <button
            className="view-menu-scrim"
            aria-label="Close view menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="view-menu" role="menu">
            <button
              className={view === "canvas" ? "active" : ""}
              role="menuitem"
              onClick={() => {
                setView("canvas");
                setMenuOpen(false);
              }}
            >
              <img src={asset("assets/2d278.svg")} alt="" />
              <span>Canvas</span>
            </button>
            <button
              className={view === "timeline" ? "active" : ""}
              role="menuitem"
              onClick={() => {
                setView("timeline");
                setMenuOpen(false);
              }}
            >
              <img src={asset("assets/d240d.svg")} alt="" />
              <span>Timeline</span>
            </button>
          </div>
        </>
      )}
      {transitionKey && (
        <div className="goal-control-transition-anchors" aria-hidden="true">
          <span className="goal-back-transition-anchor" />
          <span className="goal-private-transition-anchor" />
        </div>
      )}
      {view === "canvas" ? (
        <div
          className="canvas-viewport"
          ref={viewportRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className="canvas-world"
            style={{ transform: `translate3d(${origin.x}px, ${origin.y}px, 0) scale(${scale})` }}
          >
            {goals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                position={cardPosition(index, level, scale)}
                level={level}
                scale={fonts}
                transitioning={transitionKey === `canvas-${goal.id}`}
                onOpen={() => {
                  if (suppressClick.current) {
                    suppressClick.current = false;
                    return;
                  }
                  openFromCanvas(goal, `canvas-${goal.id}`);
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <Timeline
          transitioningGoalKey={transitionKey}
          onOpenGoal={(goal, key) =>
            openFromCanvas(
              {
                title: goal.title,
                date: "Summer · 2027",
                image: goal.image,
                private: goal.private,
              },
              key,
            )
          }
        />
      )}
      {view === "canvas" && (
        <div className="zoom-status" aria-live="polite">
          {level === 0 ? "Overview" : level === 1 ? "Default" : "Focused"}
        </div>
      )}
      <BottomNav />
    </main>
  );
}
