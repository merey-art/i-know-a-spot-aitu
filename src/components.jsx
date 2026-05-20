import { useEffect, useRef, useState } from "react";
import { PEOPLE } from "./data";
import museumVideoSrc from "./assets/museum-shot.webm";
import museumHotspotFlag from "./assets/museum-hotspot-flag.jpg";
import museumHotspotFlagLeft from "./assets/museum-hotspot-flag-left.jpg";
import museumMap from "./assets/museum_map.JPG";
import museumCity1 from "./assets/museum_city1.JPG";
import museumCity2 from "./assets/museum_city2.JPG";
import museumTitles from "./assets/museum_titles.JPG";
import museumTitles1 from "./assets/museum_titles1.JPG";
import museumWar from "./assets/museum_war.JPG";
import museumWar1 from "./assets/museum_war1.JPG";
import museumExpo from "./assets/museum_expo.JPG";
import museumExpo1 from "./assets/museum_expo1.JPG";
import museumExpo2 from "./assets/museum_expo2.JPG";
import museumArt from "./assets/museum_art.JPG";
import museumArt1 from "./assets/museum_art1.JPG";
import {
  HISTORY_ARCHIVE_PHOTOS,
  HISTORY_COLLAGE,
  HISTORY_HERO_BG,
  HISTORY_VIDEO_BLOCKS,
} from "./data/historyAssets";
import preIntroVideoSrc from "../night scene shot (online-video-cutter.com).mp4";
import natureHeroVideo from "./images/nature-tab/мельницы.mp4";
import natureBranchVideo from "./images/nature-tab/рандом ветка.mp4";

const OPENING_TITLE = "I Know a Spot";

function ChevronIcon({ direction }) {
  const isLeft = direction === "left";
  return (
    <svg width="26" height="16" viewBox="0 0 44 28" fill="none" aria-hidden>
      {isLeft ? (
        <>
          <path d="M 40,14 C 30,11.5 22,16.5 14,14 C 9,12.5 5.5,13.5 4,14"
                stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M 4,14 C 5.5,11 8.5,7.5 11.5,6"
                stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
          <path d="M 4,14 C 5.5,17 8.5,20.5 11.5,22"
                stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <path d="M 4,14 C 14,11.5 22,16.5 30,14 C 35,12.5 38.5,13.5 40,14"
                stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M 40,14 C 38.5,11 35.5,7.5 32.5,6"
                stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
          <path d="M 40,14 C 38.5,17 35.5,20.5 32.5,22"
                stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
        </>
      )}
    </svg>
  );
}


export function StoryProgressBar({
  visible,
  steps,
  currentIndex,
  onSelectStep,
  onPrev,
  onNext,
}) {
  if (!visible) return null;

  return (
    <div className="story-progress-bar" role="navigation" aria-label="Story navigation">
      <button
        className="story-nav-btn"
        onClick={onPrev}
        disabled={currentIndex <= 0}
        aria-label="Previous"
      >
        <ChevronIcon direction="left" />
      </button>

      <div className="story-progress-track">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          return (
            <button
              key={step.id}
              className={`story-step${isActive ? " active" : ""}${isCompleted ? " done" : ""}`}
              onClick={() => onSelectStep(step.id)}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="story-step-dot" />
              <span className="story-step-label">{step.label}</span>
            </button>
          );
        })}
      </div>

      <button
        className="story-nav-btn"
        onClick={onNext}
        disabled={currentIndex >= steps.length - 1}
        aria-label="Next"
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}

export function PreIntroVideoSection({ active, onFinish }) {
  const FADE_DURATION_MS = 2000;
  const OVERLAY_START_S = 9;
  const OVERLAY_DURATION_S = 1;
  const SKIP_DARKEN_MS = 800;

  const [isExiting, setIsExiting] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [overlayTransition, setOverlayTransition] = useState("none");
  const postDarkenTimerRef = useRef(null);
  const exitFadeTimerRef = useRef(null);
  const isExitingRef = useRef(false);
  const lockTimeOpacityRef = useRef(false);
  const opacityRef = useRef(0);
  const videoRef = useRef(null);
  const clearPostDarkenTimer = () => {
    if (postDarkenTimerRef.current) {
      window.clearTimeout(postDarkenTimerRef.current);
      postDarkenTimerRef.current = null;
    }
  };

  const clearExitFadeTimer = () => {
    if (exitFadeTimerRef.current) {
      window.clearTimeout(exitFadeTimerRef.current);
      exitFadeTimerRef.current = null;
    }
  };

  const clearAllTimers = () => {
    clearPostDarkenTimer();
    clearExitFadeTimer();
  };

  useEffect(() => {
    if (!active) {
      videoRef.current?.pause();
      isExitingRef.current = false;
      lockTimeOpacityRef.current = false;
      opacityRef.current = 0;
      setIsExiting(false);
      setOverlayOpacity(0);
      setOverlayTransition("none");
      clearAllTimers();
    }
  }, [active]);

  useEffect(() => () => clearAllTimers(), []);

  const finishWithFade = () => {
    if (isExitingRef.current) return;
    clearPostDarkenTimer();
    isExitingRef.current = true;
    setIsExiting(true);
    exitFadeTimerRef.current = window.setTimeout(() => {
      onFinish();
      exitFadeTimerRef.current = null;
    }, FADE_DURATION_MS);
  };

  const scheduleFinishAfterDarken = (transitionMs) => {
    clearPostDarkenTimer();
    postDarkenTimerRef.current = window.setTimeout(() => {
      postDarkenTimerRef.current = null;
      finishWithFade();
    }, transitionMs + 100);
  };

  const handleTimeUpdate = (event) => {
    if (lockTimeOpacityRef.current) return;
    const t = event.currentTarget.currentTime;
    const next = Math.min(
      1,
      Math.max(0, (t - OVERLAY_START_S) / OVERLAY_DURATION_S),
    );
    opacityRef.current = next;
    setOverlayOpacity(next);
  };

  const handleEnded = () => {
    if (isExitingRef.current) return;
    const o = opacityRef.current;
    if (o >= 0.998) {
      finishWithFade();
      return;
    }
    lockTimeOpacityRef.current = true;
    const ms = Math.max(900, Math.round((1 - o) * OVERLAY_DURATION_S * 1000));
    setOverlayTransition(`opacity ${ms}ms ease-in-out`);
    opacityRef.current = 1;
    setOverlayOpacity(1);
    scheduleFinishAfterDarken(ms);
  };

  const handleSkip = () => {
    if (isExitingRef.current) return;
    const o = opacityRef.current;
    if (o >= 0.998) {
      finishWithFade();
      return;
    }
    lockTimeOpacityRef.current = true;
    setOverlayTransition(`opacity ${SKIP_DARKEN_MS}ms ease-in-out`);
    opacityRef.current = 1;
    setOverlayOpacity(1);
    scheduleFinishAfterDarken(SKIP_DARKEN_MS);
  };

  return (
    <section
      className={`section pre-intro-video-section${active ? " active" : ""}${
        isExiting ? " exiting" : ""
      }`}
    >
      <video
        ref={videoRef}
        className="pre-intro-video"
        src={preIntroVideoSrc}
        autoPlay
        muted
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      <div className="pre-intro-video-fade" />
      <div
        className="pre-intro-darken-overlay"
        style={{
          opacity: overlayOpacity,
          transition: overlayTransition,
        }}
        aria-hidden
      />
      <button type="button" className="pre-intro-skip" onClick={handleSkip}>
        Skip
      </button>
    </section>
  );
}

