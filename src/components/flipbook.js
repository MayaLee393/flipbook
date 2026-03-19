import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PAGE_HEIGHT = 580;
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const PDF_OPTIONS = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

const ArrowButton = ({ onClick, label, children }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="w-12 h-12 rounded border-2 border-black text-black flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:bg-gray-200 active:bg-gray-300"
  >
    {children}
  </button>
);

const GoToPage = ({ numPages, onSkip }) => {
  const inputRef = useRef(null);
  const handle = () => {
    const target = parseInt(inputRef.current?.value, 10);
    if (!target || target < 1 || target > numPages) return;
    onSkip(target);
    if (inputRef.current) inputRef.current.value = "";
  };
  return (
    <div className="flex items-center gap-3 text-black text-sm">
      <span>Go to page</span>
      <input
        ref={inputRef}
        type="number"
        min={1}
        max={numPages}
        defaultValue=""
        onKeyDown={(e) => { if (e.key === "Enter") handle(); }}
        placeholder="…"
        className="w-14 bg-gray-100 border border-black text-black rounded px-2 py-1 text-sm text-center outline-none"
      />
      <button
        onClick={handle}
        className="bg-gray-100 border border-black text-black font-bold text-xs px-3 py-1.5 rounded hover:bg-gray-200"
      >
        Go
      </button>
    </div>
  );
};

const Spinner = ({ width, height }) => (
  <div
    className="flex items-center justify-center bg-white"
    style={{ width, height }}
  >
    <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
  </div>
);

export default function Flipbook({ pdfName }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageWidth, setPageWidth] = useState(400);
  const [error, setError] = useState(null);
  const [firstPageRendered, setFirstPageRendered] = useState(false);
  const bookRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      setPageWidth(mobile ? Math.min(window.innerWidth - 32, 400) : 400);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Reset when PDF changes
  useEffect(() => {
    setFirstPageRendered(false);
    setNumPages(null);
    setError(null);
  }, [pdfName]);

  const pdfUrl = `${process.env.PUBLIC_URL}/pdfs/${pdfName}.pdf`;
  const pageHeight = Math.round(PAGE_HEIGHT * (pageWidth / 400));

  const safariNext = () => setCurrentPage((p) => Math.min(p + 1, (numPages || 1) - 1));
  const safariPrev = () => setCurrentPage((p) => Math.max(p - 1, 0));
  const goNext = () => bookRef.current?.pageFlip().flipNext();
  const goPrev = () => bookRef.current?.pageFlip().flipPrev();

  const displayPage = isMobile ? currentPage + 1 : currentPage * 2 + 1;
  const displayPageEnd = isMobile
    ? currentPage + 1
    : Math.min(currentPage * 2 + 2, numPages || 0);

  const handleSkip = (target) => {
    if (isSafari) {
      setCurrentPage(target - 1);
    } else {
      const pageIndex = isMobile ? target - 1 : Math.floor((target - 1) / 2) * 2;
      bookRef.current?.pageFlip().turnToPage(pageIndex);
    }
  };

  if (isSafari) {
    return (
      <div className="flex flex-col items-center font-serif px-4 py-8 gap-6">
        <div className="relative">
          {!firstPageRendered && (
            <div className="absolute inset-0 z-10">
              <Spinner width={pageWidth} height={pageHeight} />
            </div>
          )}
          <div className="shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-black">
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={(e) => setError(e.message)}
              options={PDF_OPTIONS}
              loading={null}
            >
              {error && <p className="text-red-500 p-4">Error: {error}</p>}
              {numPages && (
                <Page
                  pageNumber={currentPage + 1}
                  width={pageWidth}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  onRenderSuccess={() => setFirstPageRendered(true)}
                />
              )}
              {!numPages && !error && <Spinner width={pageWidth} height={pageHeight} />}
            </Document>
          </div>
        </div>

        {numPages && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-6">
              <ArrowButton onClick={safariPrev} label="Previous page">
                <ArrowLeft />
              </ArrowButton>
              <span className="text-sm text-black min-w-[100px] text-center">
                {currentPage + 1} of {numPages}
              </span>
              <ArrowButton onClick={safariNext} label="Next page">
                <ArrowRight />
              </ArrowButton>
            </div>
            <GoToPage numPages={numPages} onSkip={handleSkip} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center font-serif px-4 py-8">
      <div className="flex items-center gap-6">
        <div className="hidden md:block">
          <ArrowButton onClick={goPrev} label="Previous page"><ArrowLeft /></ArrowButton>
        </div>

        <div className="relative shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_#3a2e1e] rounded-sm">
          {!firstPageRendered && (
            <div className="absolute inset-0 z-10 rounded-sm overflow-hidden">
              <Spinner
                width={isMobile ? pageWidth : pageWidth * 2}
                height={pageHeight}
              />
            </div>
          )}
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(e) => setError(e.message)}
            options={PDF_OPTIONS}
            loading={null}
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
                      onRenderSuccess={i === 0 ? () => setFirstPageRendered(true) : undefined}
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            )}
            {!numPages && !error && (
              <Spinner
                width={isMobile ? pageWidth : pageWidth * 2}
                height={pageHeight}
              />
            )}
          </Document>
        </div>

        <div className="hidden md:block">
          <ArrowButton onClick={goNext} label="Next page"><ArrowRight /></ArrowButton>
        </div>
      </div>

      {numPages && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex md:hidden items-center gap-6">
            <ArrowButton onClick={goPrev} label="Previous page"><ArrowLeft /></ArrowButton>
            <span className="text-sm text-black min-w-[100px] text-center">
              {displayPage}–{displayPageEnd} of {numPages}
            </span>
            <ArrowButton onClick={goNext} label="Next page"><ArrowRight /></ArrowButton>
          </div>

          <div className="hidden md:flex items-center gap-4 text-black text-sm">
            <span className="min-w-[120px] text-center tracking-wide">
              {displayPage}–{displayPageEnd} of {numPages}
            </span>
            <span>|</span>
            <GoToPage numPages={numPages} onSkip={handleSkip} />
          </div>

          <div className="flex md:hidden">
            <GoToPage numPages={numPages} onSkip={handleSkip} />
          </div>
        </div>
      )}
    </div>
  );
}