import { flushSync } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { asset } from "./asset.js";
import { chatTopics, goals, milestones, timeline } from "./data.js";
import {
  canvasOrigin,
  cardPosition,
  cardSize,
  levelScale,
  maxZoom,
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

function GoalCard({ goal, position, level, onOpen, transitioning }) {
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
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
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
              <div className="goal-status">
                <span>Progress · {goal.progress}%</span>
                <span>
                  {formatMoney(goal.funded)}/{formatMoney(goal.target)}
                </span>
                <span>
                  {goal.milestonesDone}/{goal.milestonesTotal} Milestones
                </span>
              </div>
              <div className="progress-track">
                <span style={{ width: `${goal.progress}%` }} />
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function TimelineCard({ goal, onOpen, transitioning }) {
  return (
    <article
      className={`timeline-card ${transitioning ? "is-transitioning" : ""} timeline-${goal.tone}`}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onOpen();
      }}
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
        <span className="timeline-count">{goal.count}</span>
      </div>
    </article>
  );
}

function Timeline({ onOpenGoal, transitioningGoalKey }) {
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
            <div className="goal-stat-card">
              <div>
                <span>Milestones achieved</span>
                <strong>1 of 4</strong>
              </div>
              <div className="goal-dots">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="goal-stat-card">
              <div>
                <span>Funds</span>
                <strong>£2k/£5k</strong>
              </div>
              <div className="goal-funds-track">
                <i />
              </div>
            </div>
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
            <div className="goal-next-input">
              <span>Let’s pick the dates</span>
              <button aria-label="Send">
                <img src={asset("assets/7644f.svg")} alt="" />
              </button>
            </div>
          </section>
          <section className="goal-copy-section">
            <h2>Recommended next steps</h2>
            <div className="recommendation-grid">
              <button className="recommendation-light">
                <span>Check leave with work</span>
                <img src={asset("assets/eb16c.svg")} alt="" />
              </button>
              <button className="recommendation-dark">
                <span>Create an automation for building funds</span>
                <img src={asset("assets/eb16c.svg")} alt="" />
              </button>
            </div>
          </section>
          <section className="milestone-panel">
            <h2>Milestones</h2>
            {milestones.map((item, index) => (
              <label className="milestone-row" key={item.title}>
                <input type="checkbox" defaultChecked={item.done} />
                <span>{item.title}</span>
                <small>{index === 0 ? "Done" : index === 2 ? "Tracking" : ""}</small>
              </label>
            ))}
          </section>
          <section className="goal-copy-section goal-chat">
            <h2>Chat</h2>
            {chatTopics.map((topic) => (
              <button key={topic}>
                <span>{topic}</span>
                <img src={asset("assets/076ec.svg")} alt="" />
              </button>
            ))}
          </section>
        </div>
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
        0.48,
        Math.min(maxZoom(window.innerWidth), zoom * Math.exp(-event.deltaY * 0.0015)),
      );
      const nextLevel = zoomLevel(level, nextZoom);
      const bounds = viewport.getBoundingClientRect();
      const pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      const currentScale = zoom / levelScale[level];
      const nextScale = nextZoom / levelScale[nextLevel];
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
      const scale = zoom / levelScale[level];
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
        0.48,
        Math.min(
          maxZoom(window.innerWidth),
          (gesture.current.pinchZoom || zoom) * (pinchDistance() / startDistance),
        ),
      );
      const nextLevel = zoomLevel(gesture.current.pinchLevel ?? level, nextZoom);
      gesture.current.pinchLevel = nextLevel;
      const center = pinchCenter();
      const worldPoint = gesture.current.pinchWorldPoint;
      const scale = nextZoom / levelScale[nextLevel];
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
  const scale = zoom / levelScale[level];

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
