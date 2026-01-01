import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CreateShopContent from "./CreateShopContent";

export default async function CreateShopPage() {
    const session = await auth();
    
    // Check if user has a store
    let hasStore = false;
    if (session?.user?.id) {
        const store = await prisma.store.findFirst({
            where: { ownerId: session.user.id }
        });
        hasStore = !!store;
    }
    
    return <CreateShopContent initialSession={session} hasStore={hasStore} />;
}
