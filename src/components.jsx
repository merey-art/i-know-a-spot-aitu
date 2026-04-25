import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PEOPLE } from "./data";
import {
  HISTORY_ARCHIVE_PHOTOS,
  HISTORY_COLLAGE,
  HISTORY_HERO_BG,
  HISTORY_VIDEO_BLOCKS,
} from "./data/historyAssets";
import preIntroVideoSrc from "../night scene shot (online-video-cutter.com).mp4";
import backstageEveningPhoto from "./images/backstage-tab/DSC04172.JPG";
import natureHeroVideo from "./images/nature-tab/мельницы.mp4";
import natureBranchVideo from "./images/nature-tab/рандом ветка.mp4";

const OPENING_TITLE = "I Know a Spot";

export function LoadingScreen({ chapterTitle, active, progress }) {
  return (
    <section className={`section loading-screen-section${active ? " active" : ""}`}>
      <div className="loading-screen-content">
        <div className="loading-chapter-title">{chapterTitle}</div>
        <div className="loading-bar-wrap">
          <div className="loading-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>
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
      >
        Previous
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
      >
        Next
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

export function OpeningSection({ active, stars, onEnter, moonTransform }) {
  return (
    <section className={`section opening${active ? " active" : ""}`}>
      <div className="night-sky">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>
      <div className="moon" style={{ transform: moonTransform }} />
      <div className="horizon" />
      <div className="opening-windmills" aria-hidden="true">
        <div className="windmill windmill-1">
          <div className="windmill-tower" />
          <div className="windmill-rotor">
            <span className="blade blade-1" />
            <span className="blade blade-2" />
            <span className="blade blade-3" />
          </div>
        </div>
        <div className="windmill windmill-2">
          <div className="windmill-tower" />
          <div className="windmill-rotor">
            <span className="blade blade-1" />
            <span className="blade blade-2" />
            <span className="blade blade-3" />
          </div>
        </div>
        <div className="windmill windmill-3">
          <div className="windmill-tower" />
          <div className="windmill-rotor">
            <span className="blade blade-1" />
            <span className="blade blade-2" />
            <span className="blade blade-3" />
          </div>
        </div>
        <div className="windmill windmill-4">
          <div className="windmill-tower" />
          <div className="windmill-rotor">
            <span className="blade blade-1" />
            <span className="blade blade-2" />
            <span className="blade blade-3" />
          </div>
        </div>
        <div className="windmill windmill-5">
          <div className="windmill-tower" />
          <div className="windmill-rotor">
            <span className="blade blade-1" />
            <span className="blade blade-2" />
            <span className="blade blade-3" />
          </div>
        </div>
        <div className="windmill windmill-6">
          <div className="windmill-tower" />
          <div className="windmill-rotor">
            <span className="blade blade-1" />
            <span className="blade blade-2" />
            <span className="blade blade-3" />
          </div>
        </div>
      </div>
      <div className="opening-title">
        <div className="title-main" aria-label={OPENING_TITLE}>
          {OPENING_TITLE.split("").map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className={`title-letter${letter === " " ? " title-letter-space" : ""}`}
              style={{ animationDelay: `${index * 0.085}s` }}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </div>
        <div className="title-sub">Ereymentau · Ерейментау · Documentary</div>
        <button className="enter-btn" onClick={onEnter}>
          Begin
        </button>
      </div>
    </section>
  );
}

export function IntroSection({
  active,
  typewriterText,
  showContinue,
  onContinue,
}) {
  return (
    <section className={`section slide-up${active ? " active" : ""}`}>
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

export function MapHub({
  active,
  onLoadChapter,
  mapTransform,
  mapPoints,
  mapHubPhase,
  mapDrawRun,
}) {
  const showMap = mapHubPhase === "drawing" || mapHubPhase === "points";
  const showPoints = mapHubPhase === "points";

  return (
    <section className={`section map-hub-section${active ? " active" : ""}`}>
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
        </svg>
      </div>
      </div>
    </section>
  );
}

export function HistorySection({ active }) {
  const VISIBLE_SLIDES = 3;
  /** 0 = collage cards fully spread, 1 = settled (driven by scroll through collage block) */
  const [collageScrollProgress, setCollageScrollProgress] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [zoomedPhoto, setZoomedPhoto] = useState(null);
  const historyVideoRefs = useRef([]);
  const historySectionRef = useRef(null);
  const collageSectionRef = useRef(null);

  const updateCollageScrollProgress = useCallback((sectionEl) => {
    const collage = collageSectionRef.current;
    if (!sectionEl || !collage) return;

    const { scrollTop, clientHeight } = sectionEl;
    const sRect = sectionEl.getBoundingClientRect();
    const cRect = collage.getBoundingClientRect();
    const collageTopInContent = scrollTop + (cRect.top - sRect.top);
    const collageH = collage.offsetHeight;

    // Ramp 0→1 over a short scroll distance while the collage block moves through view
    const RAMP_VH = 0.5;
    const RAMP_FRACTION = 0.14; // full 0→1 over this fraction of collage height (smaller = snappier)
    const rampStart = collageTopInContent - clientHeight * RAMP_VH;
    const rampSpan = Math.max(collageH * RAMP_FRACTION, 88);

    let p = (scrollTop - rampStart) / rampSpan;
    p = Math.min(1, Math.max(0, p));
    setCollageScrollProgress(p);
  }, []);

  useLayoutEffect(() => {
    if (!active) {
      setCollageScrollProgress(0);
      return;
    }
    const id = requestAnimationFrame(() => {
      if (historySectionRef.current) {
        updateCollageScrollProgress(historySectionRef.current);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [active, updateCollageScrollProgress]);

  useEffect(() => {
    if (!active) {
      setCollageScrollProgress(0);
      setCarouselIndex(0);
      setZoomedPhoto(null);
      historyVideoRefs.current.forEach((node) => {
        if (node) {
          node.pause();
          node.currentTime = 0;
        }
      });
      return;
    }
    historyVideoRefs.current.forEach((node) => {
      if (!node) return;
      const play = () => node.play().catch(() => {});
      if (node.readyState >= 2) play();
      else node.addEventListener("loadeddata", play, { once: true });
    });
  }, [active]);

  const maxIndex = Math.max(HISTORY_ARCHIVE_PHOTOS.length - VISIBLE_SLIDES, 0);
  const visiblePhotos = HISTORY_ARCHIVE_PHOTOS.slice(
    carouselIndex,
    carouselIndex + VISIBLE_SLIDES,
  );
  const onHistoryScroll = (event) => {
    updateCollageScrollProgress(event.currentTarget);
  };

  return (
    <section
      ref={historySectionRef}
      className={`section chapter-section history-section${active ? " active" : ""}`}
      onScroll={onHistoryScroll}
    >
      <div className="history-layout">
        <div className="history-hero-screen">
          <div
            className="history-hero-photo-bg"
            style={{ backgroundImage: `url(${HISTORY_HERO_BG})` }}
            aria-hidden="true"
          />
          <div className="history-hero-year">1948</div>
          <div className="history-hero-overlay">
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

        <div className="history-collage-section" ref={collageSectionRef}>
          <h3 className="history-block-title">Scroll Collage</h3>
          <p className="history-block-sub">
            Archive stills drift and settle as you scroll through the chapter.
          </p>
          <div className="history-collage-grid">
            {HISTORY_COLLAGE.map((item, index) => {
              const direction = index % 2 === 0 ? -1 : 1;
              const drift = (1 - collageScrollProgress) * 120 * direction;
              const lift = (1 - collageScrollProgress) * 18;
              return (
                <article
                  key={item.id}
                  className="history-collage-card"
                  style={{
                    transform: `translate(${drift}px, ${lift}px)`,
                    opacity: 0.4 + collageScrollProgress * 0.6,
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
            >
              ←
            </button>
            <button
              className="history-carousel-btn"
              onClick={() =>
                setCarouselIndex((prev) => Math.min(prev + 1, maxIndex))
              }
              disabled={carouselIndex >= maxIndex}
            >
              →
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

        {HISTORY_VIDEO_BLOCKS.map((block, videoIndex) => (
          <div key={block.id} className="history-video-section">
            <div className="history-video-bg">
              <video
                ref={(el) => {
                  historyVideoRefs.current[videoIndex] = el;
                }}
                className="history-video-fill"
                src={block.src}
                autoPlay
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
        ))}
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
    </section>
  );
}

export function PeopleSection({ active, onOpenPerson }) {
  return (
    <section className={`section chapter-section people-section${active ? " active" : ""}`}>
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
    </section>
  );
}

export function NatureSection({ active }) {
  const galleryItems = [
    { id: "g1", title: "Morning ridge", note: "wind over stone" },
    { id: "g2", title: "Steppe grass", note: "late summer tones" },
    { id: "g3", title: "Cloud line", note: "sky almost touching ground" },
    { id: "g4", title: "Lake edge", note: "quiet water reflections" },
    { id: "g5", title: "Wide steppe panorama", note: "horizon without end", wide: true },
  ];

  const scenicSlides = [
    { id: "s1", title: "Granite hills", meta: "placeholder frame 01" },
    { id: "s2", title: "Steppe valley", meta: "placeholder frame 02" },
    { id: "s3", title: "Evening sky", meta: "placeholder frame 03" },
    { id: "s4", title: "Dry grass texture", meta: "placeholder frame 04" },
    { id: "s5", title: "Lake mirror", meta: "placeholder frame 05" },
  ];

  const natureStoneQuote =
    "The land keeps speaking long after people stop talking.";

  const [scrollProgress, setScrollProgress] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lightboxItem, setLightboxItem] = useState(null);
  const natureHeroVideoRef = useRef(null);
  const natureBranchVideoRef = useRef(null);

  useEffect(() => {
    if (!active) {
      setScrollProgress(0);
      setCarouselIndex(0);
      setLightboxItem(null);
    }
  }, [active]);

  useEffect(() => {
    for (const ref of [natureHeroVideoRef, natureBranchVideoRef]) {
      const v = ref.current;
      if (!v) continue;
      if (active) v.play().catch(() => {});
      else v.pause();
    }
  }, [active]);

  const onNatureScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const maxScroll = Math.max(scrollHeight - clientHeight, 1);
    setScrollProgress(Math.min(Math.max(scrollTop / maxScroll, 0), 1));
  };

  const currentSlide = scenicSlides[carouselIndex];

  return (
    <section
      className={`section chapter-section nature-section${active ? " active" : ""}`}
      onScroll={onNatureScroll}
    >
      <div className="nature-layout">
        <div className="nature-hero">
          <div
            className="nature-hero-media"
            style={{ transform: `translateY(${scrollProgress * 48}px) scale(1.05)` }}
          >
            <video
              ref={natureHeroVideoRef}
              className="nature-hero-video"
              src={natureHeroVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className="nature-hero-scrim" aria-hidden />
          </div>
          <div className="nature-hero-overlay">
            <div className="chapter-eyebrow">Chapter III · Nature</div>
            <h2 className="nature-hero-title">The Steppe Breathes</h2>
            <p className="nature-hero-sub">
              Wind, hills, and wind turbines shape the rhythm of the city and define how it is experienced.
            </p>
          </div>
        </div>

        <div className="nature-gallery-block">
          <h3 className="nature-block-title">Landscape Gallery</h3>
          <div className="nature-gallery-grid">
            {galleryItems.map((item) => (
              <button
                key={item.id}
                className={`nature-gallery-item${item.wide ? " nature-gallery-item-wide" : ""}`}
                onClick={() => setLightboxItem(item)}
              >
                <div className="nature-gallery-photo">image placeholder</div>
                <div className="nature-gallery-caption">
                  <span className="nature-caption-title">{item.title}</span>
                  <span className="nature-caption-hand">{item.note}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="nature-branch-video">
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

        <div className="nature-carousel-block">
          <h3 className="nature-block-title">Nature Frames</h3>
          <div className="nature-carousel-stage">
            <button
              className="nature-carousel-btn"
              onClick={() => setCarouselIndex((prev) => Math.max(prev - 1, 0))}
              disabled={carouselIndex === 0}
            >
              Previous
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
            >
              Next
            </button>
          </div>
          <div className="nature-carousel-indicator">
            {carouselIndex + 1} / {scenicSlides.length}
          </div>
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
    </section>
  );
}

export function AuthorsSection({ active }) {
  const diaryEntries = [
    {
      id: "d1",
      timeOfDay: "Morning",
      author: "Alina Yuldazbayeva",
      note:
        "We arrived under a pale sky and shot only fragments. The city refused to become an easy postcard, so we started listening instead of framing.",
      photoTitle: "Backstage still · Arrival day",
      audioSrc: "/media/authors-aizat-voice-placeholder.mp3",
      videoSrc: "https://www.youtube.com/embed/fBLkffuPgpI",
    },
    {
      id: "d2",
      timeOfDay: "Afternoon",
      author: "Aiganym Bulatova",
      note:
        "At sunrise the hills looked almost metallic. We kept resetting the camera to follow light, not schedule. That changed the pace of the entire chapter.",
      photoTitle: "Backstage still · Sunrise setup",
      audioSrc: "/media/authors-daniyal-voice-placeholder.mp3",
      videoSrc: "https://www.youtube.com/embed/uxy1ttJdmGk",
    },
    {
      id: "d3",
      timeOfDay: "Evening",
      author: "Alima Makhymetova",
      note:
        "Most recordings happened between interviews: footsteps, wind, distant machinery. Those textures became emotional transitions between scenes.",
      photoTitle: "Backstage still · Museum visit",
      audioSrc: "/media/authors-sanzhar-voice-placeholder.mp3",
      imageSrc: backstageEveningPhoto,
    },
  ];

  const [zoomedPhoto, setZoomedPhoto] = useState(null);

  useEffect(() => {
    if (!active) setZoomedPhoto(null);
  }, [active]);

  return (
    <section className={`section chapter-section authors-section${active ? " active" : ""}`}>
      <div className="chapter-inner">
        <div className="chapter-eyebrow">Chapter IV · Authors</div>
        <h2 className="chapter-big-title">Backstage Diary</h2>
        <p className="chapter-big-sub">
          This chapter reflects how the city is perceived through different personal experiences.
          Three perspectives, shaped by memory, first impressions, and distance.
        </p>

        <div className="authors-diary-list">
          {diaryEntries.map((entry) => (
            <article key={entry.id} className="authors-diary-entry">
              <div className="authors-diary-time">{entry.timeOfDay}</div>
              <div className="authors-diary-content">
                <h3>{entry.author}</h3>
                <p>{entry.note}</p>

                {entry.videoSrc ? (
                  <div className="authors-backstage-video-wrap">
                    <iframe
                      className="authors-backstage-iframe"
                      src={entry.videoSrc}
                      title={`${entry.author} · backstage video`}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <button
                    className="authors-backstage-photo"
                    onClick={() =>
                      setZoomedPhoto({
                        title: entry.photoTitle,
                        author: entry.author,
                        ...(entry.imageSrc ? { imageSrc: entry.imageSrc } : {}),
                      })
                    }
                  >
                    <div
                      className={`authors-backstage-image${
                        entry.imageSrc ? " authors-backstage-image--photo" : ""
                      }`}
                    >
                      {entry.imageSrc ? (
                        <img src={entry.imageSrc} alt="" />
                      ) : (
                        "backstage photo placeholder"
                      )}
                    </div>
                    <div className="authors-backstage-meta">{entry.photoTitle}</div>
                  </button>
                )}

                {/* Voice comments not ready yet — restore when audio files exist
                <div className="authors-audio-block">
                  <div className="authors-audio-label">Voice comment (30–60 sec)</div>
                  <audio controls preload="metadata" className="authors-audio-player">
                    <source src={entry.audioSrc} type="audio/mpeg" />
                  </audio>
                </div>
                */}
              </div>
            </article>
          ))}
        </div>
      </div>

      {zoomedPhoto && (
        <div className="overlay" onClick={() => setZoomedPhoto(null)}>
          <div
            className="modal-inner authors-photo-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setZoomedPhoto(null)}>
              ✕ close
            </button>
            <div
              className={`authors-photo-zoom${
                zoomedPhoto.imageSrc ? " authors-photo-zoom--image" : ""
              }`}
            >
              {zoomedPhoto.imageSrc ? (
                <img src={zoomedPhoto.imageSrc} alt="" />
              ) : (
                "backstage photo placeholder"
              )}
            </div>
            <div className="authors-photo-caption">
              <h4>{zoomedPhoto.title}</h4>
              <p>{zoomedPhoto.author}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

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
        <div className="modal-person-name">{person.name}</div>
        <div className="modal-person-role">{person.role}</div>
        <div className="modal-person-quote">{person.quote}</div>
        <div className="modal-person-transcript">
          <strong>Interview transcript / key quote</strong>
          <p>{person.transcript}</p>
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
