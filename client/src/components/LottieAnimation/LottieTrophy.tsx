import Lottie from "lottie-react";
import confetti from "../../assets/lottie/Confetti.json";
import trophyAnimation from "../../assets/lottie/Trophy.json";
import { SpinLoadingWhite } from "../Icons/icons";

const LottieTrophy = () => {
    return (
        <div className="relative flex items-center justify-center w-full h-full">
            <Lottie
                animationData={confetti}
                loop={true}
                className='absolute inset-0 w-full h-full z-0 pointer-events-none'
            />
            <Lottie
                animationData={trophyAnimation}
                loop={false}
                className='relative z-10 md:w-[500px] md:h-[500px] sm:w-[300px] sm:h-[300px]'
            />
            <div className="absolute bottom-10 flex items-center justify-center z-20 gap-4">
                <SpinLoadingWhite size={12} />
                <h2 className="text-white text-2xl font-bold text-center">Calculating Results...</h2>
            </div>
        </div>
    )
}

export default LottieTrophy