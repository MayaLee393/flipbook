import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

const PAGE_WIDTH = 400;
const PAGE_HEIGHT = 580;

export default function Flipbook({ pdfName }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [skipValue, setSkipValue] = useState("");
  const bookRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const pdfUrl = `${process.env.PUBLIC_URL}/pdfs/${pdfName}.pdf`;
  console.log(pdfUrl)


  const displayPage = isMobile ? currentPage + 1 : currentPage * 2 + 1;
  const displayPageEnd = isMobile
    ? currentPage + 1
    : Math.min(currentPage * 2 + 2, numPages || 0);

  const goNext = () => bookRef.current?.pageFlip().flipNext();
  const goPrev = () => bookRef.current?.pageFlip().flipPrev();

  const handleSkip = () => {
    const target = parseInt(skipValue, 10);
    if (!target || target < 1 || target > (numPages || 1)) return;
    const pageIndex = isMobile ? target - 1 : Math.floor((target - 1) / 2) * 2;
    bookRef.current?.pageFlip().turnToPage(pageIndex);
    setSkipValue("");
  };

  const handleSkipKey = (e) => {
    if (e.key === "Enter") handleSkip();
  };

  return (
    <div className="flex flex-col items-center font-serif px-4 py-8">
      <div className="flex items-center gap-6">
        <button
          onClick={goPrev}
          aria-label="Previous page"
          className="w-12 h-12 rounded border-2 border-black text-black text-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:bg-gray-200 hover:text-gray-500"
        >
          <ArrowLeft />
        </button>

        <div className="shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_#3a2e1e] rounded-sm">
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={
              <div
                className="flex items-center justify-center text-black text-lg"
                style={{ width: isMobile ? PAGE_WIDTH : PAGE_WIDTH * 2, height: PAGE_HEIGHT }}
              >
                Loading…
              </div>
            }
          >
            {numPages && (
              <HTMLFlipBook
                ref={bookRef}
                width={PAGE_WIDTH}
                height={PAGE_HEIGHT}
                showCover={false}
                usePortrait={isMobile}
                onFlip={(e) =>
                  setCurrentPage(isMobile ? e.data : Math.floor(e.data / 2))
                }
                style={{ background: "transparent" }}
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <div key={i} className="bg-white border border-black box-border overflow-hidden">
                    <Page
                      pageNumber={i + 1}
                      width={PAGE_WIDTH - 6}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            )}
          </Document>
        </div>

        <button
          onClick={goNext}
          aria-label="Next page"
          className="w-12 h-12 rounded border-2 border-black text-black text-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:bg-gray-200 hover:text-gray-500"
        >
          <ArrowRight />
        </button>
      </div>

      {numPages && (
        <div className="mt-6 flex items-center gap-4 text-black">
          <span className="min-w-[120px] text-center tracking-wide">
            {displayPage}–{displayPageEnd} of {numPages}
          </span>
          <span>|</span>
          <span>Go to page</span>
          <input
            type="number"
            min={1}
            max={numPages}
            value={skipValue}
            onChange={(e) => setSkipValue(e.target.value)}
            onKeyDown={handleSkipKey}
            placeholder="…"
            className="w-14 bg-gray-100 border border-black text-black rounded px-2 py-1 text-sm text-center outline-none"
          />
          <button
            onClick={handleSkip}
            className="bg-gray-100 border border-black text-black font-bold text-xs px-3 py-1.5 rounded transition-colors duration-200 hover:bg-gray-200"
          >
            Go
          </button>
        </div>
      )}
    </div>
  );
}