import { memo } from "react";
import { useAuth } from "../../hooks/authContext";
import { motion } from "framer-motion";
import { ChevronLeft, BookPlus, Book, BookDashed, Archive } from "lucide-react";
import AccordionButton from "../Buttons/AccordionButton";
import { useClassContext } from "../../hooks/classContext";
import { useNavigate } from "react-router-dom";
import { useLessonsState } from "./useLessonsState";
import LessonCard from "../Card/LessonCard";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useLogReg } from "../Modals/LogRegProvider";

const YunitLessons = memo(() => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const { state, updateState, ArchiveorUnarchiveLesson, handleArchive, handleAddLesson, handleEditLesson, handleShowLesson, handleLessonDraft, handleAddQuiz, handleSeatWork} = useLessonsState();
  const { selectedYunit, selectedClass } = useClassContext();

  return (
    <div className="flex flex-1 w-full h-full relative">
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
            onClick={() => navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${selectedClass?.id}/my-courses`)}
            aria-label="Bumalik sa mga Yunit"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
          >
            <ChevronLeft className="mr-2" size={26} />
            <span className="text-lg font-semibold">Back</span>
          </motion.button>
          <div className="flex-1 min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight">
              Yunit {selectedYunit?.yunitnumber}
              <span className="mx-2 font-extrabold">•</span>
              <span className="text-2xl">{selectedYunit?.yunitname}</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-6 pb-2">
          <h2 className="text-left text-2xl font-bold text-[#2C3E50]">
            Lessons
          </h2>
          <motion.button
            disabled={state.lessons.length === 0}
            type="button"
            title="Archive Lessons"
            className="flex items-center border border-gray-300 rounded-full px-4 py-2 bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
            onClick={handleArchive}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Archive className="mr-2" size={24} />
            <span>Archive</span>
          </motion.button>
        </div>
        <OverlayScrollbarsComponent
          options={{ scrollbars: { autoHide: "leave" } }}
          defer
          className="flex-1 overflow-y-auto grid grid-cols-1 gap-8 px-6 mt-5"
        >
          <section className="w-full mb-5">
            <div className="rounded-xl bg-white shadow-md divide-y divide-gray-200 overflow-hidden">
              <AccordionButton
                icon={<Book size={22} />}
                label="Lessons"
                color="green"
                bgColor="white"
                isOpen={state.showMgaAralin}
                onClick={() => updateState({ showMgaAralin: !state.showMgaAralin })}
              >
                {state.lessons.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {state.lessons.map((lesson, idx) => (
                      <LessonCard
                        key={lesson.id || idx}
                        lesson={lesson}
                        idx={idx}
                        type="published"
                        onShow={handleShowLesson}
                        onEdit={handleEditLesson}
                        onAddQuiz={handleAddQuiz}
                        onAddSeatwork={handleSeatWork}
                        onArchiveorUnarchive={ArchiveorUnarchiveLesson}
                        isLoading={state.isLoading}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700">
                    Published lessons go here.
                  </p>
                )}
              </AccordionButton>
              <AccordionButton
                icon={<BookDashed size={22} />}
                label="Drafts"
                color="yellow"
                bgColor="white"
                isOpen={state.showIsDraft}
                onClick={() => updateState({ showIsDraft: !state.showIsDraft })}
              >
                {state.lessonsDraft.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {state.lessonsDraft.map((lesson, idx) => (
                      <LessonCard
                        key={lesson.id || idx}
                        lesson={lesson}
                        idx={idx}
                        type="draft"
                        onShow={handleLessonDraft}
                        onEdit={handleEditLesson}
                        onAddQuiz={handleAddQuiz}
                        onAddSeatwork={handleSeatWork}
                        onArchiveorUnarchive={ArchiveorUnarchiveLesson}
                        isLoading={state.isLoading}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700">
                    Draft lessons go here.
                  </p>
                )}
              </AccordionButton>
            </div>
          </section>
        </OverlayScrollbarsComponent>
      </motion.div>
    </div>
  );
});

export default YunitLessons;
