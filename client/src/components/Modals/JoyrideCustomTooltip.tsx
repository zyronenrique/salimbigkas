import { TooltipRenderProps } from 'react-joyride';
import { imageSrc } from '../Icons/icons';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const JoyrideCustomTooltip = (props: TooltipRenderProps) => {
    const { backProps, closeProps, continuous, index, primaryProps, skipProps, step, tooltipProps } = props;
    
    return (
        <div className="flex-1 relative" {...tooltipProps}>
            <img loading="lazy" src={imageSrc.robotInstruction} alt="Robot Instruction" className="absolute top-[75%] -left-20 z-10 w-30 transform -translate-y-1/2 object-contain" />
            <img
                loading="lazy"
                src={imageSrc.blackboardMode}
                alt="Blackboard Mode"
                className={`block h-72 w-full object-contain transition-all duration-300 ease-in-out`}
            />
            <div className='absolute inset-0 text-white px-16 py-16 text-justify flex flex-col items-center justify-between bg-transparent transition-colors duration-300 ease-in-out'>
                <button className="text-white w-full flex items-center justify-end" {...closeProps}>
                    <X size={24} />
                </button>
                {step.title && <h4 className="tooltip__title">{step.title}</h4>}
                <div className="text-lg">{step.content}</div>
                <div className="flex w-full justify-between gap-2 mt-4">
                    <motion.button
                        className="tooltip__button" {...skipProps}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>Itigil</span>
                    </motion.button>
                    <div className="flex gap-4">
                        {index > 0 && (
                            <motion.button
                                className="tooltip__button" {...backProps}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>Bumalik</span>
                            </motion.button>
                        )}
                        {continuous && (
                            <motion.button
                                className="tooltip__button tooltip__button--primary" {...primaryProps}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>Susunod</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JoyrideCustomTooltip