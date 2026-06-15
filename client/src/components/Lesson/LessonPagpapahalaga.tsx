import PDFViewer from "../Class/PDFViewer";

const LessonPagpapahalaga = ({ fileUrls }: { fileUrls: any[] }) => {
  const pagpapahalagaUrls = fileUrls?.[0]?.pagpapahalagaUrls || [];
  const pdfs = pagpapahalagaUrls.filter((url: string) => url.match(/\.(pdf)(\?|$)/i));
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

export default LessonPagpapahalaga;
