import { auth } from "@/auth";
import HomeContent from "./HomeContent";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return <HomeContent initialSession={session} />;
}
