import { Avatar, Box, Image, Text, Tooltip } from "@chakra-ui/react";
import DisplayImageModal from "../modals/DisplayImageModal";

const MessageItem = ({ message, isSelfMessage, isFirstMessage }) => {
  return (
    <Box
      m={1}
      mb={isFirstMessage ? 2 : 1}
      display="flex"
      justifyContent={isSelfMessage ? "flex-end" : "flex-start"}
    >
      {!isSelfMessage && isFirstMessage && (
        <Tooltip label={message?.sender?.name} placement="bottom" hasArrow>
          <Avatar
            mt="3px"
            size="xs"
            cursor="pointer"
            name={message?.sender?.name}
            src={message?.sender?.profileImage?.image_url}
          />
        </Tooltip>
      )}
      <Box
        p={1.5}
        maxWidth="75%"
        borderRadius="md"
        bg={isSelfMessage ? "#abe1f4" : "#9febbc"}
        ml={!isSelfMessage && !isFirstMessage ? 8 : 2}
        // mr={isSelfMessage && !isFirstMessage ? 8 : 2}
      >
        {message.isFile && (
          <DisplayImageModal image_url={message?.fileInfo?.file_url}>
            <Image
              borderRadius="md"
              src={message?.fileInfo?.file_url}
              alt={"message-image"}
              cursor="pointer"
            />
          </DisplayImageModal>
        )}
        <Text mt={message.isFile ? 1 : 0} pr={0.5}>
          {message?.messageContent}
        </Text>
      </Box>
      {/* {isSelfMessage && isFirstMessage && (
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