const CHAPTER_NAV = [
  { num: "01", label: "History", ru: "История", key: "history" },
  { num: "02", label: "People",  ru: "Лица",    key: "people"  },
  { num: "03", label: "Nature",  ru: "Природа", key: "nature"  },
  { num: "04", label: "Authors", ru: "Авторы",  key: "authors" },
];

export function OpeningSection({ onEnter, onLoadChapter, isVisible }) {
  const videoRef = useRef(null);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (isVisible && !activated) setActivated(true);
  }, [isVisible, activated]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isVisible) v.play().catch(() => {});
    else v.pause();
  }, [isVisible]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const KEY = "opening-video-time";
    const saved = parseFloat(localStorage.getItem(KEY) || "0");
    if (!Number.isNaN(saved) && saved > 0) {
      try { v.currentTime = saved; } catch { /* ignore */ }
    }
    const handler = () => {
      try { localStorage.setItem(KEY, String(v.currentTime)); } catch { /* ignore */ }
    };
    v.addEventListener("timeupdate", handler);
    return () => v.removeEventListener("timeupdate", handler);
  }, []);

  return (
    <section className={`opening${activated ? " opening--active" : ""}`}>
      <video
        ref={videoRef}
        className="bg-video"
        src={`${import.meta.env.BASE_URL}пейзаааж.webm`}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="bg-tint" aria-hidden />
      <div className="bg-vignette" aria-hidden />
      <div className="bg-grain" aria-hidden />

      <div className="frame-marks" aria-hidden>
        <span className="mark mark-tl">ER · 51.6°N / 73.1°E</span>
        <span className="mark mark-tr">EREYMENTAU · 2025</span>
      </div>

      <div className="opening-title">
        <div className="title-eyebrow">
          <span className="eyebrow-line" />
          <span className="eyebrow-text">A documentary in four chapters</span>
          <span className="eyebrow-line" />
        </div>

        <div className="title-main" aria-label={OPENING_TITLE}>
          {OPENING_TITLE.split("").map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className={`title-letter${letter === " " ? " title-letter-space" : ""}`}
              style={{ animationDelay: `${0.4 + index * 0.085}s` }}
            >
              {letter === " " ? " " : letter}
            </span>
          ))}
        </div>

        <div className="title-sub">Ereymentau · Ерейментау · Documentary</div>

        <button className="enter-btn" onClick={onEnter}>
          <span className="enter-btn-label">Begin</span>
          <span className="enter-btn-arrow" aria-hidden>→</span>
          <span className="enter-btn-glow" aria-hidden />
        </button>
      </div>

      <nav className="chapter-nav" aria-label="Chapters">
        <div className="chapter-nav-rail" aria-hidden />
        <ol className="chapter-nav-list">
          {CHAPTER_NAV.map((c, i) => (
            <li
              key={c.num}
              className="chapter-nav-item"
              style={{ animationDelay: `${2.6 + i * 0.18}s` }}
            >
              <button className="chapter-btn" type="button" onClick={() => onLoadChapter(c.key)}>
                <span className="chapter-num">{c.num}</span>
                <span className="chapter-label">
                  <span className="chapter-label-en">{c.label}</span>
                  <span className="chapter-label-ru">{c.ru}</span>
                </span>
                <span className="chapter-tick" aria-hidden />
              </button>
            </li>
          ))}
        </ol>
        <div className="chapter-nav-meta">
          <span className="meta-dot" aria-hidden />
          <span>scroll / tap a chapter to enter</span>
        </div>
      </nav>
    </section>
  );
}

export function ShowreelPanel({ isVisible }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isVisible) v.play().catch(() => {});
    else v.pause();
  }, [isVisible]);

  return (
    <div className="showreel-panel">
      <video
        ref={videoRef}
        className="showreel-bg"
        src={`${import.meta.env.BASE_URL}showreel.webm`}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="showreel-scrim" aria-hidden />
      <div className="showreel-card">
        <div className="showreel-card-tape" aria-hidden />
        <p className="showreel-card-title">A city at the edge<br />of the steppe</p>
        <p className="showreel-card-body">
          Ereymentau. A city of twelve thousand souls, sitting at the edge of the Kazakh steppe.
          Two granite hills rise above everything — that's where the name comes from.
          This is where we came with our cameras. This is what we found.
        </p>
      </div>
    </div>
  );
}

export function IntroSection({ typewriterText, showContinue, onContinue, isVisible }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isVisible) v.play().catch(() => {});
    else v.pause();
  }, [isVisible]);

  return (
    <section className="slide-up">
      <video
        ref={videoRef}
        className="intro-bg-video"
        src={`${import.meta.env.BASE_URL}showreel.webm`}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="intro-bg-scrim" aria-hidden />
      <div className="intro-inner">
        <div className="intro-label">Field notes · 2024</div>
        <div className="intro-heading">
          A city at the edge
          <br />
          of the steppe
        </div>
        <div className="intro-text">{typewriterText}</div>
        <button
          className={`intro-continue${showContinue ? " visible" : ""}`}
          onClick={onContinue}
        >
          Explore the Map
        </button>
      </div>
    </section>
  );
}

const MAP_TREES = [
  /* North band — dense forest line above the city */
  { x: 40,  y: 32,  s: 0.7,  kind: "pine" },
  { x: 70,  y: 22,  s: 0.85, kind: "pine" },
  { x: 95,  y: 36,  s: 0.75, kind: "bush" },
  { x: 130, y: 18,  s: 1.0,  kind: "pine" },
  { x: 165, y: 32,  s: 0.9,  kind: "pine" },
  { x: 200, y: 22,  s: 0.8,  kind: "pine" },
  { x: 230, y: 38,  s: 0.7,  kind: "bush" },
  { x: 260, y: 20,  s: 0.95, kind: "pine" },
  { x: 295, y: 32,  s: 0.8,  kind: "pine" },
  { x: 325, y: 22,  s: 0.85, kind: "pine" },
  { x: 360, y: 30,  s: 1.0,  kind: "pine" },
  { x: 390, y: 18,  s: 0.75, kind: "bush" },
  { x: 420, y: 32,  s: 0.9,  kind: "pine" },
  { x: 450, y: 22,  s: 0.85, kind: "pine" },
  { x: 478, y: 38,  s: 0.7,  kind: "pine" },
  /* East edge */
  { x: 472, y: 70,  s: 0.7,  kind: "bush" },
  { x: 485, y: 100, s: 0.85, kind: "pine" },
  { x: 478, y: 140, s: 0.75, kind: "bush" },
  { x: 488, y: 175, s: 0.9,  kind: "pine" },
  { x: 470, y: 215, s: 0.8,  kind: "pine" },
  { x: 478, y: 250, s: 0.7,  kind: "bush" },
  /* South band */
  { x: 30,  y: 235, s: 0.85, kind: "pine" },
  { x: 22,  y: 280, s: 0.75, kind: "bush" },
  { x: 36,  y: 320, s: 0.9,  kind: "pine" },
  { x: 60,  y: 350, s: 0.8,  kind: "pine" },
  { x: 95,  y: 332, s: 0.7,  kind: "bush" },
  { x: 122, y: 360, s: 0.95, kind: "pine" },
  { x: 155, y: 348, s: 0.85, kind: "pine" },
  { x: 188, y: 358, s: 0.75, kind: "bush" },
  { x: 218, y: 348, s: 0.9,  kind: "pine" },
  { x: 250, y: 358, s: 0.8,  kind: "pine" },
  { x: 282, y: 342, s: 0.85, kind: "pine" },
  { x: 315, y: 352, s: 0.7,  kind: "bush" },
  { x: 348, y: 332, s: 0.95, kind: "pine" },
  { x: 380, y: 318, s: 0.85, kind: "pine" },
  { x: 412, y: 296, s: 0.9,  kind: "pine" },
  { x: 442, y: 272, s: 0.75, kind: "bush" },
  /* Interior vegetation clumps */
  { x: 170, y: 110, s: 0.6,  kind: "bush" },
  { x: 195, y: 140, s: 0.55, kind: "pine" },
  { x: 220, y: 100, s: 0.6,  kind: "bush" },
  { x: 290, y: 150, s: 0.55, kind: "pine" },
  { x: 320, y: 130, s: 0.55, kind: "bush" },
  { x: 365, y: 105, s: 0.6,  kind: "pine" },
  { x: 395, y: 130, s: 0.55, kind: "bush" },
  { x: 250, y: 210, s: 0.6,  kind: "pine" },
  { x: 280, y: 240, s: 0.55, kind: "bush" },
  { x: 220, y: 250, s: 0.55, kind: "bush" },
  { x: 130, y: 200, s: 0.55, kind: "pine" },
  { x: 100, y: 235, s: 0.55, kind: "bush" },
];

