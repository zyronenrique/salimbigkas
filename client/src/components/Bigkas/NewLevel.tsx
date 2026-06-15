import { memo } from 'react';
import { motion } from 'framer-motion';
import { imageSrc } from '../Icons/icons';
import { toast } from 'react-toastify';
import CustomToast from '../Toast/CustomToast';
import { useNewLevelState } from './useNewLevelState';
import PhraseForm from './PhraseForm';
import BlackboardPhrase from './BlackboardPhrase';
import PhraseList from './PhraseList';
import SaveActions from './SaveActions';
import { useNavigate } from 'react-router-dom';
import { getWordImages } from '../../utils/helpers';
import { useAuth } from '../../hooks/authContext';

const NewLevel = memo(() => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const {
        state,
        selectedLessonData,
        actions,
        modes,
        validation,
    } = useNewLevelState();

    const handleBack = () => {
        if (validation.hasUnsavedEdit()) {
            toast.error(<CustomToast title="Unsaved Changes" subtitle="Please save or cancel your current edit before going back." />);
            return;
        }
        if (validation.hasUnsavedPhrases()) {
            toast.info(<CustomToast title="Unsaved Phrases" subtitle="You have unsaved phrases. Are you sure you want to go back?" />);
            return;
        }
        navigate(-1);
    };

    const handleHelp = () => {
        toast.info(
            <CustomToast 
                title="Help" 
                subtitle="Use this section to create new phrases for the game. You can generate, add, edit, or delete phrases as needed." 
            />
        );
    };

    return (
        <div className={`flex flex-col space-y-6 items-center justify-center ${role !== "Student" ? "bg-[#F8F8F8]" : "bg-[#FFA600]"} text-white min-h-screen`}>
            {/* Header */}
            <div className="w-full flex items-center justify-between px-4 py-2">
                <motion.button
                    title="Back"
                    type="button"
                    className="px-4 py-2 gap-2 flex items-center transition-colors duration-300"
                    onClick={handleBack}
                    aria-label="Back to Bigkas"
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
                
                <div className='flex items-center gap-2'>
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#2C3E50]">
                        New Level
                    </h1>
                    <motion.button
                        title="Help"
                        type="button"
                        className="px-4 py-2 gap-4 flex items-center rounded-full hover:bg-gray-200 hover:text-gray-600 transition-colors duration-300"
                        onClick={handleHelp}
                        aria-label="Help"
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.96 }}
                    >
                        <img loading="lazy" src={imageSrc.gameInfo} alt="Game Info" className="size-10 object-contain" />
                    </motion.button>
                </div>
            </div>

            {/* Main Content */}
            <div className='flex flex-col items-center justify-between w-full px-4'>
                <div className='flex items-center justify-between w-full'>
                    {/* Phrase Generation Section */}
                    <BlackboardPhrase state={state} />
                    
                    {/* Phrase List Section */}
                    <PhraseList 
                        state={state}
                        onEdit={actions.editPhrase}
                        onDelete={actions.deletePhrase}
                        modes={modes}
                        selectedLessonData={selectedLessonData}
                    />
                </div>

                {/* Form and Actions */}
                <div className='w-full flex items-center justify-between gap-4 mt-2'>
                    <PhraseForm 
                        state={state}
                        actions={actions}
                    />
                    
                    <SaveActions 
                        state={state}
                        onSave={actions.saveNewLevel}
                    />
                </div>
            </div>
        </div>
    );
});

export default NewLevel;