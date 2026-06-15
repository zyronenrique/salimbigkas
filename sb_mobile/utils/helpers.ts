import { auth, database, dbRef, get, onValue, runTransaction, update } from "../firebase/firebase";
import { doGetCurrentMonthActivities, doGenerateElevenLabsSpeech, doSetUserStatus } from "../api/functions";
import { imageSrc } from "../Icons/icons";
import { AudioJob } from "@/hooks/useAudioQueue";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
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

export const checkUserStatusRealtime = (
  onStatusChange: (userData: any, userId: string) => void,
) => {
  const user = auth.currentUser;
  if (!user) return () => {};
  const userRef = dbRef(database, `users/${user.uid}`);
  const unsubscribe = onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      onStatusChange(userData, user.uid);
    }
  });
  return unsubscribe;
};

export const checkUserStatus = async () => {
  const router = useRouter();
  const user = auth.currentUser;
  if (user) {
    const realtimeUserRef = dbRef(database, `users/${user.uid}`);
    const snapshot = await get(realtimeUserRef);
    const userData = snapshot.exists() ? snapshot.val() : null;
    if (userData && userData.disabled) {
      await doSetUserStatus(user.uid, user.uid, true);
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await auth.signOut();
      router.replace('/signInWithEmailPassword/restrictedPage');
    } else {
      router.replace('/(tabs)');
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
      a.displayName.localeCompare(b.displayName),
    );
  } else if (order === "desc") {
    filtered = filtered.sort((a, b) =>
      b.displayName.localeCompare(a.displayName),
    );
  }

  return filtered;
}

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
}

export function filterAndSortMembers(users: any[], query: string) {
  let filtered = [...users];

  // Search query filter
  if (query.trim()) {
    filtered = filtered.filter((user) =>
      Object.values(user).join(" ").toLowerCase().includes(query.toLowerCase()),
    );
  }

  return filtered;
}

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

const letterAudioMap: Record<string, number> = {
  a: require("@/assets/ALPHABETS/audioA/A.mp3"),
  b: require("@/assets/ALPHABETS/audioB/B.mp3"),
  c: require("@/assets/ALPHABETS/audioC/C.mp3"),
  d: require("@/assets/ALPHABETS/audioD/D.mp3"),
  e: require("@/assets/ALPHABETS/audioE/E.mp3"),
  f: require("@/assets/ALPHABETS/audioF/F.mp3"),
  g: require("@/assets/ALPHABETS/audioG/G.mp3"),
  h: require("@/assets/ALPHABETS/audioH/H.mp3"),
  i: require("@/assets/ALPHABETS/audioI/I.mp3"),
  j: require("@/assets/ALPHABETS/audioJ/J.mp3"),
  k: require("@/assets/ALPHABETS/audioK/K.mp3"),
  m: require("@/assets/ALPHABETS/audioM/M.mp3"),
  n: require("@/assets/ALPHABETS/audioN/N.mp3"),
  ng: require("@/assets/ALPHABETS/audioNG/NG.mp3"),
  o: require("@/assets/ALPHABETS/audioO/O.mp3"),
  p: require("@/assets/ALPHABETS/audioP/P.mp3"),
  q: require("@/assets/ALPHABETS/audioQ/Q.mp3"),
  r: require("@/assets/ALPHABETS/audioR/R.mp3"),
  s: require("@/assets/ALPHABETS/audioS/S.mp3"),
  t: require("@/assets/ALPHABETS/audioT/T.mp3"),
  u: require("@/assets/ALPHABETS/audioU/U.mp3"),
  v: require("@/assets/ALPHABETS/audioV/V.mp3"),
  w: require("@/assets/ALPHABETS/audioW/W.mp3"),
  x: require("@/assets/ALPHABETS/audioX/X.mp3"),
  y: require("@/assets/ALPHABETS/audioY/Y.mp3"),
};

