import { Avatar, Box, Text, Tooltip } from "@chakra-ui/react";

const MessageItem = ({ message, isSelfMessage, isLastMessage }) => {
  return (
    <Box
      m={1}
      mb={isLastMessage ? 2 : 0}
      display="flex"
      alignItems="center"
      justifyContent={isSelfMessage ? "flex-end" : "flex-start"}
    >
      {!isSelfMessage && isLastMessage && (
        <Tooltip label={message?.sender?.name} placement="bottom" hasArrow>
          <Avatar
            mt="7px"
            size="xs"
            cursor="pointer"
            name={message?.sender?.name}
            src={message?.sender?.profileImage}
          />
        </Tooltip>
      )}
      <Text
        ml={!isSelfMessage && !isLastMessage ? 8 : 2}
        // mr={isSelfMessage && !isLastMessage ? 8 : 2}
        py={2}
        px={3}
        maxWidth="75%"
        borderRadius="xl"
        bg={isSelfMessage ? "#BEE3F0" : "#B9F5D0"}
      >
        {message?.messageContent}
      </Text>
      {/* {isSelfMessage && isLastMessage && (
        <Tooltip label={message?.sender?.name} placement="bottom" hasArrow>
          <Avatar
            mt="7px"
            size="xs"
            cursor="pointer"
            name={message?.sender?.name}
            src={message?.sender?.profileImage}
          />
        </Tooltip>
      )} */}
    </Box>
  );
};

export default MessageItem;
