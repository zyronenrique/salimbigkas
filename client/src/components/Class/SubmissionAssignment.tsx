import { useState, useEffect } from "react";
import { doGetAllSubmissions } from "../../api/functions";
import { CheckCircle, ChevronLeft, Clock, NotebookText } from "lucide-react";
import { motion } from "framer-motion";
import { formatDateTimeLocal } from "../../utils/helpers";
import Assignment from "./Assigment";

interface SubmissionAssignmentProps {
    setShowSubmission: () => void;
    assignment: any;
    classId: string;
    callFetchAssignment: () => void;
}
const SubmissionAssignment = ({ setShowSubmission, assignment, classId, callFetchAssignment }: SubmissionAssignmentProps) => {
  
    const [submissions, setSubmissions] = useState([]);
    const [showAssignment, setShowAssignment] = useState<any>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    
    useEffect(() => {
        const fetchandSetSubmissions = async () => {
            try {
                const response = await doGetAllSubmissions(assignment.id, classId) as any;
                if (response?.submissions) {
                    setSubmissions(response.submissions);
                }
            } catch (error) {
                console.error("Error fetching submissions:", error);
            }
        }
        fetchandSetSubmissions();
    }, [assignment.id, classId]);

    return (
        <>
            {showAssignment ?
                <Assignment
                    assignment={selectedSubmission}
                    setShowAssignment={() => setShowAssignment(!showAssignment)}
                    classId={classId}
                    callFetchAssignment={callFetchAssignment}
                />
            :
                <div className="bg-white p-8 mx-auto">
                    <div className="flex items-center mb-4">
                        <button
                            type="button"
                            title="Back to Assignments"
                            className="text-gray-600 hover:text-gray-800 mr-4"
                            onClick={() => {
                                setShowSubmission();
                            }}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <NotebookText size={24} className="text-[#2C3E50] mr-2" />
                        <h1 className="text-2xl font-bold text-gray-800">Assignment Submissions</h1>
                    </div>
                    <p className="text-left text-gray-600 mb-8 px-10">
                        {assignment.title} - Submissions
                    </p>
                    <div className="max-h-[60vh] overflow-y-auto space-y-4 px-2 py-1">
                        {submissions.length === 0 ? (
                            <div className="text-center text-gray-400 py-12">
                                <NotebookText size={40} className="mx-auto mb-2" />
                                <div className="text-lg font-medium">No submissions yet.</div>
                            </div>
                        ) : (
                            submissions.map((assigment: any, index: number) => (
                                <motion.div
                                    key={assigment.id || index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex text-left items-center justify-between bg-white shadow-sm rounded-xl px-6 py-4 border border-gray-100 hover:shadow-md hover:border-[#2C3E50] transition group"
                                >
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={assigment.photoURL}
                                            alt={assigment.displayName}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 group-hover:border-[#2C3E50] transition"
                                        />
                                        <div>
                                            <div className="font-semibold text-gray-900">{assigment.displayName}</div>
                                            <div className="text-xs text-gray-500">
                                                {assigment.submission?.submittedAt
                                                    ? formatDateTimeLocal(assigment.submission.submittedAt)
                                                    : "--"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="flex flex-col items-end">
                                            {assigment.submission ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-sm">
                                                    <CheckCircle size={16} /> Submitted
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                                                    <Clock size={16} /> Not Submitted
                                                </span>
                                            )}
                                            {assigment.submission?.score !== undefined && (
                                                <span className="mt-1 inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded">
                                                    Score: {assigment.submission.score}
                                                </span>
                                            )}
                                        </div>
                                        {assigment.submission && (
                                            <button
                                                type="button"
                                                className="text-blue-600 hover:underline text-sm font-medium px-3 py-1 rounded transition hover:bg-blue-50"
                                                onClick={() => {
                                                    setShowAssignment(!showAssignment)
                                                    setSelectedSubmission(assigment);
                                                }}
                                            >
                                                View
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            }
        </>
    );
}

export default SubmissionAssignment;
