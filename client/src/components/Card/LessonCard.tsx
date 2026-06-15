import { motion } from "framer-motion";
import Popup from "reactjs-popup";
import { BookDashed, EllipsisVertical, SquarePen, TestTube2, NotebookPen, Archive, ArchiveRestore } from "lucide-react";
import { formatUserDate } from "../../utils/helpers";
import { imageSrc, SpinLoadingColored } from "../Icons/icons";

interface LessonCardProps {
  lesson: any;
  idx: number;
  type: "published" | "draft" | "archived";
  onShow?: (lesson: any) => void;
  onEdit?: (lesson: any) => void;
  onAddQuiz?: (lesson: any) => void;
  onAddSeatwork?: (lesson: any) => void;
  onArchiveorUnarchive?: (lessonId: string, isArchived: boolean) => void;
  isLoading: boolean;
}

const LessonCard = ({
  lesson,
  idx,
  type,
  onShow,
  onEdit,
  onAddQuiz,
  onAddSeatwork,
  onArchiveorUnarchive,
  isLoading,
}: LessonCardProps) => {
  const LessonImageIcon = () => (
    <img loading='lazy' src={imageSrc.lessonTab} alt="Published Icon" className="w-auto h-6 mr-4 object-contain" />
  );
  const isDraft = type === "draft";
  const isArchive = type === "archived";
  const Icon = isDraft ? BookDashed : isArchive ? Archive : LessonImageIcon;
  const bgColor = isDraft ? "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-400" : isArchive ? "bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-400" : "bg-green-50 hover:bg-green-100";
  const textColor = isDraft ? "text-yellow-900" : isArchive ? "text-blue-900" : "text-green-900";
  const badgeBg = isDraft ? "bg-yellow-200 text-yellow-800 border-yellow-300" : isArchive ? "bg-blue-200 text-blue-800 border-blue-300" : "bg-green-200 text-green-800 border-green-300";
  const badgeText = isDraft ? "Draft" : isArchive ? "Archived" : "Published";
  const dateColor = isDraft ? "text-yellow-400" : isArchive ? "text-blue-400" : "text-green-400";
  const iconColor = isDraft ? "text-yellow-500" : isArchive ? "text-blue-500" : "text-green-500";
  const ellipsisColor = isDraft ? "text-yellow-500" : isArchive ? "text-blue-500" : "text-green-500";

  return (
    <motion.div
      key={lesson.id || idx}
      className={`flex items-center w-full rounded-lg transition-colors shadow group ${bgColor}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      whileHover={{ scale: 1.02 }}
      title={`${lesson.aralinPamagat}`}
    >
      <motion.button
        type="button"
        className="flex flex-1 items-center text-left px-4 py-3"
        onClick={() => onShow && onShow(lesson)}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className={`${iconColor} w-8 h-8 mr-4`} />
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-lg ${textColor} group-hover:underline`}>
              Aralin {lesson.aralinNumero} - {lesson.aralinPamagat}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badgeBg} border animate-pulse`}>
              {badgeText}
            </span>
          </div>
          <div className={`text-sm ${isDraft ? "text-yellow-700" : isArchive ? "text-blue-700" : "text-green-700"}`}>
            {lesson.aralinPaglalarawan && lesson.aralinPaglalarawan.length > 80
              ? lesson.aralinPaglalarawan.slice(0, 80) + "..."
              : lesson.aralinPaglalarawan || "Walang deskripsyon"}
          </div>
        </div>
        <span className={`ml-4 text-xs ${dateColor}`}>
          {formatUserDate(lesson?.createdAt)}
        </span>
      </motion.button>
      <div className="px-2">
        <Popup
          trigger={
            <motion.button
              title="Actions"
              aria-label="Actions"
              type="button"
              className="flex items-center justify-center size-8 rounded-full backdrop-blur-md cursor-pointer hover:bg-white/80 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              tabIndex={0}
              onClick={(e) => e.stopPropagation()}
            >
              <EllipsisVertical size={20} className={ellipsisColor} />
            </motion.button>
          }
          position={type === "draft" ? ["bottom center", "right center"] : ["bottom right", "top right"]}
          on="click"
          closeOnDocumentClick
          arrow={false}
          contentStyle={{
            padding: 0,
            border: "none",
            background: "transparent",
            boxShadow: "none",
          }}
          overlayStyle={{ background: "rgba(0,0,0,0.3)" }}
          nested
          lockScroll
          children={
            ((close: () => void) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col bg-white shadow-xl rounded-lg mt-2 border border-gray-200 min-w-[160px] focus:outline-none"
                tabIndex={-1}
                onKeyDown={(e) => {
                  if (e.key === "Escape") close();
                }}
              >
                {type === "published" && (
                  <>
                    <button
                      type="button"
                      className="flex items-center px-6 py-4 gap-3 text-gray-700 hover:bg-gray-100 rounded transition text-base"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddQuiz &&onAddQuiz(lesson);
                        close();
                      }}
                    >
                      <TestTube2 size={24} />
                      Add quiz
                    </button>
                    <button
                      type="button"
                      className="flex items-center px-6 py-4 gap-3 text-gray-700 hover:bg-gray-100 rounded transition text-base"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddSeatwork && onAddSeatwork(lesson);
                        close();
                      }}
                    >
                      <NotebookPen size={24} />
                      Add seatwork
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="flex items-center px-6 py-4 gap-3 text-gray-700 hover:bg-gray-100 rounded transition text-base"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit && onEdit(lesson);
                    close();
                  }}
                >
                  <SquarePen size={24} />
                  Edit lesson
                </button>
                <button
                  type="button"
                  className={`flex items-center px-6 py-4 gap-3 ${isLoading ? "text-gray-500 hover:bg-gray-50" : "text-blue-400 hover:bg-blue-50"} rounded transition text-base`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchiveorUnarchive && onArchiveorUnarchive(lesson.id, isArchive ? false : true);
                  }}
                >
                  {isLoading 
                    ? 
                      <>
                        <SpinLoadingColored size={6} />
                        {isArchive ? "Unarchiving..." : "Archiving..."}
                      </> 
                    : 
                      <>
                        <ArchiveRestore size={24} />
                        {isArchive ? "Unarchived" : "Archived"} lesson
                      </>
                  }
                </button>
              </motion.div>
            )) as any
          }
        />
      </div>
    </motion.div>
  );
};

export default LessonCard;