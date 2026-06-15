import { useState, FormEvent } from "react";
import { useAuth } from "../../hooks/authContext";
import { doCreateAssignment } from "../../api/functions";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import CustomToast from "../Toast/CustomToast";
import { ChevronLeft, Paperclip, CalendarDays } from "lucide-react";
import { SpinLoadingWhite } from "../Icons/icons";
import {
  storage,
  storageRef,
  uploadBytes,
  getDownloadURL,
} from "../../firebase/firebase";
import FileInput from "../InputField/FileInput";

interface AddClassProps {
  setShowAddAssignment: () => void;
  callFetchAssignment: () => void;
  classId: string;
}

const AddAssignment = ({ setShowAddAssignment, callFetchAssignment, classId }: AddClassProps) => {
    const { currentUser } = useAuth();
    // Form state variables and error handling
    const [title, setTitle] = useState("");
    const [instructions, setInstructions] = useState("");
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const minDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const [dueDate, setDueDate] = useState("");
    const [points, setPoints] = useState("");
    // const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const uploadFileAndGetUrl = async (file: File) => {
        const filePath = `assignments/${classId}/${Date.now()}_${file.name}`;
        const fileRef = storageRef(storage, filePath);
        await uploadBytes(fileRef, file);
        return await getDownloadURL(fileRef);
    };
    const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isRegistering) {
            setIsRegistering(true);
            setErrorMessage("");
            try {
                const attachmentUrls = await Promise.all(
                    attachments.map((file) => uploadFileAndGetUrl(file))
                );
                const response = await doCreateAssignment(
                    currentUser?.uid || "",
                    classId,
                    title,
                    instructions,
                    new Date(dueDate).toISOString(),
                    Number(points),
                    attachmentUrls,
                ) as any;
                if (response?.success) {
                    toast.success(
                        <CustomToast
                            title="Congratulation!"
                            subtitle= "Assignment created successfully."
                        />,
                    );
                    callFetchAssignment();
                    setShowAddAssignment();
                } else {
                    toast.error(
                        <CustomToast
                        title="Something went wrong!"
                        subtitle="Failed to create class. Please try again."
                        />,
                    );
                }
            } catch (error) {
                setErrorMessage(
                "An error occurred while creating the class. Please try again.",
                );
            } finally {
                setIsRegistering(false);
            }
        }
    };

    return (
        <div className="overflow-hidden">
            <motion.div
                className="p-6 space-y-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <div className="flex items-center">
                    <motion.button
                        type="button"
                        className="flex py-2 text-2xl hover:text-gray-600 font-bold items-center bg-none transition duration-200 ease-in-out"
                        onClick={setShowAddAssignment}
                        aria-label="back to classes"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ChevronLeft className="mr-2" size={24} />
                        <h1 className="tracking-tight">Create new assignment</h1>
                    </motion.button>
                </div>

                <div className="rounded-xl border-1 border-gray-200 shadow-sm p-8">
                    {/* Error message display */}
                    {errorMessage && (
                        <motion.div
                        className="relative flex mb-6 py-5 px-15 bg-[#FBE6E6] text-sm justify-center items-center rounded-sm shadow-sm drop-shadow-sm"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        >
                        <svg
                            className="w-5 h-5 absolute top-auto left-6"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="rgb(211, 0, 1)"
                        >
                            <path
                            d="M7.493 0.015 C 7.442 0.021,7.268 0.039,7.107 0.055 C 5.234 0.242,3.347 1.208,2.071 2.634 C 0.660 4.211,-0.057 6.168,0.009 8.253 C 0.124 11.854,2.599 14.903,6.110 15.771 C 8.169 16.280,10.433 15.917,12.227 14.791 C 14.017 13.666,15.270 11.933,15.771 9.887 C 15.943 9.186,15.983 8.829,15.983 8.000 C 15.983 7.171,15.943 6.814,15.771 6.113 C 14.979 2.878,12.315 0.498,9.000 0.064 C 8.716 0.027,7.683 -0.006,7.493 0.015 M8.853 1.563 C 9.967 1.707,11.010 2.136,11.944 2.834 C 12.273 3.080,12.920 3.727,13.166 4.056 C 13.727 4.807,14.142 5.690,14.330 6.535 C 14.544 7.500,14.544 8.500,14.330 9.465 C 13.916 11.326,12.605 12.978,10.867 13.828 C 10.239 14.135,9.591 14.336,8.880 14.444 C 8.456 14.509,7.544 14.509,7.120 14.444 C 5.172 14.148,3.528 13.085,2.493 11.451 C 2.279 11.114,1.999 10.526,1.859 10.119 C 1.618 9.422,1.514 8.781,1.514 8.000 C 1.514 6.961,1.715 6.075,2.160 5.160 C 2.500 4.462,2.846 3.980,3.413 3.413 C 3.980 2.846,4.462 2.500,5.160 2.160 C 6.313 1.599,7.567 1.397,8.853 1.563 M7.706 4.290 C 7.482 4.363,7.355 4.491,7.293 4.705 C 7.257 4.827,7.253 5.106,7.259 6.816 C 7.267 8.786,7.267 8.787,7.325 8.896 C 7.398 9.033,7.538 9.157,7.671 9.204 C 7.803 9.250,8.197 9.250,8.329 9.204 C 8.462 9.157,8.602 9.033,8.675 8.896 C 8.733 8.787,8.733 8.786,8.741 6.816 C 8.749 4.664,8.749 4.662,8.596 4.481 C 8.472 4.333,8.339 4.284,8.040 4.276 C 7.893 4.272,7.743 4.278,7.706 4.290 M7.786 10.530 C 7.597 10.592,7.410 10.753,7.319 10.932 C 7.249 11.072,7.237 11.325,7.294 11.495 C 7.388 11.780,7.697 12.000,8.000 12.000 C 8.303 12.000,8.612 11.780,8.706 11.495 C 8.763 11.325,8.751 11.072,8.681 10.932 C 8.616 10.804,8.460 10.646,8.333 10.580 C 8.217 10.520,7.904 10.491,7.786 10.530 "
                            stroke="none"
                            />
                        </svg>
                        <p>{errorMessage}</p>
                        </motion.div>
                    )}
                    {/* Registration form */}
                    <form onSubmit={handleRegister}>
                        <div className="flex text-left mb-5 gap-4 justify-between items-center">
                            <h3 className="text-sm text-gray-600 mb-4">
                                Please fill in the details below to register a new assignment.
                            </h3>
                            <div className="flex gap-5 items-center">
                                {/* Class Time*/}
                                <div className="text-left relative">
                                    <input
                                        disabled={isRegistering}
                                        name="dueDate"
                                        type="datetime-local"
                                        id="dueDate"
                                        min={minDateTime}
                                        required
                                        className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${dueDate ? "border-[#2C3E50]" : "border-gray-300"}`}
                                        placeholder=" "
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        onKeyDown={() => {
                                            setErrorMessage("");
                                        }}
                                    />
                                    <label
                                        className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${dueDate ? "bg-white top-[-14px] text-[#2C3E50] text-lg" : "top-4 text-gray-500 text-base"}`}
                                        htmlFor="dueDate"
                                    >
                                        {dueDate ? "Select date" : ""}
                                    </label>
                                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#2C3E50] pointer-events-none">
                                        <CalendarDays size={20} />
                                    </span>
                                </div>
                                {/* Points */}
                                <div className="mt-2 mb-2 text-left relative">
                                    <input
                                        title="Points"
                                        disabled={isRegistering}
                                        name="points"
                                        type="number"
                                        id="points"
                                        autoComplete="points"
                                        required
                                        min={1}
                                        max={100}
                                        className={`w-24 p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none appearance-none ${points ? "border-[#2C3E50]" : "border-gray-300"}`}
                                        placeholder=" "
                                        value={points}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === "" || (Number(value) >= 1 && Number(value) <= 100)) {
                                                setPoints(value);
                                            }
                                        }}
                                        onKeyDown={() => {
                                            setErrorMessage("");
                                        }}
                                    />
                                    {/* {points && 
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 select-none pointer-events-none text-base">
                                            / 100
                                        </span>
                                    } */}
                                    <label
                                        className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${points ? "bg-white top-[-14px] text-[#2C3E50] text-lg" : "top-4 text-gray-500 text-base"}`}
                                        htmlFor="title"
                                    >   
                                        Points
                                    </label>
                                </div>
                                {/* Register button */}
                                <button
                                    type="submit"
                                    className={`bg-[#2C3E50] text-lg text-white px-20 py-3 rounded-lg shadow-md drop-shadow-lg ${isRegistering ? "opacity-50 cursor-not-allowed" : "hover:font-medium hover:border-[#386BF6] hover:bg-[#34495e]"}`}
                                    disabled={isRegistering}
                                >
                                    {isRegistering ? (
                                        <div className="flex items-center justify-center gap-2">
                                        <SpinLoadingWhite size={6}/>
                                        Processing...
                                        </div>
                                    ) : (
                                        "Assign"
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-1 gap-4">
                            {/* Class Name input */}
                            <div className="col-span-2 mt-2 mb-2 text-left relative">
                                <input
                                    disabled={isRegistering}
                                    name="title"
                                    type="text"
                                    id="title"
                                    autoComplete="title"
                                    required
                                    autoFocus
                                    minLength={1}
                                    maxLength={50}
                                    className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${title ? "border-[#2C3E50]" : "border-gray-300"}`}
                                    placeholder=" "
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    // Restrict input to letters and spaces only
                                    onKeyDown={() => {
                                        setErrorMessage("");
                                    }}
                                />
                                <label
                                    className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${title ? "bg-white top-[-14px] text-[#2C3E50] text-lg" : "top-4 text-gray-500 text-base"}`}
                                    htmlFor="title"
                                >
                                    Title
                                </label>
                            </div>
                            {/* Instructions */}
                            <div className="col-span-2 mt-2 text-left relative">
                                <textarea
                                    disabled={isRegistering}
                                    name="instructions"
                                    id="instructions"
                                    required
                                    rows={4}
                                    className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${instructions ? "border-[#2C3E50]" : "border-gray-300"}`}
                                    placeholder=" "
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                />
                                <label
                                    className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${instructions ? "bg-white top-[-14px] text-[#2C3E50] text-lg" : "top-4 text-gray-500 text-base"}`}
                                    htmlFor="instructions"
                                >
                                    Instructions
                                </label>
                            </div>
                            {attachments.some(file => file.type.startsWith("image/")) && (
                                <div className="mt-2">
                                    <img
                                    src={URL.createObjectURL(attachments.find(file => file.type.startsWith("image/"))!)}
                                    alt="Attachment Preview"
                                    className="max-h-48 rounded border border-gray-200"
                                    />
                                </div>
                            )}
                            {/* Attachments */}
                            <div className="mt-2 mb-2 text-left relative flex flex-col">
                                <label className="text-lg font-medium mb-2 flex items-center gap-2">
                                    <Paperclip size={18} /> Attach Resources
                                </label>
                                <FileInput
                                    label="Attach Resources (max 10 files)"
                                    files={attachments}
                                    setFiles={setAttachments}
                                    disabled={isRegistering}
                                    inputId="assignmentAttachments"
                                    multiple={true}
                                    accept="*"
                                    maxFiles={10}
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default AddAssignment;
