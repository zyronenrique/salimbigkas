import { useAuth } from "../../hooks/authContext";
import { motion } from "framer-motion";
import { getWordImages } from "../../utils/helpers";
import { useClassContext } from "../../hooks/classContext";
import { useNavigate } from "react-router-dom";
import { useLessonsState } from "../Class/useLessonsState";
import { imageSrc, SpinLoadingWhite } from "../Icons/icons";
import { useCallback } from "react";
import { useLogReg } from "../Modals/LogRegProvider";

const StudentLessons = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const { formattedGradeLevel } = useLogReg();
    const { state } = useLessonsState();
    const { selectedYunit, setSelectedLesson } = useClassContext();
    
    const handleShowLesson = useCallback((lesson: any) => {
        setSelectedLesson(lesson);
        navigate(`/${role?.toLowerCase()}/${formattedGradeLevel?.toLowerCase()}/my-courses/yunit-${selectedYunit?.yunitnumber}/lessons/lesson/${lesson.id}/about`);
    }, [navigate, role, formattedGradeLevel, selectedYunit, setSelectedLesson]);

    return (
        <div className="flex flex-col flex-1 w-full h-full relative bg-[#F8F8F8]">
            <div className="flex items-center justify-between w-full px-4 mt-4">
                <motion.button
                    title="Back"
                    type="button"
                    className="px-4 py-2 gap-2 flex items-center transition-colors duration-300"
                    onClick={() => navigate(-1)}
                    aria-label="Back"
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                >
                    <img loading="lazy" src={imageSrc.back} alt="Back" className="size-10 object-contain" />
                    <div className="flex">
                    {getWordImages(`back`, true).map((imageSrc, index) => (
                        <img
                            loading="lazy"
                            key={index}
                            src={imageSrc || ""}
                            alt='back'
                            className={`block h-8 w-auto object-contain -mr-1`}
                        />
                    ))}
                    </div>
                </motion.button>
                <h1 className="px-2 text-3xl font-extrabold tracking-tight text-gray-600">
                    Select Lesson
                </h1>
            </div>
            <motion.div
                className="flex flex-col flex-1 w-full h-full relative z-10 p-10"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {state.lessons?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {state.lessons.map((lesson, idx) => (
                            <motion.div
                                key={lesson.id || idx}
                                className={`flex items-center w-full rounded-lg transition-colors shadow group text-[#2C3E50] bg-[#FFA600]`}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                title={`Buksan ang aralin: ${lesson.aralinPamagat}`}
                            > 
                                <motion.button
                                    type="button"
                                    className="flex flex-1 items-center text-left px-6 py-8"
                                    onClick={() => handleShowLesson(lesson)}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <img loading="lazy" src={imageSrc.book} alt="Book" className="size-14 mr-4 object-contain" />
                                    <div className="flex flex-col flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`truncate max-w-xl font-semibold text-2xl group-hover:underline`}>
                                                Aralin {lesson.aralinNumero} -{" "} {lesson.aralinPamagat}
                                            </span>
                                        </div>
                                        <div className={`text-base`}>
                                            {lesson.aralinPaglalarawan &&
                                            lesson.aralinPaglalarawan.length > 80
                                                ? lesson.aralinPaglalarawan.slice(0, 80) +
                                                "..."
                                                : lesson.aralinPaglalarawan ||
                                                "Walang deskripsyon"}
                                        </div>
                                    </div>
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                ) : state.isLoading ? (
                    <div className="flex col-span-2 items-center justify-center font-bold h-80 gap-4">
                        <SpinLoadingWhite size={16} />
                        <p className="chalk-text text-8xl">Loading lessons...</p>
                    </div>
                ) : (
                    <div className="flex col-span-2 items-center justify-center font-bold h-80">
                        <p className="chalk-text text-8xl">No lessons available</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default StudentLessons;
