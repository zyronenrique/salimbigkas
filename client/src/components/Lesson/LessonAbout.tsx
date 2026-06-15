import { memo, useEffect } from "react";
import { motion } from "framer-motion";
import { CircleAlert } from "lucide-react";
import { imageSrc } from "../Icons/icons";
import { useClassContext } from "../../hooks/classContext";

const LessonAbout = memo(() => {
  const { selectedLesson, setPageNumber } = useClassContext();

  useEffect(() => {
    setPageNumber(null);
  }, [setPageNumber]);

  return (
    <div className="relative flex-1 flex items-center justify-center h-full bg-[#FFA600]">
      <img
        loading="lazy"
        src={imageSrc.lessonbg}
        alt="Lesson Background"
        className="hidden md:block absolute top-0 left-0 inset-0 w-full h-screen object-cover z-0"
      />
      <div className="relative mt-10 max-w-6xl h-[90vh] flex flex-col items-center justify-center">
        <motion.h1
          className="text-center px-8 py-4 rounded-2xl shadow-lg bg-[#003311] text-white text-4xl font-extrabold tracking-wide mb-6 bg-opacity-90"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {selectedLesson?.aralinPamagat}
        </motion.h1>
        <motion.div
          className="relative w-full bg-white rounded-xl shadow-xl p-6 flex flex-col items-center border-2 border-[#6DD5FA]/30 bg-opacity-90"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex-col gap-4 w-full px-2 py-3 rounded-lg bg-[#f0f7fa] text-lg text-gray-800 text-justify min-h-[100px] max-h-100 overflow-y-auto transition-all duration-200">
            <div className="flex flex-col px-2">
              <label className="block text-lg font-semibold text-[#2980B9] mb-2">Tungkol</label>
              <span>{selectedLesson?.aralinPaglalarawan}</span>
            </div>
            <div className="flex flex-col mt-2 px-2">
              <label className="block text-lg font-semibold text-[#2980B9] mb-2">Mga Layunin</label>
              <ul>
                {(Array.isArray(selectedLesson?.aralinLayunin) ? selectedLesson.aralinLayunin : []).map(
                  (layunin: string, index: number) => (
                    <li key={index} className="list-disc ml-10">
                      {layunin}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
          <div className="absolute -top-5 -right-5 bg-yellow-200 rounded-full p-3 shadow-md">
            <CircleAlert className="text-yellow-600" size={36} />
          </div>
        </motion.div>
      </div>
    </div>
  );
});

export default LessonAbout;
