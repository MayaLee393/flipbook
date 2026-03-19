import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

function BookThumbnail({ pdfName }) {
  return (
    <div className="w-full overflow-hidden rounded-md ">
      <Document
        file={`${process.env.PUBLIC_URL}/pdfs/${pdfName}.pdf`}
        loading={
          <div className="w-[150px] h-[200px] bg-gray-200 animate-pulse rounded-md" />
        }
      >
        <Page
          pageNumber={1}
          width={150}
          renderAnnotationLayer={false}
          renderTextLayer={false}
        />
      </Document>
    </div>
  )
}

export default function Library() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/pdfs/manifest.json`)
      .then(r => r.json())
      .then(data => { setBooks(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4">
      <h2 className="text-3xl text-black mb-8">Library</h2>

      {loading && (
        <p className="text-black animate-pulse">Loading…</p>
      )}

      <div className="flex flex-wrap justify-center gap-6">
        {books.map((book) => (
          <Link
            key={book.pdfName}
            to={`/flipbook/${book.pdfName}`}
            state={{ title: book.title }}
            className="flex flex-col items-center w-[200px] p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-100 hover:shadow-[0_0_16px_rgba(000,000,110,0.2)] transition-all duration-200 text-black no-underline group"
          >
            <BookThumbnail pdfName={book.pdfName} />
            <span className="mt-3 text-sm text-center text-black transition-colors">
              {book.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}