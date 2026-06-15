import { motion } from "framer-motion";
import { ChevronLeft, BookPlus, Book } from "lucide-react";
import AccordionButton from "../Buttons/AccordionButton";
import { useNavigate } from "react-router-dom";
import { useLessonsState } from "./useLessonsState";
import LessonCard from "../Card/LessonCard";

const ArchiveLessons = () => {
    const navigate = useNavigate();
    const { state, updateState, ArchiveorUnarchiveLesson, handleAddLesson, handleEditLesson} = useLessonsState();

    return (
        <div className="flex flex-1 w-full h-full overflow-hidden relative">
            <motion.button
                type="button"
                title="Add Lesson"
                aria-label="Add Lesson"
                id="bagong-aralin"
                className="fixed bottom-4 right-4 size-16 z-50 bg-gradient-to-br from-[#2C3E50] via-[#34495E] to-[#2980B9] shadow-2xl rounded-full flex items-center justify-center border-4 border-white hover:scale-105 active:scale-95 transition-all duration-200 group"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleAddLesson}
            >
                <motion.span
                    className="relative flex items-center justify-center w-full h-full"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: [1, -1, 1] }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                >
                    <BookPlus
                        color="#fff"
                        size={34}
                        strokeWidth={2.2}
                        className="drop-shadow-lg group-hover:rotate-10 transition-transform duration-200"
                    />
                </motion.span>
            </motion.button>
            <motion.div
                className="flex flex-col w-full h-full bg-white relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <div className="flex items-center gap-4 p-4 border-b-2 border-[#BDC3C7] bg-[#2C3E50] text-white shadow-sm">
                    <motion.button
                        disabled={state.isLoading}
                        type="button"
                        className="flex items-center py-2 transition-colors duration-200 group"
                        onClick={() => navigate(-1)}
                        aria-label="Back"
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.96 }}
                    >
                        <ChevronLeft className="mr-2" size={26} />
                        <span className="text-lg font-semibold">Back</span>
                    </motion.button>
                    <div className="flex-1 min-w-0">
                        <h1 className="truncate text-xl font-bold tracking-tight">
                            Archived
                        </h1>
                    </div>
                </div>
                <div className="flex items-center justify-between px-6 py-6 pb-2">
                    <h2 className="text-left text-2xl font-bold text-[#2C3E50]">
                        Lessons
                    </h2>
                </div>
                <main className="flex-1 overflow-y-auto grid grid-cols-1 gap-8 px-6 mt-5">
                    <section className="w-full mb-5">
                        <div className="rounded-xl bg-white shadow-md divide-y divide-gray-200 overflow-hidden">
                            <AccordionButton
                                icon={<Book size={22} />}
                                label="Archived Lessons"
                                color="blue"
                                bgColor="white"
                                isOpen={state.showArchive}
                                onClick={() => updateState({ showArchive: !state.showArchive })}
                            >
                                {state.archivedLessons.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {state.archivedLessons.map((lesson, idx) => (
                                            <LessonCard
                                                key={lesson.id || idx}
                                                lesson={lesson}
                                                idx={idx}
                                                type="archived"
                                                onEdit={handleEditLesson}
                                                isLoading={state.isLoading}
                                                onArchiveorUnarchive={ArchiveorUnarchiveLesson}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-700">
                                        Archive lessons go here.
                                    </p>
                                )}
                            </AccordionButton>
                        </div>
                    </section>
                </main>
            </motion.div>
        </div>
    );
};

export default ArchiveLessons;
