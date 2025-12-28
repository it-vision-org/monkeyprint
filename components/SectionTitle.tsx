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
        <div className={className} style={{ textAlign: 'center', marginBottom: subtitle ? '8px' : '4px' }}>
            <h2 className={titleClassName}>{title}</h2>
            {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
        </div>
    );
}

