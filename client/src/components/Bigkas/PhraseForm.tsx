import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, PlusCircle, CircleX, CircleCheck, Undo2 } from 'lucide-react';
import { imageSrc, SpinLoadingWhite } from '../Icons/icons';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/authContext';
import CustomSelect from '../Select/CustomSelect';

interface PhraseFormProps {
    state: any;
    actions: any;
}

const PhraseForm = memo(({ state, actions }: PhraseFormProps) => {
    const { gradeLevels } = useAuth();
    const groupedLessons = useMemo(() => (
        ["1", "2", "3", "4"].map(yunitNumber => ({
            label: `Yunit ${yunitNumber}`,
            options: state.lessons
                .filter((lesson: any) => String(lesson.yunitnumber) === yunitNumber)
                .map((lesson: any) => ({
                    value: lesson.id,
                    label: `Y ${lesson.yunitnumber} - L ${lesson.aralinNumero}`,
                })),
        }))
    ), [state.lessons]);
    const loadOptions = (inputValue: string, callback: (options: any[]) => void) => {
        const search = inputValue.replace(/\s+/g, '').toLowerCase();
        if (!search) {
            callback(groupedLessons);
            return;
        }
        setTimeout(() => {
            const filteredGroups = groupedLessons
                .map(group => ({
                    ...group,
                    options: group.options.filter(
                        (opt: any) =>
                            opt.label.replace(/\s+/g, '').toLowerCase().includes(search) ||
                            opt.value.replace(/\s+/g, '').toLowerCase().includes(search)
                    ),
                }))
                .filter(group => group.options.length > 0);
            callback(filteredGroups);
        }, 1000);
    };

    return (
        <form className='flex w-full p-2 gap-4 items-center justify-between'>
            <div className="flex items-center justify-center w-full bg-[#003311] rounded-sm border-4 border-[#8a3903]">
                {/* Lesson Selector */}
                <div className="flex text-left items-center">
                    {state.isLoading ? (
                        <div className="flex items-center justify-center w-[90px]">
                            <SpinLoadingWhite size={6}/>
                        </div>
                    ) : state.lessons.length > 0 ? (
                        <div className="min-w-36 px-1">
                            <CustomSelect
                                isDisabled={state.isRegister}
                                isMulti={false}
                                loadOptions={loadOptions}
                                defaultOptions={groupedLessons}
                                value={
                                    groupedLessons
                                        .flatMap(group => group.options)
                                        .find((opt: any) => opt.value === state.selectedLessonId) || null
                                }
                                onChange={(option: any) =>
                                    state.updateState({ selectedLessonId: option?.value })
                                }
                                placeholder="Select Lesson"
                                isLoading={state.isLoading}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-[90px]">
                            <img loading="lazy" src={imageSrc.cryRobot} alt="Cry Robot" className="h-8" />
                            <span className="text-white text-lg font-bold">?</span>
                        </div>
                    )}
                </div>

                {/* Mode Selector */}
                <div className="flex text-left items-center">
                    <select
                        disabled={state.isRegister}
                        title='Mode'
                        name="Mode"
                        className="w-[80px] text-lg py-4 focus:outline-none appearance-none bg-[#003311]"
                        value={state.mode}
                        onChange={(e) => state.updateState({ mode: e.target.value })}
                    >
                        <option value="easy">Easy</option>
                        <option value="normal">Normal</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                {/* Grade Level Selector */}
                <div className="flex text-left relative items-center">
                    <select
                        disabled={state.isRegister}
                        title='Grade Level'
                        name="Grade Level"
                        className="w-[80px] text-lg py-4 focus:outline-none appearance-none bg-[#003311]"
                        value={state.gradeLevel}
                        onChange={(e) => state.updateState({ gradeLevel: e.target.value })}
                    >
                        {gradeLevels?.map((level: string) => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                    <span className="pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 text-gray-500">
                        <ChevronDown size={20} />
                    </span>
                </div>

                <div className="w-0.5 bg-gray-500 h-8 mx-4"></div>

                {/* Phrase Input */}
                <div className="text-left relative w-full">
                    <input
                        disabled={state.isGenerating || state.isRegister || state.isLoading}
                        title='Phrase'
                        name="Phrase"
                        type="text"
                        required
                        maxLength={500}
                        className="w-full text-xl py-4 focus:outline-none"
                        placeholder="New Phrase"
                        value={state.phrase}
                        onChange={(e) => state.updateState({ phrase: e.target.value })}
                        onKeyDown={() => toast.dismiss()}
                    />
                </div>

                {/* Action Buttons */}
                {state.editingKey ? (
                    <div className='flex items-center p-4 gap-4'>
                        <motion.button
                            disabled={state.isGenerating || state.isRegister || state.isLoading}
                            type="button"
                            title='Cancel Edit'
                            className='text-white'
                            whileHover={{ scale: 1.10 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={actions.cancelEdit}
                        >
                            <Undo2 size={28} />
                        </motion.button>
                        <motion.button
                            disabled={state.isGenerating || state.isRegister || state.isLoading}
                            type="button"
                            title='Save Changes'
                            className='text-white'
                            whileHover={{ scale: 1.10 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={actions.saveChanges}
                        >
                            <CircleCheck size={28} />
                        </motion.button>
                    </div>
                ) : (
                    <div className='flex items-center p-4 gap-4'>
                        <motion.button
                            disabled={state.isGenerating || state.isRegister || state.isLoading}
                            type="button"
                            title='Clear All'
                            className='text-white'
                            whileHover={{ scale: 1.10 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={actions.clearAll}
                        >
                            <CircleX size={28} />
                        </motion.button>
                        <motion.button
                            disabled={state.isGenerating || state.isRegister || state.isLoading}
                            type="button"
                            title='Add Phrase'
                            className='text-white'
                            whileHover={{ scale: 1.10 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={actions.addPhrase}
                        >
                            <PlusCircle size={28} />
                        </motion.button>
                    </div>
                )}
            </div>
        </form>
    );
});

PhraseForm.displayName = 'PhraseForm';

export default PhraseForm;