import { useCallback, useEffect } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

interface SpeechRecognitionProps {
  onResult: (transcript: string) => void;
  isActive: boolean;
  updateState: (state: any) => void;
}

const useSpeechRecognition = ({ onResult, isActive, updateState }: SpeechRecognitionProps) => {
  useSpeechRecognitionEvent("start", () => updateState({ isActive: true }));
  useSpeechRecognitionEvent("end", () => updateState({ isActive: false }));
  useSpeechRecognitionEvent("result", (event) => {
    const results = event.results;
    if (results && results.length > 0) {
      const latestResult = results[results.length - 1];
      if (latestResult && latestResult.transcript) {
        onResult(latestResult.transcript);
      }
    }
  });
  
  useSpeechRecognitionEvent("error", () => {
    updateState({ isActive: false });
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {}
  });
  
  const startListening = useCallback(async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        return;
      }
      ExpoSpeechRecognitionModule.start({
        lang: "fil-PH",
        interimResults: true,
        continuous: false,
        addsPunctuation: false,
        androidRecognitionServicePackage: "com.google.android.tts",
        iosVoiceProcessingEnabled: true,
      });
    } catch (error) {
      updateState({ isActive: false });
    }
  }, [updateState]);

  const stopListening = useCallback(async () => {
    try {
      if (isActive) {
        ExpoSpeechRecognitionModule.stop();
      }
    } catch {}
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (isActive) {
        try {
          ExpoSpeechRecognitionModule.stop();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      }
    };
  }, [isActive]);

  return {
    startListening,
    stopListening,
    isActive,
  };
};

export default useSpeechRecognition;