const TTS_CACHE_KEY = "tts_cache";
const TTS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const getTtsFromCache = async (key: string): Promise<string | null> => {
  try {
    const raw = await AsyncStorage.getItem(TTS_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    const hit = cache[key];
    if (!hit) return null;
    if (Date.now() - hit.ts > TTS_CACHE_TTL) {
      delete cache[key];
      await AsyncStorage.setItem(TTS_CACHE_KEY, JSON.stringify(cache));
      return null;
    }
    return hit.url;
  } catch {
    return null;
  }
};

const putTtsInCache = async (key: string, url: string) => {
  try {
    const raw = await AsyncStorage.getItem(TTS_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    cache[key] = { url, ts: Date.now() };
    await AsyncStorage.setItem(TTS_CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

export const CreateAudioForJob = async (
  job: AudioJob
): Promise<string | number | { uri: string } | null> => {
  if (job.type === "letter") {
    const mod = letterAudioMap[job.letter.toLowerCase()];
    return mod || null;
  } else {
    const key = `${job.speed}|${job.text.trim()}`;
    const cached = await getTtsFromCache(key);
    if (cached) return { uri: cached };
    try {
      const res = await doGenerateElevenLabsSpeech(job.text, job.speed) as any;
      const url = res?.url || null;
      if (url) {
        await putTtsInCache(key, url);
        return { uri: url };
      }
      return null;
    } catch {
      return null;
    }
  }
};

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

export const stepAudios: Record<string, any> = {
  bigkasStep1: require("@/assets/steps/bigkasStep1.mp3"),
  bigkasStep2: require("@/assets/steps/bigkasStep2.mp3"),
  bigkasStep3: require("@/assets/steps/bigkasStep3.mp3"),
  bigkasStep4: require("@/assets/steps/bigkasStep4.mp3"),
  bigkasStep5: require("@/assets/steps/bigkasStep5.mp3"),
  bigkasStep6: require("@/assets/steps/bigkasStep6.mp3"),
  bigkasStep7: require("@/assets/steps/bigkasStep7.mp3"),
};

export const quizStepAudios: Record<string, any> = {
  quizStep1: require("@/assets/steps/quizStep1.mp3"),
  quizStep2: require("@/assets/steps/quizStep2.mp3"),
  quizStep3: require("@/assets/steps/quizStep3.mp3"),
  quizStep4: require("@/assets/steps/quizStep4.mp3"),
  quizStep5: require("@/assets/steps/quizStep5.mp3"),
  quizStep6: require("@/assets/steps/quizStep6.mp3"),
  quizStep7: require("@/assets/steps/quizStep7.mp3"),
};

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
    .map((value, pos) => ({ value, pos }))
    .filter(({ pos }) => !cluePositions.includes(pos))
    .map(({ value }) => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'number') {
        return letterBank[value] || '';
      }
      return value;
    })
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

type Quiz = {
  response?: {
    submittedAt?: string;
    [key: string]: any;
  };
  category?: string;
  [key: string]: any;
};

export const getLatestCompletedQuiz = (quizzes: Quiz[]) => {
  const completedQuizzes = quizzes.filter(q => q.response?.submittedAt);
  completedQuizzes.sort((a, b) => {
    const aDate = a.response?.submittedAt ? new Date(a.response.submittedAt).getTime() : 0;
    const bDate = b.response?.submittedAt ? new Date(b.response.submittedAt).getTime() : 0;
    return bDate - aDate;
  });
  return completedQuizzes[0] || null;
};

export const getLatestCompletedSeatwork = (seatworks: Quiz[]) => {
  const completedSeatworks = seatworks.filter(q => q.response?.submittedAt);
  completedSeatworks.sort((a, b) => {
    const aDate = a.response?.submittedAt ? new Date(a.response.submittedAt).getTime() : 0;
    const bDate = b.response?.submittedAt ? new Date(b.response.submittedAt).getTime() : 0;
    return bDate - aDate;
  });
  return completedSeatworks[0] || null;
};

export const getUserHistory = (yunit: any[], type: 'quizzes' | 'seatworks' = 'quizzes'): any[] => {
  const all = yunit.flatMap((y: any) =>
    (y.lessons || []).flatMap((lesson: any) =>
      (lesson[type] || [])
    )
  );
  return all
    .filter((item: any) => item.response)
    .map((item: any) => ({
      ...item.response,
      id: item.id,
      lessonId: item.lessonId,
      lessonNumber: item.lessonNumber,
      yunitNumber: item.yunitNumber,
      category: item.category,
    }));
};

export const getUserSeatworkHistory = (seatworksByYunit: any[]): any[] => {
  const allSeatworks = seatworksByYunit.flatMap((yunit: any) =>
    (yunit.lessons || []).flatMap((lesson: any) =>
      (lesson.seatworks || [])
    )
  );
  return allSeatworks
    .filter((seatwork: any) => seatwork.response)
    .map((seatwork: any) => ({
      ...seatwork.response,
      seatworkId: seatwork.id,
      lessonId: seatwork.lessonId,
      lessonNumber: seatwork.lessonNumber,
      yunitNumber: seatwork.yunitNumber,
      category: seatwork.category,
    }));
};

export const checkAllBadges = ({
  questionResults,
  memoizedQuestions,
  answers,
  totalScore,
  totalScorePossible,
  selectedQuiz,
  attempts,
  history,
  calculateScoreForQuestion,
}: any) => {
  const earned: string[] = [];
  // Perfectionist: all correct
  const allCorrect = questionResults.length === memoizedQuestions.length &&
    questionResults.every((r: any) => r.correct);
  if (allCorrect) earned.push("perfectionist");
  // Speedster: all correct and each under 10 seconds
  const allSpeedy = allCorrect && questionResults.every((r: any) => r.answerTime <= 10000);
  if (allSpeedy) earned.push("speedster");
  // First Try Hero: ≥80% on first attempt
  if (attempts === 1 && (totalScore / totalScorePossible) >= 0.8) {
    earned.push("first_try_hero");
  }
  // Streak Star: ≥80% on 3 consecutive quizzes (from history)
  if (
    history &&
    history.length >= 3 &&
    history.slice(-3).every((q: any) => (q.score / q.totalQuizScore) >= 0.8)
  ) {
    earned.push("streak_star");
  }
  // Topic Master: ≥90% on 5 quizzes in same lesson (from history)
  if (
    history &&
    history.filter((q: any) =>
      q.lessonId === selectedQuiz.lessonId && (q.score / q.totalQuizScore) >= 0.9
    ).length >= 5
  ) {
    earned.push("topic_master");
  }
  // Night Owl: completed after 8 PM
  const now = new Date();
  if (now.getHours() >= 20) earned.push("night_owl");
  // Early Bird: completed before 8 AM
  if (now.getHours() < 8) earned.push("early_bird");
  // Quiz Collector: 50 unique quizzes completed (from history)
  if (
    history &&
    new Set(history.map((q: any) => q.quizId)).size >= 50
  ) {
    earned.push("quiz_collector");
  }
  // Perfect Sequence: all enumeration answers in correct category
  const allEnumerationPerfect = memoizedQuestions
    .filter((q: any) => q.type === "enumeration")
    .every((q: any, idx: number) => {
      const score = calculateScoreForQuestion(idx, answers);
      return score === 1;
    });
  if (allEnumerationPerfect && memoizedQuestions.some((q: any) => q.type === "enumeration")) {
    earned.push("perfect_sequence");
  }
  // Instant Recall: all identification questions answered ≤30s each
  const allIdentificationFast = memoizedQuestions
    .map((q: any, idx: number) => ({ q, idx }))
    .filter(({q}: {q: any}) => q.type === "identification")
    .every(({idx}: {idx: number}) => questionResults[idx]?.answerTime <= 30000 && questionResults[idx]?.correct);
  if (allIdentificationFast && memoizedQuestions.some((q: any) => q.type === "identification")) {
    earned.push("instant_recall");
  }
  // Option Oracle: 100% correct on multiple choice
  const allMultiplePerfect = memoizedQuestions
    .filter((q: any) => q.type === "multiple")
    .every((q: any, idx: number) => calculateScoreForQuestion(idx, answers) === 1);
  if (allMultiplePerfect && memoizedQuestions.some((q: any) => q.type === "multiple")) {
    earned.push("option_oracle");
  }
  // Link Master: all matching pairs correct on first try
  const allMatchingPerfect = memoizedQuestions
    .filter((q: any) => q.type === "matching")
    .every((q: any, idx: number) => calculateScoreForQuestion(idx, answers) === 1);
  if (allMatchingPerfect && memoizedQuestions.some((q: any) => q.type === "matching")) {
    earned.push("link_master");
  }
  // Syllable Snapper: 5 words with perfect syllable placement (from history)
  const perfectSyllableCount = history
    ? history.reduce((acc: number, q: any) => {
        if (q.syllablePerfect) return acc + 1;
        return acc;
      }, 0)
    : 0;
  if (perfectSyllableCount >= 5) earned.push("syllable_snapper");
  // No Misfit: quiz finished with zero misplaced syllables
  const allSyllablePerfect = memoizedQuestions
    .filter((q: any) => q.type === "syllable")
    .every((q: any, idx: number) => calculateScoreForQuestion(idx, answers) === 1);
  if (allSyllablePerfect && memoizedQuestions.some((q: any) => q.type === "syllable")) {
    earned.push("no_misfit");
  }
  // Syllable Sorcerer: 10 syllable questions completed (from history)
  const syllableQuestionsCompleted = history
    ? history.reduce((acc: number, q: any) => acc + (q.syllableCount || 0), 0)
    : 0;
  if (syllableQuestionsCompleted >= 10) earned.push("syllable_sorcerer");

  return earned;
};

export const computeBadgeProgress = ({
  mode, // 'quiz' | 'seatwork'
  totalScore,
  totalScorePossible,
  memoizedQuestions,
  questionResults,
  answers,
  selected, // selectedQuiz or selectedSeatwork
  history,  // getUserHistory(...), see below
  calculateScoreForQuestion,
}: {
  mode: 'quiz' | 'seatwork';
  totalScore: number;
  totalScorePossible: number;
  memoizedQuestions: any[];
  questionResults: Array<{ correct: boolean; answerTime: number }>;
  answers: any;
  selected: any;
  history: any[];
  calculateScoreForQuestion: (qIdx: number, answers: any) => number;
}) => {
  const percentage = totalScorePossible > 0 ? totalScore / totalScorePossible : 0;
  const totalQuestions = memoizedQuestions?.length || 0;

  const correctWithin10 = questionResults.filter(
    q => q.correct && q.answerTime <= 10_000
  ).length;
  const allCorrect = questionResults.every(q => q.correct);

  // Minimal attempt count (can be refined if you store attempts per quiz/seatwork)
  const attempts = 1;

  const earnedBadges = checkAllBadges({
    questionResults,
    memoizedQuestions,
    answers,
    totalScore,
    totalScorePossible,
    selectedQuiz: selected,
    attempts,
    history,
    calculateScoreForQuestion,
  });

  const progress = {
    mode,
    percentage,
    totalQuestions,
    correctWithin10,
    allCorrect,
    lessonId: selected?.lessonId || null,
    yunitNumber: selected?.yunitNumber || null,
    category: selected?.category || null,
  };

  return { progress, earnedBadges };
};

export const saveBadgeProgress = async (
  uid: string,
  {
    mode,
    progress,
    earnedBadges,
  }: { mode: 'quiz' | 'seatwork'; progress: any; earnedBadges: string[] }
) => {
  const userBadgesRef = dbRef(database, `users/${uid}/badges`);
  const updates: Record<string, any> = {};

  // Accumulate counters per mode
  updates[`progress/${mode}/last`] = { ...progress, updatedAt: Date.now() };

  // Maintain simple aggregates for streaks/high scores/topic master
  // - High score streak (>= 80%)
  const streakRef = dbRef(database, `users/${uid}/badges/aggregates/${mode}/highScoreStreak`);
  await runTransaction(streakRef, (current) => {
    const prev = typeof current === 'number' ? current : 0;
    return progress.percentage >= 0.8 ? prev + 1 : 0;
  });

  // - Topic master per lesson (>= 90%)
  if (progress.lessonId && progress.percentage >= 0.9) {
    updates[`aggregates/${mode}/topicMaster/${progress.lessonId}`] = {
      count: (progress?.count || 0) + 1,
      updatedAt: Date.now(),
    };
  }

  // Store earned badges set
  if (Array.isArray(earnedBadges) && earnedBadges.length > 0) {
    earnedBadges.forEach((id) => {
      updates[`earned/${id}`] = true;
    });
  }

  // Increment taken counters
  const takenRef = dbRef(database, `users/${uid}/badges/aggregates/${mode}/taken`);
  await runTransaction(takenRef, (current) => (typeof current === 'number' ? current + 1 : 1));

  // Basic counts that are additive and do not require a transaction here
  updates[`summary/lastUpdatedAt`] = Date.now();

  await update(userBadgesRef, updates);
};

