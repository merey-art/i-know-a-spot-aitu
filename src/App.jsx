import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { setupGlobalClickSound } from "./sounds";
import {
  AuthorsPanel,
  EndingPanel,
  HistoryCarouselPanel,
  HistoryCollagePanel,
  HistoryHeroPanel,
  HistoryVideoPanel,
  IntroSection,
  MapHub,
  MemoryModal,
  MuseumVideoSection,
  NatureBranchVideoPanel,
  NatureCarouselPanel,
  NatureGalleryPanel,
  NatureHeroPanel,
  OpeningSection,
  LifeFramesPanel,
  PeopleGridPanel,
  PeopleHeroPanel,
  PersonModal,
  StoryProgressBar,
} from "./components";
import { CHAPTERS, MEMORIES, PANEL_MEMORIES } from "./data";
import { HISTORY_VIDEO_BLOCKS } from "./data/historyAssets";

const INTRO_TEXT =
  "Ereymentau. A city of twelve thousand souls, sitting at the edge of the Kazakh steppe. Two granite hills rise above everything — that's where the name comes from. This is where we came with our cameras. This is what we found.";

const CHAPTER_SECTIONS = new Set([
  "chapter-history",
  "chapter-people",
  "chapter-nature",
  "chapter-authors",
]);

const STORY_STEPS = [
  { id: "opening", label: "Opening" },
  { id: "map-hub", label: "Map" },
  { id: "chapter-history", label: "History" },
  { id: "chapter-people", label: "Life" },
  { id: "chapter-nature", label: "Nature" },
  { id: "chapter-authors", label: "Authors" },
  { id: "ending", label: "Ending" },
];

const BASE_PANELS = [
  { id: "opening",           storyStep: "opening"         },
  { id: "intro",             storyStep: "intro"           },
  { id: "map-hub",           storyStep: "map-hub"         },
  { id: "history-hero",      storyStep: "chapter-history" },
  { id: "history-collage",   storyStep: "chapter-history" },
  { id: "history-carousel",  storyStep: "chapter-history" },
  { id: "history-video-0",   storyStep: "chapter-history" },
  { id: "museum-video",      storyStep: "chapter-history" },
  { id: "history-video-1",   storyStep: "chapter-history" },
  { id: "people-hero",       storyStep: "chapter-people"  },
  { id: "people-grid",       storyStep: "chapter-people"  },
  { id: "life-frames-1",     storyStep: "chapter-people"  },
  { id: "life-frames-2",     storyStep: "chapter-people"  },
  { id: "nature-hero",       storyStep: "chapter-nature"  },
  { id: "nature-gallery",    storyStep: "chapter-nature"  },
  { id: "nature-carousel",   storyStep: "chapter-nature"  },
  { id: "nature-video",      storyStep: "chapter-nature"  },
  { id: "authors",           storyStep: "chapter-authors" },
  { id: "ending",            storyStep: "ending"          },
];

const MAP_DRAW_DURATION_MS = 3200;

function createStars() {
  return Array.from({ length: 140 }, (_, id) => ({
    id,
    left: Math.random() * 100,
    top: Math.random() * 65,
    size: Math.random() * 2.2 + 0.5,
    opacity: Math.random() * 0.45 + 0.15,
  }));
}

function createMapPoints(chapters) {
  return chapters.map((chapter, index) => {
    const fallbackPositions = [
      { x: 158, y: 126 },
      { x: 340, y: 95 },
      { x: 86, y: 214 },
      { x: 146, y: 258 },
    ];
    const position = chapter.mapPosition ?? fallbackPositions[index] ?? { x: 120, y: 120 };
    return {
      id: chapter.key,
      key: chapter.key,
      label: chapter.label,
      x: position.x,
      y: position.y,
    };
  });
}

