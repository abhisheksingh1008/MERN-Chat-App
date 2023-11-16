import { useDispatch, useSelector } from "react-redux";
import { IoMdArrowBack } from "react-icons/io";
import { Avatar, Box, Button, Text, Tooltip } from "@chakra-ui/react";
import UpdateGroupModal from "./modals/UpdateGroupModal";
import UserProfileModal from "./modals/UserProfileModal";
import ViewGroupModal from "./modals/ViewGroupModal";
import { useAuth } from "../store/AuthContext";
import { chatActions } from "../store/ChatStore/chat-slice";
import {
  getSingleChatName,
  getSingleChatProfileImage,
  loggedUserIsGroupAdmin,
} from "../utils/ChatLogics";

const SingleChatTopSection = ({ setFetchAgain, updateGroupChatHandler }) => {
  const authCtx = useAuth();
  const dispatch = useDispatch();
  const selectedChat = useSelector((state) => state.chat.selectedChat);

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center">
        <Tooltip label="Back" placement="bottom" hasArrow>
          <Button
            px={1}
            mr={1}
            variant="ghost"
            alignItems="center"
            borderRadius="lg"
            display={{ base: "flex", md: "none" }}
            onClick={() => {
              dispatch(chatActions.setSelectedChat({ chat: null }));
            }}
          >
            <IoMdArrowBack style={{ fontSize: "1.75rem", marginRight: 0 }} />
            <Avatar
              ml={0}
              size={{ base: "sm", md: "md" }}
              name={
                selectedChat?.isGroupChat
                  ? selectedChat?.chatName
                  : getSingleChatName(authCtx.user, selectedChat.users)
              }
              src={
                selectedChat?.isGroupChat
                  ? ""
                  : getSingleChatProfileImage(authCtx.user, selectedChat.users)
              }
            />
          </Button>
        </Tooltip>
        <Text fontFamily="Work sans" fontSize="xl" fontWeight="bold">
          {selectedChat?.isGroupChat
            ? selectedChat?.chatName
            : getSingleChatName(authCtx.user, selectedChat.users)}
        </Text>
      </Box>
      {selectedChat?.isGroupChat ? (
        loggedUserIsGroupAdmin(authCtx.user, selectedChat.groupAdmin) ? (
          <UpdateGroupModal
            setFetchAgain={setFetchAgain}
            onUpdateGroup={updateGroupChatHandler}
          />
        ) : (
          <ViewGroupModal
            chat={selectedChat}
            setFetchAgain={setFetchAgain}
            onUpdateGroup={updateGroupChatHandler}
          />
        )
      ) : (
        <UserProfileModal
          user={
            selectedChat.users[0]._id === authCtx.user.userId
              ? selectedChat.users[1]
              : selectedChat.users[0]
          }
        ></UserProfileModal>
      )}
    </Box>
  );
};

export default SingleChatTopSection;
