// Remove "use client" here
import ActiveChatLoader from "@/modules/messages/components/ActiveChatLoader";
import MessageWithForm from "@/modules/messages/components/MessageWithForm";

interface ChatPageProps {
  params: Promise<{ chatId: string }>;
}

export default async function Chat({ params }: ChatPageProps) {
  const { chatId } = await params;

  return (
    <>
      <ActiveChatLoader chatId={chatId} />
      <MessageWithForm chatId={chatId} />
    </>
  );
}
