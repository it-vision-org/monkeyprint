'use client';

import { useRouter } from 'next/navigation';

type PageHeaderProps = {
    title: string;
    onBack?: () => void;
    showBackButton?: boolean;
    className?: string;
    backButtonClassName?: string;
    titleClassName?: string;
};

export default function PageHeader({
    title,
    onBack,
    showBackButton = true,
    className = '',
    backButtonClassName = '',
    titleClassName = ''
}: PageHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <header className={className}>
            {showBackButton && (
                <button className={backButtonClassName} onClick={handleBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" />
                    </svg>
                </button>
            )}
            <h1 className={titleClassName}>{title}</h1>
            <div style={{ width: '24px' }}></div>
        </header>
    );
}
