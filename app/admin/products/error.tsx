"use client";

type AdminProductsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminProductsError({ error, reset }: AdminProductsErrorProps) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "20px",
        border: "1px solid #e5e7eb",
        padding: "28px",
        display: "grid",
        gap: "14px",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "24px", color: "#111827" }}>
        Impossible de charger les produits
      </h2>
      <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.6 }}>
        Une erreur temporaire est survenue dans l&apos;espace admin. Réessayez
        maintenant. Si le problème persiste, contactez le support technique.
      </p>
      {error?.digest && (
        <p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>
          Référence erreur: {error.digest}
        </p>
      )}
      <div>
        <button
          type="button"
          onClick={reset}
          style={{
            border: "none",
            background: "#111827",
            color: "white",
            borderRadius: "10px",
            padding: "10px 16px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
