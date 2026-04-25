import { useEffect, useMemo, useRef, useState } from "react";
import {
  AuthorsSection,
  HistorySection,
  IntroSection,
  LoadingScreen,
  MapHub,
  MemoryModal,
  NatureSection,
  OpeningSection,
  PeopleSection,
  PreIntroVideoSection,
  PersonModal,
  StoryProgressBar,
} from "./components";
import { CHAPTERS, MEMORIES } from "./data";

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
  const [currentSection, setCurrentSection] = useState("pre-intro-video");
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
  const rafRef = useRef(0);

  const stars = useMemo(createStars, []);
  const mapPoints = useMemo(() => createMapPoints(CHAPTERS), []);
  const chapterVisible = CHAPTER_SECTIONS.has(currentSection);
  const storyIndex = STORY_STEPS.findIndex((step) => step.id === currentSection);
  const showStoryBar = !["intro", "loading", "pre-intro-video"].includes(currentSection);
  const moonTransform = `translate(${parallax.x * 0.6}px, ${parallax.y * 0.6}px)`;
  const mapTransform = `translate(${parallax.x * 0.3}px, ${parallax.y * 0.3}px)`;

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
        if (chapterVisible) setCurrentSection("map-hub");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [chapterVisible]);

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
    setCurrentSection("opening");
  };

  const startIntro = () => {
    setCurrentSection("intro");
    window.setTimeout(startTypewriter, 400);
  };

  const openIntro = () => {
    startIntro();
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
    setCurrentSection("loading");

    const started = Date.now();
    const duration = 1800;
    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const value = Math.min(100, Math.round((elapsed / duration) * 100));
      setLoadingProgress(value);
      if (value >= 100) window.clearInterval(progressTimer);
    }, 30);

    window.setTimeout(() => {
      setCurrentSection(`chapter-${chapter}`);
      window.clearInterval(progressTimer);
      setLoadingProgress(100);
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
    setCurrentSection(stepId);
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
        onClick={() => setCurrentSection("map-hub")}
      >
        <span className="back-arrow" />
        <span>Map</span>
      </button>
      <button
        className={`memory-btn${chapterVisible ? " visible" : ""}`}
        onClick={openMemory}
      >
        ✦ memory
      </button>

      <LoadingScreen
        active={currentSection === "loading"}
        chapterTitle={loadingTitle}
        progress={loadingProgress}
      />
      <OpeningSection
        active={currentSection === "opening"}
        stars={stars}
        onEnter={openIntro}
        moonTransform={moonTransform}
      />
      <IntroSection
        active={currentSection === "intro"}
        typewriterText={typewriterText}
        showContinue={showContinue}
        onContinue={() => setCurrentSection("map-hub")}
      />
      <PreIntroVideoSection
        active={currentSection === "pre-intro-video"}
        onFinish={goToOpening}
      />
      <MapHub
        active={currentSection === "map-hub"}
        onLoadChapter={loadChapter}
        mapTransform={mapTransform}
        mapPoints={mapPoints}
        mapHubPhase={mapHubPhase}
        mapDrawRun={mapDrawRun}
      />
      <HistorySection active={currentSection === "chapter-history"} />
      <PeopleSection
        active={currentSection === "chapter-people"}
        onOpenPerson={setPersonModal}
      />
      <NatureSection active={currentSection === "chapter-nature"} />
      <AuthorsSection active={currentSection === "chapter-authors"} />
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
