import { useClassContext } from '@/hooks/classContext';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { View, Button } from 'react-native';

export default function VideoScreen() {
    const { videoUrl } = useClassContext();
    
    const player = useVideoPlayer(videoUrl, player => {
        player.loop = true;
        player.play();
    });

    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

    return (
        <View style={{
            flex: 1,
            padding: 10,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 50,
        }}>
            <VideoView style={{
                width: 350,
                height: 275,
            }} player={player} allowsFullscreen allowsPictureInPicture />
            <View style={{ padding: 10 }}>
                <Button
                title={isPlaying ? 'Pause' : 'Play'}
                onPress={() => {
                    if (isPlaying) {
                    player.pause();
                    } else {
                    player.play();
                    }
                }}
                />
            </View>
        </View>
    );
};
