import { User } from "@/modules/auth/components/UserButtton";
import ChatWellcomeTabs from "./ChatWellcomeTabs";
import ChatMessageForm from "./ChatMessageForm";

interface ChatMessageViewProps {
    user: User | null;
}

function ChatMessageView({ user }: ChatMessageViewProps) {
    return (
        <div className='flex flex-col h-screen w-full'>
            <div className="items-center justify-center w-full mx-auto p-2">
                <ChatWellcomeTabs userName={user?.name || ""} />
                <ChatMessageForm />
            </div>
        </div>
    )
}

export default ChatMessageView;