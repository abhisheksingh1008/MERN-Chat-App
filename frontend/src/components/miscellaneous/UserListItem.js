import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Avatar, Box, Spinner, Text, useToast } from "@chakra-ui/react";
import { chatActions } from "../../store/ChatStore/chat-slice";
import { useAuth } from "../../store/AuthContext";

const UserListItem = ({ user, closeSideDrawer }) => {
  const authCtx = useAuth();
  const toast = useToast();
  const dispatch = useDispatch();

  const [loadingChat, setLoadingChat] = useState(false);

  const allChats = useSelector((state) => state.chat.allChats);

  const openChat = async () => {
    setLoadingChat(true);

    await axios
      .post(
        `/api/chats/chat`,
        {
          userId: user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${authCtx.user.token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        // console.log(response.data);
        dispatch(chatActions.setSelectedChat({ chat: response.data.chat }));
        if (!allChats.find((c) => c._id === response.data?.chat._id)) {
          dispatch(chatActions.addNewChat({ chat: response.data.chat }));
          dispatch(chatActions.setNewChat({ chat: response.data.chat }));
        }

        closeSideDrawer();
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: "An error occured!",
          description:
            err.response?.data?.message || "Failed to load/create chat.",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      });

    setLoadingChat(false);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      cursor="pointer"
      borderRadius="md"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      onClick={openChat}
      p={2}
      my={2}
    >
      <Box display="flex" alignItems="center">
        <Avatar
          size={{ base: "md", md: "md" }}
          name={user?.name}
          src={user?.profileImage?.image_url}
        />
        <Box ml={2}>
          <Text
            fontSize={{ base: "1.1rem", md: "1.2rem" }}
            fontFamily="Work sans"
            fontWeight="bold"
          >
            {user.name}
          </Text>
          <Text fontSize="xs">
            <b>Email: </b>
            {user.email.substring(0, 28)}
            {user.email.length > 28 && <span>...</span>}
          </Text>
        </Box>
      </Box>
      {loadingChat && <Spinner size="md" />}
    </Box>
  );
};

export default UserListItem;
