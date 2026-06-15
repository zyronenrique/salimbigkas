import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/authContext';
import { useClassContext } from '../../hooks/classContext';
import { useLessonsState } from './useLessonsState';
import { imageSrc } from '../Icons/icons';
import { useLogReg } from '../Modals/LogRegProvider';

const SelectType = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const { formattedGradeLevel } = useLogReg();
    const { handleAddQuiz, handleSeatWork } = useLessonsState();
    const { selectedYunit, selectedLesson, selectedClass } = useClassContext();

    return (
        <div className="flex flex-1 w-full h-full overflow-hidden relative">
            <motion.div
                className="flex flex-col w-full h-full bg-white relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <div className="flex items-center gap-4 p-4 border-b-2 border-[#BDC3C7] bg-[#2C3E50] text-white shadow-sm">
                    <div className='flex-1'>
                        <motion.button
                            type="button"
                            className="flex items-center py-2 transition-colors duration-200 group"
                            onClick={() => navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${selectedClass?.id}/my-courses/yunit-${selectedYunit?.yunitnumber}/lessons`)}
                            aria-label="Back to Lessons"
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.96 }}
                        >
                            <ChevronLeft className="mr-2" size={26} />
                            <span className="text-lg font-semibold">Back</span>
                        </motion.button>
                    </div>
                    <div className="flex-2">
                        <div className="flex">
                            <h2 className="text-lg font-bold tracking-tight">Aralin {selectedLesson?.aralinNumero}</h2>
                            <span className="mx-2 font-extrabold">•</span>
                            <h1 className="text-xl font-bold truncate max-w-lg">{selectedLesson?.aralinPamagat}</h1>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center py-10">
                    <h2 className="text-center text-3xl font-bold text-[#2C3E50]">
                        Select Activity
                    </h2>
                </div>
                <main className="flex-1 grid grid-cols-1 p-20">
                    <section className="relative flex items-center justify-between gap-4">
                        <motion.button 
                            type="button"
                            title="Quiz"
                            className="flex w-[35%] h-full items-center justify-center rounded-2xl text-[#2C3E50] bg-[#FFA600] shadow-md border border-gray-200 hover:animate-pulse"
                            onClick={() => handleAddQuiz(selectedLesson)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="px-4 py-2 text-4xl font-bold">Create Quiz</span>
                        </motion.button>
                        <img
                            loading="lazy"
                            src={imageSrc.quiz}
                            alt="Quiz"
                            className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-auto h-64 object-contain"
                        />
                        <motion.button 
                            type="button"
                            title="Seat Work"
                            className="flex w-[35%] h-full items-center justify-center rounded-2xl text-[#2C3E50] bg-[#FFA600] shadow-md border border-gray-200 hover:animate-pulse"
                            onClick={() => handleSeatWork(selectedLesson)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="px-4 py-2 text-4xl font-bold">Create Seatwork</span>
                        </motion.button>
                    </section>
                </main>
            </motion.div>
        </div>
    );
}

export default SelectType