import { memo } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';
import { SpinLoadingWhite } from '../Icons/icons';

interface SaveActionsProps {
    state: any;
    onSave: () => void;
}

const SaveActions = memo(({ state, onSave }: SaveActionsProps) => {
    return (
        <div className='flex flex-1/2 items-center justify-center'>
            <motion.button
                disabled={state.isGenerating || state.isRegister || state.isLoading || state.editingKey !== null}
                type="button"
                className='w-full text-xl font-bold text-white py-4 bg-[#003311] rounded-sm shadow-lg border-4 border-[#8a3903] transition-colors duration-300'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSave}
            >
                <div className='flex items-center justify-center gap-2'>
                    {state.isRegister ? (
                        <SpinLoadingWhite size={6}/>
                    ) : (
                        <Gamepad2 size={24} className="inline-block mr-2" />
                    )}
                    <span>{state.isRegister ? 'Saving...' : 'Save'}</span>
                </div>
            </motion.button>
        </div>
    );
});

SaveActions.displayName = 'SaveActions';

export default SaveActions;