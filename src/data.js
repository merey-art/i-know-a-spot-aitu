export const CHAPTERS = [
  { key: "history", label: "History", number: "01", mapPosition: { x: 158, y: 126 } },
  { key: "people", label: "Life", number: "02", mapPosition: { x: 340, y: 95 } },
  { key: "nature", label: "Nature", number: "03", mapPosition: { x: 86, y: 214 } },
  { key: "authors", label: "Authors", number: "04", mapPosition: { x: 146, y: 258 } },
];

export const PEOPLE = [
  {
    id: "social-worker",
    name: "Aizhan Kuanova",
    role: "Social Worker",
    interviewNote: "Interview with Aizhan Kuanova, Social Worker in Ereymentau",
    quote: "",
    transcript: "",
    videoSrc: "https://www.youtube.com/embed/n4XoeHqWsxw",
    thumbnailSrc: "https://img.youtube.com/vi/n4XoeHqWsxw/maxresdefault.jpg",
    portraitTone: "social",
  },
  {
    id: "akim",
    name: "Talgat Akhmetov",
    role: "Akim of Ereymentau · Age 47",
    interviewNote: "Interview with the Akim of Ereymentau",
    quote:
      "A conversation about the city from the perspective of governance and responsibility. How ideas of development are formed, what decisions are made, and how they relate to the everyday lives of residents.",
    transcript:
      "Batyrs, the railway, and nature are what make Ereymentau special. My main goal now is to retain and attract as many young people as possible to this city.",
    videoSrc: "https://www.youtube.com/embed/NbUsCOkSeOk",
    thumbnailSrc: "https://img.youtube.com/vi/NbUsCOkSeOk/maxresdefault.jpg",
    portraitTone: "akim",
  },
  {
    id: "elderly-woman",
    name: "Kulbakhsha Bukurova",
    role: "Resident · Age 72",
    interviewNote: "Interview with a member of the Active Longevity Center",
    quote:
      "A story of everyday life where movement becomes a form of continuity. Dancing, group activities, shared moments — ways of staying connected to the city not only physically, but emotionally.",
    transcript:
      "We live peacefully here, the doors are always open. It’s very clean and green. I have sports, dancing, yoga, and lots of activities here. I don’t want to leave this place.",
    videoSrc: "https://www.youtube.com/embed/BO1_a5Rz4Kg",
    thumbnailSrc: "https://img.youtube.com/vi/BO1_a5Rz4Kg/maxresdefault.jpg",
    portraitTone: "elder",
  },
];

// Maps each panel ID to the index in MEMORIES that should appear on that panel
export const PANEL_MEMORIES = {
  "history-hero":    0,  // 150 KZT ticket
  "history-collage": 1,  // family albums
  "history-carousel":2,  // wolf
  "history-video-1": 3,  // first built house 1948 — "Words on the wall"
  "people-hero":     4,  // I do sports
  "people-grid":     5,  // spontaneous people chapter
  "nature-carousel": 6,  // Zhaushoqy 450m
  "nature-hero":     7,  // landscapes / steppe breathes
  "nature-video":    8,  // samsa stall
  "authors":         9,  // road trip dream — "Backstage Diary"
};

export const MEMORIES = [
  {
    type: "History of Ereymentau",
    content: "What was unexpected was that the ticket to the museum cost 150 KZT…",
    audio: "audio/АУДИО МАТЕРИАЛЫ/AlimaVoice/AlimaAudio_150TG.mp3",
  },
  {
    type: "Scroll Collage",
    content: "Exploring other people's family albums was very interesting.",
    audio: "audio/АУДИО МАТЕРИАЛЫ/AlimaVoice/AlimaAudio_FamilyAlbums.mp3",
  },
  {
    type: "Archive Carousel",
    content: "We got scared of that wolf seriously.",
    audio: "audio/АУДИО МАТЕРИАЛЫ/AlimaVoice/AlimaAudio_WolfScared.mp3",
  },
  {
    type: "Words on the wall",
    content: "Visiting the first built house in this town felt exciting...",
    body: "The museum building was constructed in 1948. It was the first building in the city of Ereymentau and also holds historical value, serving as a bridge between ancient and modern history.",
    audio: "audio/АУДИО МАТЕРИАЛЫ/AiganymVoice/AiganymAudio_Exciting.mp3",
  },
  {
    type: "Voices of Ereymentau",
    content: "“I do sports to stay young and healthy”",
    source: "Kulbakhsha Bukurova",
    sourceRole: "Resident · Age 72",
    audio: "audio/АУДИО МАТЕРИАЛЫ/AiganymVoice/AiganymAudio_YoungHealthy.mp3",
  },
  {
    type: "People · Interviews",
    content: "Everything was spontaneous to us in the People chapter.",
    audio: "audio/АУДИО МАТЕРИАЛЫ/AiganymVoice/AiganymAudio_PeopleChapter.mp3",
  },
  {
    type: "Nature Frames",
    content: "Zhaushoqy Mountain turns out to be 450 meters above sea level.",
    audio: "audio/АУДИО МАТЕРИАЛЫ/AlinaVoice/AlinaAudio_Jaushoqy.mp3",
  },
  {
    type: "The Steppe Breathes",
    content: "Seeing such landscapes, I felt a deep connection with nature and a sense of inner peace.",
    audio: "audio/АУДИО МАТЕРИАЛЫ/AlinaVoice/AlinaAudition_InnerPeace.mp3",
  },
  {
    type: "The land keeps speaking long after people stop talking.",
    content: "During the trip, we ended up having a favorite samsa stall.",
    audio: "audio/АУДИО МАТЕРИАЛЫ/AlinaVoice/AlinaAudio_SamsaShop.mp3",
  },
  {
    type: "Дневник",
    content: "We have been dreaming of a road trip film for such a long time and we finally succeeded to finish our journey.",
    audio: "audio/АУДИО МАТЕРИАЛЫ/AlimaVoice/AlimaAudio_Journey.mp3",
  },
];
