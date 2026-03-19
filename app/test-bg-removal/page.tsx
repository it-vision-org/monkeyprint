"use client";

import { useState, useRef, useCallback } from "react";

type Method = "rembg" | "checkerboard";

export default function TestBgRemoval() {
  const [originalSrc, setOriginalSrc] = useState<string>("/image-fake.jpg");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<Method>("rembg");
  const [tolerance, setTolerance] = useState(45);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleServerRemoval = useCallback(
    async (endpoint: string, imageSrc: string, file: File | null) => {
      setLoading(true);
      setError(null);
      setResultSrc(null);
      setProgress("Removing background...");

      try {
        const formData = new FormData();

        if (file) {
          formData.append("image", file);
        } else {
          const resp = await fetch(imageSrc);
          const blob = await resp.blob();
          formData.append("image", blob, "image.jpg");
        }

        if (endpoint === "/api/remove-checkerboard") {
          formData.append("tolerance", String(tolerance));
        }

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Server error");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setResultSrc(url);
        setProgress("");
      } catch (err) {
        console.error("Background removal failed:", err);
        setError(
          err instanceof Error ? err.message : "Background removal failed"
        );
        setProgress("");
      } finally {
        setLoading(false);
      }
    },
    [tolerance]
  );

  const handleRemove = () => {
    if (method === "rembg") {
      handleServerRemoval("/api/remove-bg", originalSrc, originalFile);
    } else {
      handleServerRemoval("/api/remove-checkerboard", originalSrc, originalFile);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalSrc(url);
      setOriginalFile(file);
      setResultSrc(null);
    }
  };

  const handleDownload = () => {
    if (!resultSrc) return;
    const a = document.createElement("a");
    a.href = resultSrc;
    a.download = "removed-bg.png";
    a.click();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          Background Removal Test
        </h1>
        <p style={{ color: "#888", marginBottom: "2rem" }}>
          Test rembg (AI model, remove.bg quality) vs checkerboard removal
        </p>

        {/* Method selector */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <button
            onClick={() => setMethod("rembg")}
            style={{
              padding: "0.6rem 1.2rem",
              background: method === "rembg" ? "#7c3aed" : "#1a1a1a",
              color: "#fff",
              border:
                method === "rembg"
                  ? "2px solid #7c3aed"
                  : "2px solid #333",
              borderRadius: 8,
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Rembg (AI - Best Quality)
          </button>
          <button
            onClick={() => setMethod("checkerboard")}
            style={{
              padding: "0.6rem 1.2rem",
              background: method === "checkerboard" ? "#7c3aed" : "#1a1a1a",
              color: "#fff",
              border:
                method === "checkerboard"
                  ? "2px solid #7c3aed"
                  : "2px solid #333",
              borderRadius: 8,
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Checkerboard Removal
          </button>
        </div>

        {/* Tolerance slider for checkerboard mode */}
        {method === "checkerboard" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                color: "#aaa",
                marginBottom: "0.5rem",
              }}
            >
              Tolerance: {tolerance} (lower = more precise, higher = more
              aggressive)
            </label>
            <input
              type="range"
              min={15}
              max={80}
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              style={{ width: 300 }}
            />
          </div>
        )}

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleRemove}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              background: loading ? "#333" : "#7c3aed",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: "1rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Processing..." : "Remove Background"}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#222",
              color: "#fff",
              border: "1px solid #444",
              borderRadius: 8,
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Upload Different Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />

          {resultSrc && (
            <button
              onClick={handleDownload}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Download Result (PNG)
            </button>
          )}
        </div>

        {/* Progress / Error */}
        {progress && (
          <div
            style={{
              marginBottom: "1rem",
              color: "#a78bfa",
              fontSize: "0.95rem",
            }}
          >
            {progress}
          </div>
        )}
        {error && (
          <div
            style={{
              marginBottom: "1rem",
              color: "#ef4444",
              fontSize: "0.95rem",
            }}
          >
            Error: {error}
          </div>
        )}

        {/* Image comparison */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: resultSrc ? "1fr 1fr" : "1fr",
            gap: "2rem",
          }}
        >
          {/* Original */}
          <div>
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "0.75rem",
                color: "#ccc",
              }}
            >
              Original
            </h2>
            <div
              style={{
                background:
                  "repeating-conic-gradient(#222 0% 25%, #1a1a1a 0% 50%) 50% / 20px 20px",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #333",
              }}
            >
              <img
                src={originalSrc}
                alt="Original"
                style={{ width: "100%", display: "block" }}
              />
            </div>
          </div>

          {/* Result */}
          {resultSrc && (
            <div>
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "#ccc",
                }}
              >
                Background Removed
              </h2>
              <div
                style={{
                  background:
                    "repeating-conic-gradient(#444 0% 25%, #333 0% 50%) 50% / 20px 20px",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #333",
                }}
              >
                <img
                  src={resultSrc}
                  alt="Result"
                  style={{ width: "100%", display: "block" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
