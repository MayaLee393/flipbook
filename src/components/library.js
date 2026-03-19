import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

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
    <div style={{ textAlign: 'center' }}>
      <h2>📚 Library</h2>
      {loading && <p>Loading…</p>}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {books.map((book) => (
          <Link
            key={book.pdfName}
            to={`/flipbook/${book.pdfName}`}
            style={{
              border: '1px solid #ccc',
              padding: '20px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'black',
              width: '150px'
            }}
          >
            <div style={{ fontSize: '40px' }}>📖</div>
            <div>{book.title}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}