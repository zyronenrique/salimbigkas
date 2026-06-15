import { getWordImages } from '@/utils/helpers';
import React, { memo } from 'react'
import { TouchableOpacity, Image } from 'react-native';

interface PlayBtnProps {
    disabled: boolean;
    onPress: () => void;
}

const PlayBtn = memo(({ disabled, onPress }: PlayBtnProps) => {
    return (
        <TouchableOpacity
            disabled={disabled}
            style={{
                position: 'absolute',
                top: '75%',
                left: '50%',
                flexDirection: 'row',
                transform: [{ translateX: -120 }, { translateY: -30 }],
                borderRadius: 5,
                padding: 10,
                backgroundColor: 'transparent',
            }}
            onPress={onPress}
        >
            {getWordImages("play", true).map((imageSrc, index) => (
                <Image
                    key={index}
                    source={imageSrc}
                    style={{
                        width: 60,
                        height: 60,
                        marginLeft: index > 0 ? -14 : 0,
                    }}
                    resizeMode='contain'
                />
            ))}
        </TouchableOpacity>
    )
});

export default PlayBtn;