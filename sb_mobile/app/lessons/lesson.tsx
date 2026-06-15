import { View, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router';
import LessonPagbasa from './lessonPagbasa';
import { useClassContext } from '@/hooks/classContext';
import * as ScreenOrientation from 'expo-screen-orientation';
import { imageSrc } from '@/Icons/icons';
import { FAB, Portal } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import useLessonTimeTracker from './useLessonTimeTracker';
import { useAuth } from '@/hooks/authContext';

const Lesson = () => {
    const router = useRouter();
    const { currentUser } = useAuth();
    const { selectedLesson } = useClassContext();
    const [isPortrait, setIsPortrait] = useState(true);
    const [state, setState] = useState({ open: false });
    const onStateChange = ({ open }: { open: boolean }) => setState({ open });
    const { open } = state;
    const [label, setLabel] = useState('')
    const [activePagbasaIdx, setActivePagbasaIdx] = useState(0);

    useEffect(() => {
        const checkOrientation = async () => {
            const orientation = await ScreenOrientation.getOrientationAsync();
            setIsPortrait(
                orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
                orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
            );
        };
        checkOrientation();
        const subscription = ScreenOrientation.addOrientationChangeListener(() => {
            checkOrientation();
        });
        return () => {
            ScreenOrientation.removeOrientationChangeListener(subscription);
        };
    }, []);

    const pagbasaUrls = selectedLesson.fileUrls
        ?.map((item: any) => item || [])
        .flat()
        .filter((url: string) => typeof url === "string" && url.match(/\.(pdf)(\?|$)/i)) || [];
    
    useLessonTimeTracker({
        userId: currentUser?.uid,
        yunitId: selectedLesson.yunitId,
        lessonId: selectedLesson.id,
        gradeLevel: selectedLesson.gradeLevel,
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <TouchableOpacity 
                style={{ position: 'absolute', top: 30, left: 12, zIndex: 1 }}
                onPress={() => {
                    router.back();
                    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
                }}
            >
                <Image source={imageSrc.gameX} style={{ width: 40, height: 40 }} resizeMode='contain' />
            </TouchableOpacity>
            {isPortrait && (
                <TouchableOpacity
                    style={{ position: 'absolute', top: 30, right: 12, zIndex: 1 }}
                    onPress={() => router.navigate('/lessons/modal')}
                >
                    <Image source={imageSrc.gameInfo} style={{ width: 40, height: 40 }} resizeMode='contain' />
                </TouchableOpacity>
            )}
            <Portal>
                <FAB.Group
                    open={open}
                    visible={true}
                    icon={() => <Image source={imageSrc.book} style={{ width: 24, height: 24 }} resizeMode='contain' />}
                    label={label}
                    color='white'
                    fabStyle={{ backgroundColor: '#003311', borderWidth: 4, borderColor: '#8a3903' }}
                    actions={[
                        ...pagbasaUrls.map((url: string, idx: number) => ({
                            icon: 'file-pdf-box',
                            label: `Pagbasa ${idx + 1}`,
                            size: 'medium',
                            color: 'white',
                            style: { backgroundColor: '#003311', borderWidth: 4, borderColor: '#8a3903' },
                            key: `pagbasa-${idx}`,
                            onPress: () => setActivePagbasaIdx(idx),
                        })),
                        {
                            icon:() => <MaterialIcons name="video-library" size={24} color="white" />,
                            style: { backgroundColor: '#003311', borderWidth: 4, borderColor: '#8a3903' },
                            label: 'Videos',
                            size: 'medium',
                            color: 'white',
                            key: 'videos',
                            onPress: () => router.navigate('/lessons/lessonFiles'),
                        },
                    ]}
                    onStateChange={onStateChange}
                    onLongPress={() => {
                        setLabel(label === '' ? 'Lesson Files' : '')
                    }}
                    onPress={() => {
                        if (open) {
                            // do something if the speed dial is open
                        }
                    }}
                />
            </Portal>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flex: 1 }}>
                {pagbasaUrls.length > 0 && (
                    <LessonPagbasa fileUrl={pagbasaUrls[activePagbasaIdx]} />
                )}
            </View>
        </SafeAreaView>
    );
};

export default Lesson;