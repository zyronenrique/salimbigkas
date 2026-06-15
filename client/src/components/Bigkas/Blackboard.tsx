import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { imageSrc } from '../Icons/icons';
import { getWordImages } from '../../utils/helpers';
import { Volume2 } from 'lucide-react';
import { useAudioQueue } from '../Lesson/useAudioQueue';

interface BlackboardProps {
    loading: boolean;
    phrase: {
        text: string;
        [key: string]: any;
    };
    wordResults: (null | boolean)[];
    isActive: boolean;
    onListen: () => void;
    onSpeak: (speed: "normal" | "slow") => void;
    showSpeed: boolean;
    updateState: (state: any) => void;
    run: boolean;
    audioQueue: ReturnType<typeof useAudioQueue>;
}

const Blackboard = memo(({ loading, phrase, wordResults, isActive, onListen, onSpeak, showSpeed, updateState, run, audioQueue }: BlackboardProps) => {
    // const uppercaseImages = getWordImages("bigkasin", true);
    const { pause, resume, stop, isPlaying, isPaused } = audioQueue;
    return (
        <div className="relative flex items-center justify-center w-full h-screen md:w-auto">
            <img
                loading="lazy"
                src={imageSrc.blackboard}
                alt="Blackboard"
                className="hidden md:block h-auto object-contain"
            />
            <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[75%] max-h-[65%] flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={phrase?.text}
                        initial={{ scale: 0.8, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: -40 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30, duration: 0.4 }}
                        className="flex flex-col w-full items-center justify-center"
                    >
                        <div className='relative flex w-full ml-10'>
                            {isPlaying ? (
                                <div className="flex items-center gap-4">
                                    <div className='flex items-center'>
                                        <span className="chalk-text font-bold text-3xl animate-pulse">Speaking...</span>
                                        <div className="inline-flex items-center ml-2 gap-1">
                                            {[...Array(4)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-1 bg-[#FFF9C4] rounded-full"
                                                    animate={{
                                                        height: [8, 16, 8],
                                                        opacity: [0.4, 1, 0.4]
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        delay: i * 0.2,
                                                        ease: "easeInOut"
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-2 items-center">
                                        <motion.img
                                            loading='lazy'
                                            src={!isPaused ? imageSrc.pause : imageSrc.play}
                                            title={!isPaused ? "Pause Reading" : "Continue Reading"}
                                            alt={!isPaused ? "Pause Reading" : "Continue Reading"}
                                            className="inline size-12 object-contain"
                                            onClick={() => { isPaused ? resume() : pause(); }}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        />
                                        <motion.img
                                            loading='lazy'
                                            src={imageSrc.gameX}
                                            title="Stop Reading"
                                            className="inline size-12 object-contain"
                                            onClick={stop}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        />
                                    </div>
                                </div>
                            ):(
                                <>
                                    <motion.button
                                        disabled={loading || isActive || isPlaying || run}
                                        className={`chalk-text font-bold text-3xl text-left -mb-2 ${
                                            loading || isActive ? "opacity-50" : ""
                                        }`}
                                        data-joyride="bigkas-listen-button"
                                        onClick={() => updateState({ showSpeed: !showSpeed })}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <span>Tap to Listen</span>
                                        <Volume2 className="inline-block ml-2 text-[#FFF9C4] size-6" />
                                    </motion.button>
                                    {showSpeed && (
                                        <div className="absolute z-10 top-10 left-5 flex flex-col flex-grow w-28 gap-2 items-center bg-[#003311] border-4 border-[#8a3903] rounded-2xl p-4">
                                            <motion.img
                                                loading="lazy"
                                                src={imageSrc.normalSpeed} 
                                                title="Normal Speed"
                                                alt="Normal Speed" 
                                                className="inline size-14 object-contain"
                                                onClick={() => onSpeak("normal")}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            />
                                            <motion.img
                                                loading="lazy"
                                                src={imageSrc.slowSpeed}
                                                title="Slow Speed"
                                                alt="Slow Speed"
                                                className="inline size-14 object-contain"
                                                onClick={() => onSpeak("slow")}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <motion.p
                            className="text-[2rem] font-normal tracking-wider text-left break-words text-[#FFF9C4] px-4 py-2 w-full overflow-auto leading-relaxed hyphens-none"
                            data-joyride="bigkas-phrase"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {phrase?.text.split(" ").map((word: string, idx: number) => (
                                <span
                                    key={idx}
                                    className={`text-[2rem] font-normal tracking-wider text-[#FFF9C4] mx-1 border-b-4 transition-all duration-300 whitespace-nowrap ${
                                        wordResults[idx] === true
                                        ? "border-green-400"
                                        : wordResults[idx] === false
                                        ? "border-red-400"
                                        : "border-transparent"
                                    }`}
                                >
                                    {word}
                                </span>
                            ))}
                        </motion.p>
                        <motion.button
                            title='Listen'
                            type='button'
                            disabled={loading || isActive || isPlaying || run}
                            className={`flex items-center justify-center gap-0.5 mt-6 ${
                                loading || isActive || isPlaying ? "opacity-50" : ""
                                }`}
                            data-joyride="bigkasin-button"
                            onClick={onListen}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {getWordImages(`bigkasin`, true).map((imageSrc, index) => (
                                <img
                                    loading="lazy"
                                    key={index}
                                    src={imageSrc || ""}
                                    alt='bigkasin'
                                    className={`block h-12 w-auto object-contain
                                        ${index >= 0 && index <= 3 
                                            ? "-ml-1" 
                                            : index >= 3 && index <= 4 ? "-ml-3" 
                                            : index >= 4 ? "-ml-1.5"
                                            : ""
                                        }`}
                                />
                            ))}
                        </motion.button>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
});

export default Blackboard;