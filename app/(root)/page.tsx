import { getCurrentUser } from "@/modules/auth/actions";
import ChatMessageView from "@/modules/chat/components/ChatMessageView";

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <ChatMessageView user={user} />
    </div>
  );
}
