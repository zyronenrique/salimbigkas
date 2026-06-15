import React, { memo } from 'react'
import { View, Image, TouchableOpacity } from 'react-native';
import { imageSrc } from '@/Icons/icons';
import { getWordImages } from '@/utils/helpers';

interface BumalikBtnProps {
    disabled?: boolean;
    style?: object;
    onPress: () => void;
    size: number;
}

const BumalikBtn = memo(({ disabled, style, onPress, size }: BumalikBtnProps) => {

    const defaultStyle = {
        position: 'absolute',
        zIndex: 10,
        top: 20,
        left: 20,
        height: 50,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    };

    return (
        <TouchableOpacity
            disabled={disabled}
            style={ style ? style : defaultStyle }
            accessibilityLabel="Back"
            onPress={onPress}
        >
            <Image source={imageSrc.back} style={{ width: size, height: size }} resizeMode='contain' />
            <View style={{ flexDirection: "row", backgroundColor: 'transparent' }}>
                {getWordImages(`bumalik`, true).map((imageSrc, index) => (
                    <Image
                        key={index}
                        source={imageSrc || ""}
                        style={{ 
                            width: size, 
                            height: size, 
                            resizeMode: 'contain', 
                            marginLeft: 
                                index > 0 && index <= 1 
                                    ? -4
                                    : index > 1 && index <= 2
                                        ? -1
                                        : index > 2 && index <= 3
                                            ? -2
                                            : index > 3 && index <= 4
                                                ? -6
                                                : index > 4 && index <= 5
                                                    ? -10
                                                    : index > 5
                                                        ? -8
                                                        : 0 
                        }}
                    />
                ))}
            </View>
        </TouchableOpacity>
    )
});

export default BumalikBtn;