export default function App() {
  const [activePanelId, setActivePanelId] = useState("opening");
  const [isFading, setIsFading] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [showContinue, setShowContinue] = useState(false);
  const [personModal, setPersonModal] = useState(null);
  const [memoryModal, setMemoryModal] = useState(null);
  const [mapHubPhase, setMapHubPhase] = useState("idle");
  const [mapDrawRun, setMapDrawRun] = useState(0);
  const [cursor, setCursor] = useState({ x: 0, y: 0, rx: 0, ry: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") ?? "dark");
  const [loadingVisible, setLoadingVisible] = useState(true);
  const [loadingFading, setLoadingFading] = useState(false);
  const [vhsOpen, setVhsOpen] = useState(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const rafRef = useRef(0);
  const trackRef = useRef(null);
  const typewriterStarted = useRef(false);

  const currentSection = BASE_PANELS.find((p) => p.id === activePanelId)?.storyStep ?? "opening";

  const chapterVisible = CHAPTER_SECTIONS.has(currentSection);
  const storyIndex = STORY_STEPS.findIndex((step) => step.id === currentSection);
  const showStoryBar = !["opening", "intro", "pre-intro-video"].includes(currentSection);
  const moonTransform = `translate(${parallax.x * 0.6}px, ${parallax.y * 0.6}px)`;
  const mapTransform = `translate(${parallax.x * 0.3}px, ${parallax.y * 0.3}px)`;

  useEffect(() => setupGlobalClickSound(), []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const startFade = () => {
      setLoadingFading(true);
      setTimeout(() => setLoadingVisible(false), 900);
    };
    if (document.readyState === "complete") {
      setTimeout(startFade, 800);
    } else {
      window.addEventListener("load", () => setTimeout(startFade, 800), { once: true });
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-nav-style", "cards");
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const stars = useMemo(createStars, []);
  const mapPoints = useMemo(() => createMapPoints(CHAPTERS), []);

  const scrollToPanel = useCallback((panelId) => {
    const track = trackRef.current;
    if (!track) return;
    const target = track.querySelector(`[data-panel-id="${panelId}"]`);
    if (target) target.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, []);

  const fadeToPanel = useCallback((panelId) => {
    setIsFading(true);
    setTimeout(() => {
      const track = trackRef.current;
      const target = track?.querySelector(`[data-panel-id="${panelId}"]`);
      if (target) target.scrollIntoView({ behavior: "instant", inline: "start", block: "nearest" });
      setTimeout(() => setIsFading(false), 80);
    }, 220);
  }, []);

  // IntersectionObserver — tracks which panel is ≥50% visible
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const id = entry.target.dataset.panelId;
            if (id) {
              setActivePanelId(id);
              // Auto-start typewriter when intro panel scrolls into view
              if (id === "intro" && !typewriterStarted.current) {
                typewriterStarted.current = true;
                window.setTimeout(startTypewriter, 300);
              }
            }
          }
        }
      },
      { root: track, threshold: 0.5 },
    );

    track.querySelectorAll("[data-panel-id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onMouseMove = (event) => {
      setCursor((prev) => ({ ...prev, x: event.clientX, y: event.clientY }));
      const x = (event.clientX / window.innerWidth - 0.5) * 12;
      const y = (event.clientY / window.innerHeight - 0.5) * 12;
      setParallax({ x, y });
    };
    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, []);

  useEffect(() => {
    const animate = () => {
      setCursor((prev) => ({
        ...prev,
        rx: prev.rx + (prev.x - prev.rx) * 0.12,
        ry: prev.ry + (prev.y - prev.ry) * 0.12,
      }));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setPersonModal(null);
        setMemoryModal(null);
        if (chapterVisible) scrollToPanel("map-hub");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [chapterVisible, scrollToPanel]);

  useEffect(() => {
    if (currentSection !== "map-hub") {
      setMapHubPhase("idle");
      return;
    }
    setMapHubPhase("drawing");
    setMapDrawRun((prev) => prev + 1);
    const timer = window.setTimeout(() => {
      setMapHubPhase("points");
    }, MAP_DRAW_DURATION_MS + 140);
    return () => window.clearTimeout(timer);
  }, [currentSection]);

  const startTypewriter = () => {
    setTypewriterText("");
    setShowContinue(false);
    let idx = 0;
    const timer = window.setInterval(() => {
      idx += 1;
      setTypewriterText(INTRO_TEXT.slice(0, idx));
      if (idx >= INTRO_TEXT.length) {
        window.clearInterval(timer);
        setShowContinue(true);
      }
    }, 28);
  };

  const openIntro = () => {
    scrollToPanel("intro");
    if (!typewriterStarted.current) {
      typewriterStarted.current = true;
      window.setTimeout(startTypewriter, 400);
    }
  };

  const loadChapter = (chapter) => {
    const firstPanel = BASE_PANELS.find((p) => p.storyStep === `chapter-${chapter}`);
    if (firstPanel) fadeToPanel(firstPanel.id);
  };

  const openMemory = () => {
    const idx = PANEL_MEMORIES[activePanelId];
    if (idx === undefined) return;
    setMemoryModal(MEMORIES[idx]);
  };

  const goToStoryStep = (stepId) => {
    if (stepId.startsWith("chapter-")) {
      const chapter = stepId.replace("chapter-", "");
      loadChapter(chapter);
      return;
    }
    fadeToPanel(stepId);
  };

  const goToStoryOffset = (offset) => {
    if (storyIndex < 0) return;
    const nextIndex = storyIndex + offset;
    if (nextIndex < 0 || nextIndex >= STORY_STEPS.length) return;
    goToStoryStep(STORY_STEPS[nextIndex].id);
  };

  const panelIndex = BASE_PANELS.findIndex((p) => p.id === activePanelId);

  const goPanelOffset = (offset) => {
    const next = panelIndex + offset;
    if (next < 0 || next >= BASE_PANELS.length) return;
    scrollToPanel(BASE_PANELS[next].id);
  };

  return (
    <>
      {loadingVisible && (
        <div className={`loading-screen${loadingFading ? " loading-screen--fade" : ""}`}>
          <video
            className="loading-screen__video"
            autoPlay
            muted
            playsInline
            loop
          >
            <source src={`${import.meta.env.BASE_URL}night-loading.webm`} type="video/webm" />
            <source src={`${import.meta.env.BASE_URL}night-loading.mp4`} type="video/mp4" />
          </video>
          <div className="loading-screen__overlay" />
          <div className="loading-screen__title">I know a spot</div>
          <div className="loading-screen__dots">
            <span /><span /><span />
          </div>
        </div>
      )}

      <div id="grain" />
      <div
        id="cursor-dot"
        style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
      />
      <div
        id="cursor-ring"
        style={{ transform: `translate(${cursor.rx}px, ${cursor.ry}px)` }}
      />

      <button
        className={`back-btn${chapterVisible ? " visible" : ""}`}
        onClick={() => scrollToPanel("map-hub")}
      >
        <svg className="back-arrow" width="20" height="13" viewBox="0 0 44 28" fill="none" aria-hidden>
          <path d="M 40,14 C 30,11.5 22,16.5 14,14 C 9,12.5 5.5,13.5 4,14"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M 4,14 C 5.5,11 8.5,7.5 11.5,6"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M 4,14 C 5.5,17 8.5,20.5 11.5,22"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
        <span>Map</span>
      </button>
      {PANEL_MEMORIES[activePanelId] !== undefined && (
        <button
          className={`memory-btn${chapterVisible ? " visible" : ""}`}
          onClick={openMemory}
        >
          ✦ memory
        </button>
      )}

      {/* Horizontal scroll track */}
      <div ref={trackRef} className="h-scroll-track">
        <div className="h-panel" data-panel-id="opening">
          <OpeningSection
            onEnter={openIntro}
            onLoadChapter={loadChapter}
            isVisible={activePanelId === "opening"}
          />
        </div>

        <div className="h-panel h-panel--centered" data-panel-id="intro">
          <IntroSection
            typewriterText={typewriterText}
            showContinue={showContinue}
            onContinue={() => scrollToPanel("map-hub")}
            isVisible={activePanelId === "intro"}
          />
        </div>

        <div className="h-panel" data-panel-id="map-hub">
          <MapHub
            onLoadChapter={loadChapter}
            mapTransform={mapTransform}
            mapPoints={mapPoints}
            mapHubPhase={mapHubPhase}
            mapDrawRun={mapDrawRun}
            isVisible={activePanelId === "map-hub"}
          />
        </div>

        <div className="h-panel" data-panel-id="history-hero">
          <HistoryHeroPanel isVisible={activePanelId === "history-hero"} />
        </div>

        <div className="h-panel h-panel--scrollable" data-panel-id="history-collage">
          <HistoryCollagePanel isVisible={activePanelId === "history-collage"} />
        </div>

        <div className="h-panel h-panel--scrollable" data-panel-id="history-carousel">
          <HistoryCarouselPanel isVisible={activePanelId === "history-carousel"} />
        </div>

        <div className="h-panel" data-panel-id="history-video-0">
          <HistoryVideoPanel
            block={HISTORY_VIDEO_BLOCKS[0]}
            isVisible={activePanelId === "history-video-0"}
          />
        </div>

        <div className="h-panel" data-panel-id="museum-video">
          <MuseumVideoSection isVisible={activePanelId === "museum-video"} />
        </div>

        <div className="h-panel" data-panel-id="history-video-1">
          <HistoryVideoPanel
            block={HISTORY_VIDEO_BLOCKS[1]}
            isVisible={activePanelId === "history-video-1"}
          />
        </div>

        <div className="h-panel" data-panel-id="people-hero">
          <PeopleHeroPanel />
        </div>

        <div className="h-panel" data-panel-id="people-grid">
          <PeopleGridPanel onOpenPerson={setPersonModal} isVisible={activePanelId === "people-grid"} />
        </div>

        <div className="h-panel" data-panel-id="life-frames-1">
          <LifeFramesPanel bunch={1} isVisible={activePanelId === "life-frames-1"} />
        </div>

        <div className="h-panel" data-panel-id="life-frames-2">
          <LifeFramesPanel bunch={2} isVisible={activePanelId === "life-frames-2"} />
        </div>

        <div className="h-panel" data-panel-id="nature-hero">
          <NatureHeroPanel isVisible={activePanelId === "nature-hero"} />
        </div>

        <div className="h-panel h-panel--scrollable" data-panel-id="nature-gallery">
          <NatureGalleryPanel onVhsOpen={setVhsOpen} />
        </div>

        <div className="h-panel h-panel--scrollable" data-panel-id="nature-carousel">
          <NatureCarouselPanel />
        </div>

        <div className="h-panel" data-panel-id="nature-video">
          <NatureBranchVideoPanel isVisible={activePanelId === "nature-video"} />
        </div>

        <div className="h-panel h-panel--scrollable" data-panel-id="authors">
          <AuthorsPanel
            onDiaryOpen={() => setIsDiaryOpen(true)}
            onDiaryClose={() => setIsDiaryOpen(false)}
          />
        </div>

        <div className="h-panel" data-panel-id="ending">
          <EndingPanel isVisible={activePanelId === "ending"} />
        </div>
      </div>

      {activePanelId !== "opening" && !isDiaryOpen && (
        <>
          <button
            className="side-nav-btn side-nav-btn--prev"
            onClick={() => goPanelOffset(-1)}
            disabled={panelIndex <= 0 || vhsOpen}
            style={vhsOpen ? { opacity: 0.25, pointerEvents: "none" } : undefined}
            aria-label="Previous"
          >
            PREV
          </button>
          <button
            className="side-nav-btn side-nav-btn--next"
            onClick={() => goPanelOffset(1)}
            disabled={panelIndex >= BASE_PANELS.length - 1 || vhsOpen}
            style={vhsOpen ? { opacity: 0.25, pointerEvents: "none" } : undefined}
            aria-label="Next"
          >
            NEXT
          </button>
        </>
      )}

      <StoryProgressBar
        visible={showStoryBar}
        steps={STORY_STEPS}
        currentIndex={storyIndex < 0 ? 0 : storyIndex}
        onSelectStep={goToStoryStep}
      />

      <PersonModal person={personModal} onClose={() => setPersonModal(null)} />
      <MemoryModal memory={memoryModal} onClose={() => setMemoryModal(null)} />
      <div className={`chapter-fade${isFading ? " active" : ""}`} aria-hidden />
    </>
  );
}
