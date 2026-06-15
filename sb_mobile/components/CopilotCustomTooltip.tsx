import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { imageSrc } from '@/Icons/icons';
import {
    TooltipProps,
    useCopilot,
} from "react-native-copilot";

const CopilotCustomTooltip = ({ labels }: TooltipProps) => {
    const { isFirstStep, isLastStep, goToNext, goToNth, goToPrev, stop, currentStep } = useCopilot();
    
    const handleStop = async () => {
        await stop();
    };
    const handleNext = async () => {
        await goToNext();
    };
    const handlePrev = async () => {
        await goToPrev();
    };

    return (
        <View style={styles.container}>
            <View style={styles.blackboardContainer}>
                <Image
                    source={imageSrc.blackboardMode}
                    alt="Blackboard Mode"
                    style={styles.blackboardImage}
                    resizeMode='contain'
                />
                <View style={styles.textContainer}>
                    <Text style={styles.stepText} testID="stepDescription">
                        {currentStep?.text}
                    </Text>
                    <View style={styles.buttonContainer}>
                        {!isLastStep ? (
                            <TouchableOpacity onPress={handleStop} >
                                <Text style={styles.buttonText}>
                                    {labels.skip}
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                        {!isFirstStep ? (
                            <TouchableOpacity onPress={handlePrev} >
                                <Text style={styles.buttonText}>
                                    {labels.previous}
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                        {!isLastStep ? (
                            <TouchableOpacity onPress={handleNext} >
                                <Text style={styles.buttonText}>
                                    {labels.next}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={handleStop} >
                                <Text style={styles.buttonText}>
                                    {labels.finish}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
            <Image 
                source={imageSrc.robotInstruction} 
                alt="Robot Instruction" 
                style={styles.robotImage}
                resizeMode='contain'
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 460,
        height: 260,
        position: 'relative',
        backgroundColor: 'transparent',
        alignItems: 'center',
    },
    blackboardContainer: {
        position: 'relative',
        width: 400,
        height: 240,
    },
    blackboardImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    textContainer: {
        position: 'absolute',
        top: '20%',
        left: '14%',
        right: '14%',
        bottom: '20%',
        justifyContent: 'center',
        paddingHorizontal: 15,
    },
    stepText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        flexWrap: 'wrap',
        lineHeight: 24,
    },
    robotImage: {
        position: 'absolute',
        top: 120,
        left: -30,
        width: 130,
        height: 130,
        zIndex: 10,
    },
    buttonContainer: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '900',
    },
});

export default CopilotCustomTooltip;