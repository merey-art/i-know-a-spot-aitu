import heroBg from "../images/history-tab/DSC04134.webp";
import collage1 from "../images/history-tab/SON02807.webp";
import collage2 from "../images/history-tab/SON02822.webp";
import collage3 from "../images/history-tab/SON02828.webp";
import collage4 from "../images/history-tab/SON03077.webp";
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
      "The District Historical and Local Lore Museum. The museum was opened in 1991. It features several halls: a paleontological hall, an archaeological hall, an ethnographic hall, and a Hall of Glory dedicated to Kazakh batyrs. Separate exhibitions рассказывают о местной истории и природе — separate exhibitions present the local history and nature of the region. We also saw an exhibition display dedicated to the sacred sites of the district.",
  },
  {
    id: "v2",
    src: videoMuseumPlaque,
    title: "Words on the wall",
    body:
      "The museum building was constructed in 1948. It was the first building in the city of Ereymentau and also holds historical value, serving as a bridge between ancient and modern history.",
  },
];
