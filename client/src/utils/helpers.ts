import { useRef, useEffect, useState } from "react";
import { 
  auth,
  storage,
  storageRef,
  uploadBytes,
  getDownloadURL,
  dbRef,
  database,
  get,
} from "../firebase/firebase";
import { PDFDocument } from 'pdf-lib';
import { doGenerateSpeech, doSetUserStatus, doGetCurrentMonthActivities, doGenerateElevenLabsSpeech } from "../api/functions";
import { imageSrc } from "../components/Icons/icons";
import imageCompression from 'browser-image-compression';
import { PDFDocumentProxy } from "pdfjs-dist";
import tagalogDict from "../assets/dictionary/tagalog_dict_lines.json";
import singleA from "../assets/ALPHABETS/A/A.mp3";
import singleB from "../assets/ALPHABETS/B/B.mp3";
import singleC from "../assets/ALPHABETS/C/C.mp3";
import singleD from "../assets/ALPHABETS/D/D.mp3";
import singleE from "../assets/ALPHABETS/E/E.mp3";
import singleF from "../assets/ALPHABETS/F/F.mp3";
import singleG from "../assets/ALPHABETS/G/G.mp3";
import singleH from "../assets/ALPHABETS/H/H.mp3";
import singleI from "../assets/ALPHABETS/I/I.mp3";
import singleJ from "../assets/ALPHABETS/J/J.mp3";
import singleK from "../assets/ALPHABETS/K/K.mp3";
import singleM from "../assets/ALPHABETS/M/M.mp3";
import singleN from "../assets/ALPHABETS/N/N.mp3";
import singleNg from "../assets/ALPHABETS/NG/NG.mp3";
import singleO from "../assets/ALPHABETS/O/O.mp3";
import singleP from "../assets/ALPHABETS/P/P.mp3";
import singleQ from "../assets/ALPHABETS/Q/Q.mp3";
import singleR from "../assets/ALPHABETS/R/R.mp3";
import singleS from "../assets/ALPHABETS/S/S.mp3";
import singleT from "../assets/ALPHABETS/T/T.mp3";
import singleU from "../assets/ALPHABETS/U/U.mp3";
import singleV from "../assets/ALPHABETS/V/V.mp3";
import singleW from "../assets/ALPHABETS/W/W.mp3";
import singleX from "../assets/ALPHABETS/X/X.mp3";
import singleY from "../assets/ALPHABETS/Y/Y.mp3";
import { AudioJob } from "../components/Lesson/useAudioQueue";
import bigkasStep1 from '../assets/steps/bigkasStep1.mp3';
import bigkasStep2 from '../assets/steps/bigkasStep2.mp3';
import bigkasStep3 from '../assets/steps/bigkasStep3.mp3';
import bigkasStep4 from '../assets/steps/bigkasStep4.mp3';
import bigkasStep5 from '../assets/steps/bigkasStep5.mp3';
import bigkasStep6 from '../assets/steps/bigkasStep6.mp3';
import bigkasStep7 from '../assets/steps/bigkasStep7.mp3';
import quizStep1 from '../assets/steps/quizStep1.mp3';
import quizStep2 from '../assets/steps/quizStep2.mp3';
import quizStep3 from '../assets/steps/quizStep3.mp3';
import quizStep4 from '../assets/steps/quizStep4.mp3';
import quizStep5 from '../assets/steps/quizStep5.mp3';
import quizStep6 from '../assets/steps/quizStep6.mp3';
import quizStep7 from '../assets/steps/quizStep7.mp3';
/**
 * Hides the scrollbar of a target element if there's no user action for `timeout` ms.
 * Shows the scrollbar again on user interaction.
 * @param targetSelector - CSS selector for the scrollable element (e.g. ".my-scrollable-div")
 * @param timeout - Time in ms before hiding the scrollbar (default: 1500)
 */

const numberImages = [
  imageSrc.number0, imageSrc.number1, imageSrc.number2, imageSrc.number3, imageSrc.number4,
  imageSrc.number5, imageSrc.number6, imageSrc.number7, imageSrc.number8, imageSrc.number9, imageSrc.number10
];

export const getNumberImages = (num: number) => {
  return num
    ?.toString()
    .split("")
    .map((digit) => numberImages[parseInt(digit, 10)]);
};

export const getStarImages = (mode: string) => {
  const starCounts = { easy: 1, normal: 2, hard: 3 };
  const count = starCounts[mode?.toLowerCase() as keyof typeof starCounts] || 1;
  return Array(count).fill(imageSrc.star);
};

