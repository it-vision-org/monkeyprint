import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProductConfigManager from './ProductConfigManager';

export default async function AdminProductConfigPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    // Check for admin role
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== 'ADMIN') redirect("/dashboard");

    return (
        <div style={{ padding: '24px' }}>
            <h1 className="dash-page-title" style={{ marginBottom: '32px' }}>
                Configuration des Produits
            </h1>
            <ProductConfigManager />
        </div>
    );
}


