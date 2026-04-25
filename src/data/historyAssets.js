import heroBg from "../images/history-tab/DSC04134.JPG";
import collage1 from "../images/history-tab/SON02807.webp";
import collage2 from "../images/history-tab/SON02822.webp";
import collage3 from "../images/history-tab/SON02828.webp";
import collage4 from "../images/history-tab/SON03077.jpg";
import videoMuseumExterior from "../images/history-tab/музей снаружи.mp4";
import videoMuseumPlaque from "../images/history-tab/табличка музея.mp4";

/** Fullscreen hero background */
export const HISTORY_HERO_BG = heroBg;

/** Scroll collage — four frames that move on scroll */
export const HISTORY_COLLAGE = [
  { id: "c1", src: collage1 },
  { id: "c2", src: collage2 },
  { id: "c3", src: collage3 },
  { id: "c4", src: collage4 },
];

/** Horizontal carousel — all stills including wide hero frame */
export const HISTORY_ARCHIVE_PHOTOS = [
  { id: "a1", src: heroBg },
  { id: "a2", src: collage1 },
  { id: "a3", src: collage2 },
  { id: "a4", src: collage3 },
  { id: "a5", src: collage4 },
];

/** Fullscreen background videos + overlay copy */
export const HISTORY_VIDEO_BLOCKS = [
  {
    id: "v1",
    src: videoMuseumExterior,
    title: "Past in motion",
    body:
      "The museum from outside — a fixed point in the city where public memory is gathered, displayed, and argued over in quiet corridors.",
  },
  {
    id: "v2",
    src: videoMuseumPlaque,
    title: "Words on the wall",
    body:
      "A plaque, a name, a date: small objects that anchor a much larger story about who gets to write history on the street.",
  },
];
