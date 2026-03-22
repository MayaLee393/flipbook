import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Flipbook from "./flipbook";

export default function Book() {
  const { pdfname } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [title, setTitle] = useState(state?.title ?? null);
  const [version, setVersion] = useState(state?.version ?? null);

  useEffect(() => {
    // Only fetch if we're missing title or version (i.e. direct link)
    if (title && version !== null) return;
    fetch(`${process.env.PUBLIC_URL}/pdfs/manifest.json`)
      .then(r => r.json())
      .then(data => {
        const match = data.find(b => b.pdfName === pdfname);
        setTitle(match?.title ?? pdfname?.replace(/-/g, " "));
        setVersion(match?.version ?? 1);
      })
      .catch(() => {
        setTitle(pdfname?.replace(/-/g, " "));
        setVersion(1);
      });
  }, [pdfname]);

  useEffect(() => {
    document.title = title ?? "Flipbook";
    return () => { document.title = "Flipbook"; };
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
      {/* Wait until version is resolved before rendering Flipbook */}
      {version !== null && <Flipbook pdfName={pdfname} version={version} />}
    </div>
  );
}