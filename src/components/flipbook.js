import { useParams } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import { useState, useRef, useEffect } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

const PAGE_WIDTH = 400;
const PAGE_HEIGHT = 580;

const styles = {
  root: {
    minHeight: "100vh",
    background: "#1a1612",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Georgia', serif",
    padding: "32px 16px",
  },
  bookContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  arrowBtn: {
    background: "none",
    border: "2px solid #c9a96e",
    color: "#c9a96e",
    borderRadius: "50%",
    width: "48px",
    height: "48px",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    flexShrink: 0,
  },
  bookWrapper: {
    boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px #3a2e1e",
    borderRadius: "2px",
  },
  pageDiv: {
    background: "#fff",
    border: "3px solid #8b6914",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  controls: {
    marginTop: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    color: "#c9a96e",
    fontSize: "15px",
    fontFamily: "'Georgia', serif",
  },
  pageInfo: {
    color: "#c9a96e",
    fontSize: "14px",
    letterSpacing: "0.05em",
    minWidth: "120px",
    textAlign: "center",
  },
  skipInput: {
    width: "52px",
    background: "#2a2218",
    border: "1px solid #c9a96e",
    color: "#f0e0b0",
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "14px",
    textAlign: "center",
    fontFamily: "'Georgia', serif",
    outline: "none",
  },
  skipBtn: {
    background: "#c9a96e",
    border: "none",
    color: "#1a1612",
    borderRadius: "4px",
    padding: "5px 12px",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    fontWeight: "bold",
    transition: "background 0.2s",
  },
  loading: {
    color: "#c9a96e",
    fontSize: "18px",
    fontFamily: "'Georgia', serif",
    letterSpacing: "0.1em",
  },
};

export default function Flipbook() {
  const { pdfname } = useParams();
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

  const pdfUrl = `${process.env.PUBLIC_URL}/pdfs/${pdfname}.pdf`;
  console.log(pdfUrl)

  const displayPage = isMobile ? currentPage + 1 : currentPage * 2 + 1;
  const displayPageEnd = isMobile ? currentPage + 1 : Math.min(currentPage * 2 + 2, numPages || 0);

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
    <div style={styles.root}>
      <div style={styles.bookContainer}>
        {/* Left arrow */}
        <button
          style={styles.arrowBtn}
          onClick={goPrev}
          onMouseEnter={e => { e.currentTarget.style.background = "#c9a96e"; e.currentTarget.style.color = "#1a1612"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#c9a96e"; }}
          aria-label="Previous page"
        >
          ‹
        </button>

        {/* Book */}
        <div style={styles.bookWrapper}>
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div style={{ ...styles.loading, width: isMobile ? PAGE_WIDTH : PAGE_WIDTH * 2, height: PAGE_HEIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>Loading…</div>}
          >
            {numPages && (
              <HTMLFlipBook
                ref={bookRef}
                width={PAGE_WIDTH}
                height={PAGE_HEIGHT}
                showCover={false}
                usePortrait={isMobile}
                onFlip={(e) => setCurrentPage(isMobile ? e.data : Math.floor(e.data / 2))}
                style={{ background: "transparent" }}
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <div key={i} style={styles.pageDiv}>
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

        {/* Right arrow */}
        <button
          style={styles.arrowBtn}
          onClick={goNext}
          onMouseEnter={e => { e.currentTarget.style.background = "#c9a96e"; e.currentTarget.style.color = "#1a1612"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#c9a96e"; }}
          aria-label="Next page"
        >
          ›
        </button>
      </div>

      {/* Controls bar */}
      {numPages && (
        <div style={styles.controls}>
          <span style={styles.pageInfo}>
            {displayPage}–{displayPageEnd} of {numPages}
          </span>

          <span style={{ color: "#5a4a2a", margin: "0 4px" }}>|</span>

          <span style={{ color: "#a08040", fontSize: "13px" }}>Go to page</span>
          <input
            style={styles.skipInput}
            type="number"
            min={1}
            max={numPages}
            value={skipValue}
            onChange={e => setSkipValue(e.target.value)}
            onKeyDown={handleSkipKey}
            placeholder="…"
          />
          <button
            style={styles.skipBtn}
            onClick={handleSkip}
            onMouseEnter={e => e.currentTarget.style.background = "#e0b97a"}
            onMouseLeave={e => e.currentTarget.style.background = "#c9a96e"}
          >
            Go
          </button>
        </div>
      )}
    </div>
  );
}