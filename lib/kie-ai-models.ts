// ═══════════════════════════════════════════════════════════════════
// KIE.AI MODEL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════
//
// To switch the active design model, change ACTIVE_MODEL_ID below.
// All models use POST https://api.kie.ai/api/v1/jobs/createTask
//
// ═══════════════════════════════════════════════════════════════════

export type KieAiModel = {
  /** Exact model string sent to the API */
  id: string;
  /** Human-readable name */
  name: string;
  /** Brief description */
  description: string;
  /**
   * How many images this model returns per single task submission.
   * nano-banana-2 and z-image return 1 → submit 4 tasks in parallel.
   * grok-imagine returns up to 6 → submit 1 task only.
   */
  imagesPerTask: number;
  /** Whether this model accepts image URLs as input (image-to-image) */
  supportsImageInput?: boolean;
  /** Preferred output format for this model */
  outputFormat?: "png" | "jpg";
};

// ─── AVAILABLE MODELS (top-3) ─────────────────────────────────────

export const KIE_AI_MODELS: KieAiModel[] = [
  // #1 — Nano Banana 2 (best quality, PNG support, image-input capable)
  {
    id: "nano-banana-2",
    name: "Nano Banana 2",
    description:
      "Nano Banana 2 — highest quality, PNG output, supports image input",
    imagesPerTask: 1,
    supportsImageInput: true,
    outputFormat: "png",
  },

  // #2 — Qwen Z-Image (affordable, solid quality)
  {
    id: "z-image",
    name: "Qwen Z-Image",
    description: "Qwen Z-Image — affordable, reliable, 1 image per task",
    imagesPerTask: 1,
    outputFormat: "jpg",
  },

  // #3 — Grok Imagine (returns up to 6 images in one request)
  {
    id: "grok-imagine/text-to-image",
    name: "Grok Imagine",
    description: "Grok Imagine — fast, up to 6 images per request",
    imagesPerTask: 6,
    outputFormat: "jpg",
  },
];

// ═══════════════════════════════════════════════════════════════════
// ✅ CHANGE THIS ONE LINE TO SWITCH THE DESIGN GENERATION MODEL
// ═══════════════════════════════════════════════════════════════════
export const ACTIVE_MODEL_ID: string = "grok-imagine/text-to-image";

// ────────────────────────────────────────────────────────────────
export function getActiveModel(): KieAiModel {
  const model = KIE_AI_MODELS.find((m) => m.id === ACTIVE_MODEL_ID);
  if (!model) {
    throw new Error(
      `KIE.AI model "${ACTIVE_MODEL_ID}" not found. ` +
        `Available IDs: ${KIE_AI_MODELS.map((m) => m.id).join(", ")}`,
    );
  }
  return model;
}
