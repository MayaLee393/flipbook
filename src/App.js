import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Book from "./components/book";
import Library from "./components/library";


export default function App() {
  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/flipbook/:pdfname" element={<Book />} />
        </Routes>
      </div>
    </Router>
  )
}