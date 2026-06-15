import { memo, useCallback } from "react";
import {
  ChevronRight,
  SquarePen,
  Trash2,
  EllipsisVertical,
  LockKeyhole,
  LockKeyholeOpen,
} from "lucide-react";
import { useAuth } from "../../hooks/authContext";
import { motion } from "framer-motion";
import Popup from "reactjs-popup";
import SkeletonYunit from "../SkeletonLoaders/SkeletonYunit";
import YunitModal from "../Modals/YunitModal";
import DeleteModal from "../Modals/DeleteModal";
import { imageSrc, SpinLoadingColored, SpinLoadingWhite } from "../Icons/icons";
import { useYunitsState } from "./useYunitsState";
import { useClassContext } from "../../hooks/classContext";
import { useNavigate } from "react-router-dom";
import { getWordImages } from "../../utils/helpers";
import { useLogReg } from "../Modals/LogRegProvider";

const MyCourses = memo(() => {
  const navigate = useNavigate();
  const skeletonArray = Array.from({ length: 4 }, (_, index) => (
    <SkeletonYunit key={index} />
  ));
  const { role } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const { state, updateState, handleUnlockorLockYunit, handleAddYunit, handleEditYunit, handleDeleteYunit } = useYunitsState();
  const { selectedClass, setSelectedYunit } = useClassContext();

  const handleSelectYunit = useCallback((unit: any) => {
    setSelectedYunit(unit);
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${selectedClass?.id}/my-courses/yunit-${unit.yunitnumber}/lessons`);
  }, [formattedGradeLevel, navigate, role, selectedClass?.id, setSelectedYunit]);

  const handleStudentSelectYunit = useCallback((unit: any) => {
    setSelectedYunit(unit);
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/my-courses/yunit-${unit.yunitnumber}/lessons`);
  }, [formattedGradeLevel, navigate, role, setSelectedYunit]);

  return (
    <>
      {role === "Admin" && (
        <motion.button
          type="button"
          title="Gumawa ng bagong yugto"
          aria-label="Gumawa ng bagong yugto"
          id="bagong-yugto"
          className="fixed bottom-4 right-4 size-16 z-50 bg-gradient-to-br from-[#2C3E50] via-[#34495E] to-[#2980B9] shadow-2xl rounded-full flex items-center justify-center border-4 border-white hover:scale-105 active:scale-95 transition-all duration-200 group"
          whileHover={{ scale: 1.05}}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddYunit}
        >
          <motion.span
            className="relative flex items-center justify-center w-full h-full"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: [1, -1, 1] }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <SquarePen
              color="#fff"
              size={34}
              strokeWidth={2.2}
              className="drop-shadow-lg group-hover:rotate-10 transition-transform duration-200"
            />
            {state.isYunitModalOpen && (
              <span className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full z-10">
                <SpinLoadingColored size={6}/>
              </span>
            )}
          </motion.span>
        </motion.button>
      )}
      {role === "Student" && (
        <div className="relative flex items-center justify-between w-full px-4 mt-2 z-10">
          <motion.button
            title="Back"
            type="button"
            className="px-4 py-2 gap-2 flex items-center transition-colors duration-300"
            onClick={() => navigate(-1)}
            aria-label="Bumalik sa mga Yunit"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
          >
            <img loading="lazy" src={imageSrc.back} alt="Back" className="size-8 object-contain" />
            <div className="flex">
              {getWordImages(`back`, true).map((imageSrc, index) => (
                <img
                  loading="lazy"
                  key={index}
                  src={imageSrc || ""}
                  alt='back'
                  className={`block h-6 w-auto object-contain -mr-1`}
                />
              ))}
            </div>
          </motion.button>
          <h1 className="px-2 text-3xl font-extrabold tracking-tight text-white">
            Select Yunit
          </h1>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-6 h-full">
        {state.isLoading
          ? skeletonArray
          : state.yunits.map((unit, idx) => (
              <motion.div
                key={unit.id || idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <motion.div
                  className={`relative z-10 h-full rounded-2xl bg-gradient-to-br bg-[#FFA600] text-white cursor-pointer overflow-hidden ${
                    unit.status === true && unit.unlocked === false ? "opacity-60" : ""
                  }`}
                  whileHover={{ scale: unit.status === true && unit.unlocked === false ? 1 : 1.05 }}
                  whileTap={{ scale: unit.status === true && unit.unlocked === false ? 0.95 : 1 }}
                >
                  <motion.button
                    type="button"
                    className={`relative flex flex-col w-full h-full group ${unit.status === true && unit.unlocked === false ? "grayscale" : ""}`}
                    aria-label={`View lessons for ${unit.yunitnumber}`}
                    onClick={() => {
                      if (role === "Student") {
                        handleStudentSelectYunit(unit);
                      } else {
                        handleSelectYunit(unit)
                      }
                    }}
                    disabled={unit.status === true && unit.unlocked === false}
                  >
                    <img
                      loading="lazy"
                      src={unit.imageurl}
                      alt={unit.yunitnumber}
                      className="absolute inset-0 w-full h-full object-contain z-0 opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="relative z-10 flex flex-col h-full justify-between p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <div>
                        <div className="text-2xl font-extrabold mb-1 drop-shadow-lg tracking-wide">
                          Yunit {unit.yunitnumber}
                        </div>
                        <div className="text-base font-medium opacity-95 mb-4 drop-shadow-sm tracking-wide">
                          {unit.yunitname}
                        </div>
                      </div>
                      {unit.unlocked === true && (
                        <div className="flex items-center gap-2 mt-auto">
                          <span
                            className={`text-xs font-semibold underline underline-offset-2 transition-colors group-hover:text-blue-200`}
                          >
                            View Lessons
                          </span>
                          <ChevronRight size={18} />
                        </div>
                      )}
                    </div>
                  </motion.button>
                  {/* Popup for edit and delete */}
                  {role !== "Student" && (
                    <Popup
                      trigger={
                        unit.unlocked === true && (
                          <motion.button
                            disabled={state.isUnlock}
                            title="Options"
                            aria-label="Options"
                            type="button"
                            className="absolute top-3 right-3 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-md shadow-lg cursor-pointer hover:bg-white/30 transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            tabIndex={0}
                          >
                            <EllipsisVertical size={20} color="white" />
                          </motion.button>
                        )
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
                              className="flex items-center px-6 py-4 gap-3 text-gray-700 hover:bg-gray-100 rounded transition text-base"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleUnlockorLockYunit(unit.id, false);
                                close();
                              }}
                            >
                              {state.isUnlock ? (
                                <>
                                  <SpinLoadingColored size={6}/>
                                  Locking...
                                </>
                              ) : (
                                <>
                                  <LockKeyholeOpen
                                    size={24}
                                    className="inline-block"
                                  />
                                  Locked yunit
                                </>
                              )}
                            </button>
                            {role === "Admin" && (
                              <>
                                <button
                                  type="button"
                                  className="flex items-center px-6 py-4 gap-3 text-gray-700 hover:bg-gray-100 rounded transition text-base"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditYunit(unit);
                                    close();
                                  }}
                                >
                                  <SquarePen size={24} />
                                  Edit yunit
                                </button>
                                <button
                                  type="button"
                                  className={`flex items-center px-6 py-4 gap-3 ${role !== "Admin" ? "text-gray-500 hover:bg-gray-50" : "text-red-500 hover:bg-red-50"} rounded transition text-base`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateState({ selectedYunitId: unit.id, isDeleteModalOpen: true });
                                    close();
                                  }}
                                >
                                  <Trash2 size={24} />
                                  Delete yunit
                                </button>
                              </>
                            )}
                          </motion.div>
                        )) as any
                      }
                    />
                  )}
                  {(unit.status === true && unit.unlocked === false) && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
                      <LockKeyhole
                        size={48}
                        className="text-white mb-2 animate-bounce"
                      />
                      <span className="text-white text-lg font-bold">
                        Locked
                      </span>
                      <span className="text-white text-xs mt-1">
                        This yunit is currently locked.
                      </span>
                      {role !== "Student" && (
                        <motion.button
                          className="flex mt-4 px-4 py-2 gap-2 bg-[#FFA600] font-bold text-[#2C3E50] rounded-lg"
                          onClick={() => handleUnlockorLockYunit(unit.id, true)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {state.isUnlock ? (
                            <>
                              <SpinLoadingWhite size={6}/> 
                              Unlocking...
                            </>
                          ) : (
                            <>
                              <LockKeyholeOpen
                                size={20}
                                className="inline-block"
                              />
                              Unlock
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ))}
      </div>
      {state.isYunitModalOpen && (
        <div className={"fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center overflow-hidden"}>
          <YunitModal
            isOpen={state.isYunitModalOpen}
            onClose={() => updateState({ isYunitModalOpen: false })}
          />
        </div>
      )}
      {state.isDeleteModalOpen && (
        <div className={"fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center"}>
          <DeleteModal
            entityType="yunit"
            isOpen={state.isDeleteModalOpen}
            onClose={() => updateState({ isDeleteModalOpen: false, selectedYunitId: "" })}
            onDelete={handleDeleteYunit}
          />
        </div>
      )}
    </>
  );
});

export default MyCourses;
