'use client';

import Image from "next/image";
import LoadingLink from "@/components/LoadingLink";

type HomeHeroProps = {
    className?: string;
    titleClassName?: string;
    subtitleClassName?: string;
    ctaClassName?: string;
    ctaTextClassName?: string;
    rectClassName?: string;
    monkeyClassName?: string;
    coinsClassName?: string;
    shopAddClassName?: string;
};

export default function HomeHero({
    className = '',
    titleClassName = '',
    subtitleClassName = '',
    ctaClassName = '',
    ctaTextClassName = '',
    rectClassName = '',
    monkeyClassName = '',
    coinsClassName = '',
    shopAddClassName = ''
}: HomeHeroProps) {
    return (
        <section className={className} aria-label="Hero">
            <div className={rectClassName} />
            <div className={monkeyClassName}>
                <Image src="/Monkey.svg" alt="" width={343} height={357} priority />
            </div>
            <div className={coinsClassName}>
                <Image src="/Coins.png" alt="" width={359} height={247} priority />
            </div>
            <div className={shopAddClassName}>
                <Image src="/shop-add.svg" alt="" width={80} height={80} priority />
            </div>
            <h1 className={titleClassName}>
                GAGNEZ DE <span style={{ color: "#f3ff00" }}>L&apos;ARGENT GRATUITEMENT</span>, EN VENDANT SIMPLEMENT DES PRODUITS
                MARCHANDS <span style={{ color: "black" }}>EN TUNISIE.</span>
            </h1>
            <p className={subtitleClassName}>
                Téléchargez vos œuvres d&apos;art, personnalisez vos produits et démarrez votre propre
                boutique en ligne.
            </p>
            <LoadingLink href="/create-shop" className={ctaClassName}>
                <span className={ctaTextClassName}>COMMENCEZ GRATUITEMENT !</span>
            </LoadingLink>
        </section>
    );
}

