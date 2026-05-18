import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AuthorsPanel,
  HistoryCarouselPanel,
  HistoryCollagePanel,
  HistoryHeroPanel,
  HistoryVideoPanel,
  IntroSection,
  LoadingScreen,
  MapHub,
  MemoryModal,
  MuseumVideoSection,
  NatureBranchVideoPanel,
  NatureCarouselPanel,
  NatureGalleryPanel,
  NatureHeroPanel,
  OpeningSection,
  PeopleGridPanel,
  PeopleHeroPanel,
  PersonModal,
  PreIntroVideoSection,
  StoryProgressBar,
} from "./components";
import { CHAPTERS, MEMORIES } from "./data";
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
  { id: "chapter-people", label: "People" },
  { id: "chapter-nature", label: "Nature" },
  { id: "chapter-authors", label: "Authors" },
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
  { id: "nature-hero",       storyStep: "chapter-nature"  },
  { id: "nature-gallery",    storyStep: "chapter-nature"  },
  { id: "nature-carousel",   storyStep: "chapter-nature"  },
  { id: "nature-video",      storyStep: "chapter-nature"  },
  { id: "authors",           storyStep: "chapter-authors" },
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
  const [overlaySection, setOverlaySection] = useState("pre-intro-video");
  const [loadingTitle, setLoadingTitle] = useState("History");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const [showContinue, setShowContinue] = useState(false);
  const [personModal, setPersonModal] = useState(null);
  const [memoryModal, setMemoryModal] = useState(null);
  const [mapHubPhase, setMapHubPhase] = useState("idle");
  const [mapDrawRun, setMapDrawRun] = useState(0);
  const [cursor, setCursor] = useState({ x: 0, y: 0, rx: 0, ry: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") ?? "dark");
  const rafRef = useRef(0);
  const trackRef = useRef(null);
  const typewriterStarted = useRef(false);

  const currentSection = overlaySection
    ?? (BASE_PANELS.find((p) => p.id === activePanelId)?.storyStep ?? "opening");

  const chapterVisible = CHAPTER_SECTIONS.has(currentSection);
  const storyIndex = STORY_STEPS.findIndex((step) => step.id === currentSection);
  const showStoryBar = !["intro", "loading", "pre-intro-video"].includes(currentSection);
  const moonTransform = `translate(${parallax.x * 0.6}px, ${parallax.y * 0.6}px)`;
  const mapTransform = `translate(${parallax.x * 0.3}px, ${parallax.y * 0.3}px)`;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const stars = useMemo(createStars, []);
  const mapPoints = useMemo(() => createMapPoints(CHAPTERS), []);

  const scrollToPanel = useCallback((panelId) => {
    const track = trackRef.current;
    if (!track) return;
    const target = track.querySelector(`[data-panel-id="${panelId}"]`);
    if (target) target.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
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

  const goToOpening = () => {
    setOverlaySection(null);
    scrollToPanel("opening");
  };

  const openIntro = () => {
    scrollToPanel("intro");
    if (!typewriterStarted.current) {
      typewriterStarted.current = true;
      window.setTimeout(startTypewriter, 400);
    }
  };

  const loadChapter = (chapter) => {
    const labels = {
      history: "History",
      people: "People",
      nature: "Nature",
      authors: "Authors",
    };
    setLoadingTitle(labels[chapter] || chapter);
    setLoadingProgress(0);
    setOverlaySection("loading");

    const started = Date.now();
    const duration = 1800;
    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const value = Math.min(100, Math.round((elapsed / duration) * 100));
      setLoadingProgress(value);
      if (value >= 100) window.clearInterval(progressTimer);
    }, 30);

    window.setTimeout(() => {
      setOverlaySection(null);
      window.clearInterval(progressTimer);
      setLoadingProgress(100);
      scrollToPanel(`${chapter}-hero`);
    }, 2200);
  };

  const openMemory = () => {
    const randomMemory = MEMORIES[Math.floor(Math.random() * MEMORIES.length)];
    setMemoryModal(randomMemory);
  };

  const goToStoryStep = (stepId) => {
    if (stepId.startsWith("chapter-")) {
      const chapter = stepId.replace("chapter-", "");
      loadChapter(chapter);
      return;
    }
    scrollToPanel(stepId);
  };

  const goToStoryOffset = (offset) => {
    if (storyIndex < 0) return;
    const nextIndex = storyIndex + offset;
    if (nextIndex < 0 || nextIndex >= STORY_STEPS.length) return;
    goToStoryStep(STORY_STEPS[nextIndex].id);
  };

  return (
    <>
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
      <button
        className={`memory-btn${chapterVisible ? " visible" : ""}`}
        onClick={openMemory}
      >
        ✦ memory
      </button>

      {/* Fixed overlays */}
      <LoadingScreen
        active={overlaySection === "loading"}
        chapterTitle={loadingTitle}
        progress={loadingProgress}
      />
      <PreIntroVideoSection
        active={overlaySection === "pre-intro-video"}
        onFinish={goToOpening}
      />

      {/* Horizontal scroll track */}
      <div ref={trackRef} className="h-scroll-track">
        <div className="h-panel" data-panel-id="opening">
          <OpeningSection
            stars={stars}
            onEnter={openIntro}
            moonTransform={moonTransform}
            theme={theme}
            onThemeToggle={toggleTheme}
            isVisible={overlaySection === null && activePanelId === "opening"}
          />
        </div>

        <div className="h-panel h-panel--centered" data-panel-id="intro">
          <IntroSection
            typewriterText={typewriterText}
            showContinue={showContinue}
            onContinue={() => scrollToPanel("map-hub")}
          />
        </div>

        <div className="h-panel" data-panel-id="map-hub">
          <MapHub
            onLoadChapter={loadChapter}
            mapTransform={mapTransform}
            mapPoints={mapPoints}
            mapHubPhase={mapHubPhase}
            mapDrawRun={mapDrawRun}
          />
        </div>

        <div className="h-panel" data-panel-id="history-hero">
          <HistoryHeroPanel />
        </div>

        <div className="h-panel h-panel--scrollable" data-panel-id="history-collage">
          <HistoryCollagePanel isVisible={activePanelId === "history-collage"} />
        </div>

        <div className="h-panel h-panel--scrollable" data-panel-id="history-carousel">
          <HistoryCarouselPanel />
        </div>

        <div className="h-panel" data-panel-id="history-video-0">
          <HistoryVideoPanel
            block={HISTORY_VIDEO_BLOCKS[0]}
            isVisible={activePanelId === "history-video-0"}
          />
        </div>

        <div className="h-panel" data-panel-id="museum-video">
          <MuseumVideoSection />
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

        <div className="h-panel h-panel--scrollable" data-panel-id="people-grid">
          <PeopleGridPanel onOpenPerson={setPersonModal} />
        </div>

        <div className="h-panel" data-panel-id="nature-hero">
          <NatureHeroPanel isVisible={activePanelId === "nature-hero"} />
        </div>

        <div className="h-panel h-panel--scrollable" data-panel-id="nature-gallery">
          <NatureGalleryPanel />
        </div>

        <div className="h-panel h-panel--scrollable" data-panel-id="nature-carousel">
          <NatureCarouselPanel />
        </div>

        <div className="h-panel" data-panel-id="nature-video">
          <NatureBranchVideoPanel isVisible={activePanelId === "nature-video"} />
        </div>

        <div className="h-panel h-panel--scrollable" data-panel-id="authors">
          <AuthorsPanel />
        </div>
      </div>

      <StoryProgressBar
        visible={showStoryBar}
        steps={STORY_STEPS}
        currentIndex={storyIndex < 0 ? 0 : storyIndex}
        onSelectStep={goToStoryStep}
        onPrev={() => goToStoryOffset(-1)}
        onNext={() => goToStoryOffset(1)}
      />

      <PersonModal person={personModal} onClose={() => setPersonModal(null)} />
      <MemoryModal memory={memoryModal} onClose={() => setMemoryModal(null)} />
    </>
  );
}
