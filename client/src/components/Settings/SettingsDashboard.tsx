import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/authContext";
import { imageSrc } from "../Icons/icons";
import { UserRoundPen, X, Save, Camera, PhoneCall, Mail, SquarePen } from "lucide-react";
import { SpinLoadingColored } from "../Icons/icons";
import { doUpdateUserProfile } from "../../firebase/auth";
import { toast } from "react-toastify";
import CustomToast from "../Toast/CustomToast";
import ReauthenticateModal from "../Modals/ReauthenticateModal";
import { motion } from "framer-motion";
import { getWordImages } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";
import { useClassContext } from "../../hooks/classContext";

const SettingsDashboard = () => {
    const navigate = useNavigate();
    const { currentUser, role, gradeLevels, gradeLevel, refreshUser, setLoading: setIsLoading } = useAuth();
    const { className } = useClassContext();
    const [editMode, setEditMode] = useState(false);
    const [profile, setProfile] = useState({
        displayName: currentUser?.displayName || "",
        email: currentUser?.email || "",
        photoURL: currentUser?.photoURL,
        role: role,
        gradeLevel: gradeLevel,
        gradeLevels: gradeLevels || [],
        emailVerified: currentUser?.emailVerified,
        phoneNumber: currentUser?.phoneNumber || "",
        createdAt: currentUser?.metadata?.creationTime,
        lastSignInTime: currentUser?.metadata?.lastSignInTime,
        updatedAt: new Date().toISOString(),
    });
    const [photoPreview, setPhotoPreview] = useState(profile.photoURL);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    // const [errorMessage, setErrorMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEm, setIsEm] = useState<boolean>(false);
    const [isPw, setIsPw] = useState<boolean>(false);

    useEffect(() => {
        setProfile({
            displayName: currentUser?.displayName || "",
            email: currentUser?.email || "",
            photoURL: currentUser?.photoURL,
            role: role,
            gradeLevel: gradeLevel,
            gradeLevels: gradeLevels || [],
            emailVerified: currentUser?.emailVerified,
            phoneNumber: currentUser?.phoneNumber || "",
            createdAt: currentUser?.metadata?.creationTime,
            lastSignInTime: currentUser?.metadata?.lastSignInTime,
            updatedAt: new Date().toISOString(),
        });
        setPhotoPreview(currentUser?.photoURL);
    }, [currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, files } = e.target as HTMLInputElement;
        if (name === "photoURL" && files && files[0]) {
            const file = files[0];
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
                setProfile((prev) => ({ ...prev, photoURL: reader.result as string }));
            };
            reader.readAsDataURL(file);
        } else {
            setProfile((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setIsLoading(true);
        try {
            await doUpdateUserProfile({
                displayName: profile.displayName,
                email: profile.email,
                phoneNumber: profile.phoneNumber,
                photoFile,
            });
            await refreshUser();
            toast.success(
                <CustomToast
                    title="Congratulation!"
                    subtitle="Your profile has been updated successfully."
                />,
            );
            setEditMode(false);
        } catch (err: any) {
            let errorMsg = "An error occurred while updating your profile.";
            if (err.code === "auth/email-already-in-use") {
                errorMsg = "The email address is already in use. Please use a different email.";
            } else if (err.code === "auth/operation-not-allowed") {
                errorMsg = "Please verify your new email before changing email.";
            }else {
                errorMsg = err.message;
            }
            toast.error(
                <CustomToast
                    title="Something went wrong!"
                    subtitle={`${errorMsg} Please try again.`}
                />,
            );
        } finally {
            setLoading(false);
            setIsLoading(false);
        }
    };

    return (
        <div className="relative p-6 space-y-6 z-10">
            <header className="flex flex-col justify-between text-left">
                <div className="flex items-center justify-between mb-2">
                    {role == "Student" && (
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
                    )}
                    <div className={`flex flex-col px-2 ${role === "Student" ? "text-right text-white" : "text-left"}`}>
                        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                        <p>Manage your account settings.</p>
                    </div>
                </div>
            </header>
            <div className="flex flex-col gap-8 md:flex-row md:items-start">
                {/* Profile Details Section */}
                <section className="relative w-full p-8 bg-white rounded-2xl shadow border border-gray-200">
                    <div className="flex flex-col gap-6 text-left">
                        <div className="flex items-center gap-6">
                            {/* Profile Photo */}
                            <div className="relative group">
                                <img
                                    loading="lazy"
                                    src={photoPreview || imageSrc.man}
                                    alt="User Avatar"
                                    className="size-36 rounded-full border-4 border-primary-500 object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
                                />
                                {editMode && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
                                        <Camera size={40} className="text-white drop-shadow" />
                                    </div>
                                )}
                                <input
                                    disabled={!editMode}
                                    title="Change Profile Photo"
                                    type="file"
                                    name="photoURL"
                                    accept="image/*"
                                    className={`absolute top-0 left-0 size-36 opacity-0 cursor-pointer ${editMode ? "z-10" : "pointer-events-none"}`}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex flex-col items-start">
                                {editMode ? (
                                    <div className="flex flex-col items-start gap-2">
                                        <div className="text-left relative">
                                            <input
                                                disabled={loading}
                                                title="Display Name"
                                                type="text"
                                                name="displayName"
                                                minLength={1}
                                                maxLength={30}
                                                value={profile.displayName}
                                                onChange={handleChange}
                                                className={`w-full p-4 text-3xl border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${profile.displayName ? "border-[#2C3E50]" : "border-gray-300"}`}
                                                autoFocus
                                            />
                                            <label
                                                className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${profile.displayName ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                                                htmlFor="displayName"
                                                >
                                                Full Name
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <h2 className="px-4 py-2 text-4xl font-semibold text-white bg-[#2C3E50] rounded-lg">
                                        {profile.displayName}
                                    </h2>
                                )}
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <Mail size={18} className="inline text-gray-500" />
                                    <p className="text-xl text-gray-500">{profile.email}</p>
                                    {editMode &&
                                        <button
                                            title="Change Email"
                                            type="button"
                                            className="flex mt-2 px-4 py-3 gap-2 bg-[#2C3E50] text-white rounded-lg hover:bg-[#34495e] items-center transition-colors disabled:opacity-50"
                                            onClick={() => {
                                                setIsModalOpen(!isModalOpen);
                                                setIsEm(!isEm);
                                            }}
                                        >
                                            <SquarePen size={18} />
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mt-2 px-4">
                            <div className="flex flex-col">
                                <span className="text-base font-medium">Role</span>
                                <span className="text-lg px-3 py-2 font-medium bg-[#2C3E50] text-white rounded-lg shadow tracking-wide">{profile.role}</span>
                            </div>
                            <div className="flex flex-col"> 
                                <span className="text-base font-medium">Grade Level</span>
                                <div className={`text-lg  px-3 py-2 font-medium ${profile.gradeLevel || profile.gradeLevels ? 'bg-[#2C3E50] text-white' : 'text-[#2C3E50]'} rounded-lg shadow tracking-wide`}>
                                    {profile.gradeLevel
                                        ? profile.gradeLevel
                                        : Array.isArray(profile.gradeLevels) && profile.gradeLevels.length > 0
                                            ? profile.gradeLevels.join(", ")
                                            : "N/A"}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-base font-medium">Email Verified</span>
                                <div className={`px-3 py-2 text-lg rounded-lg border ${profile.emailVerified ? 'text-green-500 bg-green-50 border-green-200' : 'text-red-500 bg-red-50 border-red-200'}`}>{profile.emailVerified ? "Yes" : "No"}</div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-base font-medium">Class Enrolled</span>
                                <div className={`px-3 py-2 text-lg rounded-lg border ${className ? 'text-green-500 bg-green-50 border-green-200' : 'text-red-500 bg-red-50 border-red-200'}`}>{className ? className : "N/A"}</div>
                            </div>
                            <div className="flex flex-col gap-1">
                                {!editMode && 
                                    <span className="text-base font-medium">Phone</span>
                                }
                                {editMode ?
                                    <div className="space-y-1 text-left relative">
                                        <input
                                            disabled={loading}
                                            title="Phone Number"
                                            type="tel"
                                            name="phoneNumber"
                                            maxLength={13}
                                            pattern="^(\+639\d{9}|09\d{9})$"
                                            value={profile.phoneNumber}
                                            onChange={handleChange}
                                            className={`w-full p-4 text-base border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${profile.phoneNumber ? "border-[#2C3E50]" : "border-gray-300"}`}
                                            placeholder=""
                                            required
                                        />
                                        <label
                                            className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${profile.phoneNumber ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                                            htmlFor="phoneNumber"
                                            >
                                            Phone
                                        </label>
                                        <span className="text-xs text-gray-500">
                                            Format: +639XXXXXXXXX or 09XXXXXXXXX
                                        </span>
                                    </div>
                                :
                                    <div className="flex items-center gap-2 px-3 py-2 font-medium bg-[#2C3E50] text-white rounded-lg shadow">
                                        <PhoneCall size={18} className="inline" />
                                        <div className="text-lg tracking-wide">{profile.phoneNumber || "-----------"}</div>
                                    </div>
                                }
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-base font-medium">Member Since</span>
                                <div className="px-3 py-2 text-lg rounded-lg bg-[#2C3E50] text-white tracking-wide">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}</div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-base font-medium">Last Sign-In</span>
                                <div className="px-3 py-2 text-lg rounded-lg bg-[#2C3E50] text-white tracking-wide">{profile.lastSignInTime ? new Date(profile.lastSignInTime).toLocaleDateString() : "N/A"}</div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-base font-medium">Change Password?</span>
                                <motion.button
                                    title="Change Password"
                                    type="button"
                                    className="px-3 py-2.5 rounded-lg bg-[#2C3E50] text-white text-base"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setIsModalOpen(!isModalOpen);
                                        setIsPw(!isPw);
                                    }}
                                >
                                    <SquarePen size={18} className="inline mr-2" />
                                    Change Password
                                </motion.button>
                            </div>
                        </div>
                        {/* Edit/Save/Cancel Buttons */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            {editMode ? (
                                <div className="flex items-center gap-4">
                                    <motion.button
                                        disabled={loading}
                                        title="Save Changes"
                                        type="button"
                                        className={`px-3 py-2 rounded-full bg-primary-500 text-[#2C3E50] hover:bg-gray-50 transition flex items-center gap-1 shadow ${loading ? "cursor-progress" : ""}`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSave}
                                    >
                                        {loading ? <SpinLoadingColored size={6}/> : <Save size={20} /> }
                                        <span className="hidden md:inline">{loading ? 'Saving...' : 'Save'}</span>
                                    </motion.button>
                                    <motion.button
                                        disabled={loading}
                                        title="Cancel Edit"
                                        type="button"
                                        className={`px-3 py-2 rounded-full bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition flex items-center gap-1 shadow ${loading ? "cursor-not-allowed" : ""}`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setEditMode(false);
                                            setProfile({
                                                displayName: currentUser?.displayName || "",
                                                email: currentUser?.email || "",
                                                photoURL: currentUser?.photoURL,
                                                role: role,
                                                gradeLevel: gradeLevel,
                                                gradeLevels: gradeLevels || [],
                                                emailVerified: currentUser?.emailVerified,
                                                phoneNumber: currentUser?.phoneNumber || "-----------",
                                                createdAt: currentUser?.metadata?.creationTime,
                                                lastSignInTime: currentUser?.metadata?.lastSignInTime,
                                                updatedAt: new Date().toISOString(),
                                            });
                                            setPhotoPreview(currentUser?.photoURL);
                                            setPhotoFile(null);
                                        }}
                                    >
                                        <X size={20} />
                                        <span className="hidden md:inline">Cancel</span>
                                    </motion.button>
                                </div>
                            ) : (
                                <motion.button
                                    title="Edit Profile"
                                    type="button"
                                    className="px-3 py-2 rounded-full bg-primary-50 hover:bg-[#2C3E50] hover:text-white transition flex items-center gap-1 shadow"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setEditMode(true)}
                                >
                                    <UserRoundPen size={20} />
                                    <span className="hidden md:inline">Edit</span>
                                </motion.button>
                            )}
                        </div>
                    </div>
                </section>
            </div>
            {isModalOpen && (
                <div
                    className={
                    "fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center"
                    }
                >
                    <ReauthenticateModal 
                        isOpen={isModalOpen} 
                        onClose={() => {
                            setIsModalOpen(false);
                            setIsEm(false);
                            setIsPw(false);
                        }}
                        setEditMode={() => setEditMode(!editMode)}
                        isEm={isEm}
                        email={profile.email}
                        isPw={isPw}
                    />
                </div>
            )}
        </div>
    );
};

export default SettingsDashboard;
