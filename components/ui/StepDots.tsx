'use client';

type StepDotsProps = {
    currentStep: number;
    totalSteps: number;
    onStepClick?: (step: number) => void;
    className?: string;
    dotClassName?: string;
    filledClassName?: string;
};

export default function StepDots({
    currentStep,
    totalSteps,
    onStepClick,
    className = '',
    dotClassName = '',
    filledClassName = ''
}: StepDotsProps) {
    return (
        <div className={className} style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
                const isFilled = step <= currentStep;
                const isClickable = onStepClick && isFilled;

                return (
                    <button
                        key={step}
                        className={`${dotClassName} ${isFilled ? filledClassName : ''}`}
                        onClick={() => isClickable && onStepClick(step)}
                        disabled={!isClickable}
                        aria-label={`Go to step ${step}`}
                        type="button"
                        style={{
                            width: '11px',
                            height: '11px',
                            borderRadius: '50%',
                            border: isFilled ? '1px solid #41eb5c' : '1px solid #0f8373',
                            background: isFilled ? '#41eb5c' : 'transparent',
                            cursor: isClickable ? 'pointer' : 'default',
                            padding: 0
                        }}
                    />
                );
            })}
        </div>
    );
}
