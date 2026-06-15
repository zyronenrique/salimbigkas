import React, { useEffect, useState } from "react";
import PDFViewer from "./pdfViewer";
import { Text } from "react-native";
import { doExtractTextFromPDF } from "@/api/functions";

const LessonPagbasa = ({ fileUrl }: { fileUrl: string }) => {
  const [pageTexts, setPageTexts] = useState<string[]>([]);

  useEffect(() => {
    if (!fileUrl) return;
    (async () => {
      try {
        const res = await doExtractTextFromPDF(fileUrl) as any;
        setPageTexts(res.pageTexts || []);
      } catch {
        setPageTexts([]);
      }
    })();
  }, [fileUrl]);

  if (!fileUrl) {
    return <Text className="text-gray-600">No PDF file uploaded.</Text>;
  }

  return <PDFViewer fileUrl={fileUrl} pageTexts={pageTexts} />;
};

export default LessonPagbasa;