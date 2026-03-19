import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Flipbook from "./flipbook";

export default function Book() {
  const { pdfname } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [title, setTitle] = useState(state?.title ?? null);

  useEffect(() => {
    if (title) return;
    fetch(`${process.env.PUBLIC_URL}/pdfs/manifest.json`)
      .then(r => r.json())
      .then(data => {
        const match = data.find(b => b.pdfName === pdfname);
        setTitle(match?.title ?? pdfname?.replace(/-/g, " "));
      })
      .catch(() => setTitle(pdfname?.replace(/-/g, " ")));
  }, [pdfname]);

  useEffect(() => {
    document.title = title ?? "Flipbook";
    return () => { document.title = "Flipbook"; }; // reset on unmount
  }, [title]);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-600 hover:text-black transition-colors"
        >
          ← Back to Library
        </button>
        <h2 className="text-lg font-semibold">
          {title ?? pdfname?.replace(/-/g, " ")}
        </h2>
        <div className="w-24" />
      </div>
      <Flipbook pdfName={pdfname} />
    </div>
  );
}