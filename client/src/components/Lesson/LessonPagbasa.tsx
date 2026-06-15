import { memo } from "react";
import PDFViewer from "../Class/PDFViewer";
import { useClassContext } from "../../hooks/classContext";

const LessonPagbasa = memo(() => {
  const { fileUrl } = useClassContext();
  if (!fileUrl) {
    return <p className="text-gray-600">No PDF file uploaded.</p>;
  }
  return <PDFViewer fileUrl={fileUrl} />;
});

export default LessonPagbasa;