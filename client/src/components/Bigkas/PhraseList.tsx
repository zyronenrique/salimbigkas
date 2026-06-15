import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { model } from '../../firebase/firebase';
import { imageSrc, SpinLoadingWhite } from '../Icons/icons';
import { toast } from 'react-toastify';
import CustomToast from '../Toast/CustomToast';
import { fileToGenerativePart, getPdfFileName, urlToFile } from '../../utils/helpers';

interface PhraseListProps {
    state: any;
    onEdit: (levelKey: string, mode: string, phraseIndex: number) => void;
    onDelete: (levelKey: string, mode: string, phraseIndex: number) => void;
    modes: string[];
    selectedLessonData: any;
}

const PhraseList = memo(({ state, onEdit, onDelete, modes, selectedLessonData }: PhraseListProps) => {
    const generatePrompt = useCallback((count: number, mode: string, gradeLevel: string) => {
        const punctuationRules = {
            easy: `
                - EASY MODE: Gamitin ang basic punctuation marks:
                * Tuldok (.) - sa dulo ng mga pangungusap
                * Kuwit (,) - sa pagitan ng mga salita sa listahan
                * Tandang Pananong (?) - sa mga tanong
                Halimbawa: "Kumakain ako ng mansanas.", "Saan ka pupunta?", "Gusto ko ng prutas, gulay, at tubig."
            `,
            normal: `
                - NORMAL MODE: Gamitin ang intermediate punctuation marks:
                * Lahat ng basic punctuation (. , ?)
                * Tandang Padamdam (!) - sa mga emosyonal na pahayag
                * Gitlapi o dash (-) - sa compound words
                * Apostrophe (') - sa mga contraction o pag-aari
                Halimbawa: "Ang ganda ng bulaklak!", "Si Ana'y masipag.", "Puto-bumbong ang paboritong kakanin.", "Hindi siya umuwi, kaya nag-alala kami."
            `,
            hard: `
                - HARD MODE: Gamitin ang advanced punctuation marks:
                * Lahat ng basic at intermediate punctuation
                * Colon (:) - sa paglilista o pagpapaliwanag
                * Semicolon (;) - sa paghahati ng mga kumplikadong pangungusap
                * Quotation marks ("") - sa mga siping salita o dialogue
                * Parentheses () - sa mga karagdagang impormasyon
                Halimbawa: "Sabi niya: 'Matutulog na ako.'", "Mag-aral tayo; mahalaga ang edukasyon.", "Ang mga prutas (mansanas, ubas, saging) ay masustansya."
            `
        };

        return `
            Gamit ang PDF na ito bilang inspirasyon o reference lamang, gumawa ng ${count} BAGONG at CREATIVE na parirala sa wikang Filipino para sa mga mag-aaral sa ${gradeLevel}.

            IMPORTANTE - PUNCTUATION REQUIREMENTS:
            ${punctuationRules[mode as keyof typeof punctuationRules]}
            
            CONTENT REQUIREMENTS:
            - Huwag direktang kopyahin ang mga salita o parirala sa PDF; dapat orihinal ang mga parirala.
            - Gumawa ng sariling mga parirala na nakatuon sa tema o paksa ng aralin.
            - Difficulty level: "${mode}".
            - Gawing educational at engaging para sa mga bata.
            - Magkakaiba dapat ang lahat ng parirala.
            - DAPAT may tamang punctuation marks base sa difficulty level.
            - Bawat parirala ay dapat isang kumpleto na may wastong bantas at hindi bababa sa 3 salita.
            - Iwasan ang single words, fragments, o hindi kumpletong parirala.
            
            Mga halimbawa ng content na may punctuation:
            - Easy: "Masayang naglalaro ang mga bata.", "Ano ang paboritong kulay mo?", "Kumain kami ng kanin, ulam, at gulay."
            - Normal: "Wow! Ang galing mo sa pagkanta!", "Si Maria'y nag-aaral ng mabuti.", "Hindi siya natulog kagabi, kaya antok na antok siya."
            - Hard: "Ang guro ay nagtanong: 'Sino ang nag-iimbento ng bombilya?'", "Mag-aral tayo nang mabuti; ito ang susi sa tagumpay.", "Ang mga hayop (aso, pusa, ibon) ay kailangan ng pagmamahal."
            
            Ibalik bilang JSON na may 'phrases' array na may mga string na may tamang punctuation.
        `;
    }, []);
    
    const handleGenerate = useCallback(async () => {
        const urls = selectedLessonData?.pagbasaUrls;
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            toast.error(<CustomToast title="No PDF Selected" subtitle="Please select a lesson first." />);
            return;
        }
        if (!state.count || state.count <= 0) {
            toast.error(<CustomToast title="Invalid Count" subtitle="Please enter a valid number of phrases up to 10 to generate." />);
            return;
        }
        if (state.updateState) {
            state.updateState({ isGenerating: true });
        }
        try {
            const prompt = generatePrompt(state.count, state.mode, state.gradeLevel);
            const files = await Promise.all(
                urls.map((url: string) => {
                    const filename = getPdfFileName(url);
                    const mimeType = "application/pdf";
                    return urlToFile(url, filename, mimeType);
                })
            );
            const pdfParts = await Promise.all(files.map(fileToGenerativePart));
            const result = await model.generateContent([prompt, ...pdfParts]);
            const response = result.response;
            const data = response.text();
            const parsedData = JSON.parse(data);
            const filteredPhrases = parsedData.phrases.filter((p: string) => p.trim().split(/\s+/).length >= 3);

            if (filteredPhrases && Array.isArray(filteredPhrases)) {
                if (state.actions?.generatePhrases) {
                    state.actions.generatePhrases(filteredPhrases);
                }
                toast.success(<CustomToast title="Phrases Generated!" subtitle={`Added ${filteredPhrases.length} phrases successfully.`} />);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Error generating phrases:", error);
            toast.error(<CustomToast title="Generation Failed" subtitle="Failed to generate phrases. Please try again." />);
        } finally {
            if (state.updateState) {
                state.updateState({ isGenerating: false });
            }
        }
    }, [state, fileToGenerativePart, generatePrompt]);

    return (
        <div className='space-y-2 w-1/2 overflow-y-hidden'>
            <div className='p-4'>
                {state.isGenerating ? (
                    <div className='w-full max-w-2xl p-4 bg-[#003311] rounded-lg border-4 border-[#8a3903]'>
                        <div className='flex items-center justify-center gap-4'>
                            <SpinLoadingWhite size={6} />
                            <h3 className='text-xl font-bold text-center'>Generating Phrases...</h3>
                        </div>
                    </div>
                ) : (
                    <motion.div 
                        className='flex items-center justify-center bg-[#003311] rounded-full border-4 border-[#8a3903]'
                        whileHover={{ scale: 1.05 }}
                    >
                        <motion.button
                            disabled={state.isGenerating || state.isRegister || state.isLoading}
                            type="button"
                            className='text-2xl font-bold p-4 items-center'
                            whileTap={{ scale: 0.95 }}
                            onClick={handleGenerate}
                        >
                            {state.isGenerating || state.isLoading ? <SpinLoadingWhite size={6}/> : <span>Generate</span>}
                        </motion.button>
                        <div className="w-0.5 bg-gray-500 h-8 mx-4"></div>
                        <div className='flex items-center'>
                            <input
                                disabled={state.isGenerating || state.isRegister || state.isLoading}
                                title='Count'
                                type="text"
                                value={state.count || ""}
                                className='w-10 text-2xl font-bold focus:outline-none text-center'
                                placeholder="?"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,2}$/.test(value)) {
                                        state.updateState({ count: value ? parseInt(value, 10) : null });
                                    }
                                }}
                                onKeyDown={(e) => {
                                    const currentValue = state.count?.toString() || "";
                                    const futureValue = currentValue + e.key;
                                    const futureNumber = parseInt(futureValue, 10);
                                    if (isNaN(futureNumber) || futureNumber > 10) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                            <span className='text-2xl font-bold text-gray-300 mx-4'>Phrases</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Phrase List */}
            {state.phraseList.map((level: any) => (
                <div key={level.key} className='px-4 space-y-3 overflow-y-auto max-h-[420px] hide-scrollbar'>
                    <div className='text-lg font-bold text-yellow-300 px-2 border-b border-gray-500 pb-1'>
                        Y{level.yunitNumber} - L{level.levelNumber} ({level.gradeLevel})
                    </div>
                    {modes.map(mode => {
                        if (!level[mode] || !level[mode].phrases.length) return null;
                        return (
                            <div key={mode} className='space-y-2'>
                                <div className='text-sm font-bold text-gray-300 px-2 flex justify-between'>
                                    <span>{mode.toUpperCase()}</span>
                                    <span>{level[mode].totalPoints} pts ({level[mode].totalWords} words)</span>
                                </div>
                                {level[mode].phrases.map((phraseObj: any, index: number) => (
                                    <div key={`${level.key}-${mode}-${index}`} className='relative flex w-full'>
                                        <motion.button
                                            disabled={state.isGenerating || state.isRegister || state.isLoading || state.editingKey !== null}
                                            type='button'
                                            className='w-full text-left text-sm cursor-pointer px-3 py-2 bg-[#003311] rounded-lg border-2 border-[#8a3903] flex justify-between items-center'
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => onEdit(level.key, mode, index)}
                                        >   
                                            <span className="flex-1 pr-2 line-clamp-2">{phraseObj.text}</span>
                                            <span className="text-xs text-gray-400">
                                                {phraseObj.points}pts
                                            </span>
                                        </motion.button>
                                        <motion.button
                                            disabled={state.isGenerating || state.isRegister || state.isLoading || state.editingKey !== null}
                                            type="button"
                                            title='Delete Phrase'
                                            className='absolute -top-2 -right-2 z-10 text-red-500 hover:text-red-700'
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(level.key, mode, index);
                                            }}
                                        >
                                            <img loading='lazy' src={imageSrc.gameX} alt="Delete Phrase" className="size-6" />
                                        </motion.button>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
});

PhraseList.displayName = 'PhraseList';

export default PhraseList;