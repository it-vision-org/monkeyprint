import Link from "next/link";

export default function OrderConfirmationPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: '20px', textAlign: 'center' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%' }}>
                <div style={{ width: '80px', height: '80px', background: '#41eb5c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <h1 style={{ margin: '0 0 12px', fontSize: '24px' }}>Merci pour votre commande !</h1>
                <p style={{ color: '#666', marginBottom: '32px' }}>Votre commande a été reçue et est en cours de traitement.<br />Nous vous contacterons bientôt pour confirmer la livraison.</p>

                <Link href="/" style={{ display: 'inline-block', background: '#000', color: 'white', fontWeight: 'bold', padding: '16px 32px', borderRadius: '12px', textDecoration: 'none' }}>
                    Trouver d&apos;autres produits
                </Link>
            </div>
        </div>
    );
}
