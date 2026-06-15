import { motion } from "framer-motion";
import { FileUp, Plus, FileVideo, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { storage, storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "../../firebase/firebase";
import { toast } from "react-toastify";
import CustomToast from "../Toast/CustomToast";
import { doGetAllVideos, doUploadVideo, doDeleteVideo } from "../../api/functions";
import { useAuth } from "../../hooks/authContext";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useClassContext } from "../../hooks/classContext";

type FileItem = {
    file: File;
    uploadedAt: Date;
    url?: string;
    progress?: number; // 0-100
    uploading?: boolean;
};

const MAX_VIDEO_SIZE_MB = 50;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const LessonFiles = () => {
    const { currentUser, gradeLevel } = useAuth();
    const userId = currentUser?.uid || "";
    const { selectedClass, selectedLesson, setPageNumber } = useClassContext();
    const [uploadingFiles, setUploadingFiles] = useState<FileItem[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [refresh, setRefresh] = useState<boolean>(false);

    useEffect(() => {
        setPageNumber(null);
    }, [setPageNumber]);

    useEffect(() => {
        const fetchandSetVideos = async () => {
            try {
                const response = await doGetAllVideos(selectedLesson?.id, gradeLevel || selectedClass.gradeLevel) as any;
                setVideos(response?.videos);
            } catch (error) {
                console.error("Failed to fetch videos:", error);
                toast.error(<CustomToast title="Error" subtitle="Failed to fetch videos." />);
            }
        }
        fetchandSetVideos();
    }, [refresh, selectedLesson?.id, gradeLevel || selectedClass.gradeLevel]);

    const formatSize = (size: number) =>
        size < 1024
            ? `${size} B`
            : size < 1024 * 1024
            ? `${(size / 1024).toFixed(1)} KB`
            : `${(size / (1024 * 1024)).toFixed(1)} MB`;

    // const formatDate = (date: Date) =>
    //     date.toLocaleDateString() + " " + date.toLocaleTimeString();

    const getFileIcon = (type: string) => {
        if (type.startsWith("video/")) return <FileVideo color="black" size={24} />;
        return "📁";
    };

    const SUPPORTED_VIDEO_TYPES = [
        "video/mp4",
        "video/webm",
        "video/ogg",
    ];
    const SUPPORTED_EXTENSIONS = [".mp4", ".webm", ".ogg"];

    const isSupportedVideo = (file: File) => {
        const typeOk = SUPPORTED_VIDEO_TYPES.includes(file.type);
        const extOk = SUPPORTED_EXTENSIONS.some(ext =>
            file.name.toLowerCase().endsWith(ext)
        );
        return typeOk && extOk;
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files).filter(isSupportedVideo);

            const oversizedFiles = selectedFiles.filter(file => file.size > MAX_VIDEO_SIZE_BYTES);
            if (oversizedFiles.length > 0) {
                toast.error(
                    <CustomToast
                        title="File Too Large"
                        subtitle={`Each video must be less than ${MAX_VIDEO_SIZE_MB} MB.`}
                    />
                );
            }
            const validFiles = selectedFiles.filter(file => file.size <= MAX_VIDEO_SIZE_BYTES);
            
            validFiles.forEach((file) => {
                const videoRef = storageRef(storage, `lesson-videos/${Date.now()}_${file.name}`);
                const uploadTask = uploadBytesResumable(videoRef, file);

                const uploadingFile: FileItem = {
                    file,
                    uploadedAt: new Date(),
                    progress: 0,
                    uploading: true,
                };

                setUploadingFiles((prev) => [...prev, uploadingFile]);

                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        setUploadingFiles((prev) =>
                            prev.map((f) =>
                                f.file === file ? { ...f, progress } : f
                            )
                        );
                    },
                    () => {
                        setUploadingFiles((prev) =>
                            prev.filter((f) => f.file !== file)
                        );
                    },
                    async () => {
                        const url = await getDownloadURL(uploadTask.snapshot.ref);
                        await doUploadVideo(
                            userId,
                            selectedLesson?.id,
                            gradeLevel || selectedClass.gradeLevel,
                            url,
                            file.name,
                            file.size,
                        );
                        setUploadingFiles((prev) =>
                            prev.filter((f) => f.file !== file)
                        );
                        setRefresh(!refresh);
                    }
                );
            });
            e.target.value = "";
        }
    };

    const handleDelete = async (item: any) => {
        try {
            const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/`;
            const pathWithToken = decodeURIComponent(item.videoUrl.replace(baseUrl, "").split("?")[0]);
            const fileRef = storageRef(storage, pathWithToken);
            await deleteObject(fileRef);
            await doDeleteVideo(userId, selectedLesson?.id, item.id);
            setRefresh(!refresh);
        } catch (error) {
            toast.error(<CustomToast title="Error" subtitle="Failed to delete video." />);
        }
    };

    return (
        <div 
            className="flex flex-1 w-full flex-col p-8 mx-auto">
            <div className="w-full flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Videos</h2>
                {videos.length > 0 &&
                    <>
                        <input
                            title="Upload Video Files"
                            type="file"
                            ref={inputRef}
                            onChange={handleUpload}
                            className="hidden"
                            multiple
                            accept=".mp4,video/mp4,.webm,video/webm,.ogg,video/ogg"
                        />
                        <motion.button
                            className="flex items-center gap-2 bg-[#2C3E50] text-white px-6 py-4 rounded hover:bg-[#3A5F7A] transition-colors shadow"
                            onClick={() => inputRef.current?.click()}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FileUp className="w-5 h-5" />
                            Upload Videos
                        </motion.button>
                    </>
                }
            </div>
            <OverlayScrollbarsComponent
                options={{ scrollbars: { autoHide: "leave", autoHideDelay: 500 } }}
                defer
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-full overflow-y-auto p-4 bg-white rounded shadow"
            >
                {uploadingFiles.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-2 bg-gray-100 rounded shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{getFileIcon(item.file.type)}</span>
                            <div className="flex-1">
                                <p className="font-semibold">{item.file.name}</p>
                                <p className="text-sm text-gray-600">
                                    {formatSize(item.file.size)}
                                </p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded h-3">
                            <div
                                className="bg-[#3A5F7A] h-3 rounded"
                                style={{ width: `${item.progress}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500">{item.progress}% uploading...</p>
                    </div>
                ))}
                {/* Uploaded files */}
                {videos.length === 0 && uploadingFiles.length === 0 ? (
                    <div className="col-span-4 flex flex-1 flex-col p-8 items-center justify-center text-center bg-white rounded-lg shadow-inner border border-dashed border-gray-300">
                        <Plus className="text-gray-400 mb-4" size={64} />
                        <p className="text-xl font-semibold text-gray-600 mb-2">
                            No Videos Uploaded
                        </p>
                        <p className="text-gray-400 mb-6">
                            You haven&apos;t uploaded any videos yet. Click the button below to get started.
                        </p>
                        <input
                            title="Upload Video Files"
                            type="file"
                            ref={inputRef}
                            onChange={handleUpload}
                            className="hidden"
                            multiple
                            accept=".mp4,video/mp4,.webm,video/webm,.ogg,video/ogg"
                        />
                        <motion.button
                            className="flex items-center gap-2 bg-[#2C3E50] text-white px-6 py-4 rounded hover:bg-[#3A5F7A] transition-colors shadow"
                            onClick={() => inputRef.current?.click()}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FileUp className="w-5 h-5" />
                            Upload Videos
                        </motion.button>
                        <p className="text-sm font-bold text-gray-500 mt-4">Supported formats: .mp4, .webm, .ogg (Max {MAX_VIDEO_SIZE_MB} MB each)</p>
                    </div>
                ) : (
                    videos.map((video) => (
                        <div
                            key={video.id}
                            className="flex flex-col gap-2 p-2 bg-gray-100 rounded hover:bg-gray-200 shadow-sm transition text-left"
                        >
                            <div className="flex items-center gap-3 justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">
                                        <FileVideo color="black" size={24} />
                                    </span>
                                    <div>
                                        <p className="font-semibold">
                                            {video.videoTitle}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {video.videoSize ? formatSize(video.videoSize) : ""} -{" "}
                                            {video.createdAt ? new Date(video.createdAt).toLocaleString() : ""}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="p-1 rounded hover:bg-red-100"
                                    title="Delete video"
                                    onClick={() => handleDelete(video)}
                                >
                                    <Trash2 className="text-red-500" size={24} />
                                </button>
                            </div>
                            {/* Video preview */}
                            <video
                                controls
                                src={video.videoUrl}
                                className="w-full max-w-md rounded"
                            />
                        </div>
                    ))
                )}
            </OverlayScrollbarsComponent>
        </div>
    );
};

export default LessonFiles;