import { useState, MouseEvent } from "react";
import { 
    Paperclip, 
    CalendarDays, 
    Star, 
    ChevronLeft
} from "lucide-react";
import { formatDateTimeLocal } from "../../utils/helpers";
import { motion } from "framer-motion";
import { SpinLoadingWhite } from "../Icons/icons";
import FileInput from "../InputField/FileInput";
import { doSubmitAssigment } from "../../api/functions";
import {
  storage,
  storageRef,
  uploadBytes,
  getDownloadURL,
} from "../../firebase/firebase";
import { toast } from "react-toastify";
import CustomToast from "../Toast/CustomToast";
import { useAuth } from "../../hooks/authContext";

interface AssignmentProps {
    setShowAssignment: () => void;
    assignment: any;
    classId: string;
    callFetchAssignment: () => void;
}

const Assignment = ({ setShowAssignment, assignment, classId, callFetchAssignment }: AssignmentProps) => {
    
    const { currentUser } = useAuth();
    const userId = currentUser?.uid || "";
    const userResponse = assignment.response || assignment.submission;
    console.log("userResponse", userResponse);
    const duePassed = new Date(assignment.dueDate) < new Date();
    const userHasSubmitted = !!userResponse;
    const submittedAt = userResponse?.submittedAt; // This should be replaced with actual submission date if available
    const [isRegistering, setIsRegistering] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const getFileIconUrl=(type: string)=> {
        switch (type.toLowerCase()) {
            case "pdf":
                return "https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/pdf.svg";
            case "doc":
            case "docx":
                return "https://api.iconify.design/vscode-icons/file-type-word.svg";
            case "xls":
            case "xlsx":
                return "https://api.iconify.design/vscode-icons/file-type-excel.svg";
            case "ppt":
            case "pptx":
                return "https://api.iconify.design/vscode-icons/file-type-powerpoint.svg";
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
                return "https://api.iconify.design/vscode-icons/file-type-image.svg";
            case "zip":
            case "rar":
                return "https://api.iconify.design/vscode-icons/file-type-zip.svg";
            case "txt":
                return "https://api.iconify.design/vscode-icons/file-type-text.svg";
            case "mp3":
            case "wav":
                return "https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/audio.svg";
            case "mp4":
            case "mov":
            case "avi":
            case "webm":
                return "https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/video.svg";
            default:
                return "https://fonts.gstatic.com/s/i/materialiconsoutlined/insert_drive_file/v15/24px.svg";
        }
    }
    const getFileNameAndType=(url: string)=> {
        const decoded = decodeURIComponent(url);
        const fileName = decoded.split('/').pop()?.split('?')[0] || '';
        const cleanedName = fileName.replace(/^\d+_/, '');
        const [name, type] = cleanedName.split(/\.(?=[^\.]+$)/);
        return { name, type };
    }

    const uploadFileAndGetUrl = async (file: File) => {
        const filePath = `submissions/${userId}/${Date.now()}_${file.name}`;
        const fileRef = storageRef(storage, filePath);
        await uploadBytes(fileRef, file);
        return await getDownloadURL(fileRef);
    };
    const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsRegistering(true);
        try {
            const attachmentUrls = await Promise.all(
                attachments.map((file) => uploadFileAndGetUrl(file))
            );
            const response = await doSubmitAssigment(userId, assignment.id, classId, attachmentUrls) as any;
            if (response?.success) {
                toast.success(<CustomToast title="Success" subtitle="Assignment submitted successfully!" />);
                setAttachments([]);
                callFetchAssignment();
                setShowAssignment();
            } else {
                toast.error(<CustomToast title="Error" subtitle="Failed to submit assignment. Please try again." />);
                setIsRegistering(false);
            }
        } catch (error) {
            toast.error(<CustomToast title="Error" subtitle="Failed to submit assignment. Please try again." />)
            setIsRegistering(false);
        } finally {
            setIsRegistering(false);
        }
    }
    return (
        <div className="mx-auto p-6 h-screen">
            <motion.div 
                className="h-full bg-white rounded-2xl shadow-lg border border-gray-200"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <div className="relative flex items-center justify-between bg-[#2C3E50] rounded-t-2xl gap-3 px-8 py-6">
                    <motion.button
                        type="button"
                        className="absolute -top-2 -left-2 flex p-2 hover:text-gray-600 font-bold items-center bg-white border-2 border-[#2C3E50] rounded-full transition duration-200 ease-in-out"
                        onClick={setShowAssignment}
                        aria-label="back to classes"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ChevronLeft color="#2C3E50" size={24} />
                    </motion.button>
                    <div className="flex items-center gap-4">
                        <div className="bg-[#eaf1fb] rounded-full p-3">
                            <Star className="text-[#386BF6]" size={28} />
                        </div>
                        <div className="text-left">
                            <h1 className="text-2xl font-bold text-white">{assignment.title}</h1>
                            <div className="flex gap-4 mt-1 text-sm text-white/80">
                                <span className="flex items-center gap-1">
                                    <CalendarDays size={16} />
                                    Due: {formatDateTimeLocal(assignment.dueDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star size={16} />
                                    {assignment.totalPoints} pts
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        {!duePassed && !userHasSubmitted ? (
                            <button
                                type="button"
                                className={`bg-white text-lg font-bold text-[#2C3E50] px-20 py-3 rounded-lg shadow-md drop-shadow-lg ${isRegistering ? "opacity-50 cursor-not-allowed" : "hover:font-medium hover:border-[#386BF6] hover:bg-gray-100"}`}
                                onClick={handleSubmit}
                                disabled={isRegistering}
                            >
                                {isRegistering ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <SpinLoadingWhite size={6}/>
                                        Processing...
                                    </div>
                                ) : (
                                    "Submit"
                                )}
                            </button>
                        ) : userHasSubmitted ? (
                            <span className="text-green-600 font-semibold">
                                Submitted on {formatDateTimeLocal(submittedAt)}
                            </span>
                        ) : (
                            <span className="text-red-600 font-semibold">
                                Submission closed
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-left px-8 py-6">
                    <h2 className="text-lg text-justify font-semibold text-[#2C3E50] mb-2">Instructions</h2>
                    <p className="text-gray-700 mb-6 whitespace-pre-line">{assignment.instructions}</p>
                    {assignment.attachments && assignment.attachments.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-md font-medium text-[#2C3E50] mb-2 flex items-center gap-2">
                                <Paperclip size={18} /> Reference
                            </h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {assignment.attachments.map((url: any, idx: number) => {
                                    const { name, type } = getFileNameAndType(url);
                                    return (
                                        <li key={idx}>
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center p-4 text-blue-600 border border-gray-200 shadow-sm rounded-lg appearance-none"
                                            >
                                                <img
                                                    src={getFileIconUrl(type)}
                                                    alt={type + " icon"}
                                                    className="size-6 mr-2 inline-block align-middle flex-shrink-0"
                                                />
                                                <span className="truncate text-blue-700 font-medium">
                                                    {name}
                                                </span>
                                                <span className="text-blue-700 font-medium whitespace-nowrap">.{type}</span>
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                    <div className="mt-2 mb-2 text-left relative flex flex-col">
                        <label className="text-lg font-medium mb-2 flex items-center gap-2">
                            <Paperclip size={18} /> My work
                        </label>
                        {userResponse?.attachments && userResponse.attachments.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {userResponse.attachments.map((url: string, idx: number) => {
                                    const { name, type } = getFileNameAndType(url);
                                    return (
                                    <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-4 text-blue-600 border border-gray-200 shadow-sm rounded-lg appearance-none"
                                    >
                                        <img
                                            src={getFileIconUrl(type)}
                                            alt={type + " icon"}
                                            className="size-6 mr-2 inline-block align-middle flex-shrink-0"
                                        />
                                        <span className="truncate text-blue-700 font-medium">
                                            {name}
                                        </span>
                                        <span className="text-blue-700 font-medium whitespace-nowrap">.{type}</span>
                                    </a>
                                    );
                                })}
                            </div>
                        ) : (
                            
                            <FileInput
                                label="Insert your files here"
                                files={attachments}
                                setFiles={setAttachments}
                                disabled={isRegistering}
                                inputId="assignmentAttachments"
                                multiple={true}
                                accept="*"
                                maxFiles={10}
                            />
                        )}
                    </div>
                    {/* Feedback and points */}
                    <div className="mt-6 space-y-4">
                        <div className="flex flex-col items-start gap-2">
                            <span className="font-semibold text-gray-700">Feedback:</span>
                            {userResponse?.feedback ? (
                                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg shadow-sm border border-green-200">
                                    {userResponse.feedback}
                                </span>
                            ) : (
                                <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg border border-gray-200">
                                    No feedback provided yet.
                                </span>
                            )}
                        </div>
                        {userResponse?.score && (
                            <div className="flex items-center gap-2 mt-3">
                                <span className="font-semibold text-gray-700">Score:</span>
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg shadow-sm border border-blue-200 font-bold">
                                    {userResponse.score} / {assignment.totalPoints}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Assignment;
