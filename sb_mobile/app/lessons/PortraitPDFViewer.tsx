import React, { useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';

interface Props {
  fileUrl: string;
  setTotalPages: (num: number) => void;
}

const PortraitPDFViewer = ({ fileUrl, setTotalPages }: Props) => {
    // const [page, setPage] = useState(1);
    // const [numberOfPages, setNumberOfPages] = useState(1);

    const windowDims = Dimensions.get('window');
    const pdfWidth = windowDims.width;
    const pdfHeight = windowDims.height - 120;

    return (
        <>
            <Pdf
                trustAllCerts={false}
                source={{ uri: fileUrl, cache: true }}
                style={{ flex: 1, width: pdfWidth, height: pdfHeight, backgroundColor: 'transparent' }}
                enableAntialiasing={true}
                enableDoubleTapZoom={true}
                enableAnnotationRendering={true}
                scrollEnabled={true}
                singlePage={false}
                fitPolicy={0}
                onLoadComplete={(numberOfPages: number, filePath: string) => {
                    // setNumberOfPages(numberOfPages);
                    setTotalPages(numberOfPages);
                }}
                onPageChanged={(newPage: number, totalPages: number) => {
                    // setPage(newPage);
                    // setNumberOfPages(totalPages);
                    setTotalPages(totalPages);
                }}
                onError={e => {
                    console.log('PDF error:', e);
                }}
            />
            {/* <View style={{
                position: 'absolute',
                bottom: 16,
                alignSelf: 'center',
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 6,
            }}>
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
                    Page {page} of {numberOfPages}
                </Text>
            </View> */}
        </>
    );
};

export default PortraitPDFViewer;