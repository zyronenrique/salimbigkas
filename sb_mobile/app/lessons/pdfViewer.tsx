import React, { useEffect, useState } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import LandScapePDFViewer from './LandScapePDFViewer';
import PortraitPDFViewer from './PortraitPDFViewer';
import { StatusBar } from 'expo-status-bar';

interface PDFViewerProps {
  fileUrl: string;
  pageTexts: string[];
}

const PDFViewer = ({ fileUrl, pageTexts }: PDFViewerProps) => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    ScreenOrientation.unlockAsync();
    const getOrientation = async () => {
      const orientation = await ScreenOrientation.getOrientationAsync();
      setIsLandscape(
        orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      );
    };
    getOrientation();
    const subscription = ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
      const orientation = orientationInfo.orientation;
      setIsLandscape(
        orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      );
    });
    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      {isLandscape ? (
        <LandScapePDFViewer
          fileUrl={fileUrl}
          pageTexts={pageTexts}
          totalPages={totalPages}
        />
      ) : (
        <PortraitPDFViewer
          fileUrl={fileUrl}
          setTotalPages={setTotalPages}
        />
      )}
    </>
  );
};

export default PDFViewer;