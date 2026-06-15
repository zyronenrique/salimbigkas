import { useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import CustomToast from '../Toast/CustomToast';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeechRecognition = (onResult: (transcript: string) => void) => {
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  
  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(<CustomToast title="Error" subtitle="Speech Recognition not supported." />);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fil-PH";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(" ")
        .trim();
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        toast.error(<CustomToast title="Error" subtitle="Speech recognition failed." />);
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      toast.error(<CustomToast title="Error" subtitle="Failed to start speech recognition." />);
    }
  }, [onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  return { startListening, stopListening };
};
