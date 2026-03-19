import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

const PAGE_HEIGHT = 580;

export default function Flipbook({ pdfName }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [skipValue, setSkipValue] = useState("");
  const [pageWidth, setPageWidth] = useState(400);
  const bookRef = useRef(null);
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (mobile) {
        // On mobile, fit a single page to the screen with some padding
        setPageWidth(Math.min(window.innerWidth - 32, 400));
      } else {
        setPageWidth(400);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const pdfUrl = `${process.env.PUBLIC_URL}/pdfs/${pdfName}.pdf`;

  const displayPage = isMobile ? currentPage + 1 : currentPage * 2 + 1;
  const displayPageEnd = isMobile
    ? currentPage + 1
    : Math.min(currentPage * 2 + 2, numPages || 0);

  const pageHeight = Math.round(PAGE_HEIGHT * (pageWidth / 400));

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

  const ArrowButton = ({ onClick, label, children }) => (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-12 h-12 rounded border-2 border-black text-black flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:bg-gray-200 hover:text-gray-500"
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col items-center font-serif px-4 py-8" ref={containerRef}>

      {/* Book — arrows on sides for desktop, hidden on mobile */}
      <div className="flex items-center gap-6">
        <div className="hidden md:block">
          <ArrowButton onClick={goPrev} label="Previous page">
            <ArrowLeft />
          </ArrowButton>
        </div>

        <div className="shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_#3a2e1e] rounded-sm">
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={
              <div
                className="flex items-center justify-center text-black text-lg"
                style={{ width: isMobile ? pageWidth : pageWidth * 2, height: pageHeight }}
              >
                Loading…
              </div>
            }
          >
            {numPages && (
              <HTMLFlipBook
                ref={bookRef}
                width={pageWidth}
                height={pageHeight}
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
                      width={pageWidth - 6}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            )}
          </Document>
        </div>

        <div className="hidden md:block">
          <ArrowButton onClick={goNext} label="Next page">
            <ArrowRight />
          </ArrowButton>
        </div>
      </div>

      {/* Controls bar */}
      {numPages && (
        <div className="mt-6 flex flex-col items-center gap-3">

          {/* Arrows on mobile — shown below book */}
          <div className="flex md:hidden items-center gap-6">
            <ArrowButton onClick={goPrev} label="Previous page">
              <ArrowLeft />
            </ArrowButton>
            <span className="text-sm text-black min-w-[100px] text-center">
              {displayPage}–{displayPageEnd} of {numPages}
            </span>
            <ArrowButton onClick={goNext} label="Next page">
              <ArrowRight />
            </ArrowButton>
          </div>

          {/* Page info — desktop only */}
          <div className="hidden md:flex items-center gap-4 text-black text-sm">
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

          {/* Go to page — mobile */}
          <div className="flex md:hidden items-center gap-3 text-black text-sm">
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

        </div>
      )}
    </div>
  );
}