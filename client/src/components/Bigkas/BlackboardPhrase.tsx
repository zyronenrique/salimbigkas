import { memo } from 'react';
import { motion } from 'framer-motion';
import { imageSrc } from '../Icons/icons';


interface BlackboardPhraseProps {
    state: any;
}

const BlackboardPhrase = memo(({ state }: BlackboardPhraseProps) => {
    return (
        <div className='relative flex w-full md:w-auto items-center justify-center'>
            <img
                loading="lazy"
                src={imageSrc.blackboard}
                alt="Blackboard"
                className="hidden md:block w-auto h-auto object-contain"
            />
            <div className='absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[75%] h-[65%] flex items-center justify-center'>
                <motion.p
                    className="chalk-text text-3xl text-[#FFF9C4] tracking-widest break-words text-left px-4 py-2 max-w-full max-h-full overflow-auto leading-tight"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    {state.phrase}
                </motion.p>
            </div>
        </div>
    );
});

BlackboardPhrase.displayName = 'BlackboardPhrase';

export default BlackboardPhrase;