const lowercaseLetters = {
  'a': imageSrc.lc_letter_a, 'b': imageSrc.lc_letter_b, 'c': imageSrc.lc_letter_c, 'd': imageSrc.lc_letter_d,
  'e': imageSrc.lc_letter_e, 'f': imageSrc.lc_letter_f, 'g': imageSrc.lc_letter_g, 'h': imageSrc.lc_letter_h,
  'i': imageSrc.lc_letter_i, 'j': imageSrc.lc_letter_j, 'k': imageSrc.lc_letter_k, 'l': imageSrc.lc_letter_l,
  'm': imageSrc.lc_letter_m, 'n': imageSrc.lc_letter_n, 'o': imageSrc.lc_letter_o, 'p': imageSrc.lc_letter_p,
  'q': imageSrc.lc_letter_q, 'r': imageSrc.lc_letter_r, 's': imageSrc.lc_letter_s, 't': imageSrc.lc_letter_t,
  'u': imageSrc.lc_letter_u, 'v': imageSrc.lc_letter_v, 'w': imageSrc.lc_letter_w, 'x': imageSrc.lc_letter_x,
  'y': imageSrc.lc_letter_y, 'z': imageSrc.lc_letter_z
};

const uppercaseLetters = {
  'A': imageSrc.letterA, 'B': imageSrc.letterB, 'C': imageSrc.letterC, 'D': imageSrc.letterD,
  'E': imageSrc.letterE, 'F': imageSrc.letterF, 'G': imageSrc.letterG, 'H': imageSrc.letterH,
  'I': imageSrc.letterI, 'J': imageSrc.letterJ, 'K': imageSrc.letterK, 'L': imageSrc.letterL,
  'M': imageSrc.letterM, 'N': imageSrc.letterN, 'O': imageSrc.letterO, 'P': imageSrc.letterP,
  'Q': imageSrc.letterQ, 'R': imageSrc.letterR, 'S': imageSrc.letterS, 'T': imageSrc.letterT,
  'U': imageSrc.letterU, 'V': imageSrc.letterV, 'W': imageSrc.letterW, 'X': imageSrc.letterX,
  'Y': imageSrc.letterY, 'Z': imageSrc.letterZ
};

const numberLetters = {
  '0': imageSrc.number0, '1': imageSrc.number1, '2': imageSrc.number2, '3': imageSrc.number3, '4': imageSrc.number4,
  '5': imageSrc.number5, '6': imageSrc.number6, '7': imageSrc.number7, '8': imageSrc.number8, '9': imageSrc.number9
};

export const getLetterImages = (word: string, preserveCase: boolean = true) => {
  return word
    .split("")
    .map((char) => {
      if (preserveCase) {
        if (/\d/.test(char)) {
          return numberLetters[char as keyof typeof numberLetters] || null;
        }
        if (char === ' ') {
          return null;
        }
        return uppercaseLetters[char as keyof typeof uppercaseLetters] || 
               lowercaseLetters[char as keyof typeof lowercaseLetters] || null;
      } else {
        const lowerChar = char.toLowerCase();
        return lowercaseLetters[lowerChar as keyof typeof lowercaseLetters] || null;
      }
    })
    .filter(Boolean);
};

export const getWordImages = (word: string, allUppercase: boolean = false) => {
  if (allUppercase) {
    return word
      .split("")
      .map((char) => {
        if (/\d/.test(char)) {
          return numberLetters[char as keyof typeof numberLetters] || null;
        }
        if (char === ' ') {
          return null;
        }
        return uppercaseLetters[char.toUpperCase() as keyof typeof uppercaseLetters] || null;
      })
      .filter(Boolean);
  }
  return getLetterImages(word, true);
};

export const getMixedTextNumber = (text: string, allUppercase: boolean = false) => {
  return text
    .split("")
    .map((char) => {
      if (/\d/.test(char)) {
        return numberLetters[char as keyof typeof numberLetters];
      }
      if (char === ' ') {
        return null;
      }
      if (allUppercase) {
        return uppercaseLetters[char.toUpperCase() as keyof typeof uppercaseLetters] || 
               lowercaseLetters[char.toLowerCase() as keyof typeof lowercaseLetters];
      } else {
        return uppercaseLetters[char as keyof typeof uppercaseLetters] || 
               lowercaseLetters[char as keyof typeof lowercaseLetters];
      }
    })
    .filter(Boolean);
};

export const checkUserStatus = async (
  setShowVerificationModal: (v: boolean) => void,
  setShowRestrictedModal: (v: boolean) => void,
  setShouldNavigate: (v: boolean) => void
) => {
  const user = auth.currentUser;
  if (user) {
    const realtimeUserRef = dbRef(database, `users/${user.uid}`);
    const snapshot = await get(realtimeUserRef);
    const userData = snapshot.exists() ? snapshot.val() : null;
    if (userData && userData.disabled) {
      await doSetUserStatus(user.uid, user.uid, true);
      setShowVerificationModal(false);
      setShowRestrictedModal(true);
      await auth.signOut();
      return;
    } else {
      setShouldNavigate(true);
    }
  }
};

