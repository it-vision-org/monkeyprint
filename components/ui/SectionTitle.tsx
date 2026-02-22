'use client';

type SectionTitleProps = {
    title: string;
    subtitle?: string;
    className?: string;
    titleClassName?: string;
    subtitleClassName?: string;
};

export default function SectionTitle({
    title,
    subtitle,
    className = '',
    titleClassName = '',
    subtitleClassName = ''
}: SectionTitleProps) {
    return (
        <div className={className}>
            <h2 className={titleClassName || className}>{title}</h2>
            {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
        </div>
    );
}
