"use client";

import styles from "../../styles/product-upload.module.css";

type Step = 1 | 2 | 3;

const STEPS: { step: Step; label: string }[] = [
  { step: 1, label: "Design" },
  { step: 2, label: "Détails" },
  { step: 3, label: "Publier" },
];

type ProductUploadStepsProps = {
  currentStep: Step;
};

export default function ProductUploadSteps({
  currentStep,
}: ProductUploadStepsProps) {
  return (
    <div className={styles.puSteps}>
      {STEPS.map(({ step, label }, index) => {
        const done = step < currentStep;
        const active = step === currentStep;
        const showCheck = done || (active && step === 1);

        return (
          <div key={step} className={styles.puStepsItem}>
            <div className={styles.puStepsNodeWrap}>
              <div
                className={`${styles.puStepsCircle} ${done || active ? styles.puStepsCircleActive : ""}`}
              >
                {showCheck ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`${styles.puStepsLabel} ${active || done ? styles.puStepsLabelActive : ""}`}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && <div className={styles.puStepsLine} />}
          </div>
        );
      })}
    </div>
  );
}
