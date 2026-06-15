import PDFViewer from "../Class/PDFViewer";

const LessonGramatika = ({ fileUrls }: { fileUrls: any[] }) => {
  const gramatikaUrls = fileUrls?.[0]?.gramatikaUrls || [];
  const pdfs = gramatikaUrls.filter((url: string) => url.match(/\.(pdf)(\?|$)/i));
  if (pdfs.length === 0) {
    return <p className="text-gray-600">No PDF files uploaded.</p>;
  }
  return (
    <>
      {pdfs.map((url: string, idx: number) => (
        <PDFViewer key={idx} fileUrl={url} />
      ))}
    </>
  );
};

export default LessonGramatika;