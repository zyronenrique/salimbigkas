import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocumentProxy } from "pdfjs-dist";
import { buildJobsFromText, createAudioForJob, extractTextFromPDFPage } from "../../utils/helpers";
import { AnimatePresence, motion } from "framer-motion";
import { imageSrc } from "../Icons/icons";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useAudioQueue } from "../Lesson/useAudioQueue";
import { useClassContext } from "../../hooks/classContext";

// Set workerSrc for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PDFViewer = memo(({ fileUrl }: { fileUrl: string }) => {
  const { setPageNumber: setNavPageNumber } = useClassContext();
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageText, setPageText] = useState<string>("");
  const [containerWidth, setContainerWidth] = useState<number>(window.innerWidth);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSpeed, setShowSpeed] = useState<boolean>(false);

  useEffect(() => {
    const measureWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    measureWidth();
    window.addEventListener("resize", measureWidth);
    return () => window.removeEventListener("resize", measureWidth);
  }, []);

  useEffect(() => {
    const extractText = async () => {
      if (!pdfDoc || numPages === 0) return;
      const plain = await extractTextFromPDFPage(pdfDoc, pageNumber);
      setPageText(plain);
      console.log("Extracted text for page", pageNumber, ":", plain);
    };
    extractText();
  }, [pdfDoc, numPages, pageNumber]);

  const { playQueue, pause, resume, stop, isPlaying, isPaused } = useAudioQueue(createAudioForJob);

  const handleSpeak = useCallback(async (speed: "normal" | "slow") => {
    const jobs = buildJobsFromText(pageText, speed === "slow" ? 0.7 : 1);
    await playQueue(jobs);
    setShowSpeed(false);
  }, [buildJobsFromText, pageText, playQueue]);

  useEffect(() => {
    stop();
  }, [pageNumber, stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  useEffect(() => {
    setPageNumber(1);
    setPdfDoc(null);
    setNumPages(0);
  }, [fileUrl]);

  return (
    <OverlayScrollbarsComponent
      options={{ scrollbars: { autoHide: "leave", autoHideDelay: 500 } }}
      defer
      className="w-full flex flex-col items-center overflow-y-auto bg-[#f8fafc]"
    >
      <div className="flex flex-col items-center justify-center">
        {fileUrl ? (
          <Document
            key={fileUrl}
            file={fileUrl}
            onLoadSuccess={(pdf: PDFDocumentProxy) => {
              setNumPages(pdf.numPages);
              setPdfDoc(pdf);
              setPageNumber(1);
              setNavPageNumber({
                page: 1,
                totalPages: pdf.numPages
              });
            }}
            loading={
              <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="chalk-text font-bold text-6xl">Loading PDF…</h1>
              </div>
            }
            className="w-full"
          >
            <div className="w-full relative">
              {(pdfDoc && numPages > 0 && pageNumber >= 1 && pageNumber <= numPages) ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pageNumber}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Page
                      key={`page_${pageNumber}`}
                      pageNumber={pageNumber}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      width={containerWidth}
                      className="shadow-lg rounded-lg bg-white"
                      error={
                        <div className="flex flex-col items-center justify-center h-screen">
                          <h1 className="font-bold text-4xl text-red-500">Failed to load page {pageNumber}</h1>
                        </div>
                      }
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center h-screen">
                  <h1 className="font-bold text-4xl text-gray-500">No page to display.</h1>
                </div>
              )}
              {pageText && (
                <>
                  {isPlaying ? (
                    <div className="fixed z-10 top-5 right-5 flex flex-row gap-4 items-center">
                      <motion.img 
                        loading="lazy"
                        src={!isPaused ? imageSrc.pause : imageSrc.play}
                        title={!isPaused ? "Pause Reading" : "Continue Reading"}
                        alt={!isPaused ? "Pause Reading" : "Continue Reading"}
                        className="inline size-12 object-contain"
                        onClick={() => { isPaused ? resume() : pause(); }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      />
                      <motion.img 
                        loading="lazy"
                        src={imageSrc.gameX}
                        title="Stop Reading"
                        className="inline size-10 object-contain"
                        onClick={stop}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      />
                    </div>
                  ):(
                    <>
                      <motion.img 
                        loading="lazy"
                        src={imageSrc.volume} 
                        title="Read Aloud"
                        alt="Read Aloud" 
                        className="fixed z-10 top-5 right-5 bg-transparent inline size-12 object-contain"
                        onClick={() => setShowSpeed(!showSpeed)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        data-joyride="lesson-speaker"
                      />
                      {showSpeed && (
                        <div className="fixed z-10 top-20 right-5 flex flex-col flex-grow gap-2 items-center bg-[#003311] border-4 border-[#8a3903] rounded-2xl p-4">
                          <motion.img
                            loading="lazy"
                            src={imageSrc.normalSpeed} 
                            title="Normal Speed"
                            alt="Normal Speed" 
                            className="inline size-14 bg-transparent object-contain"
                            onClick={() => handleSpeak("normal")}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          />
                          <motion.img 
                            loading="lazy"
                            src={imageSrc.slowSpeed} 
                            title="Slow Speed"
                            alt="Slow Speed" 
                            className="inline size-14 bg-transparent object-contain"
                            onClick={() => handleSpeak("slow")}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              {/* Page navigation */}
              <motion.button
                type="button"
                disabled={pageNumber <= 1}
                onClick={() => {
                  setPageNumber(pageNumber - 1);
                  setNavPageNumber({ page: pageNumber - 1, totalPages: numPages });
                }}
                className={`fixed top-1/2 left-2 z-50 bg-transparent ${pageNumber <= 1 ? "disabled:filter grayscale" : ""}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                data-joyride="previous-page"
              >
                <img loading="lazy" src={imageSrc.lessThan} alt="Previous Page" className="inline size-18 object-contain" />
              </motion.button>
              <motion.button
                type="button"
                disabled={pageNumber >= numPages}
                onClick={() => {
                  setPageNumber(pageNumber + 1);
                  setNavPageNumber({ page: pageNumber + 1, totalPages: numPages });
                }}
                className={`fixed top-1/2 right-2 z-50 bg-transparent ${pageNumber >= numPages ? "disabled:filter grayscale" : ""}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                data-joyride="next-page"
              >
                <img loading="lazy" src={imageSrc.greaterThan} alt="Next Page" className="inline size-18 object-contain" />
              </motion.button>
            </div>
          </Document>
        ) : (
          <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="font-bold text-4xl text-gray-500">No PDF file specified.</h1>
          </div>
        )}
      </div>
    </OverlayScrollbarsComponent>
  );
});

export default PDFViewer;