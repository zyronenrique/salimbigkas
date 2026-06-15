import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ViewStyle } from 'react-native';
import Pdf from 'react-native-pdf';
import { buildJobsFromText, CreateAudioForJob } from '@/utils/helpers';
import { imageSrc } from '@/Icons/icons';
import { useAudioQueue } from '../../hooks/useAudioQueue';

interface Props {
  fileUrl: string;
  pageTexts: string[];
  totalPages: number;
}

const LandScapePDFViewer = ({ fileUrl, pageTexts, totalPages }: Props) => {
    const pageRef = useRef(1);
    const [page, setPage] = useState(1);
    const [showSpeed, setShowSpeed] = useState<boolean>(false);

    const { playQueue, pause, resume, stop, isPlaying, isPaused } = useAudioQueue(CreateAudioForJob);
    
    const goToPrevPage = useCallback(() => {
        setShowSpeed(false);
        if (pageRef.current > 1) {
            pageRef.current -= 1;
            setPage(pageRef.current);
        }
    }, []);

    const goToNextPage = useCallback(() => {
        setShowSpeed(false);
        if (pageRef.current < totalPages) {
            pageRef.current += 1;
            setPage(pageRef.current);
        }
    }, [totalPages]);

    const handlePageChanged = useCallback((newPage: number) => {
        pageRef.current = newPage;
        setPage(newPage);
    }, []);

    useEffect(() => {
      stop();
    }, [page]);

    const pageIndex = useMemo(() => pageRef.current - 1, [page]);
    
    const handleSpeak = useCallback(async (speed: "normal" | "slow") => {
        const idx = Math.max(0, Math.min(pageTexts.length - 1, (pageRef.current || 1) - 1));
        const text = pageTexts[idx] || "";
        if (!text.trim()) { setShowSpeed(false); return; }
        await stop();
        const jobs = buildJobsFromText(text, speed === "slow" ? 0.7 : 1.0);
        await playQueue(jobs);
        setShowSpeed(false);
    }, [pageTexts, playQueue, stop]);

    const prevButtonStyle: ViewStyle = useMemo(() => ({
        filter: page > 1 ? 'none' : 'grayscale(100%)',
        marginHorizontal: 12,
        justifyContent: 'center',
    }), [page]);

    const nextButtonStyle: ViewStyle = useMemo(() => ({
        filter: page >= totalPages ? 'grayscale(100%)' : 'none',
        marginHorizontal: 12,
        justifyContent: 'center',
    }), [page, totalPages]);

    return (
        <>
            <View style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                zIndex: 10,
                justifyContent: 'center',
                alignItems: 'center',
                transform: [{ translateY: -30 }],
            }}>
                <TouchableOpacity
                    style={prevButtonStyle}
                    onPress={() => page > 1 && goToPrevPage()}
                    disabled={page <= 1}
                >
                    <Image source={imageSrc.lessThan} style={{ width: 60, height: 60 }} resizeMode='contain' />
                </TouchableOpacity>
            </View>
            <Pdf
                trustAllCerts={false}
                source={{ uri: fileUrl, cache: true }}
                style={{ flex: 1, backgroundColor: 'transparent' }}
                enableAntialiasing={true}
                enableDoubleTapZoom={true}
                enableAnnotationRendering={true}
                scrollEnabled={true}
                page={pageRef.current}
                fitPolicy={0}
                onPageChanged={handlePageChanged}
                onError={e => {
                    console.log('PDF error:', e);
                }}
            />
            {pageTexts[pageIndex] && (
                <>
                    {isPlaying ? (
                        <View style={{ position: 'absolute', top: 30, right: 10, zIndex: 10, flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                            <TouchableOpacity onPress={() => (isPaused ? resume() : pause())}>
                                <Image source={isPaused ? imageSrc.play : imageSrc.pause} style={{ width: 40, height: 40 }} resizeMode='contain' />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={stop}>
                                <Image source={imageSrc.gameX} style={{ width: 40, height: 40 }} resizeMode='contain' />
                            </TouchableOpacity>
                        </View>
                    ): (
                        <>
                            <View style={{ position: 'absolute', top: 30, right: 10, zIndex: 10 }}>
                                <TouchableOpacity
                                    style={{ flex: 1 }}
                                    onPress={() => setShowSpeed(!showSpeed)}
                                    disabled={isPlaying && !isPaused}
                                >
                                    <Image source={imageSrc.volume} style={{ width: 40, height: 40 }} resizeMode='contain' />
                                </TouchableOpacity>
                            </View>
                            {showSpeed && (
                                <View style={{ position: 'absolute', top: 80, right: 10, zIndex: 50, backgroundColor: '#003311', borderWidth: 2, borderColor: '#8a3903', borderRadius: 16, padding: 10, alignItems: 'center', gap: 8 }}>
                                    <TouchableOpacity onPress={() => handleSpeak("normal")}>
                                        <Image source={imageSrc.normalSpeed} style={{ width: 60, height: 60 }} resizeMode='contain' />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleSpeak("slow")}>
                                        <Image source={imageSrc.slowSpeed} style={{ width: 60, height: 60 }} resizeMode='contain' />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}
                </>
            )}
            <View style={{
                position: 'absolute',
                top: '50%',
                right: 0,
                zIndex: 10,
                justifyContent: 'space-between',
                alignItems: 'center',
                transform: [{ translateY: -30 }],
            }}>
                <TouchableOpacity
                    style={nextButtonStyle}
                    onPress={goToNextPage}
                    disabled={page >= totalPages}
                >
                    <Image source={imageSrc.greaterThan} style={{ width: 60, height: 60 }} resizeMode='contain' />
                </TouchableOpacity>
            </View>
            <View style={{
                position: 'absolute',
                bottom: 16,
                alignSelf: 'center',
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 6,
            }}>
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
                    Page {page} of {totalPages}
                </Text>
            </View>
        </>
    );
};

export default LandScapePDFViewer;