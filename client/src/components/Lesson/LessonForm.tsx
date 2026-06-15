import { motion } from "framer-motion";
import { NotebookPen, ChevronLeft, CircleAlert, SquarePen, SquareX } from "lucide-react";
import { SpinLoadingWhite } from "../Icons/icons";
import FileInput from "../InputField/FileInput";
import { useClassContext } from "../../hooks/classContext";
import { useNavigate } from "react-router-dom";
import { useLessonFormState } from "./useLessonFormState";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const LessonForm = () => {
  const navigate = useNavigate();
  const { selectedYunit, isEditMode } = useClassContext();
  const { state, updateState, handleGenerateLessonInfo, handleGenerateDescription, handleGenerateObjectives, handleContinue } = useLessonFormState();

  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex flex-col"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex items-center gap-4 p-4 border-b-2 border-[#BDC3C7] bg-[#2C3E50] text-white shadow-sm">
          <motion.button
            disabled={state.isContinue || state.isGenerating}
            type="button"
            className="flex items-center py-2 transition-colors duration-200 group"
            onClick={() => navigate(-1)}
            aria-label="Bumalik sa mga Yunit"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
          >
            <ChevronLeft className="mr-2" size={26} />
            <span className="text-lg font-semibold">Back</span>
          </motion.button>
          <div className="flex flex-1 items-center justify-center">
            {state.lessonNumber.length > 0 || state.lessonTitle.length > 0 ? (
              <>
                <h2 className="text-lg font-bold tracking-tight">Aralin {state.lessonNumber}</h2>
                <span className="mx-2 font-extrabold">•</span>
                <h1 className="text-xl font-bold truncate max-w-lg">{state.lessonTitle}</h1>
              </>
            ) : (
              <h2 className="text-lg font-bold tracking-tight">New Lesson</h2>
            )}
          </div>
        </div>
        <OverlayScrollbarsComponent
          options={{ scrollbars: { autoHide: "leave", autoHideDelay: 500 } }}
          defer
          className="bg-white flex flex-col p-6 max-h-[85vh] overflow-y-auto"
        >
          <div className="rounded-xl border-1 border-gray-200 shadow-sm p-8">
            {/* Error message display */}
            {state?.errorMessage && (
              <motion.div
                className="relative flex mb-6 py-5 px-15 bg-[#FBE6E6] text-sm justify-center items-center rounded-sm shadow-sm drop-shadow-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <CircleAlert
                  className="absolute left-4 text-red-600"
                  size={24}
                />
                <p>{state.errorMessage}</p>
              </motion.div>
            )}
            {/* Registration form */}
            <form onSubmit={async (e) => {
                e.preventDefault();
                await handleContinue();
              }}
            >
              <div className="flex text-left mb-5 justify-between items-center">
                <div className="flex items-center justify-between gap-2">
                  <NotebookPen size={34} />
                  <div>
                    <h1 className="text-2xl font-medium">{isEditMode ? "Edit Lesson" : "New Lesson"}</h1>
                    <h3 className="text-sm text-gray-600">
                      {isEditMode ? "Update the lesson details." : `Create a new lesson for Yunit ${selectedYunit.yunitnumber}`}
                    </h3>
                  </div>
                </div>
                <div className="flex gap-5 items-center">
                  {/* Register button */}
                  <button
                    type="submit"
                    className={`bg-[#2C3E50] text-lg text-white px-20 py-3 rounded-lg shadow-md drop-shadow-lg ${state.isContinue || state.isGenerating ? "opacity-50 cursor-not-allowed" : "hover:font-medium hover:border-[#386BF6] hover:bg-[#34495e]"}`}
                    disabled={state.isContinue || state.isGenerating}
                  >
                    {state.isContinue ? (
                      <div className="flex items-center justify-center gap-2">
                        <SpinLoadingWhite size={6}/>
                      </div>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-1 gap-4">
                {/* Lesson Number input */}
                <div className="text-left mt-4 mb-2">
                  <div className="relative">
                    <input
                      disabled={state.isContinue || state.isGenerating || state.isDisabled}
                      name="lessonNumber"
                      type="text"
                      id="lessonNumber"
                      required
                      autoFocus
                      minLength={1}
                      className={`w-full font-bold p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${state.lessonNumber ? "border-[#2C3E50]" : state.isDisabled ? "opacity-50 cursor-not-allowed" : "border-gray-300"}`}
                      placeholder=" "
                      value={state.lessonNumber}
                      onChange={(e) => updateState({ lessonNumber: e.target.value })}
                      // Restrict input to letters and spaces only
                      onKeyDown={(e) => {
                        updateState({ errorMessage: "" });
                        if (
                          !/^\d*$/.test(e.key) &&
                          e.key !== "Backspace" &&
                          e.key !== "Delete"
                        ) {
                          e.preventDefault();
                          updateState({ errorMessage: "Please enter a valid number." });
                          return;
                        }
                      }}
                    />
                    <label
                      className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${state.lessonNumber ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                      htmlFor="lessonNumber"
                    >
                      Lesson No.
                    </label>
                    {!isEditMode && 
                      <>
                        {state.isDisabled ? (
                          <motion.button
                            disabled={state.isContinue || state.isGenerating}
                            type="button"
                            title="Enable editing"
                            className={`absolute right-4 top-4 z-10 text-sm text-[#2C3E50] underline`}
                            onClick={() => updateState({ isDisabled: false })}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <SquarePen className="inline mr-2" size={24} />
                          </motion.button>
                        ):(
                          <motion.button
                            disabled={state.isContinue || state.isGenerating}
                            type="button"
                            title="Disable editing"
                            className={`absolute right-4 top-4 z-10 text-sm text-[#2C3E50] underline`}
                            onClick={() => updateState({ isDisabled: true })}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <SquareX className="inline mr-2" size={24} />
                          </motion.button>
                        )}
                      </>
                    }
                  </div>
                  <h4 className="mt-2 text-xs text-gray-500 font-semibold">
                    (eg. Lesson 1, Lesson 2, ...)
                  </h4>
                </div>
                {/* Class Name input */}
                <div className="text-left relative">
                  <input
                    disabled={state.isContinue || state.isGenerating}
                    name="title"
                    type="text"
                    id="title"
                    autoComplete="title"
                    required={!isEditMode}
                    minLength={1}
                    className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${state.lessonTitle ? "border-[#2C3E50]" : "border-gray-300"}`}
                    placeholder=" "
                    value={state.lessonTitle}
                    onChange={(e) => updateState({ lessonTitle: e.target.value })}
                    onKeyDown={() => {
                      updateState({ errorMessage: "" });
                    }}
                  />
                  <label
                    className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${state.lessonTitle ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                    htmlFor="title"
                  >
                    Title
                  </label>
                </div>
                <div className="flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-gray-500 font-semibold">
                      Description
                    </h4>
                    {!state.isContinue && state.lessonDescription && (
                      <motion.button
                        type="button"
                        className={`px-4 py-2 bg-[#2C3E50] text-white rounded ${state.pagbasaFiles.length === 0 || state.isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={state.pagbasaFiles.length === 0 || state.isGenerating}
                        onClick={handleGenerateDescription}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {state.isGenerating ? "Generating.." : "Generate Description"}
                      </motion.button>
                    )}
                  </div>
                  <div className="text-left relative">
                    <textarea
                      disabled={state.isContinue || state.isGenerating}
                      name="description"
                      id="description"
                      autoComplete="description"
                      required={!isEditMode}
                      minLength={1}
                      rows={3}
                      className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${state.lessonDescription ? "border-[#2C3E50]" : "border-gray-300"}`}
                      placeholder=" "
                      value={state.lessonDescription}
                      onChange={(e) => updateState({ lessonDescription: e.target.value })}
                      onKeyDown={() => {
                        updateState({ errorMessage: "" });
                      }}
                    />
                    <label
                      className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${state.lessonDescription ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                      htmlFor="description"
                    >
                      Description
                    </label>
                  </div>
                </div>
                <div className="flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-gray-500 font-semibold">
                      Objectives
                    </h4>
                    {!state.isContinue && state.lessonObjectives?.length > 0 && (
                      <motion.button
                        type="button"
                        className={`px-4 py-2 bg-[#2C3E50] text-white rounded ${state.pagbasaFiles.length === 0 || state.isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={state.pagbasaFiles.length === 0 || state.isGenerating}
                        onClick={handleGenerateObjectives}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {state.isGenerating ? "Generating.." : "Generate Objectives"}
                      </motion.button>
                    )}
                  </div>
                  <div className="text-left relative">
                    <textarea
                      disabled={state.isContinue || state.isGenerating}
                      name="objectives"
                      id="objectives"
                      autoComplete="objectives"
                      required={!isEditMode}
                      minLength={1}
                      rows={4}
                      className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${state.lessonObjectives?.length > 0 ? "border-[#2C3E50]" : "border-gray-300"}`}
                      placeholder=" "
                      value={Array.isArray(state.lessonObjectives) ? state.lessonObjectives.join("\n") : state.lessonObjectives}
                      onChange={(e) => updateState({ lessonObjectives: e.target.value.split("\n") })}
                      onKeyDown={() => {
                        updateState({ errorMessage: "" });
                      }}
                    />
                    <label
                      className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${state.lessonObjectives?.length > 0 ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                      htmlFor="objectives"
                    >
                      Objectives
                    </label>
                  </div>
                </div>
                <div className="text-left relative">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-gray-500 font-semibold">
                      Content
                    </h4>
                    {!state.isContinue && state.pagbasaFiles.length > 0 && (
                      <motion.button
                        type="button"
                        className={`px-4 py-2 bg-[#2C3E50] text-white rounded ${state.pagbasaFiles.length === 0 || state.isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={state.isGenerating}
                        onClick={handleGenerateLessonInfo}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {state.isGenerating ? "Generating.." : "Generate Content"}
                      </motion.button>
                    )}
                  </div>
                  <FileInput
                    label="Upload the lesson content"
                    files={state.pagbasaFiles}
                    setFiles={(files) => updateState({ pagbasaFiles: files })}
                    disabled={state.isContinue}
                    inputId="pagbasaContent"
                    multiple={true}
                    maxFiles={5}
                  />
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 border border-gray-200 font-medium">
                      <span className="mr-1">Accepted:</span>
                      <span className="font-semibold text-[#2C3E50]">
                        PDF only (Up to 5 files, max 5 MB each)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </OverlayScrollbarsComponent>
      </motion.div>
    </div>
  );
};

export default LessonForm;
