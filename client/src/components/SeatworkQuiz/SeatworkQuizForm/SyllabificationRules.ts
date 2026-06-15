import tagalogDictData from '../../../assets/dictionary/tagalog_dict_lines.json';

const DIACRITICAL_MARKS = {
  // Acute accent (malumì)
  'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
  // Grave accent (mabagál)
  'à': 'a', 'è': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u',
  // Circumflex (pakupyâ)
  'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u',
  // Glottal stop marker
  "'": "'", "''": "'", "`": "'",
};

const normalizeDiacritics = (word: string): { normalized: string; original: string } => {
  let normalized = word;
  for (const [accented, base] of Object.entries(DIACRITICAL_MARKS)) {
    normalized = normalized.replace(new RegExp(accented, 'g'), base);
  }
  return { normalized, original: word };
};

const mapToOriginalCase = (syllables: string[], originalWord: string): string[] => {
    let originalIndex = 0;
    return syllables.map(syllable => {
        let result = '';
        for (let i = 0; i < syllable.length; i++) {
            if (originalIndex < originalWord.length) {
                const originalChar = originalWord[originalIndex];
                const syllableChar = syllable[i].toLowerCase();
                if (syllable[i] === '-' || syllable[i] === "'") {
                    result += syllable[i];
                    continue;
                }
                if (syllableChar === originalChar.toLowerCase()) {
                    result += originalChar;
                    originalIndex++;
                } else {
                    result += syllable[i];
                }
            } else {
                result += syllable[i];
            }
        }
        return result;
    });
};

// Core KWF syllabification rules
const applyCoreKWFRules = (cleanWord: string, originalWord: string): string[] => {
    const vowels = 'aeiou';
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const trueDiphthongs = ['ai', 'ay', 'aw', 'ey', 'oy', 'uy', 'iw', 'iu'];
    const validOnsets = [
        // English-derived clusters
        'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr',
        'pl', 'pr', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'tr', 'tw',
        'sk', 'sc', 'spl', 'spr', 'str', 'scr', 'thr', 'shr',
        // Filipino-specific
        'ts', 'ng', 'ny'
    ];
    const syllables: string[] = [];
    let i = 0;
    while (i < cleanWord.length) {
        let syllable = '';
        let consonantStart = i;
        while (i < cleanWord.length && consonants.includes(cleanWord[i])) {
            i++;
        }
        const consonantCluster = cleanWord.substring(consonantStart, i);
        if (consonantCluster.length > 0) {
            if (syllables.length === 0) {
                syllable += consonantCluster;
            } else {
                let bestOnset = '';
                for (const onset of validOnsets.sort((a, b) => b.length - a.length)) {
                    if (consonantCluster.endsWith(onset)) {
                        bestOnset = onset;
                        break;
                    }
                }
                if (bestOnset) {
                    const coda = consonantCluster.substring(0, consonantCluster.length - bestOnset.length);
                    if (coda) {
                        syllables[syllables.length - 1] += coda;
                    }
                    syllable += bestOnset;
                } else {
                    if (consonantCluster.length === 1) {
                        syllable += consonantCluster;
                    } else {
                        const coda = consonantCluster.substring(0, consonantCluster.length - 1);
                        const onset = consonantCluster.substring(consonantCluster.length - 1);
                        syllables[syllables.length - 1] += coda;
                        syllable += onset;
                    }
                }
            }
        }
        if (i < cleanWord.length && vowels.includes(cleanWord[i])) {
            let foundDiphthong = false;
            for (const diphthong of trueDiphthongs.sort((a, b) => b.length - a.length)) {
                if (i + diphthong.length <= cleanWord.length && 
                    cleanWord.substring(i, i + diphthong.length) === diphthong) {
                    syllable += diphthong;
                    i += diphthong.length;
                    foundDiphthong = true;
                    break;
                }
            }
            if (!foundDiphthong) {
                syllable += cleanWord[i];
                i++;
                if (i < cleanWord.length && vowels.includes(cleanWord[i])) {
                    const v1 = cleanWord[i - 1];
                    const v2 = cleanWord[i];
                    if ((v1 === 'i' && 'aeou'.includes(v2)) || 
                        (v1 === 'u' && 'aeio'.includes(v2)) ||
                        (v2 === 'i' && 'aeou'.includes(v1)) || 
                        (v2 === 'u' && 'aeio'.includes(v1))) {
                        syllable += v2;
                        i++;
                    }
                }
            }
        }
        let nextVowelIndex = i;
        while (nextVowelIndex < cleanWord.length && consonants.includes(cleanWord[nextVowelIndex])) {
            nextVowelIndex++;
        }
        if (nextVowelIndex >= cleanWord.length) {
            syllable += cleanWord.substring(i);
            i = cleanWord.length;
        }
        if (syllable) {
            syllables.push(syllable);
        }
        if (syllables.length > 20) break;
    }
    if (syllables.length === 0) {
        return [cleanWord];
    }
    return mapToOriginalCase(syllables, originalWord);
};

