'use client';

type StarRatingProps = {
    rating: number;
    reviews?: number;
    size?: number;
    showReviews?: boolean;
    className?: string;
    reviewsClassName?: string;
};

export default function StarRating({
    rating,
    reviews,
    size = 12,
    showReviews = true,
    className = '',
    reviewsClassName = ''
}: StarRatingProps) {
    return (
        <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '4px' }} role="img" aria-label={`Note : ${rating} sur 5${showReviews && reviews !== undefined ? `, ${reviews} avis` : ''}`}>
            {[...Array(5)].map((_, i) => (
                <svg
                    key={i}
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill={i < rating ? "#FFA500" : "#E5E7EB"}
                    aria-hidden="true"
                >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
            ))}
            {showReviews && reviews !== undefined && (
                <span className={reviewsClassName} style={{ fontSize: `${size}px`, color: '#666' }} aria-hidden="true">({reviews})</span>
            )}
        </div>
    );
}
