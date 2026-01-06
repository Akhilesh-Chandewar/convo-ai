import { getCurrentUser } from "@/modules/auth/actions";
import ChatMessageView from "@/modules/chat/components/ChatMessageView";

export default async function Home() {
  const user = await getCurrentUser();
  return <ChatMessageView user={user} />;
}
