import React from 'react';
import Image from "next/image";
import styles from './HowItWorks.module.css';
import desktopStyles from './HowItWorks.desktop.module.css';

type HowItWorksCard = {
    icon: string;
    title: string;
    description: string;
};

type HowItWorksProps = {
    title?: string;
    subtitle?: string;
    cards?: HowItWorksCard[];
};

const defaultCards: HowItWorksCard[] = [
    { icon: "/Paper Plus.png", title: "Téléchargez votre\nconception", description: "Téléchargez facilement vos œuvres et voyez-les prendre vie sur des produits de qualité." },
    { icon: "/Edit.png", title: "Personnalisez les\nproduits", description: "Choisissez parmi nos t-shirts, sweats à capuche, mugs et plus encore. Choisissez les couleurs, les tailles et l'emplacement." },
    { icon: "/Home.png", title: "Créez votre\nboutique", description: "Créez votre propre boutique de marque et commencez à vendre vos créations immédiatement." },
    { icon: "/Arrow.png", title: "Commencez à\nvendre", description: "Vous partagez, nous nous occupons de vos produits, de l'impression à l'expédition." }
];

export default function HowItWorks({
    title = "Comment ça marche",
    subtitle = "De la conception à la vente en quelques étapes simples",
    cards = defaultCards
}: HowItWorksProps) {
    return (
        <>
            {/* Mobile View */}
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
            {cards.map((card, index) => {
                const i = index + 1;
                const isEven = i % 2 === 0;
                return (
                    <div key={index}>
                        <div className={`${styles.cardRect} ${styles[`card${i}Rect`]}`} />
                        <div className={`${styles.cardIcon} ${styles[`card${i}Icon`]}`}>
                            <Image src={card.icon} alt="" width={56} height={56} />
                        </div>
                        <div className={`${styles.cardText} ${styles[`card${i}Text`]}`}>
                            <div className={`${styles.cardTitle} ${styles[`cardTitle${i}`]}`}>
                                {card.title.split('\n').map((line, idx) => (
                                    <span key={idx}>
                                        {line}
                                        {idx < card.title.split('\n').length - 1 && <br />}
                                    </span>
                                ))}
                            </div>
                            <div className={styles.cardDesc}>{card.description}</div>
                        </div>
                    </div>
                );
            })}

            {/* Desktop View */}
            <section className={desktopStyles.desktopHowItWorksSection}>
                <div className={desktopStyles.desktopHowItWorksHeader}>
                    <h2 className={desktopStyles.desktopHowItWorksTitle}>{title}</h2>
                    <p className={desktopStyles.desktopHowItWorksSubtitle}>
                        {subtitle}
                    </p>
                </div>

                <div className={desktopStyles.desktopHowItWorksGrid}>
                    {/* Card 1 */}
                    <div className={`${desktopStyles.desktopHowItWorksCard} ${desktopStyles.desktopHowItWorksCard1}`}>
                        <div className={`${desktopStyles.desktopHowItWorksCardIcon} ${desktopStyles.desktopHowItWorksCard1Icon}`}>
                            <Image src="/Paper Plus.png" alt="" width={64} height={64} />
                        </div>
                        <div className={desktopStyles.desktopHowItWorksCardContent}>
                            <h3 className={desktopStyles.desktopHowItWorksCardTitle}>
                                Téléchargez votre conception
                            </h3>
                            <p className={desktopStyles.desktopHowItWorksCardDesc}>
                                Téléchargez facilement vos œuvres et voyez-les prendre vie sur des produits de qualité.
                            </p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className={`${desktopStyles.desktopHowItWorksCard} ${desktopStyles.desktopHowItWorksCard2}`}>
                        <div className={`${desktopStyles.desktopHowItWorksCardIcon} ${desktopStyles.desktopHowItWorksCard2Icon}`}>
                            <Image src="/Edit.png" alt="" width={64} height={64} />
                        </div>
                        <div className={desktopStyles.desktopHowItWorksCardContent}>
                            <h3 className={desktopStyles.desktopHowItWorksCardTitle}>
                                Personnaliser les produits
                            </h3>
                            <p className={desktopStyles.desktopHowItWorksCardDesc}>
                                Choisissez parmi nos t-shirts, sweats à capuche, mugs et plus encore. Choisissez les couleurs, les tailles et l&apos;emplacement.
                            </p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className={`${desktopStyles.desktopHowItWorksCard} ${desktopStyles.desktopHowItWorksCard3}`}>
                        <div className={`${desktopStyles.desktopHowItWorksCardIcon} ${desktopStyles.desktopHowItWorksCard3Icon}`}>
                            <Image src="/Home.png" alt="" width={64} height={64} />
                        </div>
                        <div className={desktopStyles.desktopHowItWorksCardContent}>
                            <h3 className={desktopStyles.desktopHowItWorksCardTitle}>
                                Créez votre boutique
                            </h3>
                            <p className={desktopStyles.desktopHowItWorksCardDesc}>
                                Créez votre propre boutique de marque et commencez à vendre vos créations immédiatement.
                            </p>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className={`${desktopStyles.desktopHowItWorksCard} ${desktopStyles.desktopHowItWorksCard4}`}>
                        <div className={`${desktopStyles.desktopHowItWorksCardIcon} ${desktopStyles.desktopHowItWorksCard4Icon}`}>
                            <Image src="/Arrow.png" alt="" width={64} height={64} />
                        </div>
                        <div className={desktopStyles.desktopHowItWorksCardContent}>
                            <h3 className={desktopStyles.desktopHowItWorksCardTitle}>
                                Commencez à vendre
                            </h3>
                            <p className={desktopStyles.desktopHowItWorksCardDesc}>
                                Vous partagez, nous nous occupons de vos produits, de l&apos;impression à l&apos;expédition.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