export async function fetchCurrentMonthActivities(uid: string) {
  try {
    const response = await doGetCurrentMonthActivities(uid) as any;
    if (response?.activities) {
      return {
        five: response.activities.five,
        all: response.activities.all,
      };
    }
    return { five: [], all: [] };
  } catch (error) {
    console.error("Error fetching activities:", error);
    return { five: [], all: [] };
  }
}

export const getTimeFromCreatedAt = (createdAt: string) => {
  const date = new Date(createdAt);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

export function formatTimeTo12Hour(time24: string) {
  if (!time24) return "";
  const [hour, minute] = time24.split(":");
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12.toString().padStart(2, "0")}:${minute} ${ampm}`;
}

export function formatTimeTo24Hour(time12h: string) {
  if (!time12h) return "";
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  let h = parseInt(hours, 10);
  if (modifier === "PM" && h < 12) h += 12;
  if (modifier === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${minutes}`;
}

export function formatUserDate(dateString: string) {
  const date = new Date(dateString);
  return `${date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })} ${date.toLocaleDateString("en-US", { weekday: "short" })}`;
}

export function formatDateTimeLocal(dateTimeString: string) {
  if (!dateTimeString) return "";
  const date = new Date(dateTimeString);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  let hour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 === 0 ? 12 : hour % 12;
  return `${day} ${month} ${year} ${hour}:${minute} ${ampm}`;
}

export const useLongPress = (callback: () => void, ms: number = 500) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    timerRef.current = setTimeout(callback, ms);
  };

  const clear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
  };
};

export function filterAndSortUsers(
  users: any[],
  query: string,
  role: string,
  order: string,
  verified: string,
  status: string,
) {
  let filtered = [...users];

  // Search query filter
  if (query.trim()) {
    filtered = filtered.filter((user) =>
      Object.values(user).join(" ").toLowerCase().includes(query.toLowerCase()),
    );
  }

  // Role filter
  if (role) {
    filtered = filtered.filter((user) => user.role === role);
  }

  // Email verified filter
  if (verified) {
    filtered = filtered.filter((user) =>
      verified === "verified" ? user.emailVerified : !user.emailVerified,
    );
  }

  // Status filter
  if (status) {
    filtered = filtered.filter((user) =>
      status === "active" ? !user.disabled : user.disabled,
    );
  }

  // Alphabetical order filter
  if (order === "asc") {
    filtered = filtered.sort((a, b) =>
      (a.displayName || "").localeCompare(b.displayName || ""),
    );
  } else if (order === "desc") {
    filtered = filtered.sort((a, b) =>
      (b.displayName || "").localeCompare(a.displayName || ""),
    );
  }

  return filtered;
};

export function paginate<T>(items: T[], page: number, perPage: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const startIdx = (safePage - 1) * perPage;
  const endIdx = startIdx + perPage;
  return {
    paged: items.slice(startIdx, endIdx),
    totalPages,
    safePage,
  };
};

export function filterAndSortMembers(users: any[], query: string) {
  let filtered = [...users];

  // Search query filter
  if (query.trim()) {
    filtered = filtered.filter((user) =>
      Object.values(user).join(" ").toLowerCase().includes(query.toLowerCase()),
    );
  }

  return filtered;
};

export function paginateMembers<T>(items: T[], page: number, perPage: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const startIdx = (safePage - 1) * perPage;
  const endIdx = startIdx + perPage;
  return {
    paged: items.slice(startIdx, endIdx),
    totalPages,
    safePage,
  };
};

export function useAutoHideScrollbar(
  targetSelector: string,
  timeout: number = 1500,
) {
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const el = document.querySelector(targetSelector) as HTMLElement | null;
    if (!el) return;

    const showScrollbar = () => {
      el.classList.remove("hide-scrollbar");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(hideScrollbar, timeout);
    };

    const hideScrollbar = () => {
      el.classList.add("hide-scrollbar");
    };

    // Initial show
    showScrollbar();

    // Listen for user actions
    el.addEventListener("mousemove", showScrollbar);
    el.addEventListener("scroll", showScrollbar);
    el.addEventListener("keydown", showScrollbar);

    return () => {
      el.removeEventListener("mousemove", showScrollbar);
      el.removeEventListener("scroll", showScrollbar);
      el.removeEventListener("keydown", showScrollbar);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [targetSelector, timeout]);
};

const tagalogWords = new Set((tagalogDict.data as { word: string }[]).map(w => w.word));

