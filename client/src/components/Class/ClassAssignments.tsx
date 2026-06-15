import { useState, useEffect } from "react";
import { NotebookText, Plus, UsersRound } from "lucide-react";
import AddAssignment from "./AddAssignment";
import Assignment from "./Assigment";
import SubmissionAssignment from "./SubmissionAssignment";
import { doGetAllAssignments } from "../../api/functions";
import { useAuth } from "../../hooks/authContext";
import { formatDateTimeLocal } from "../../utils/helpers";
import { motion } from "framer-motion";
import { useClassContext } from "../../hooks/classContext";

const ClassAssignments = () => {
    const { currentUser, role } = useAuth();
    const { selectedClass } = useClassContext();
    const [showAddAssignment, setShowAddAssignment] = useState(false);
    const [showSubmission, setShowSubmission] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [showAssignment, setShowAssignment] = useState(false);
    const [refresh, setRefresh] = useState<boolean>(false);
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await doGetAllAssignments(currentUser?.uid || "", selectedClass.id) as any;
                setAssignments(response?.assignments);
            } catch (error) {
                console.error("Error fetching assignments:", error);
            }
        };
        fetchAssignments();
    }, [currentUser, selectedClass.id, refresh]);
    return (
        <>
            { role === "Teacher" && showAddAssignment ? 
                <AddAssignment 
                    setShowAddAssignment={()=> setShowAddAssignment(!showAddAssignment)}
                    callFetchAssignment={() => setRefresh(!refresh)}
                    classId={selectedClass.id}
                /> 
            : role === "Teacher" && showSubmission ? 
                <SubmissionAssignment
                    setShowSubmission={() => setShowSubmission(!showSubmission)}
                    assignment={selectedAssignment}
                    classId={selectedClass.id}
                    callFetchAssignment={() => setRefresh(!refresh)}
                />
            : role === "Student" && showAssignment ? 
                <Assignment
                    setShowAssignment={() => setShowAssignment(!showAssignment)}
                    assignment={selectedAssignment}
                    classId={selectedClass.id}
                    callFetchAssignment={() => setRefresh(!refresh)}
                /> 
            :
                <div className="bg-white p-8 mx-auto">
                    <div className="flex items-center mb-6">
                        <NotebookText size={24} className="text-[#2C3E50] mr-2" />
                        <h1 className="text-2xl font-bold text-gray-800">Class Assignments</h1>
                    </div>
                    <p className="text-left text-gray-600 mb-8">
                        {role === "Teacher" ?
                            "Manage and view all assignments for this class. Create new assignments, track submissions, and review student progress."
                            :
                            "View your assignments and submit your work. Keep track of due dates and requirements."
                        }
                    </p>
                    <div className="flex flex-col gap-4">
                        {assignments.length > 0 && 
                            role === "Teacher" && 
                            <button
                                type="button"
                                className="bg-[#2C3E50] hover:bg-[#34495e] text-white font-semibold py-4 px-6 rounded transition"
                                onClick={() => setShowAddAssignment(true)}
                            >
                                + Create Assignment
                            </button>
                        }
                        {assignments.length === 0 ? (
                            role === "Teacher" ?
                            <div className="col-span-4 flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg shadow-inner border border-dashed border-gray-300">
                                <Plus className="text-gray-400 mb-4" size={64} />
                                <p className="text-xl font-semibold text-gray-600 mb-2">
                                    No Assignments Found
                                </p>
                                <p className="text-gray-400 mb-6">
                                    You haven&apos;t created any assignments yet. Click the button below to create your first assignment.
                                </p>
                                <button
                                    type="button"
                                    className="bg-[#2C3E50] hover:bg-[#34495e] text-white font-semibold py-4 px-6 rounded transition"
                                    onClick={() => setShowAddAssignment(true)}
                                >
                                    + Create Assignment
                                </button>
                            </div>
                            :
                            <div className="col-span-4 flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg shadow-inner border border-dashed border-gray-300">
                                <NotebookText className="text-gray-400 mb-4" size={64} />
                                <p className="text-xl font-semibold text-gray-600 mb-2">
                                    No Assignments Available
                                </p>
                                <p className="text-gray-400 mb-6">
                                    Your teacher hasn&apos;t assigned any tasks yet. Please check back later.
                                </p>
                            </div>
                        ) : (
                            <div className="max-h-[60vh] overflow-y-auto space-y-4">
                                {assignments.map((assignment: any, index) => (
                                    <motion.div
                                        key={assignment.id}
                                        className="bg-white rounded-xl p-6 flex items-center justify-between shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-100 hover:border-[#2C3E50] group"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.07 }}
                                        onClick={() => {
                                            setSelectedAssignment(assignment);
                                            if (role === "Teacher") {
                                                setShowSubmission(true);
                                            } else {
                                                setShowAssignment(true);
                                            }
                                        }}
                                    >
                                        <div className="text-left flex-1">
                                            <div className="flex items-center gap-2">
                                                <h2 className="font-semibold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">{assignment.title}</h2>
                                                {assignment.response && (
                                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                                        Submitted
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Due: <span className="font-medium">{formatDateTimeLocal(assignment.dueDate)}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 ml-6">
                                            {role === "Teacher" && (
                                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                                                    <UsersRound size={20} className="text-blue-600" />
                                                    <span className="text-sm text-blue-700 font-medium">
                                                        {assignment.submittedCount || 0} / {assignment.totalMembers}
                                                    </span>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-semibold px-4 py-2 rounded transition-colors bg-blue-50 group-hover:bg-blue-100"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                    
                
            }
        </>
    );
}

export default ClassAssignments;
