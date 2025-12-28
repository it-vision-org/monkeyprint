'use client';

type ScrollButtonsProps = {
    onPrev: () => void;
    onNext: () => void;
    className?: string;
    buttonClassName?: string;
    leftButtonClassName?: string;
    rightButtonClassName?: string;
};

export default function ScrollButtons({ 
    onPrev, 
    onNext, 
    className = '',
    buttonClassName = '',
    leftButtonClassName = '',
    rightButtonClassName = ''
}: ScrollButtonsProps) {
    return (
        <>
            <button 
                type="button"
                className={`${buttonClassName} left ${leftButtonClassName}`}
                onClick={onPrev}
                aria-label="Previous"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            <button 
                type="button"
                className={`${buttonClassName} right ${rightButtonClassName}`}
                onClick={onNext}
                aria-label="Next"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        </>
    );
}