// Handle compound words according to KWF rules
const handleCompoundWords = (cleanWord: string, originalWord: string): string[] => {
    const parts = cleanWord.split('-').filter(part => part.trim());
    const originalParts = originalWord.split('-').filter(part => part.trim());
    const result = parts.map((part, index) => {
        const { normalized } = normalizeDiacritics(originalParts[index] || part);
        const syllables = applyCoreKWFRules(normalized, originalParts[index] || part);
        if (index < parts.length - 1 && syllables.length > 0) {
            syllables[syllables.length - 1] += '-';
        }
        return syllables;
    }).flat();
    return result.length > 0 ? result : [originalWord];
};

// Handle contractions according to KWF rules
const handleContractions = (cleanWord: string, originalWord: string): string[] => {
  const parts = cleanWord.split(/['`'']/);
  if (parts.length === 2) {
    const { normalized: firstNorm } = normalizeDiacritics(parts[0]);
    const { normalized: secondNorm } = normalizeDiacritics(parts[1]);
    const firstPart = applyCoreKWFRules(firstNorm, parts[0]);
    const secondPart = secondNorm ? applyCoreKWFRules(secondNorm, parts[1]) : [];
    if (firstPart.length > 0) {
      const glottalChar = originalWord.match(/['`'']/)?.[0] || "'";
      firstPart[firstPart.length - 1] += glottalChar;
    }
    const result = [...firstPart, ...secondPart];
    return mapToOriginalCase(result, originalWord);
  }
  return [originalWord];
};

// Official KWF-based syllabification rules
const officialSyllabify = (word: string): string[] => {
    if (!word || word.length === 0) return [''];
    if (word.length === 1) return [word];
    const endPunctuation = word.match(/[.,!?;:'")\]}]*$/)?.[0] || '';
    const cleanWordWithDiacritics = word.replace(/[.,!?;:'")\]}]*$/, '');
    const { normalized: cleanWord } = normalizeDiacritics(cleanWordWithDiacritics);
    let result: string[] = [];
    if (cleanWordWithDiacritics.includes('-')) {
        result = handleCompoundWords(cleanWord, cleanWordWithDiacritics);
    } else if (cleanWordWithDiacritics.match(/['`'']/)) {
        result = handleContractions(cleanWord, cleanWordWithDiacritics);
    } else {
        result = applyCoreKWFRules(cleanWord, cleanWordWithDiacritics);
    }
    if (result.length > 0 && endPunctuation) {
        result[result.length - 1] += endPunctuation;
    }
    return result.length > 0 ? result : [word];
};

// Enhanced Filipino Word Dictionary with official KWF rules
const createEnhancedDictionary = () => {
    const dictionary: Record<string, string[]> = {};
    const manuallyVerified: Record<string, string[]> = {
        // Fix the problematic examples
        'yakap': ['ya', 'kap'],
        'away': ['a', 'way'],
        'abaka': ['a', 'ba', 'ka'],
        
        // Other corrected basic words
        'bahay': ['ba', 'hay'],
        'tao': ['ta', 'o'],
        'bata': ['ba', 'ta'],
        'araw': ['a', 'raw'],
        'mata': ['ma', 'ta'],
        'nasa': ['na', 'sa'],
        'para': ['pa', 'ra'],
        'mga': ['mga'],
        'ang': ['ang'],
        'ako': ['a', 'ko'],
        'siya': ['si', 'ya'],
        'kami': ['ka', 'mi'],
        'kayo': ['ka', 'yo'],
        'sila': ['si', 'la'],
        
        // Words with prefixes (correct CV splitting)
        'kumain': ['ku', 'ma', 'in'],
        'umuwi': ['u', 'mu', 'wi'],
        'tumayo': ['tu', 'ma', 'yo'],
        'sumama': ['su', 'ma', 'ma'],
        'lumaki': ['lu', 'ma', 'ki'],
        
        // Words with infixes
        'binasa': ['bi', 'na', 'sa'],
        'kinain': ['ki', 'na', 'in'],
        'ginawa': ['gi', 'na', 'wa'],
        'tinuro': ['ti', 'nu', 'ro'],
        
        // Common root words
        'bago': ['ba', 'go'],
        'dito': ['di', 'to'],
        'doon': ['do', 'on'],
        'galing': ['ga', 'ling'],
        'hanap': ['ha', 'nap'],
        'ibig': ['i', 'big'],
        'kita': ['ki', 'ta'],
        'laki': ['la', 'ki'],
        'maga': ['ma', 'ga'],
        'naka': ['na', 'ka'],
        'paki': ['pa', 'ki'],
        'sabi': ['sa', 'bi'],
        'taka': ['ta', 'ka'],
        'wala': ['wa', 'la'],
        
        // Diphthongs and complex patterns
        'bayani': ['ba', 'ya', 'ni'],
        'taong': ['ta', 'ong'],
        'mayroon': ['may', 'ro', 'on'],
        'kayumanggi': ['ka', 'yu', 'mang', 'gi'],
        
        // Compound words
        'pag-ibig': ['pag-', 'i', 'big'],
        'mag-aral': ['mag-', 'a', 'ral'],
        'bahay-kubo': ['ba', 'hay-', 'ku', 'bo'],
        
        // Educational terms with correct syllabification
        'paaralan': ['pa', 'a', 'ra', 'lan'],
        'estudyante': ['es', 'tud', 'yan', 'te'],
        'matematika': ['ma', 'te', 'ma', 'ti', 'ka'],
        'kasaysayan': ['ka', 'say', 'sa', 'yan'],
        'literatura': ['li', 'te', 'ra', 'tu', 'ra'],
        
        // Common adjectives
        'maganda': ['ma', 'gan', 'da'],
        'malaki': ['ma', 'la', 'ki'],
        'maliit': ['ma', 'li', 'it'],
        'mabait': ['ma', 'ba', 'it'],
        'masama': ['ma', 'sa', 'ma'],
        'mabuti': ['ma', 'bu', 'ti'],
        
        // Family terms
        'pamilya': ['pa', 'mil', 'ya'],
        'magulang': ['ma', 'gu', 'lang'],
        'kapatid': ['ka', 'pa', 'tid'],
        'nanay': ['na', 'nay'],
        'tatay': ['ta', 'tay'],
        'lola': ['lo', 'la'],
        'lolo': ['lo', 'lo'],
        
        // Action words
        'kain': ['ka', 'in'],
        'tulog': ['tu', 'log'],
        'gising': ['gi', 'sing'],
        'takbo': ['tak', 'bo'],
        'laro': ['la', 'ro'],
        'sulat': ['su', 'lat'],
        'basa': ['ba', 'sa'],
        'kanta': ['kan', 'ta'],
        'sayaw': ['sa', 'yaw'],
        
        // Words with 'ng'
        'tong': ['tong'],
        'kong': ['kong'],
        'aming': ['a', 'ming'],
        'inyong': ['in', 'yong'],
        'kanyang': ['kan', 'yang'],
        'maging': ['ma', 'ging'],
        'dating': ['da', 'ting'],
        'walang': ['wa', 'lang'],
        'maraming': ['ma', 'ra', 'ming'],
    };
    Object.assign(dictionary, manuallyVerified);
    tagalogDictData.data.forEach(entry => {
        const word = entry.word.toLowerCase();
        if (dictionary[word]) return;
        if (word.length > 30 || !/^[a-zàáâèéêìíîòóôùúûñ\-'`'']+$/.test(word)) return;
        try {
            const syllables = officialSyllabify(word);
            dictionary[word] = syllables;
        } catch (error) {
        }
    });
    return dictionary;
};

let enhancedFilipinoDict: Record<string, string[]> | null = null;

const getEnhancedDictionary = () => {
    if (!enhancedFilipinoDict) {
        enhancedFilipinoDict = createEnhancedDictionary();
    }
    return enhancedFilipinoDict;
};

// Enhanced syllable splitting function with dictionary lookup
const enhancedSplitSimpleWord = (cleanWord: string): string[] => {
    const originalWord = cleanWord;
    const { normalized: cleanWordLower } = normalizeDiacritics(cleanWord.toLowerCase());
    const dict = getEnhancedDictionary();
    if (dict[cleanWordLower]) {
        const dictEntry = dict[cleanWordLower];
        return mapToOriginalCase(dictEntry, originalWord);
    }
    const syllables = officialSyllabify(cleanWord);
    return syllables;
};

// Enhanced splitIntoSyllables function
const splitIntoSyllables = (word: string): string[] => {
    if (!word || word.trim().length === 0) return [''];
    const trimmedWord = word.trim();
    const result = enhancedSplitSimpleWord(trimmedWord);
    return result.length > 0 ? result : [trimmedWord];
};

export { splitIntoSyllables };