export function MapHub({
  onLoadChapter,
  mapTransform,
  mapPoints,
  mapHubPhase,
  mapDrawRun,
}) {
  const showMap = mapHubPhase === "drawing" || mapHubPhase === "points";
  const showPoints = mapHubPhase === "points";

  return (
    <section className="map-hub-section">
      <div className="map-hub-inner">
        <header className="map-hub-heading" aria-label="Map title">
          <h1 className="map-sidebar-title">I Know a Spot</h1>
          <p className="map-sidebar-sub">Ereymentau, Kazakhstan</p>
        </header>
        <div
          className={`map-container${showMap ? " map-container-visible" : ""}`}
          style={{ transform: mapTransform }}
        >
        <svg
          key={mapDrawRun}
          className="map-svg"
          viewBox="0 0 500 380"
          role="img"
          aria-label="Map silhouette with chapter points"
        >
          <path
            className="map-outline"
            pathLength={1}
            d="M52 112 L128 76 L236 64 L424 58 L444 126 L432 164 L192 292 L166 340 L118 278 L52 202 Z"
          />
          {showPoints &&
            mapPoints.map((point) => (
            <g
              key={point.id}
              className="map-random-point clickable"
              onClick={() => onLoadChapter(point.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onLoadChapter(point.key);
                }
              }}
            >
              <circle cx={point.x} cy={point.y} r="3.2" />
              <text x={point.x + 6} y={point.y - 6}>
                {point.label}
              </text>
            </g>
            ))}
          {showPoints && (
            <g transform="translate(250,190) scale(0.93) translate(-250,-190)">
              {MAP_TREES.map((t, i) => (
                <g
                  key={i}
                  className={`map-tree map-tree--${t.kind}`}
                  transform={`translate(${t.x}, ${t.y}) scale(${t.s})`}
                  style={{ animationDelay: `${0.1 + i * 0.04}s` }}
                >
                  {t.kind === "pine" ? (
                    <>
                      <path d="M0 -22 L-7 -8 L-3 -8 L-9 4 L9 4 L3 -8 L7 -8 Z" className="map-tree-top" />
                      <rect x="-1.4" y="4" width="2.8" height="5" className="map-tree-trunk" />
                    </>
                  ) : (
                    <>
                      <circle cx="-3" cy="0"  r="4.5" className="map-tree-top" />
                      <circle cx="3"  cy="-1" r="4.5" className="map-tree-top" />
                      <circle cx="0"  cy="3"  r="4"   className="map-tree-top" />
                      <rect x="-0.8" y="6" width="1.6" height="3" className="map-tree-trunk" />
                    </>
                  )}
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>
      </div>
    </section>
  );
}

// ─── History panels ───────────────────────────────────────────────────────────

export function HistoryHeroPanel({ isVisible }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isVisible) v.play().catch(() => {});
    else v.pause();
  }, [isVisible]);

  return (
    <div className="history-hero-screen">
      <video
        ref={videoRef}
        className="history-hero-bg-video"
        src={`${import.meta.env.BASE_URL}showreel-museum.webm`}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="history-hero-bg-scrim" aria-hidden />
      <div className="history-hero-inner">
        <div className="chapter-eyebrow">Chapter I · Foundation</div>
        <h2 className="history-hero-title">History of Ereymentau</h2>
        <p className="history-hero-copy">
          The city begins as a steppe settlement near trade routes and
          defensive posts. Over two centuries, it grows from a frontier point
          into a place where memory, landscape, and people stay tightly
          connected.
        </p>
      </div>
    </div>
  );
}

export function HistoryCollagePanel({ isVisible }) {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setSettled(false);
      return;
    }
    const timer = window.setTimeout(() => setSettled(true), 200);
    return () => window.clearTimeout(timer);
  }, [isVisible]);

  return (
    <div className="history-collage-section">
      <h3 className="history-block-title">Scroll Collage</h3>
      <p className="history-block-sub">
        Archive stills drift and settle as you enter the chapter.
      </p>
      <div className="history-collage-grid">
        {HISTORY_COLLAGE.map((item, index) => {
          const direction = index % 2 === 0 ? -1 : 1;
          const drift = settled ? 0 : 120 * direction;
          const lift = settled ? 0 : 18;
          return (
            <article
              key={item.id}
              className="history-collage-card"
              style={{
                transform: `translate(${drift}px, ${lift}px)`,
                opacity: settled ? 1 : 0.4,
                transition: `transform 0.6s ease ${index * 0.05}s, opacity 0.6s ease ${index * 0.05}s`,
              }}
            >
              <div className="history-collage-image">
                <img src={item.src} alt="" loading="lazy" />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function HistoryCarouselPanel() {
  const VISIBLE_SLIDES = 3;
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [zoomedPhoto, setZoomedPhoto] = useState(null);

  const maxIndex = Math.max(HISTORY_ARCHIVE_PHOTOS.length - VISIBLE_SLIDES, 0);
  const visiblePhotos = HISTORY_ARCHIVE_PHOTOS.slice(
    carouselIndex,
    carouselIndex + VISIBLE_SLIDES,
  );

  return (
    <>
      <div className="history-carousel-section">
        <h3 className="history-block-title">Archive Carousel</h3>
        <p className="history-block-sub">
          Old town, residents, and album fragments. Click card to zoom.
        </p>
        <div className="history-carousel-controls">
          <button
            className="history-carousel-btn"
            onClick={() => setCarouselIndex((prev) => Math.max(prev - 1, 0))}
            disabled={carouselIndex === 0}
            aria-label="Previous"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            className="history-carousel-btn"
            onClick={() =>
              setCarouselIndex((prev) => Math.min(prev + 1, maxIndex))
            }
            disabled={carouselIndex >= maxIndex}
            aria-label="Next"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
        <div className="history-carousel-track">
          {visiblePhotos.map((photo) => (
            <button
              key={photo.id}
              className="history-carousel-item"
              onClick={() => setZoomedPhoto(photo)}
            >
              <div className="history-carousel-image">
                <img src={photo.src} alt="" loading="lazy" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {zoomedPhoto && (
        <div className="overlay" onClick={() => setZoomedPhoto(null)}>
          <div
            className="modal-inner history-photo-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setZoomedPhoto(null)}>
              ✕ close
            </button>
            <div className="history-zoom-image">
              <img src={zoomedPhoto.src} alt="" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function HistoryVideoPanel({ block, isVisible }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    if (isVisible) {
      const play = () => node.play().catch(() => {});
      if (node.readyState >= 2) play();
      else node.addEventListener("loadeddata", play, { once: true });
    } else {
      node.pause();
      node.currentTime = 0;
    }
  }, [isVisible]);

  return (
    <div className="history-video-section history-video-panel">
      <div className="history-video-bg">
        <video
          ref={videoRef}
          className="history-video-fill"
          src={block.src}
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
      <div className="history-video-overlay">
        <h3>{block.title}</h3>
        <p>{block.body}</p>
      </div>
    </div>
  );
}

const MUSEUM_HOTSPOTS = [
  {
    id: "museum-map",
    timeStart: 16,
    timeEnd: 20,
    x: 50,
    y: 50,
    image: museumMap,
  },
  {
    id: "museum-city",
    timeStart: 23,
    timeEnd: 30,
    x: 50,
    y: 50,
    images: [museumCity1, museumCity2],
  },
  {
    id: "museum-titles",
    timeStart: 34,
    timeEnd: 37,
    x: 50,
    y: 50,
    images: [museumTitles, museumTitles1],
  },
  {
    id: "museum-war",
    timeStart: 40,
    timeEnd: 43,
    x: 50,
    y: 50,
    images: [museumWar, museumWar1],
  },
  {
    id: "museum-expo",
    timeStart: 60,
    timeEnd: 66,
    x: 50,
    y: 50,
    images: [museumExpo, museumExpo1, museumExpo2],
  },
  {
    id: "museum-art",
    timeStart: 136,
    timeEnd: 141,
    x: 50,
    y: 40,
    images: [museumArt, museumArt1],
  },
  {
    id: "flag-left",
    timeStart: 181,
    timeEnd: 183,
    x: 25,
    y: 35,
    image: museumHotspotFlagLeft,
  },
  {
    id: "flag-right",
    timeStart: 181,
    timeEnd: 183,
    x: 72,
    y: 35,
    image: museumHotspotFlag,
  },
];

export function MuseumVideoSection() {
  const videoRef = useRef(null);
  const scrollRef = useRef(null);
  const rafRef = useRef(null);
  const targetTimeRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [hotspotImageIndex, setHotspotImageIndex] = useState(0);

  useEffect(() => {
    const scroll = scrollRef.current;
    const video = videoRef.current;
    if (!scroll || !video) return;

    const loop = () => {
      if (!video.duration) { rafRef.current = null; return; }
      const diff = targetTimeRef.current - video.currentTime;
      if (Math.abs(diff) < 0.04) {
        video.pause();
        rafRef.current = null;
        return;
      }
      if (diff > 0) {
        const rate = Math.min(diff * 12, 6);
        video.playbackRate = Math.max(0.2, rate);
        if (video.paused) video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = targetTimeRef.current;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    const onScroll = () => {
      const max = scroll.scrollHeight - scroll.clientHeight;
      if (max <= 0) return;
      const p = scroll.scrollTop / max;
      setProgress(p);
      if (video.duration) {
        targetTimeRef.current = p * video.duration;
        if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
      }
    };

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onMetadata = () => {
      const max = scroll.scrollHeight - scroll.clientHeight;
      if (max > 0 && video.duration) {
        targetTimeRef.current = (scroll.scrollTop / max) * video.duration;
        video.currentTime = targetTimeRef.current;
      }
    };

    scroll.addEventListener("scroll", onScroll, { passive: true });
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onMetadata);
    return () => {
      scroll.removeEventListener("scroll", onScroll);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onMetadata);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const visibleHotspots = MUSEUM_HOTSPOTS.filter(
    (h) => currentTime >= h.timeStart && currentTime <= h.timeEnd,
  );

  const handleHotspotClick = (hotspot) => {
    videoRef.current?.pause();
    setHotspotImageIndex(0);
    setActiveHotspot(hotspot);
  };

  const closeHotspot = () => setActiveHotspot(null);

  return (
    <>
      <div ref={scrollRef} className="museum-scroll-container">
        <div className="museum-video-content">
          <div className="museum-video-sticky">
            <video
              ref={videoRef}
              className="museum-video-fill"
              src={museumVideoSrc}
              muted
              playsInline
              preload="auto"
            />

            {visibleHotspots.map((h) => (
              <button
                key={h.id}
                className="museum-hotspot"
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
                onClick={() => handleHotspotClick(h)}
                aria-label={h.title}
              >
                <span className="museum-hotspot-ring" />
                <span className="museum-hotspot-dot" />
              </button>
            ))}

            <div className="museum-scroll-hint" style={{ opacity: progress > 0.03 ? 0 : 1 }}>
              <span>Scroll to explore</span>
              <span className="museum-scroll-arrow">↓</span>
            </div>
            <div className="museum-progress-bar">
              <div className="museum-progress-fill" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {activeHotspot && (
        <div className="overlay" onClick={closeHotspot}>
          <div className="modal-inner museum-hotspot-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeHotspot}>✕ close</button>
            {activeHotspot.images ? (
              <div className="museum-hotspot-gallery">
                <button
                  className="vhs-paper-nav"
                  onClick={() => setHotspotImageIndex((i) => Math.max(0, i - 1))}
                  disabled={hotspotImageIndex === 0}
                  aria-label="Previous"
                >
                  <span className="vhs-paper-nav-arrow">←</span>
                </button>
                <div className="museum-hotspot-image">
                  <img src={activeHotspot.images[hotspotImageIndex]} alt="" />
                </div>
                <button
                  className="vhs-paper-nav"
                  onClick={() => setHotspotImageIndex((i) => Math.min(activeHotspot.images.length - 1, i + 1))}
                  disabled={hotspotImageIndex === activeHotspot.images.length - 1}
                  aria-label="Next"
                >
                  <span className="vhs-paper-nav-arrow">→</span>
                </button>
              </div>
            ) : activeHotspot.image ? (
              <div className="museum-hotspot-image">
                <img src={activeHotspot.image} alt="" />
              </div>
            ) : null}
            {(activeHotspot.title || activeHotspot.body) && (
              <div className="museum-hotspot-meta">
                <h3 className="museum-hotspot-title">{activeHotspot.title}</h3>
                <p className="museum-hotspot-body">{activeHotspot.body}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── People panels ────────────────────────────────────────────────────────────

export function PeopleHeroPanel() {
  return (
    <div className="people-hero">
      <div className="people-hero-bg-text">People</div>
      <div className="people-hero-content">
        <div className="chapter-eyebrow">Chapter II · People</div>
        <h2 className="people-hero-title">Voices of Ereymentau</h2>
        <p className="people-hero-copy">
          The city reveals itself through those who live in it — through their
          rhythms, routines, memories, and expectations.
        </p>
        <p className="people-hero-copy">
          This chapter brings together voices that describe the same place in
          different ways: formally, personally, and almost accidentally.
        </p>
      </div>
    </div>
  );
}

export function PeopleGridPanel({ onOpenPerson }) {
  return (
    <div className="chapter-inner people-content">
      <div className="chapter-eyebrow">Chapter II</div>
      <h2 className="chapter-big-title">People</h2>
      <p className="chapter-big-sub">Faces of a city · Interviews</p>
      <div className="people-grid">
        {PEOPLE.map((person) => (
          <button
            key={person.id}
            className="person-card"
            onClick={() => onOpenPerson(person)}
          >
            <div
              className={`person-portrait-frame portrait-tone-${person.portraitTone}`}
            >
              <div
                className={`person-portrait${
                  person.thumbnailSrc ? " person-portrait--thumb" : ""
                }`}
                style={
                  person.thumbnailSrc
                    ? { backgroundImage: `url(${person.thumbnailSrc})` }
                    : undefined
                }
              />
              <div className="portrait-hover-label">Open interview</div>
            </div>
            <div className="person-name">{person.name}</div>
            <div className="person-role">{person.role}</div>
            {person.interviewNote ? (
              <div className="person-interview-note">{person.interviewNote}</div>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Nature panels ────────────────────────────────────────────────────────────

export function NatureHeroPanel({ isVisible }) {
  const natureHeroVideoRef = useRef(null);

  useEffect(() => {
    const v = natureHeroVideoRef.current;
    if (!v) return;
    if (isVisible) v.play().catch(() => {});
    else v.pause();
  }, [isVisible]);

  return (
    <div className="nature-hero">
      <video
        ref={natureHeroVideoRef}
        className="nature-hero-video"
        src={`${import.meta.env.BASE_URL}nature-hero.webm`}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="nature-hero-scrim" aria-hidden />
      <div className="nature-hero-overlay">
        <div className="chapter-eyebrow">Chapter III · Nature</div>
        <h2 className="nature-hero-title">The Steppe Breathes</h2>
        <p className="nature-hero-sub">
          Wind, hills, and wind turbines shape the rhythm of the city and define how it is experienced.
        </p>
      </div>
    </div>
  );
}

// ─── VHS Nature Gallery ───────────────────────────────────────────────────────

const _B = import.meta.env.BASE_URL.replace(/\/$/, "");
const _N = (slug) => ({ src: `${_B}/nature/${slug}.webm`, thumb: `${_B}/nature/thumbs/${slug}.jpg` });
const VHS_ITEMS = [
  { id: 1,  title: "trees",            station: "CH 01 · 00:09", tag: null,    glitch: false, ..._N("деревья")        },
  { id: 2,  title: "lone tree",        station: "CH 02 · 00:03", tag: null,    glitch: false, ..._N("деревоо")        },
  { id: 3,  title: "spruce",           station: "CH 03 · 00:03", tag: null,    glitch: false, ..._N("елка")           },
  { id: 4,  title: "dandelions",       station: "CH 04 · 00:09", tag: "EP-01", glitch: false, ..._N("одуванчики")     },
  { id: 5,  title: "lilac",            station: "CH 05 · 00:09", tag: null,    glitch: false, ..._N("сирень")         },
  { id: 6,  title: "spring",           station: "CH 06 · 00:12", tag: null,    glitch: false, ..._N("родник")         },
  { id: 7,  title: "gathering water",  station: "CH 07 · 00:17", tag: null,    glitch: false, ..._N("люди-у-родника") },
  { id: 8,  title: "windmills",        station: "CH 08 · 00:15", tag: null,    glitch: false, ..._N("мельницы-кадр")  },
  { id: 9,  title: "mills at dusk",    station: "CH 09 · 00:11", tag: "REC",   glitch: false, ..._N("мельницы-закат") },
  { id: 10, title: "steppe",           station: "CH 10 · 00:17", tag: null,    glitch: false, ..._N("степь")          },
  { id: 11, title: "ridge view",       station: "CH 11 · 00:09", tag: null,    glitch: false, ..._N("вид-с-горы")     },
  { id: 12, title: "sokoliny hills",   station: "CH 12 · 00:11", tag: null,    glitch: false, ..._N("соколиные")      },
];

const VHS_PALETTES = [
  ["#2a3b1e","#0d0907"], ["#3a2818","#0d0907"], ["#2c2a1a","#0a0a07"],
  ["#1f2a3a","#0a0a07"], ["#3a2418","#0d0807"], ["#2a1f3a","#0a0a07"],
  ["#2a2018","#0a0a07"], ["#1e3030","#0a0a07"], ["#3a2e1c","#0a0a07"],
  ["#243a28","#0a0a07"], ["#3a3018","#0a0a07"], ["#1c283a","#0a0a07"],
];

function vhsBg(id) {
  const [a, b] = VHS_PALETTES[(id - 1) % VHS_PALETTES.length];
  return `radial-gradient(ellipse at 50% 50%, ${a} 0%, ${b} 100%)`;
}

function VhsPlayer({ item, onClose }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [total, setTotal] = useState(1);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => setTotal(v.duration || 1);
    const onTime  = () => setElapsed(v.currentTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("timeupdate", onTime);
    return () => { v.removeEventListener("loadedmetadata", onMeta); v.removeEventListener("timeupdate", onTime); };
  }, [item.src]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    playing ? v.play().catch(() => {}) : v.pause();
  }, [playing]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const progress = total > 0 ? elapsed / total : 0;

  return (
    <div className="vhs-player-overlay" onClick={onClose}>
      <div className="vhs-collage" aria-hidden>
        {HISTORY_COLLAGE.slice(0, 4).map((photo, i) => {
          const positions = [
            { top: "8%",  left: "5%",  transform: "rotate(-6deg)" },
            { top: "62%", left: "4%",  transform: "rotate(4deg)"  },
            { top: "6%",  right: "4%", transform: "rotate(5deg)"  },
            { top: "60%", right: "6%", transform: "rotate(-3deg)" },
          ];
          return (
            <div key={photo.id} className="vhs-collage-item vhs-collage-polaroid" style={positions[i]}>
              <img src={photo.src} alt="" />
              <div className="vhs-collage-polaroid-caption">archive · 0{i + 1}</div>
            </div>
          );
        })}
        <div className="vhs-collage-item vhs-collage-clipping" style={{ top: "44%", left: "2%", transform: "rotate(-3deg)" }}>
          <h5>Steppe winds · 1979</h5>
          <p>The granite ridge above the city catches wind from the north all year. Older residents claim they can tell the season from how it sounds at midnight.</p>
        </div>
        <div className="vhs-collage-item vhs-collage-clipping" style={{ top: "40%", right: "2%", transform: "rotate(2.5deg)" }}>
          <h5>Lake report · spring</h5>
          <p>The shallow lakes south of Ereymentau hold water through August. Fishermen describe the surface as "mirror with a small noise underneath."</p>
        </div>
        <div className="vhs-collage-item vhs-collage-marker" style={{ top: "2%",  left: "32%", transform: "rotate(-4deg)" }}>EREYMENTAU</div>
        <div className="vhs-collage-item vhs-collage-marker vhs-collage-marker--blue vhs-collage-marker--small" style={{ top: "4%", left: "62%", transform: "rotate(3deg)" }}>steppe wind</div>
        <div className="vhs-collage-item vhs-collage-marker vhs-collage-marker--small" style={{ bottom: "4%", left: "30%", transform: "rotate(-2deg)" }}>field tapes</div>
        <div className="vhs-collage-item vhs-collage-marker vhs-collage-marker--blue" style={{ bottom: "2%", right: "26%", transform: "rotate(2deg)" }}>1979 · 2024</div>
        <div className="vhs-collage-item vhs-collage-sticky" style={{ top: "32%", left: "20%", transform: "rotate(-5deg)" }}>
          remember to dub<br/>side B before<br/>handing it back
        </div>
        <div className="vhs-collage-item vhs-collage-sticky" style={{ top: "30%", right: "22%", transform: "rotate(4deg)", background: "#b8e0a1" }}>
          ch. 07 — granite at sunrise.<br/>do not erase.
        </div>
      </div>

      {/* VHS player window */}
      <div className="vhs-player-window" onClick={(e) => e.stopPropagation()}>
        <button className="vhs-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="vhs-player-screen">
          <video
            ref={videoRef}
            src={item.src}
            poster={item.thumb}
            autoPlay
            loop
            playsInline
            muted
            className="vhs-video"
          />
          <div className="vhs-player-screen-overlay">{item.station}</div>
          {playing && <div className="vhs-player-screen-play-blink">▶ PLAY</div>}
        </div>
        <div className="vhs-controls">
          <button className="vhs-card-btn" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
            {playing ? (
              <svg viewBox="0 0 24 24" aria-hidden><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden><polygon points="6,3 22,12 6,21" /></svg>
            )}
          </button>
          <div className="vhs-progress" style={{ "--vhs-progress": `${progress * 100}%` }}>
            <div className="vhs-progress-line" />
            <div className="vhs-progress-thumb" />
            <div className="vhs-progress-ticks">
              <span>00:00</span><span>side A</span><span>{fmt(total)}</span>
            </div>
          </div>
          <div className="vhs-timer">
            {fmt(elapsed)}<span className="vhs-timer-sep"> / </span>{fmt(total)}
          </div>
        </div>
        <div className="vhs-player-caption">tape · {item.title}</div>
      </div>
    </div>
  );
}

export function NatureGalleryPanel() {
  const [vhsItem, setVhsItem] = useState(null);
  const [page, setPage] = useState(0);
  const PER_PAGE = 6;
  const pages = Math.ceil(VHS_ITEMS.length / PER_PAGE);
  const items = VHS_ITEMS.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <>
      <div className="nature-vhs-section">
        <h3 className="nature-block-title">Nature · VHS archive</h3>
        <p className="nature-vhs-section-sub">tape no. 01 — landscapes &amp; loops</p>
        <div className="nature-vhs-stage">
          <button
            className="vhs-paper-nav"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Previous page"
          >
            <span className="vhs-paper-nav-arrow">←</span>
            PREV
          </button>
          <div className="nature-vhs-grid">
            {items.map((item) => (
              <button
                key={item.id}
                className={`vhs-preview${item.glitch ? " is-glitch" : ""}`}
                onClick={() => setVhsItem(item)}
                aria-label={`Open ${item.title}`}
              >
                {item.tag && <span className="vhs-preview-sticker">{item.tag}</span>}
                <div className="vhs-preview-screen">
                  <div className="vhs-screen-content" style={{ background: vhsBg(item.id) }}>
                    {item.thumb && <img src={item.thumb} alt="" className="vhs-thumb" />}
                    {item.title}
                  </div>
                  <span className="vhs-station">{item.station}</span>
                  {item.tag === "REC" && <span className="vhs-rec">REC</span>}
                </div>
                <span className="vhs-preview-label">{item.title}</span>
              </button>
            ))}
          </div>
          <button
            className="vhs-paper-nav"
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            disabled={page >= pages - 1}
            aria-label="Next page"
          >
            <span className="vhs-paper-nav-arrow">→</span>
            NEXT
          </button>
        </div>
      </div>
      {vhsItem && <VhsPlayer item={vhsItem} onClose={() => setVhsItem(null)} />}
    </>
  );
}

export function NatureCarouselPanel() {
  const scenicSlides = [
    { id: "s1", title: "Granite hills", meta: "placeholder frame 01" },
    { id: "s2", title: "Steppe valley", meta: "placeholder frame 02" },
    { id: "s3", title: "Evening sky", meta: "placeholder frame 03" },
    { id: "s4", title: "Dry grass texture", meta: "placeholder frame 04" },
    { id: "s5", title: "Lake mirror", meta: "placeholder frame 05" },
  ];
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lightboxItem, setLightboxItem] = useState(null);
  const currentSlide = scenicSlides[carouselIndex];

  return (
    <>
      <div className="nature-carousel-block">
        <h3 className="nature-block-title">Nature Frames</h3>
        <div className="nature-carousel-stage">
          <button
            className="nature-carousel-btn"
            onClick={() => setCarouselIndex((prev) => Math.max(prev - 1, 0))}
            disabled={carouselIndex === 0}
            aria-label="Previous"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            className="nature-carousel-photo"
            onClick={() => setLightboxItem(currentSlide)}
          >
            <div className="nature-carousel-image">photo placeholder</div>
            <div className="nature-carousel-meta">
              <strong>{currentSlide.title}</strong>
              <span>{currentSlide.meta}</span>
            </div>
          </button>
          <button
            className="nature-carousel-btn"
            onClick={() =>
              setCarouselIndex((prev) =>
                Math.min(prev + 1, scenicSlides.length - 1),
              )
            }
            disabled={carouselIndex === scenicSlides.length - 1}
            aria-label="Next"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
        <div className="nature-carousel-indicator">
          {carouselIndex + 1} / {scenicSlides.length}
        </div>
      </div>

      {lightboxItem && (
        <div className="overlay" onClick={() => setLightboxItem(null)}>
          <div
            className="modal-inner nature-lightbox"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setLightboxItem(null)}>
              ✕ close
            </button>
            <div className="nature-lightbox-image">image placeholder</div>
            <div className="nature-lightbox-meta">
              <h4>{lightboxItem.title}</h4>
              <p>{lightboxItem.note ?? lightboxItem.meta}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function NatureBranchVideoPanel({ isVisible }) {
  const natureBranchVideoRef = useRef(null);
  const natureStoneQuote = "The land keeps speaking long after people stop talking.";

  useEffect(() => {
    const v = natureBranchVideoRef.current;
    if (!v) return;
    if (isVisible) v.play().catch(() => {});
    else v.pause();
  }, [isVisible]);

  return (
    <div className="nature-branch-video nature-branch-video-panel">
      <div className="nature-branch-video-bg">
        <video
          ref={natureBranchVideoRef}
          className="nature-branch-video-fill"
          src={natureBranchVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="nature-branch-video-scrim" aria-hidden />
      </div>
      <div className="nature-branch-video-overlay">
        <div className="nature-quote-inner">
          <div className="nature-quote-line" />
          <p className="nature-quote-text">{natureStoneQuote}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Authors panel ────────────────────────────────────────────────────────────

const _A       = `${import.meta.env.BASE_URL}authors/Alina/`;
const _Alima   = `${import.meta.env.BASE_URL}authors/Alima/`;
const _Aiganym = `${import.meta.env.BASE_URL}authors/Aiganym/`;

const DIARY_ENTRIES = [
  {
    id: "d1",
    author: "Alina",
    fullName: "Alina Yuldazbayeva",
    role: "Director · Field notes",
    tag: "APRIL–MAY",
    timeOfDay: "Morning",
    coverPhoto: `${import.meta.env.BASE_URL}authors/alina.png`,
    pages: [
      {
        date: "Day 0 · April 1",
        timeOfDay: "4 AM → Sunset",
        note: "We left very early in the morning, around 4–5 AM. The train ride was surprisingly cozy — we spent most of it discussing ideas and the feeling we wanted the film to capture. We arrived in Ereymentau around 7–8 AM and immediately started filming. Later we managed to get an unexpected interview with the Akim of the city. In the evening, the steppe near the windmills — the sky turned orange and pink, the windmills standing against the horizon.",
        fieldNote: "Train · First frames · City Hall · Windmills at golden hour",
        photoTitle: "April 1",
        images: [`${_A}DSC04358-web.jpg`, `${_A}DSC00191.jpg`],
      },
      {
        date: "Day 1 · May 8",
        timeOfDay: "All day",
        note: "The first thing I noticed when we arrived was how much the city had changed since April. Everything had become green — the streets felt more alive, the whole atmosphere softer and warmer. Later we went out into the steppe to film the windmills from a much closer distance. The landscape looked endless, and the movement of the windmills against the open sky created very cinematic shots.",
        fieldNote: "May · Spring · Windmills up close",
        photoTitle: "May 8",
        images: [`${_A}DSC00120.jpg`, `${_A}DSC00097.jpg`],
      },
      {
        date: "Day 2 · May 9",
        timeOfDay: "Dawn → Evening",
        note: "We drove to the Falcon Mountains early in the morning — the road through the endless steppe already felt like part of the film. The mountains were quiet and massive. We climbed higher while filming; from above, the views were incredible — open skies, distant hills, rocks, endless space. In the evening we reviewed everything we had shot throughout the trip.",
        fieldNote: "Road · Sokoliny Mountains · Behind the scenes",
        photoTitle: "May 9",
        images: [`${_A}L1001046.jpg`, `${_A}DSC04184-web.jpg`],
      },
    ],
  },
  {
    id: "d2",
    author: "Aiganym",
    fullName: "Aiganym Bulatova",
    role: "Director of Photography",
    tag: "APRIL–MAY",
    timeOfDay: "Morning",
    coverPhoto: `${import.meta.env.BASE_URL}authors/aiganym.png`,
    pages: [
      {
        date: "Day 0 · April 1",
        timeOfDay: "Morning",
        note: "The first time we had to go, I couldn't sleep the night before — excited and anxious at once. The last time I'd visited was six years ago, when my grandparents still lived here before moving to Astana. When the train stopped, memories from my childhood came rushing back: the railway station, the parks, the streets — all of it deeply familiar, yet somehow new.",
        fieldNote: "Six years since my last visit · First frames · Railway station",
        photoTitle: "April 1 · Morning",
        imageSrc: `${_Aiganym}aiganym1-web.jpg`,
      },
      {
        date: "Day 0 · April 1",
        timeOfDay: "Afternoon–Evening",
        note: "Everything seemed both known and new. The city had changed in a way invisible to the eyes but noticeable to the soul. We spent the whole day conducting interviews, taking pictures, and scouting locations. That night Aunt Aizhan welcomed us with a warm dinner — a house that held both history and warmth. I remembered it from childhood; back then it had seemed enormous. We boarded the train late, exhausted but genuinely happy.",
        fieldNote: "Interviews · Scouting · Aunt Aizhan's dinner",
        photoTitle: "April 1 · Together",
        videoSrc: `${_Aiganym}aiganym2.webm`,
      },
      {
        date: "Day 1 · May 8",
        timeOfDay: "All day",
        note: "Everything outside the window was green and glowing. The city felt completely different — huge trees, air hot and full of flowers, streets already alive at 8 in the morning. We rented a cozy apartment and spent hours walking until we reached the house where my grandparents used to live. That moment felt deeply nostalgic. In the evening we interviewed Aunt Aizhan; listening to her, the city came alive in a new way. We ended with sushi and a series together, sunburnt and quietly happy.",
        fieldNote: "May · Grandparents' house · Aunt Aizhan · Sushi",
        photoTitle: "May 8",
        imageSrc: `${_Aiganym}Aiganym3.jpg`,
      },
      {
        date: "Day 2 · May 9",
        timeOfDay: "All day",
        note: "We woke up without feeling tired. Saken — my brother's friend — drove us to the Sunkar Mountains. The heat was intense, but what shocked me most was the wind: the strongest I'd ever felt, strong enough that I thought I could fly. My Leica battery was already low, so I captured only a few photos — which somehow made the moment feel even more fleeting and unforgettable. Ereimentau became more than a place we visited. I really hope to return there with the girls.",
        fieldNote: "Sunkar Mountains · Leica · Wind · Saken",
        photoTitle: "May 9",
        imageSrc: `${_Aiganym}aiganym4-web.jpg`,
      },
    ],
  },
  {
    id: "d3",
    author: "Alima",
    fullName: "Alima Makhymetova",
    role: "Camera · Filming diary",
    tag: "APRIL–MAY",
    timeOfDay: "Morning",
    coverPhoto: `${import.meta.env.BASE_URL}authors/alima.png`,
    pages: [
      {
        date: "Day 0 · April 1",
        timeOfDay: "Scouting Day",
        note: "We traveled to the city for a scouting trip — not to film, but to understand the location. We arrived in the morning and immediately started exploring, getting a sense of the city's rhythm and potential filming spots. One of the most important moments was an interview with the city's akim, which gave us a broader perspective on the place. We also visited the local museum for historical and cultural context. After hours of walking and meeting residents, we gathered in the evening to build a clearer plan. After 12 hours in the city, we hopped on a train back to Astana.",
        fieldNote: "Scouting · Akim interview · Museum · Train home",
        photoTitle: "April 1",
        images: [`${_Alima}alima1.JPG`, `${_Alima}alima2.JPG`],
      },
      {
        date: "Day 1 · May 8",
        timeOfDay: "All day",
        note: "5 AM train, arrived at 8. Everything felt quiet and fresh. After checking in, we headed to a teammate's grandmother's house — from there, a clear view of the windmills in the morning light. At one point I walked far into the open steppe alone, carrying my tripod and camera, trying to capture wide empty shots. The city felt most alive in the mornings: cats everywhere, everything green, warm vibrant light. In the evening we ordered food, watched Scream Queens, and all slept on one bed — exhausted but happy.",
        fieldNote: "5:00 AM train · Steppe walk · Windmills · Scream Queens",
        photoTitle: "May 8",
        images: [`${_Alima}alima3.JPG`, `${_Alima}alima4.JPG`],
      },
      {
        date: "Day 2 · May 9",
        timeOfDay: "Dawn → Evening",
        note: "We woke early for the Falcon Mountains — a two-hour drive with a friend of our teammate. On the way we filmed villages through the window. The landscapes felt unreal; at times it was hard to believe how beautiful everything looked. I had my laptop to transfer footage throughout the day, testing shots and staying organized. By evening we were tired but deeply impressed. The nature, the light, the scale — one of those days where you realize how important it is to capture the moment properly.",
        fieldNote: "Falcon Mountains · Filming villages · 2 hrs drive",
        photoTitle: "May 9",
        imageSrc: `${_Alima}alima6.JPG`,
      },
    ],
  },
];

const COVER_COLORS = [
  { cover1: "#6b2820", cover2: "#4a1812", spine: "#2a0e0a", accent: "#d8323a" },
  { cover1: "#5a2d4a", cover2: "#38182f", spine: "#1d0916", accent: "#ff2cc4" },
  { cover1: "#3b3270", cover2: "#221c4a", spine: "#110c2a", accent: "#2e3aff" },
];

export function AuthorsPanel() {
  const [mode, setMode] = useState("covers");
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [animDir, setAnimDir] = useState("open");
  const [flap, setFlap] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const entry = DIARY_ENTRIES[activeIndex];
  const pages = entry.pages;
  const spreadIndex = Math.floor(pageIndex / 2);
  const spreadCount = Math.ceil(pages.length / 2);
  const pageL = pages[pageIndex];
  const pageR = pages[pageIndex + 1] ?? null;
  const wordsL = pageL.note.split(" ");
  const wordsR = pageR?.note.split(" ") ?? [];

  const openDiary = (index) => {
    setAnimDir("open");
    setActiveIndex(index);
    setPageIndex(0);
    setMode("reading");
  };

  const goToPage = (nextPage, dir) => {
    setFlap(dir);
    window.setTimeout(() => {
      setAnimDir(dir);
      setPageIndex(nextPage);
      setFlap(null);
    }, 320);
  };

  const navigate = (dir) => {
    const nextSpread = spreadIndex + dir;
    if (nextSpread < 0 || nextSpread >= spreadCount) return;
    goToPage(nextSpread * 2, dir > 0 ? "next" : "prev");
  };

  if (mode === "covers") {
    return (
      <div className="authors-panel-root">
        <div className="chapter-eyebrow">Chapter IV · Authors</div>
        <h2 className="chapter-big-title">Backstage Diary</h2>
        <p className="chapter-big-sub">
          Three perspectives, shaped by memory, first impressions, and distance. Click a diary to read.
        </p>
        <div className="diary-covers">
          {DIARY_ENTRIES.map((e, i) => {
            const c = COVER_COLORS[i];
            return (
              <button
                key={e.id}
                className="diary-cover"
                style={{
                  "--cover-1": c.cover1,
                  "--cover-2": c.cover2,
                  "--spine": c.spine,
                  "--accent": c.accent,
                }}
                onClick={() => openDiary(i)}
                aria-label={`Open ${e.author}'s diary`}
              >
                <div className="diary-cover-tag">{e.timeOfDay}</div>
                <div className="diary-cover-body">
                  <div className="diary-cover-spine" />
                  <div className="diary-cover-ribbon" />
                  <div className="diary-cover-elastic" />
                  <div className="diary-cover-stamp">Diary</div>
                  <div className="diary-cover-photo-wrap">
                    <div
                      className="diary-cover-photo"
                      style={e.coverPhoto ? { backgroundImage: `url(${e.coverPhoto})` } : undefined}
                    />
                    <div className="diary-cover-photo-caption">{e.author}</div>
                  </div>
                  <div className="diary-cover-meta">
                    <span className="diary-cover-name">{e.fullName}</span>
                    <span className="diary-cover-time">{e.tag}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="diary-covers-hint">click a diary to read →</div>
      </div>
    );
  }

  const renderPageContent = (pg, words, side) => (
    <>
      <div className="diary-page-header">
        <span className="diary-page-date">{pg.date}</span>
        <span className="diary-page-time">{pg.timeOfDay}</span>
      </div>
      <div className="diary-page-author">{entry.fullName} · {entry.role}</div>
      <p className="diary-handwriting">
        {words.map((word, wi) => (
          <span key={wi} className="word" style={{ animationDelay: `${0.3 + wi * 0.06}s` }}>
            {word}{" "}
          </span>
        ))}
      </p>
      <div className="diary-doodle" style={{ animationDelay: `${0.4 + words.length * 0.06}s` }}>
        ✦ {pg.timeOfDay.toLowerCase()}
      </div>
      <div className="diary-field-note" style={{ animationDelay: `${0.8 + words.length * 0.06}s` }}>
        {pg.fieldNote}
      </div>
      <div className="diary-inline-media">
        {pg.images ? (
          <div className="diary-photo-pair">
            {pg.images.map((src, i) => (
              <div
                key={i}
                className="diary-photo-small"
                style={{ "--pair-tilt": i === 0 ? "-1.8deg" : "1.6deg" }}
                onClick={() => setLightbox(src)}
              >
                <img src={src} alt="" />
              </div>
            ))}
          </div>
        ) : pg.videoSrc?.includes("youtube") ? (
          <iframe
            src={pg.videoSrc}
            title={`${entry.fullName} video`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="diary-inline-video"
          />
        ) : pg.videoSrc ? (
          <div
            className="diary-photo-small"
            style={{ "--pair-tilt": "-1.2deg" }}
          >
            <video src={pg.videoSrc} autoPlay muted loop playsInline className="diary-inline-video" />
          </div>
        ) : pg.gallery ? (
          <div className="diary-gallery">
            {pg.gallery.map((src, i) => (
              <button key={i} className="diary-gallery-thumb" onClick={() => setLightbox(src)}>
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        ) : pg.imageSrc ? (
          <div
            className="diary-photo-small"
            style={{ "--pair-tilt": "-1.2deg", cursor: "zoom-in" }}
            onClick={() => setLightbox(pg.imageSrc)}
          >
            <img src={pg.imageSrc} alt="" />
          </div>
        ) : null}
        {pg.photoTitle && (
          <div className="diary-inline-caption">{pg.photoTitle}</div>
        )}
      </div>
    </>
  );

  return (
    <div className="authors-panel-root">
      <div className="chapter-eyebrow">Chapter IV · Authors</div>
      <h2 className="chapter-big-title">Backstage Diary</h2>

      <div
        key={`${activeIndex}-${spreadIndex}-${animDir}`}
        className="diary-spread"
        data-anim={animDir}
      >
        {/* Left page */}
        <div className="diary-page diary-page-left diary-page-ruled">
          <div className="diary-page-pin" aria-hidden />
          {renderPageContent(pageL, wordsL, "left")}
        </div>

        {/* Right page — next day if exists, else decorative blank */}
        {pageR ? (
          <div className="diary-page diary-page-ruled">
            {renderPageContent(pageR, wordsR, "right")}
          </div>
        ) : (
          <div className="diary-page diary-page-blank" />
        )}

        {flap && <div className={`diary-page-flap diary-page-flap--${flap}`} aria-hidden />}
      </div>

      {/* Navigation below spread */}
      <div className="diary-nav">
        <button className="diary-nav-back" onClick={() => setMode("covers")}>
          ← all authors
        </button>
        <div className="diary-nav-dots">
          {Array.from({ length: spreadCount }, (_, i) => (
            <button
              key={i}
              className={`diary-nav-dot${i === spreadIndex ? " active" : ""}`}
              onClick={() => { if (i !== spreadIndex) goToPage(i * 2, i > spreadIndex ? "next" : "prev"); }}
            />
          ))}
        </div>
        <div className="diary-nav-pager">
          <button onClick={() => navigate(-1)} disabled={spreadIndex === 0}>
            <ChevronIcon direction="left" />
          </button>
          <button onClick={() => navigate(1)} disabled={spreadIndex === spreadCount - 1}>
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>

      {lightbox && (
        <div className="diary-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" />
        </div>
      )}
    </div>
  );
}

// ─── Modals (unchanged) ───────────────────────────────────────────────────────

export function PersonModal({ person, onClose }) {
  const videoRef = useRef(null);
  const isYoutubeEmbed = Boolean(person?.videoSrc?.includes("youtube.com/embed/"));

  const stopVideo = () => {
    if (isYoutubeEmbed) return;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    return () => stopVideo();
  }, [person]);

  if (!person) return null;

  const closeWithStop = () => {
    stopVideo();
    onClose();
  };

  return (
    <div className="overlay" onClick={closeWithStop}>
      <div className="modal-inner" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={closeWithStop}>
          ✕ close
        </button>
        <div className="modal-video-box">
          {isYoutubeEmbed ? (
            <iframe
              className="modal-video"
              src={person.videoSrc}
              title={`${person.name} interview`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              className="modal-video"
              controls
              preload="metadata"
            >
              <source src={person.videoSrc} type="video/mp4" />
            </video>
          )}
        </div>
        <div className="modal-person-copy">
          <div className="modal-person-name">{person.name}</div>
          <div className="modal-person-role">{person.role}</div>
          <div className="modal-person-quote">{person.quote}</div>
          <div className="modal-person-transcript">
            <strong>Interview transcript</strong>
            <p>{person.transcript}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MemoryModal({ memory, onClose }) {
  if (!memory) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-inner memory" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="memory-type">{memory.type}</div>
        <div className="memory-content">{memory.content}</div>
        <div className="memory-source">{memory.source}</div>
      </div>
    </div>
  );
}
