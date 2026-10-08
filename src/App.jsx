import { flushSync } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { asset } from "./asset.js";
import { goals, timeline } from "./data.js";
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
  const milestonesDone = goal.milestoneGroups.filter((group) => group.tone === "done").length;
  const milestonesTotal = goal.milestoneGroups.length;
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
              <div className={`progress-track${goal.progress >= 90 ? " is-complete" : ""}`}>
                <span style={{ width: `${goal.progress}%` }} />
              </div>
            </div>
          )}
          {level === 2 && (
            <div className="progress progress-focused">
              <div className="progress progress-inline">
                <span>{goal.progress}%</span>
                <div className={`progress-track${goal.progress >= 90 ? " is-complete" : ""}`}>
                  <span style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
              <div className="goal-funds">
                <span>
                  {formatMoney(goal.funded)} of {formatMoney(goal.target)}
                </span>
                <span>
                  {milestonesDone} of {milestonesTotal} · To-dos
                </span>
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
      className={`timeline-card${marker ? " is-marker timeline-neutral" : ""} ${transitioning ? "is-transitioning" : ""}`}
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
  const milestoneGroups = goal.milestoneGroups;
  const [openMilestones, setOpenMilestones] = useState(() =>
    milestoneGroups.flatMap((group, index) => (group.tone === "tracking" ? [index] : [])),
  );
  const [groups, setGroups] = useState(milestoneGroups);
  const [editingTodos, setEditingTodos] = useState(false);
  const [todoDraft, setTodoDraft] = useState(milestoneGroups);
  const [goalFunds, setGoalFunds] = useState(goal.target);
  const [savedFunds, setSavedFunds] = useState(goal.funded);
  const [puttingAway, setPuttingAway] = useState(goal.monthly);
  const [frequency, setFrequency] = useState(goal.frequency || "month");
  const [editingFunds, setEditingFunds] = useState(false);
  const [goalDraft, setGoalDraft] = useState(String(goal.target));
  const [savedDraft, setSavedDraft] = useState(String(goal.funded));
  const [puttingDraft, setPuttingDraft] = useState(String(goal.monthly));
  const [frequencyDraft, setFrequencyDraft] = useState(goal.frequency || "month");
  const fundsPercent = goalFunds > 0 ? Math.min(100, Math.round((savedFunds / goalFunds) * 100)) : 0;
  const commitAmount = (value, fallback) => {
    const next = Number(value);
    return Number.isFinite(next) && next >= 0 ? next : fallback;
  };
  const toggleFundsEdit = () => {
    if (!editingFunds) {
      setGoalDraft(String(goalFunds));
      setSavedDraft(String(savedFunds));
      setPuttingDraft(String(puttingAway));
      setFrequencyDraft(frequency);
      setEditingFunds(true);
      return;
    }
    setGoalFunds(commitAmount(goalDraft, goalFunds));
    setSavedFunds(commitAmount(savedDraft, savedFunds));
    setPuttingAway(commitAmount(puttingDraft, puttingAway));
    setFrequency(frequencyDraft);
    setEditingFunds(false);
  };
  const [chat, setChat] = useState(null);
  const openChat = (title, messages) => setChat({ title, messages });
  const toggleMilestone = (index) => {
    setOpenMilestones((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
    );
  };
  const updateTodoGroup = (groupIndex, title) => {
    setTodoDraft((current) =>
      current.map((group, index) => (index === groupIndex ? { ...group, title } : group)),
    );
  };
  const updateTodoItem = (groupIndex, itemIndex, patch) => {
    setTodoDraft((current) =>
      current.map((group, index) => {
        if (index !== groupIndex) return group;
        return {
          ...group,
          items: group.items.map((item, index) => (index === itemIndex ? { ...item, ...patch } : item)),
        };
      }),
    );
  };
  const toggleTodosEdit = () => {
    if (!editingTodos) {
      setTodoDraft(groups.map((group) => ({ ...group, items: group.items.map((item) => ({ ...item })) })));
      setEditingTodos(true);
      return;
    }
    setGroups(
      todoDraft.map((group, index) => {
        const previous = groups[index];
        return {
          ...group,
          title: group.title.trim() || previous.title,
          items: group.items.map((item, itemIndex) => {
            const previousItem = previous.items[itemIndex];
            const detail = item.detail?.trim() ?? "";
            return {
              ...item,
              title: item.title.trim() || previousItem.title,
              detail: detail || undefined,
            };
          }),
        };
      }),
    );
    setEditingTodos(false);
  };
  return (
    <div className="goal-page">
      <div className="goal-page-hero">
        <img
          className="goal-page-hero-background"
          src={goal.image || asset("assets/429f6.png")}
          alt=""
        />
        <img
          className="goal-page-transition-image"
          src={goal.image || asset("assets/429f6.png")}
          alt=""
        />
        <div className="goal-page-hero-bar">
          <button className="goal-page-back" onClick={onClose} aria-label="Back">
            <img src={asset("assets/982d7.svg")} alt="" />
          </button>
          {goal.private && (
            <span className="goal-page-private">
              <img src={asset("assets/ca787.svg")} alt="" />
              Private
            </span>
          )}
        </div>
      </div>
      <div className="goal-page-sheet">
        <div className="goal-page-sheet-backdrop" aria-hidden="true" />
        <div className="goal-page-body">
          <section className="goal-page-details">
            <p className="goal-page-date">{goal.date}</p>
            <h1>{goal.pageTitle || goal.title}</h1>
            <p className="goal-page-description">{goal.description}</p>
          </section>
          <section className="funds-panel" id="funds">
            <div className="funds-heading">
              <h2>Budget</h2>
              <button
                type="button"
                className="funds-update"
                aria-label={editingFunds ? "Save the budget" : "Update the budget"}
                onClick={toggleFundsEdit}
              >
                {editingFunds ? (
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3.2 8.4 6.3 11.5 12.8 4.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <img src={asset("assets/goal-edit.svg")} alt="" />
                )}
              </button>
            </div>
            <div className="funds-card">
              <div className="funds-row is-goal">
                <span>Goal</span>
                {editingFunds ? (
                  <input
                    aria-label="Goal amount"
                    inputMode="decimal"
                    value={goalDraft}
                    onChange={(event) => setGoalDraft(event.target.value)}
                  />
                ) : (
                  <strong>{formatMoney(goalFunds)}</strong>
                )}
              </div>
              <div className="funds-row is-saved">
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
              <div className="funds-row is-monthly">
                <span>Putting away</span>
                {editingFunds ? (
                  <span className="funds-monthly">
                    <input
                      aria-label="Amount put away"
                      inputMode="decimal"
                      value={puttingDraft}
                      onChange={(event) => setPuttingDraft(event.target.value)}
                    />
                    <span>/</span>
                    <select
                      aria-label="How often"
                      value={frequencyDraft}
                      onChange={(event) => setFrequencyDraft(event.target.value)}
                    >
                      <option value="week">week</option>
                      <option value="month">month</option>
                      <option value="year">year</option>
                    </select>
                  </span>
                ) : (
                  <strong>{formatMoney(puttingAway)} / {frequency}</strong>
                )}
              </div>
              <div className={`goal-funds-track${fundsPercent >= 90 ? " is-complete" : ""}`}>
                <i style={{ width: `${fundsPercent}%` }} />
              </div>
            </div>
          </section>
          <section className="todo-panel" id="milestones">
            <div className="funds-heading">
              <h2>To-do list</h2>
              <div className="todo-heading-meta">
                <div className="todo-dots" aria-hidden="true">
                  {groups.slice(0, 10).map((group, index) => (
                    <i key={index} className={group.tone === "done" ? "is-done" : group.tone === "tracking" ? "is-next" : "is-later"} />
                  ))}
                </div>
                <button
                  type="button"
                  className="funds-update"
                  aria-label={editingTodos ? "Save to-dos" : "Update to-dos"}
                  onClick={toggleTodosEdit}
                >
                  {editingTodos ? (
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M3.2 8.4 6.3 11.5 12.8 4.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <img className="todo-edit" src={asset("assets/goal-edit.svg")} alt="" />
                  )}
                </button>
              </div>
            </div>
            <div className="todo-card">
              {(editingTodos ? todoDraft : groups).map((group, groupIndex) => {
                const actions = group.items.slice(0, 2);
                const open = openMilestones.includes(groupIndex);
                const radio = group.tone === "done"
                  ? "assets/goal-radio-done.svg?v=2"
                  : group.tone === "tracking"
                    ? "assets/goal-radio-tracking.svg?v=2"
                    : "assets/goal-radio-later.svg?v=2";
                const status = (
                  <span className="milestone-group-meta">
                    <span className="milestone-group-status">{group.tone === "done" ? "Done" : actions.filter((item) => !item.done).length}</span>
                    <img
                      className="milestone-toggle"
                      src={asset(open ? "assets/goal-chevron-up.svg" : "assets/goal-chevron-down.svg")}
                      alt=""
                    />
                  </span>
                );
                return (
                  <div className={`milestone-group is-${group.tone}${open ? " is-open" : ""}`} key={groupIndex}>
                    {editingTodos ? (
                      <div className="milestone-group-head">
                        <img className="milestone-radio" src={asset(radio)} alt="" />
                        <input
                          className="milestone-group-title"
                          aria-label={`To-do ${groupIndex + 1}`}
                          placeholder="To-do"
                          value={group.title}
                          onChange={(event) => updateTodoGroup(groupIndex, event.target.value)}
                        />
                        <button type="button" className="milestone-group-toggle" aria-expanded={open} onClick={() => toggleMilestone(groupIndex)}>
                          {status}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="milestone-group-head"
                        aria-expanded={open}
                        onClick={() => toggleMilestone(groupIndex)}
                      >
                        <img className="milestone-radio" src={asset(radio)} alt="" />
                        <span className="milestone-group-title">{group.title}</span>
                        {status}
                      </button>
                    )}
                    {open && (
                      <div className="milestone-group-body">
                        <span className="milestone-line" />
                        <div className="milestone-cards">
                          {actions.map((item, itemIndex) => {
                            const circle = (
                              <span
                                className={`milestone-circle${item.done ? " is-done" : group.tone === "tracking" ? " is-next" : " is-later"}`}
                              />
                            );
                            const owner = item.owner === "photo" ? (
                              <img className="milestone-owner is-photo" src={asset("assets/avatar-photo.png")} alt="" />
                            ) : item.owner ? (
                              <span className="milestone-owner">{item.owner}</span>
                            ) : null;
                            if (editingTodos) {
                              return (
                                <div className="milestone-card" key={itemIndex}>
                                  {circle}
                                  <span className="milestone-card-fields">
                                    <input
                                      aria-label={`Sub-to-do ${itemIndex + 1}`}
                                      placeholder="Sub-to-do"
                                      value={item.title}
                                      onChange={(event) => updateTodoItem(groupIndex, itemIndex, { title: event.target.value })}
                                    />
                                    <input
                                      aria-label={`Decision ${itemIndex + 1}`}
                                      placeholder="Decision"
                                      value={item.detail ?? ""}
                                      onChange={(event) => updateTodoItem(groupIndex, itemIndex, { detail: event.target.value })}
                                    />
                                  </span>
                                  {owner}
                                </div>
                              );
                            }
                            return (
                              <button
                                key={item.title}
                                type="button"
                                className="milestone-card"
                                onClick={() => openChat(item.title, item.history)}
                              >
                                {circle}
                                <span className="milestone-card-copy">
                                  <span>{item.title}</span>
                                  {item.detail && <strong>{item.detail}</strong>}
                                </span>
                                {owner}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
          <section className="kemble-suggests">
            <h2>Kemble suggests</h2>
            <p>{goal.suggestion}</p>
            <button type="button" onClick={() => openChat(goal.suggestion)}>
              Chat
            </button>
          </section>
          <section className="goal-chat">
            <h2>Chat history</h2>
            {goal.chatTopics.map((topic) => (
              <button key={topic} type="button" onClick={() => openChat(topic)}>
                <span>{topic}</span>
                <img src={asset("assets/goal-chevron-right.svg")} alt="" />
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
  const [messages, setMessages] = useState(chat.messages ?? []);
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
        <div className="view-nav" role="tablist" aria-label="Life view">
          <button
            className={view === "canvas" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={view === "canvas"}
            aria-label="Canvas"
            onClick={() => setView("canvas")}
          >
            <img src={asset(view === "canvas" ? "assets/view-canvas-active.svg" : "assets/view-canvas.svg")} alt="" />
          </button>
          <button
            className={view === "timeline" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={view === "timeline"}
            aria-label="Timeline"
            onClick={() => setView("timeline")}
          >
            <img src={asset(view === "timeline" ? "assets/view-timeline-active.svg" : "assets/view-timeline.svg")} alt="" />
          </button>
        </div>
      </header>
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
          onOpenGoal={(goal, key) => openFromCanvas(goal, key)}
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
