import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Avatar, Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import { useAuth } from "../store/AuthContext";
import { IoMdAdd } from "react-icons/io";
import LoadingSkeleton from "./miscellaneous/ChatLoadingSkeleton";
import CreateNewGroupChatModal from "./modals/CreateNewGroupChatModal";
import { chatActions } from "../store/ChatStore/chat-slice";
import {
  getSingleChatName,
  getSingleChatProfileImage,
} from "../utils/chatLogics";

const MyChats = ({ fetchAgain }) => {
  const authCtx = useAuth();
  const toast = useToast();
  const dispatch = useDispatch();

  const [loadingChats, setLoadingChats] = useState(false);

  const allChats = useSelector((state) => state.chat.allChats);
  const selectedChat = useSelector((state) => state.chat.selectedChat);

  useEffect(() => {
    const fetchAllChats = async () => {
      setLoadingChats(true);

      await axios
        .get(`/api/chats/${authCtx.user?.userId}`, {
          headers: {
            Authorization: `Bearer ${authCtx.user?.token}`,
          },
        })
        .then((res) => {
          dispatch(chatActions.setAllChats({ chats: res.data.chats }));
        })
        .catch((err) => {
          console.log(err);
          toast({
            title: "An error occured!",
            description: err.response?.data?.message || "Failed to load chats.",
            status: "error",
            duration: 6000,
            isClosable: true,
            position: "top",
          });
        });

      setLoadingChats(false);
    };

    fetchAllChats();
  }, [fetchAgain]);

  return (
    <Box
      display={{
        base: selectedChat ? "none" : "block",
        md: "block",
      }}
      flexDir="column"
      alignItems="center"
      bg="white"
      p={{ base: "3px", md: "6px" }}
      w={{ base: "100%", md: "36%" }}
      h={"100%"}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        p={1}
        py={2}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text
          ml={1}
          fontWeight="bold"
          fontFamily="Work sans"
          fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
        >
          My chats
        </Text>
        <CreateNewGroupChatModal>
          <Button
            variant="ghost"
            colorScheme="blue"
            p="0px 8px"
            display="flex"
            alignItems="center"
          >
            <IoMdAdd style={{ fontSize: "1.25rem" }} />
            <Text ml="2px">New Group Chat</Text>
          </Button>
        </CreateNewGroupChatModal>
      </Box>
      <Box
        w="100%"
        h="90%"
        bg="#F8F8F8"
        d="flex"
        flexDir="column"
        overflowY="scroll"
        p={{ base: 1, md: 2 }}
        borderRadius="lg"
      >
        {loadingChats ? (
          <LoadingSkeleton />
        ) : allChats.length === 0 ? (
          <span>No Chats.</span>
        ) : (
          allChats.length > 0 && (
            <Stack overflowY="scroll">
              {allChats.map((chat) => (
                <Box
                  px={3}
                  py={2}
                  key={chat._id}
                  cursor="pointer"
                  borderRadius="lg"
                  color={selectedChat === chat ? "white" : "black"}
                  bg={selectedChat?._id === chat?._id ? "#38B2AC" : "#E8E8E8"}
                  onClick={() => {
                    dispatch(chatActions.setSelectedChat({ chat }));
                    dispatch(chatActions.removeNotifications({ chat }));
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <Avatar
                      mr={2}
                      size={{ base: "sm", md: "md" }}
                      name={
                        chat.isGroupChat
                          ? chat.chatName
                          : getSingleChatName(authCtx.user, chat.users)
                      }
                      src={
                        !chat.isGroupChat
                          ? getSingleChatProfileImage(authCtx.user, chat.users)
                          : ""
                      }
                      border="1px"
                    />
                    <Text
                      fontFamily="Work sans"
                      fontSize={{ base: "md", md: "lg" }}
                      fontWeight="semibold"
                    >
                      {chat.isGroupChat
                        ? chat.chatName
                        : getSingleChatName(authCtx.user, chat.users)}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Stack>
          )
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
