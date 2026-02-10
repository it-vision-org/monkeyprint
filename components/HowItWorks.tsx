import Image from "next/image";
import styles from './HowItWorks.module.css';

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
    { icon: "/Paper Plus.png", title: "Téléchargez votre conception", description: "Téléchargez facilement vos œuvres et voyez-les prendre vie sur des produits de qualité." },
    { icon: "/Edit.png", title: "Personnaliser les produits", description: "Choisissez parmi nos t-shirts, sweats à capuche, mugs et plus encore." },
    { icon: "/Home.png", title: "Créez votre boutique", description: "Créez votre propre boutique de marque et commencez à vendre immédiatement." },
    { icon: "/Arrow.png", title: "Commencez à vendre", description: "Vous partagez, nous nous occupons de vos produits, de l'impression à l'expédition." }
];

export default function HowItWorks({
    title = "Comment ça marche",
    subtitle = "De la conception à la vente en quelques étapes simples",
    cards = defaultCards
}: HowItWorksProps) {
    return (
        <section className={styles.section}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
            <div className={styles.grid}>
                {cards.map((card, index) => (
                    <div key={index} className={`${styles.card} ${styles[`card${index + 1}`]}`}>
                        <div className={styles.icon}>
                            <Image
                                src={card.icon}
                                alt=""
                                width={64}
                                height={64}
                            />
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>
                                {card.title}
                            </h3>
                            <p className={styles.cardDesc}>{card.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