export const stepAudios = [
  bigkasStep1,
  bigkasStep2,
  bigkasStep3,
  bigkasStep4,
  bigkasStep5,
  bigkasStep6,
  bigkasStep7,
];

export const quizStepAudios = [
  quizStep1,
  quizStep2,
  quizStep3,
  quizStep4,
  quizStep5,
  quizStep6,
  quizStep7,
];

export const fixSmartSplitWords = (text: string) => {
  return text.replace(/\b([A-Za-z]+)\s+([A-Za-z]+)\b/g, (match, part1, part2) => { // Regex: match two words separated by a single space
    const lower1 = part1.toLowerCase();
    const lower2 = part2.toLowerCase();
    const joined = (part1 + part2).toLowerCase();
    if (tagalogWords.has(lower1) && tagalogWords.has(lower2)) { // Both parts are valid Tagalog words: keep the space
      return part1 + " " + part2;
    }
    if (tagalogWords.has(joined)) { // Joined is a valid Tagalog word: join them
      return part1 + part2;
    }
    return match; // Otherwise, leave as is
  });
};

export const fixWordsWithDictionary = (text: string) => {
  return text.split(/\b/).map(word => {
    const trimmed = word.trim();
    if (!trimmed) return word;
    if (tagalogWords.has(trimmed)) return word; // Exact match
    const joined = trimmed.replace(/\s+/g, ""); // Remove all spaces
    if (tagalogWords.has(joined)) return word.replace(trimmed, joined);
    return word;
  }).join("");
};

