import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateShopContent from "./CreateShopContent";

export default async function CreateShopPage() {
    const session = await auth();
    
    // Check if user has a store
    if (session?.user?.id) {
        const store = await prisma.store.findFirst({
            where: { ownerId: session.user.id }
        });
        
        // Redirect to dashboard if user already has a store
        if (store) {
            redirect("/dashboard");
        }
    }
    
    return <CreateShopContent initialSession={session} hasStore={false} />;
}
