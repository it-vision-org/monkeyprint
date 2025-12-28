'use client';

import Image from "next/image";

type HowItWorksCard = {
    icon: string;
    iconWidth?: number;
    iconHeight?: number;
    title: string;
    description: string;
};

type HowItWorksProps = {
    title?: string;
    subtitle?: string;
    titleClassName?: string;
    subtitleClassName?: string;
    cards: HowItWorksCard[];
    getCardRectClassName: (index: number) => string;
    getCardIconClassName: (index: number) => string;
    getCardTextClassName: (index: number) => string;
    getCardTitleClassName: (index: number) => string;
    cardDescClassName?: string;
};

export default function HowItWorks({
    title = "Comment ça marche",
    subtitle = "De la conception à la vente en quelques étapes simples",
    titleClassName = '',
    subtitleClassName = '',
    cards,
    getCardRectClassName,
    getCardIconClassName,
    getCardTextClassName,
    getCardTitleClassName,
    cardDescClassName = ''
}: HowItWorksProps) {
    return (
        <>
            <h2 className={titleClassName}>{title}</h2>
            <p className={subtitleClassName}>{subtitle}</p>
            {cards.map((card, index) => (
                <div key={index}>
                    <div className={getCardRectClassName(index)} />
                    <div className={getCardIconClassName(index)}>
                        <Image 
                            src={card.icon} 
                            alt="" 
                            width={card.iconWidth || 56} 
                            height={card.iconHeight || 56} 
                        />
                    </div>
                    <div className={getCardTextClassName(index)}>
                        <div className={getCardTitleClassName(index)}>
                            {card.title.split('\n').map((line, idx) => (
                                <span key={idx}>
                                    {line}
                                    {idx < card.title.split('\n').length - 1 && <br />}
                                </span>
                            ))}
                        </div>
                        <div className={cardDescClassName}>{card.description}</div>
                    </div>
                </div>
            ))}
        </>
    );
}

