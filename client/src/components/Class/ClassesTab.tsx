import { useCallback, useState } from "react";
import {
  Plus,
  Trash2,
  Ellipsis,
  SquarePen,
  Copy,
  CircleFadingPlus,
} from "lucide-react";
import { useAuth } from "../../hooks/authContext";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import CustomToast from "../Toast/CustomToast";
import Popup from "reactjs-popup";
import DeleteModal from "../Modals/DeleteModal";
import SkeletonClass from "../SkeletonLoaders/SkeletonClass";
import JoinOrCreateClassPopup from "../Buttons/JoinOrCreateClassPopupButton";
import JoinClassByCodeModal from "../Modals/JoinClassByCodeModal";
import { imageSrc } from "../Icons/icons";
import { useClassContext } from "../../hooks/classContext";
import { useNavigate } from "react-router-dom";
import { useClassesState } from "./useClassesState";
import { useLogReg } from "../Modals/LogRegProvider";

const ClassesTab = () => {
  const navigate = useNavigate();
  const { state, updateState, handleDeleteClass } = useClassesState();
  const { setSelectedClass, setIsEditMode } = useClassContext();
  const { role } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<any | null>(null);

  const handleShowClass = useCallback((classData: any) => {
    setIsEditMode(false);
    setSelectedClass(classData);
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${classData?.id}/my-courses`);
  }, [setSelectedClass, navigate, role, formattedGradeLevel]);

  const handleUpdateClass = useCallback((classData: any) => {
    setIsEditMode(true);
    setSelectedClass(classData);
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${classData?.id}/edit`);
  }, [setSelectedClass, navigate, role, formattedGradeLevel]);

  return (
    <>
      <div className="relative p-6 space-y-6 h-screen">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-normal">
            {role === "Teacher" ? "My Classes" : "Classes"}
          </h1>
          <div className="flex items-center">
            <JoinOrCreateClassPopup
              triggerButton={
                state.classes.length > 0 && (
                  <button
                    title="Options"
                    aria-label="Options"
                    type="button"
                    className="flex px-8 py-4 gap-2 text-lg font-bold text-[#2C3E50] items-center bg-white rounded-lg shadow-sm hover:bg-gray-100 transition duration-200 ease-in-out"
                    tabIndex={0}
                  >
                    <CircleFadingPlus className="h-6 w-6" />
                    Join or create a class
                  </button>
                )
              }
              setShowJoinClass={setShowJoinClass}
              showJoinClass={showJoinClass}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {state.isLoading
            ? <SkeletonClass />
            : state.classes.length > 0
              ? state.classes?.filter(classItem => classItem.className && classItem.gradeLevel).map((classItem, index) => (
                  <motion.div
                    key={index}
                    className="relative z-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <button
                        type="button"
                        className="rounded-lg bg-white shadow-sm border border-gray-200 p-4 w-full items-center justify-center"
                        title={classItem.className}
                        onClick={() => handleShowClass(classItem)}
                      >
                        <div className="w-full flex flex-col items-center justify-between bg-[#2C3E50] p-8 rounded-lg text-white tracking-wider line-clamp-2">
                          <h2 className="text-4xl font-extrabold">
                            {classItem.gradeLevel}
                          </h2>
                          <h4 className="mt-2 font-semibold">
                            {classItem.className}
                          </h4>
                        </div>
                        {/* Date and time */}
                        <div className="w-full flex items-center justify-between">
                          <p className="mt-2 text-gray-600 text-sm">
                            Days: {classItem.days.join("/ ")}
                          </p>
                          <p className="mt-2 text-gray-600 text-sm">
                            Time: {classItem.time}
                          </p>
                        </div>
                      </button>
                      <Popup
                        trigger={
                          <button
                            title="Options"
                            aria-label="Options"
                            type="button"
                            className="absolute top-2 right-2 p-2 rounded-full bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2C3E50]"
                            tabIndex={0}
                          >
                            <Ellipsis className="h-6 w-6" />
                          </button>
                        }
                        position="bottom right"
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
                              <button
                                type="button"
                                className="flex items-center px-6 py-4 text-gray-700 hover:bg-gray-100 rounded transition text-base"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateClass(classItem);
                                  close();
                                }}
                              >
                                <SquarePen className="h-4 w-4 mr-2" />
                                Edit Class
                              </button>
                              <button
                                type="button"
                                className="flex items-center px-6 py-4 text-red-500 hover:bg-red-50 rounded transition text-base"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedClassId(classItem.id);
                                  updateState({ isDeleteModalOpen: true });
                                  close();
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Class
                              </button>
                              <button
                                type="button"
                                className="flex items-center px-6 py-4 text-gray-700 hover:bg-gray-100 rounded transition text-base"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(
                                    classItem.code,
                                  );
                                  toast.success(
                                    <CustomToast
                                      title="Class code copied!"
                                      subtitle="The class code has been copied to your clipboard."
                                    />,
                                  );
                                  close();
                                }}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy class code
                              </button>
                            </motion.div>
                          )) as any
                        }
                      />
                    </motion.div>
                  </motion.div>
                ))
              : 
                <div className="col-span-4 flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg shadow-inner border border-dashed border-gray-300">
                  <Plus className="text-gray-400 mb-4" size={64}/>
                  <p className="text-xl font-semibold text-gray-600 mb-2">
                    No classes found
                  </p>
                  <p className="text-gray-400 mb-6">
                    You haven&apos;t joined or created any classes yet.
                  </p>
                  <JoinOrCreateClassPopup
                    triggerButton={
                      state.classes.length <= 0 && (
                        <button
                          title="Options"
                          aria-label="Options"
                          type="button"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-lg font-medium shadow hover:bg-[#34495E] transition"
                          tabIndex={0}
                        >
                          <CircleFadingPlus className="h-6 w-6" />
                          Join or create a class
                        </button>
                      )
                    }
                    setShowJoinClass={setShowJoinClass}
                    showJoinClass={showJoinClass}
                  />
                </div>
          }
        </div>
        <img
          loading="lazy"
          src={imageSrc.studentGirl}
          alt="Student illustration"
          className="absolute bottom-0 right-10 z-0 w-1/4 h-auto pointer-events-none object-contain"
        />
      </div>
      {showJoinClass && (
        <div
          className={
            "fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center"
          }
        >
          <JoinClassByCodeModal
            isOpen={showJoinClass}
            onClose={() => setShowJoinClass(!showJoinClass)}
          />
        </div>
      )}
      {state.isDeleteModalOpen && (
        <div className={"fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center"}>
          <DeleteModal
            entityType="class"
            isOpen={state.isDeleteModalOpen}
            onClose={() => updateState({ isDeleteModalOpen: false })}
            onDelete={() => handleDeleteClass(selectedClassId)}
          />
        </div>
      )}
    </>
  );
};

export default ClassesTab;
