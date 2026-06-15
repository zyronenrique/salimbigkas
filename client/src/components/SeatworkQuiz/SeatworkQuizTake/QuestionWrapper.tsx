import { memo, useEffect } from "react";
import MultipleChoiceType from "./MultipleChoiceType";
import IdentificationType from "./IdentificationType";
import EnumerationType from "./EnumerationType";
import MatchingType from "./MatchingType";
import SyllableType from "./SyllableType";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { imageSrc } from "../../Icons/icons";
import { useAudioQueue } from "../../Lesson/useAudioQueue";
import { buildJobsFromText } from "../../../utils/helpers";

interface QuestionWrapperProps {
    question: any;
    answers: { [key: string]: any };
    isAnswered: boolean;
    cluePositions: number[];
    availableOptions: any[];
    letterBank: string[];
    availableLetters: any[];
    availableEnumerationItems: any[];
    availableMatchingItems: any[];
    shuffledSyllableIndexes: number[];
    audioQueue: ReturnType<typeof useAudioQueue>;
    run: boolean;
}

const QuestionWrapper = memo(({
    question,
    answers,
    isAnswered,
    cluePositions,
    availableOptions,
    letterBank,
    availableLetters,
    availableEnumerationItems,
    availableMatchingItems,
    shuffledSyllableIndexes,
    audioQueue,
    run,
}: QuestionWrapperProps) => {
    const [showSpeed, setShowSpeed] = useState<boolean>(run ? true : false);
    const { playQueue, pause, resume, stop, isPlaying, isPaused } = audioQueue;
    
    useEffect(() => {
        if (!run) {
            setShowSpeed(false);
        }
    }, [run]);
    
    const getQuestionComponent = () => {
        const commonProps = {
            question,
            answers,
            isAnswered,
        };

        switch (question.type) {
            case 'multiple':
                return (
                    <MultipleChoiceType
                        {...commonProps}
                        availableOptions={availableOptions}
                    />
                );
            case 'identification':
                return (
                    <IdentificationType
                        {...commonProps}
                        cluePositions={cluePositions}
                        letterBank={letterBank}
                        availableLetters={availableLetters}
                    />
                );
            case 'enumeration':
                return (
                    <EnumerationType
                        {...commonProps}
                        availableEnumerationItems={availableEnumerationItems}
                    />
                );
            case 'matching':
                return (
                    <MatchingType
                        {...commonProps}
                        availableMatchingItems={availableMatchingItems}
                    />
                );
            case 'syllable':
                return (
                    <SyllableType
                        {...commonProps}
                        cluePositions={cluePositions}
                        shuffledSyllableIndexes={shuffledSyllableIndexes}
                    />
                );
            default:
                return <div>Unsupported question type: {question.type}</div>;
        }
    };

    const handleSpeak = useCallback(async (speed: "normal" | "slow") => {
        const jobs = buildJobsFromText(question.question, speed === "slow" ? 0.7 : 1);
        await playQueue(jobs);
        setShowSpeed(false);
    }, [buildJobsFromText, question.question, playQueue]);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={question.id}
                initial={{ scale: 0.8, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -40 }}
                transition={{ type: "spring", stiffness: 400, damping: 30, duration: 0.4 }}
                className="space-y-6"
            >
                {/* Question Text */}
                <div className="text-center">
                    <div className="flex items-center justify-center mb-4 gap-2">
                        <h3 className="text-2xl font-bold text-[#2C3E50] py-2" data-joyride="swq-question">
                            {question.question}
                        </h3>
                        {isPlaying ? (
                            <div className="flex flex-row gap-4 items-center">
                                <motion.img
                                    loading="eager"
                                    src={!isPaused ? imageSrc.pause : imageSrc.play}
                                    title={!isPaused ? "Pause Reading" : "Continue Reading"}
                                    alt={!isPaused ? "Pause Reading" : "Continue Reading"}
                                    className="inline size-12"
                                    onClick={() => { isPaused ? resume() : pause(); }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                />
                                <motion.img
                                    loading="eager"
                                    src={imageSrc.gameX}
                                    title="Stop Reading"
                                    className="inline size-10"
                                    onClick={stop}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                />
                            </div>
                        ):(
                            <div className="relative" data-joyride="swq-question-speaker">
                                <motion.img
                                    loading="eager"
                                    src={imageSrc.volume}
                                    title="Read Aloud"
                                    alt="Read Aloud" 
                                    className="inline size-12"
                                    onClick={() => setShowSpeed(!showSpeed)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                />
                                {showSpeed && (
                                    <div className="absolute z-10 top-14 left-1/2 -translate-x-1/2 flex flex-col flex-grow w-28 gap-2 items-center bg-[#003311] border-4 border-[#8a3903] rounded-2xl p-4">
                                        <motion.button
                                            disabled={run}
                                            type="button"
                                            title="Normal Speed"
                                            className="bg-transparent"
                                            onClick={() => handleSpeak("normal")}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <img
                                                loading="eager"
                                                src={imageSrc.normalSpeed} 
                                                title="Normal Speed"
                                                alt="Normal Speed" 
                                                className="inline size-14"
                                            />
                                        </motion.button>
                                        <motion.button
                                            disabled={run}
                                            type="button"
                                            title="Slow Speed"
                                            className="bg-transparent"
                                            onClick={() => handleSpeak("slow")}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <img
                                                loading="eager"
                                                src={imageSrc.slowSpeed} 
                                                title="Slow Speed"
                                                alt="Slow Speed" 
                                                className="inline size-14"
                                            />
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {getQuestionComponent()}
            </motion.div>
        </AnimatePresence>
    );
});

export default QuestionWrapper;
