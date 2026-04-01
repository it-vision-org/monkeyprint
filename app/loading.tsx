export default function AppLoading() {
  return (
    <>
      <style>{`
        @keyframes appLoadingSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        }}
        aria-live="polite"
        aria-busy="true"
      >
        <div style={{ display: "grid", gap: "14px", justifyItems: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "4px solid #d1fae5",
              borderTopColor: "#10b981",
              animation: "appLoadingSpin 0.8s linear infinite",
            }}
          />
          <p style={{ margin: 0, color: "#047857", fontWeight: 600 }}>
            Chargement...
          </p>
        </div>
      </div>
    </>
  );
}
