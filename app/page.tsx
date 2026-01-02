import { getCurrentUser } from "@/modules/auth/actions";
import UserButton from "@/modules/auth/components/UserButtton";

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <UserButton user={user} />
    </div>
  );
}