export const extractTextFromPDFPage = async (
  pdfDoc: PDFDocumentProxy,
  pageNumber: number
): Promise<string> => {
  if (!pdfDoc) return "";
  try {
    const page = await pdfDoc.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items as any[];
    const seen = new Set();
    const uniqueItems = items.filter(item => {
      const key = `${item.str}-${item.transform[4]}-${item.transform[5]}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    uniqueItems.sort((a, b) => {
      const ay = a.transform[5], by = b.transform[5];
      if (Math.abs(ay - by) > 1) return by - ay;
      return a.transform[4] - b.transform[4];
    });
    let lines: { y: number, text: string[] }[] = [];
    uniqueItems.forEach(item => {
      const y = item.transform[5];
      let line = lines.find(l => Math.abs(l.y - y) < 1);
      if (!line) {
        line = { y, text: [] };
        lines.push(line);
      }
      if (!line.text.includes(item.str)) {
        line.text.push(item.str);
      }
    });
    let mergedLines = lines
      .map(line => line.text.join(" "))
      .map(line => line.replace(/\s+/g, " ").trim())
      .filter(line => line.length > 0);
    const dedupedLines = Array.from(new Set(mergedLines));
    let mergedText = dedupedLines.join("\n")
      .replace(/(?:^|\n)(.+)(?:\n\1)+/g, "$1")  // Remove consecutive duplicate lines
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove invisible characters
      .normalize("NFC"); // Normalize unicode
    mergedText = mergedText.replace(/(\w)-\s+(\w)/g, "$1$2"); // Fix hyphenated splits
    mergedText = mergedText.replace(/[\u0332\u0300-\u036F]/g, ""); // Remove underline/diacritics
    mergedText = fixSmartSplitWords(mergedText); // Smart fix split words
    mergedText = mergedText.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents
    mergedText = fixWordsWithDictionary(mergedText); // Fix using dictionary
    let plain = mergedText.trim();
    if (!plain.endsWith(".")) {
      plain += ".";
    }
    return plain;
  } catch (err) {
    return "";
  }
};

const letterAudioMap: Record<string, string> = {
  a: singleA,
  b: singleB,
  c: singleC,
  d: singleD,
  e: singleE,
  f: singleF,
  g: singleG,
  h: singleH,
  i: singleI,
  j: singleJ,
  k: singleK,
  m: singleM,
  n: singleN,
  ng: singleNg,
  o: singleO,
  p: singleP,
  q: singleQ,
  r: singleR,
  s: singleS,
  t: singleT,
  u: singleU,
  v: singleV,
  w: singleW,
  x: singleX,
  y: singleY,
};

const TTS_CACHE_KEY = "tts_cache";
const TTS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const getTtsCache = (): Record<string, { url: string; ts: number }> => {
  return JSON.parse(localStorage.getItem(TTS_CACHE_KEY) || "{}");
};

const setTtsCache = (cache: Record<string, { url: string; ts: number }>) => {
  localStorage.setItem(TTS_CACHE_KEY, JSON.stringify(cache));
};

export const getCachedTts = async (text: string, speed: number): Promise<string | null> => {
  const key = `${text}|${speed}`;
  const cache = getTtsCache();
  const entry = cache[key];
  if (entry && Date.now() - entry.ts < TTS_CACHE_TTL) {
    return entry.url;
  }
  return null;
};

export const putCachedTts = async (text: string, speed: number, url: string) => {
  const key = `${text}|${speed}`;
  const cache = getTtsCache();
  cache[key] = { url, ts: Date.now() };
  setTtsCache(cache);
};

export const createAudioForJob = (async (job: AudioJob) => {
  if (job.type === "letter") {
    const src = letterAudioMap[job.letter.toLowerCase()];
    return src ? new Audio(src) : null;
  } else {
    const cachedUrl = await getCachedTts(job.text, job.speed);
    if (cachedUrl) return new Audio(cachedUrl);
    try {
      const res = await doGenerateElevenLabsSpeech(job.text, job.speed) as any;
      if (res?.url) {
        await putCachedTts(job.text, job.speed, res.url);
        return new Audio(res.url);
      }
    } catch {}
    return null;
  }
});

export const buildJobsFromText = (text: string, speed: number): AudioJob[] => {
  const parts = text.split(/(\b(?:[A-Z]|NG)\b)/g).filter(p => p !== undefined && p !== "");
  const jobs: AudioJob[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed || trimmed === ".") continue;
    const key = trimmed.replace(/[.,]/g, "").toLowerCase();
    if (letterAudioMap[key]) {
      jobs.push({ type: "letter", letter: key });
    } else {
      jobs.push({ type: "tts", text: part, speed });
    }
  }
  return jobs;
};

export function useAudioSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [isAudioPaused, setIsAudioPaused] = useState(true);

  const speak = async (text: string, idx: number) => {
    if (audioRef.current && playingIdx === idx) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsAudioPaused(false);
      } else {
        audioRef.current.pause();
        setIsAudioPaused(true);
      }
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingIdx(idx);
    try {
      const response = await doGenerateSpeech(text) as any;
      if (response?.url) {
        const audio = new Audio(response.url);
        audioRef.current = audio;
        audio.play();
        setIsAudioPaused(false);
        audio.onpause = () => setIsAudioPaused(true);
        audio.onplay = () => setIsAudioPaused(false);
        audio.onended = () => {
          if (audioRef.current === audio) audioRef.current = null;
          setPlayingIdx(null);
          setIsAudioPaused(true);
        };
        audio.onerror = () => {
          setPlayingIdx(null);
          setIsAudioPaused(true);
        };
      } else {
        setPlayingIdx(null);
        setIsAudioPaused(true);
      }
    } catch (error) {
      setPlayingIdx(null);
      setIsAudioPaused(true);
    }
  };

  return { audioRef, playingIdx, isAudioPaused, speak };
}

export const urlToFile = async (url: string, filename: string, mimeType: string): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: mimeType });
}

export const getYunitFileName = (url: string) => {
  try {
    const decoded = decodeURIComponent(url);
    const match = decoded.match(/yunits\/[^_]+_(.+?)\?/);
    return match ? match[1] : "";
  } catch {
    return "";
  }
};

export const getPdfFileName = (url: string) => {
  try {
    const decoded = decodeURIComponent(url);
    const match = decoded.match(/\/([^\/\?]+\.pdf)\?/);
    return match ? match[1] : "";
  } catch {
    return "";
  }
};

export const findOrCreateLevelGroup = (
  phraseList: any[], 
  yunitNumber: number, 
  levelNumber: number, 
  gradeLevel: string
) => {
  const existingLevel = phraseList.find(level => 
    level.yunitNumber === yunitNumber && 
    level.levelNumber === levelNumber && 
    level.gradeLevel === gradeLevel
  );
  if (existingLevel) {
    return { level: existingLevel, isNew: false };
  }
  const newLevel = {
    key: `${yunitNumber}-${levelNumber}-${Date.now()}`,
    yunitNumber: yunitNumber,
    levelNumber: levelNumber,
    gradeLevel: gradeLevel,
    easy: null,
    normal: null,
    hard: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return { level: newLevel, isNew: true };
};

export const addPhrasesToMode = (level: any, mode: string, phrases: string[], Points: Record<string, number>) => {
  const processedPhrases = phrases.map(phrase => ({
    text: phrase.trim(),
    wordCount: phrase.trim().split(/\s+/).length,
    points: phrase.trim().split(/\s+/).length * (Points[mode] || 1) // Points per word
  }));
  const existingPhrases = level[mode]?.phrases || [];
  const allPhrases = [...existingPhrases, ...processedPhrases];
  const modeData = {
    mode: mode,
    basePoints: Points[mode] || 1,
    phrases: allPhrases,
    phraseCount: allPhrases.length,
    totalWords: allPhrases.reduce((sum, p) => sum + p.wordCount, 0),
    totalPoints: allPhrases.reduce((sum, p) => sum + p.points, 0)
  };
  return {
    ...level,
    [mode]: modeData,
    updatedAt: new Date().toISOString()
  };
};

export const updatePhraseList = (
  prev: any[],
  levelKey: string, 
  mode: string, 
  phraseIndex: number,
  modes: string[]
) => {
  return prev.map(level => {
    if (level.key === levelKey) {
      const phraseObj = level[mode].phrases[phraseIndex];
      const updatedMode = {
        ...level[mode],
        phrases: level[mode].phrases.filter((_: any, index: number) => index !== phraseIndex),
        phraseCount: level[mode].phraseCount - 1,
        totalWords: level[mode].totalWords - phraseObj.wordCount,
        totalPoints: level[mode].totalPoints - phraseObj.points
      };
      if (updatedMode.phrases.length === 0) {
        const { [mode]: removedMode, ...levelWithoutMode } = level;
        return levelWithoutMode;
      }
      return { ...level, [mode]: updatedMode };
    }
    return level;
  }).filter(level =>
    modes.some(m => level[m] && level[m].phrases.length > 0)
  );
};

export const isLevelUnlocked = (levelIndex: number, levels: any[]) => {
  if (levelIndex === 0) return true; // First level always unlocked
  if (levelIndex > 0 && levels[levelIndex - 1]) {
    return levels[levelIndex - 1].isCompleted || false;
  }
  return false;
};

export const isModeUnlocked = (mode: string, modeCompletions: any) => {
  if (mode === "easy") return true; // Easy always unlocked
  if (mode === "normal") return modeCompletions?.easy?.isCompleted || false;
  if (mode === "hard") return modeCompletions?.normal?.isCompleted || false;
  return false;
};

const getRandomPositions = (count: number, max: number, includeFirst: boolean = false): number[] => {
  const positions = new Set<number>();
  if (includeFirst && max > 0) {
    positions.add(0);
    count--;
  }
  while (positions.size < count && positions.size < max) {
    const randomPos = Math.floor(Math.random() * max);
    positions.add(randomPos);
  }
  return Array.from(positions).sort((a, b) => a - b);
};

export const getClueLettersByGrade = (answer: string, gradeLevel: string = "Grade 1"): number[] => {
  if (!answer) return [];
  const cluePositions: number[] = [];
  const answerLength = answer.length;
  const gradeNum = gradeLevel ? parseInt(gradeLevel.replace('Grade ', ''), 10) : 1;
  
  switch (gradeNum) {
    case 1:
    case 2:
      // Show 50-60% of letters (minimum 2)
      if (answerLength <= 4) {
        const clueCount = Math.max(2, Math.ceil(answerLength * 0.5));
        cluePositions.push(...getRandomPositions(clueCount, answerLength, true));
      } else {
        const clueCount = Math.max(3, Math.ceil(answerLength * 0.5));
        cluePositions.push(...getRandomPositions(clueCount, answerLength, true));
      }
      break;
    case 3:
    case 4:
      // Show 40% of letters (minimum 2)
      if (answerLength <= 5) {
        const clueCount = Math.max(2, Math.ceil(answerLength * 0.4));
        const includeFirst = Math.random() < 0.7;
        cluePositions.push(...getRandomPositions(clueCount, answerLength, includeFirst));
      } else {
        const clueCount = Math.max(2, Math.ceil(answerLength * 0.4));
        const includeFirst = Math.random() < 0.5;
        cluePositions.push(...getRandomPositions(clueCount, answerLength, includeFirst));
      }
      break;
    case 5:
    case 6:
      // Show 30% of letters (minimum 2)
      if (answerLength <= 6) {
        const clueCount = Math.max(2, Math.ceil(answerLength * 0.3));
        cluePositions.push(...getRandomPositions(clueCount, answerLength, false));
      } else {
        const clueCount = Math.max(2, Math.ceil(answerLength * 0.25));
        cluePositions.push(...getRandomPositions(clueCount, answerLength, false));
      }
      break;
    default:
      // Show 20% of letters (minimum 1)
      if (answerLength > 4) {
        const clueCount = Math.max(1, Math.ceil(answerLength * 0.2));
        cluePositions.push(...getRandomPositions(clueCount, answerLength, false));
      } else {
        cluePositions.push(...getRandomPositions(1, answerLength, false));
      }
  }
  return cluePositions;
};

export const combineUserAnswerWithClues = (
  userInput: string, 
  correctAnswer: string, 
  cluePositions: number[]
): string => {
  if (!correctAnswer) return userInput;
  let combined = "";
  let userIndex = 0;
  for (let i = 0; i < correctAnswer?.length; i++) {
    if (cluePositions?.includes(i)) {
      combined += correctAnswer[i];
    } else {
      if (userIndex < userInput?.length) {
        combined += userInput[userIndex];
        userIndex++;
      } else {
        combined += "?";
      }
    }
  }
  return combined;
};

export const getSyllableClues = (syllableParts: string[], gradeLevel: string): number[] => {
  if (!syllableParts || syllableParts.length === 0) return [];
  const cluePositions: number[] = [];
  const syllableCount = syllableParts.length;
  const gradeNum = gradeLevel ? parseInt(gradeLevel.replace('Grade ', ''), 10) : 1;

  switch (gradeNum) {
    case 1:
    case 2:
      // Show 50-60% of syllables (minimum 1)
      if (syllableCount <= 3) {
          cluePositions.push(...getRandomPositions(1, syllableCount, true));
      } else {
          const clueCount = Math.max(2, Math.ceil(syllableCount * 0.5));
          cluePositions.push(...getRandomPositions(clueCount, syllableCount, true));
      }
      break;
    case 3:
    case 4:
      // Show 40-50% of syllables
      if (syllableCount <= 4) {
        const clueCount = Math.max(1, Math.ceil(syllableCount * 0.4));
        const includeFirst = Math.random() < 0.7;
        cluePositions.push(...getRandomPositions(clueCount, syllableCount, includeFirst));
      } else {
        const clueCount = Math.max(2, Math.ceil(syllableCount * 0.4));
        const includeFirst = Math.random() < 0.5;
        cluePositions.push(...getRandomPositions(clueCount, syllableCount, includeFirst));
      }
      break;
    case 5:
    case 6:
      // Show 30% of syllables (minimum 1)
      if (syllableCount > 2) {
        const clueCount = Math.max(1, Math.ceil(syllableCount * 0.3));
      cluePositions.push(...getRandomPositions(clueCount, syllableCount, false));
      } else {
        // For very short words, show 1 syllable
        cluePositions.push(...getRandomPositions(1, syllableCount, false));
      }
      break;
    default:
      // Show 20-25% of syllables (minimum 1)
      if (syllableCount > 3) {
        const clueCount = Math.max(1, Math.ceil(syllableCount * 0.2));
        cluePositions.push(...getRandomPositions(clueCount, syllableCount, false));
      } else {
        cluePositions.push(...getRandomPositions(1, syllableCount, false));
      }
  }
  return cluePositions;
};

export const combineSyllableAnswerWithClues = (
  userSyllables: string[], 
  correctSyllables: string[], 
  cluePositions: number[]
): string[] => {
  if (!correctSyllables.length) return userSyllables;
  const combined: string[] = [];
  let userIndex = 0;
  for (let i = 0; i < correctSyllables.length; i++) {
    if (cluePositions.includes(i)) {
      combined.push(correctSyllables[i]);
    } else {
      if (userIndex < userSyllables.length) {
        combined.push(userSyllables[userIndex]);
        userIndex++;
      } else {
        combined.push("?");
      }
    }
  }
  return combined;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getQuestionTimeByGrade = (gradeLevel: string) => {
  switch (gradeLevel) {
    case 'Grade 1': return 90;
    case 'Grade 2': return 80;
    case 'Grade 3': return 70;
    case 'Grade 4': return 60;
    case 'Grade 5': return 50;
    case 'Grade 6': return 40;
    default: return 60;
  }
};

export const getQuestionTimeByType = (type: string) => {
  switch (type) {
    case 'multiple': return 20;
    case 'identification': return 60;
    case 'enumeration': return 60;
    case 'matching': return 60;
    case 'syllable': return 60;
    default: return 20;
  }
};

export const isAllFilled = (arr: any[], cluePositions: number[] = []) => {
  return arr.filter((slot, idx) => !cluePositions.includes(idx) && slot !== null && slot !== undefined).length === arr.length - cluePositions.length;
};

export const getUserOnlyLetters = (slots: any[], letterBank: string[], cluePositions: number[]) => {
  return slots
    .map((index, pos) => ({ index, pos }))
    .filter(({ pos }) => !cluePositions.includes(pos))
    .map(({ index }) => index !== null ? (letterBank[index] || '') : '')
    .join('');
};

export const areAllItemsPlaced = (itemBank: string[], boxes: string[][]) =>
  itemBank.every(item => boxes.some(box => box.includes(item)));

export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1] || "";
        resolve(base64);
      } else {
        resolve("");
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { 
      mimeType: file.type,
      data: await base64EncodedDataPromise 
    },
  };
};

export const splitPdfByTopics = async (pdfFile: File, topics: { title: string, pages: number[] }[]) => {
  const originalPdfBytes = await pdfFile.arrayBuffer();
  const originalPdf = await PDFDocument.load(originalPdfBytes);
  const splitFiles: { title: string, file: File }[] = [];
  for (const { title, pages } of topics) {
    const newPdf = await PDFDocument.create();
    for (const pageNum of pages) {
      const [copiedPage] = await newPdf.copyPages(originalPdf, [pageNum - 1]);
      newPdf.addPage(copiedPage);
    }
    const pdfBytes = await newPdf.save();
    const arrayBuffer = pdfBytes.slice().buffer;
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const file = new File([blob], `${title}.pdf`, { type: 'application/pdf' });
    splitFiles.push({ title, file });
  }
  return splitFiles;
};

export const compressPdfFile = async (file: File): Promise<File> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const compressedBytes = await pdfDoc.save();
  // const arrayBufferFixed = (compressedBytes as Uint8Array).buffer as ArrayBuffer;
  // return new File([arrayBufferFixed], file.name, { type: file.type });
  return new File([compressedBytes as BlobPart], file.name, { type: file.type });
};

export const getMaxQuestionsByGrade = (gradeLevel: string) => {
  if (!gradeLevel) return 10;
  const grade = parseInt(gradeLevel.replace(/\D/g, ""), 10);
  if (grade >= 5) return 20;
  if (grade >= 3) return 15;
  return 10;
};

export const filterEmptyQuestions = (questions: any[], getNonEmptyCount: (qs: any[]) => number) => {
  return questions.filter(q => {
    return getNonEmptyCount([q]) > 0;
  });
};

export const processQuestionImages = async (qs: any[]): Promise<any[]> => {
  return Promise.all(
    qs.map(async (q) => {
      if (q.imageFile) {
        let fileToUpload = q.imageFile;
        const IMAGE_MAX_MB = 2;
        if (fileToUpload.size > IMAGE_MAX_MB * 1024 * 1024) {
          try {
            fileToUpload = await imageCompression(fileToUpload, {
              maxSizeMB: 2,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            });
          } catch (err) {
            console.error("Image compression error:", err);
          }
        }
        const imageRef = storageRef(
          storage,
          `quiz_images/${Date.now()}_${fileToUpload.name}`,
        );
        await uploadBytes(imageRef, fileToUpload);
        const downloadURL = await getDownloadURL(imageRef);
        return { ...q, image: downloadURL };
      }
      return q;
    }),
  );
};

export const toFirestoreQuestions = (questions: any[]): any[] => {
  return questions.map((q) => {
    const baseQuestion = {
      id: q.id,
      type: q.type,
      question: q.question || "",
      image: (q.image && typeof q.image === 'string' && q.image.startsWith('http')) ? q.image : null,
    };
    if (q.type === "multiple") {
      return {
        ...baseQuestion,
        options: Array.isArray(q.options) ? q.options.map((opt: string) => String(opt || "")) : [],
        numAnswer: q.numAnswer || 0,
      };
    }
    if (q.type === "identification") {
      return {
        ...baseQuestion,
        answer: q.answer || "",
      };
    }
    if (q.type === "enumeration") {
      return {
        ...baseQuestion,
        categories: Array.isArray(q.categories) 
          ? q.categories.filter((ans: string) => ans && ans.trim()).map((ans: string) => String(ans.trim()))
          : [""],
        correctItems: q.correctItems ? 
          Object.fromEntries(
            Object.entries(q.correctItems)
              .filter(([category, items]) => 
                category && category.trim() && 
                Array.isArray(items) && 
                items.some(item => item && item.trim())
              )
              .map(([category, items]) => [
                category.trim(),
                Array.isArray(items)
                  ? items.filter((item: string) => item && item.trim()).map((item: string) => String(item.trim()))
                  : []
              ])
          ) : {}
      };
    }
    if (q.type === "matching") {
      return {
        ...baseQuestion,
        leftItems: Array.isArray(q.leftItems) 
          ? q.leftItems.filter((item: string) => item && item.trim()).map((item: string) => String(item.trim()))
          : [],
        rightItems: Array.isArray(q.rightItems) 
          ? q.rightItems.filter((item: string) => item && item.trim()).map((item: string) => String(item.trim()))
          : [],
        matches: Array.isArray(q.matches) 
          ? q.matches.map((match: number) => Number(match || 0))
          : [],
      };
    }
    if (q.type === "syllable") {
      return {
        ...baseQuestion,
        targetWord: q.targetWord?.trim() || "",
        syllableParts: Array.isArray(q.syllableParts) 
          ? q.syllableParts.filter((part: string) => part && part.trim()).map((part: string) => String(part.trim()))
          : [],
      };
    }
    return baseQuestion;
  });
};

