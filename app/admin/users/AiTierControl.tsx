"use client";

import { useState } from "react";

type Props = {
  userId: string;
  initialTier: "FREE" | "PREMIUM";
  initialLimit: number | null;
};

export default function AiTierControl({ userId, initialTier, initialLimit }: Props) {
  const [tier, setTier] = useState(initialTier);
  const [limit, setLimit] = useState<string>(initialLimit != null ? String(initialLimit) : "");
  const [saving, setSaving] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const toggle = async (newTier: "FREE" | "PREMIUM") => {
    if (newTier === "PREMIUM" && !showInput) {
      setShowInput(true);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ai-tier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiTier: newTier,
          aiPremiumLimit: newTier === "PREMIUM" && limit ? parseInt(limit) : null,
        }),
      });
      if (res.ok) {
        setTier(newTier);
        setShowInput(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (showInput) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="Limite/jour"
          min="1"
          style={{
            width: 90,
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
        />
        <button
          onClick={() => toggle("PREMIUM")}
          disabled={saving}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            background: "#14b8a6",
            color: "#fff",
            border: "none",
            fontSize: 12,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {saving ? "…" : "OK"}
        </button>
        <button
          onClick={() => setShowInput(false)}
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            background: "#f1f5f9",
            color: "#64748b",
            border: "none",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          padding: "3px 9px",
          borderRadius: 999,
          background: tier === "PREMIUM" ? "#fef3c7" : "#f1f5f9",
          color: tier === "PREMIUM" ? "#92400e" : "#64748b",
          letterSpacing: "0.03em",
        }}
      >
        {tier === "PREMIUM" ? "⭐ Premium" : "Gratuit"}
        {tier === "PREMIUM" && initialLimit != null && ` · ${initialLimit}/j`}
      </span>
      <button
        onClick={() => toggle(tier === "FREE" ? "PREMIUM" : "FREE")}
        disabled={saving}
        title={tier === "FREE" ? "Passer en Premium" : "Repasser en Gratuit"}
        style={{
          padding: "3px 9px",
          borderRadius: 6,
          background: tier === "FREE" ? "#14b8a6" : "#fee2e2",
          color: tier === "FREE" ? "#fff" : "#991b1b",
          border: "none",
          fontSize: 11,
          fontWeight: 600,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.6 : 1,
          transition: "opacity 0.15s",
        }}
      >
        {saving ? "…" : tier === "FREE" ? "→ Premium" : "→ Gratuit"}
      </button>
    </div>
  );
}
