import MessageItem from "./MessageItem";
import { useAuth } from "../../store/AuthContext";

const MessageFeed = ({ messages }) => {
  const authCtx = useAuth();

  return (
    <>
      {messages?.length > 0 &&
        messages.map((message, index) => (
          <MessageItem
            key={message._id}
            message={message}
            isSelfMessage={authCtx.user?.userId === message?.sender?._id}
            isFirstMessage={
              index === 0 ? true : messages[index - 1]?.sender?._id !== message?.sender?._id
            }
          />
        ))}
    </>
  );
};

export default MessageFeed;
