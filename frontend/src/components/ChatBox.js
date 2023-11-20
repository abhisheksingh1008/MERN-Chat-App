import { useSelector } from "react-redux";
import { Box } from "@chakra-ui/react";
import SingleChat from "./SingleChat";

const ChatBox = ({ setFetchAgain }) => {
  const selectedChat = useSelector((state) => state.chat.selectedChat);

  return (
    <Box
      p={{ base: 1, md: 2 }}
      bg="white"
      h={"100%"}
      flexDir="column"
      borderRadius="lg"
      borderWidth="1px"
      alignItems="center"
      w={{ base: "100%", md: "64%" }}
      display={{
        base: selectedChat ? "block" : "none",
        md: "block",
      }}
    >
      <SingleChat setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;
