import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  Input,
  Spinner,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../store/AuthContext";
import { chatActions } from "../store/ChatStore/chat-slice";
import { IoMdArrowBack, IoMdSend } from "react-icons/io";
import UserProfileModal from "./modals/UserProfileModal";
import {
  getSingleChatName,
  getSingleChatProfileImage,
  loggedUserIsGroupAdmin,
} from "../utils/ChatLogics";
import UpdateGroupModal from "./modals/UpdateGroupModal";
import ViewGroupModal from "./modals/ViewGroupModal";
import MessageFeed from "./miscellaneous/MessageFeed";
import TypingIndicator from "./miscellaneous/TypingIndicator";

let socket, selectedChatCompare, timeout;
const timerLength = 3500;

const SingleChat = ({ setFetchAgain }) => {
  const authCtx = useAuth();
  const toast = useToast();
  const dispatch = useDispatch();

  const selectedChat = useSelector((state) => state.chat.selectedChat);
  const newChat = useSelector((state) => state.chat.newChat);

  const [allMessages, setAllMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [enteredMessage, setEnteredMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [someoneElseIsTyping, setSomeoneElseIsTyping] = useState(false);
  const [userWhoIsTyping, setUserWhoIsTyping] = useState(null);
  const [iAmTyping, setIAmTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchAllMessages = async () => {
    if (!selectedChat) return;

    page === 1 ? setLoadingMessages(true) : setLoadingMoreMessages(true);

    await axios
      .get(`/api/messages/${selectedChat?._id}?page=${page}`, {
        headers: {
          Authorization: `Bearer ${authCtx.user?.token}`,
        },
      })
      .then((res) => {
        if (page === 1) {
          setAllMessages(res.data.messages);
          setTotalPages(Math.ceil(res.data.count / 50));
        } else if (page > 1) {
          setAllMessages((prev) => [...res.data.messages, ...prev]);
        }

        socket.emit("join chat", selectedChat._id);
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: "An error occured!",
          description:
            err.response?.data?.message || "Failed to load messages.",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      });

    page === 1 ? setLoadingMessages(false) : setLoadingMoreMessages(false);
  };

  const sendMessageHandler = async () => {
    if (enteredMessage.trim().length === 0) {
      toast({
        title: "Please enter a message.",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSendingMessage(true);

    await axios
      .post(
        `/api/messages/create/${selectedChat?._id}`,
        {
          messageContent: enteredMessage.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${authCtx.user?.token}`,
          },
        }
      )
      .then((res) => {
        // console.log(res.data);
        setEnteredMessage("");
        setAllMessages((prev) => [...prev, res.data?.createdMessage]);
        dispatch(
          chatActions.onNewMessage({
            chat: { ...res.data.createdMessage.chat },
          })
        );

        socket.emit("stop typing", selectedChat._id);
        socket.emit("send new message", res.data.createdMessage);
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: "An error occured!",
          description: err.response?.data?.message || "Failed to send message.",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      });

    setSendingMessage(false);
  };

  const sendMessage = async (e) => {
    if (e.key === "Enter") {
      if (enteredMessage.trim().length === 0) {
        toast({
          title: "Please enter a message.",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
        return;
      }

      setSendingMessage(true);

      await axios
        .post(
          `/api/messages/create/${selectedChat?._id}`,
          {
            messageContent: enteredMessage.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${authCtx.user?.token}`,
            },
          }
        )
        .then((res) => {
          // console.log(res);
          setEnteredMessage("");
          setAllMessages((prev) => [...prev, res.data?.createdMessage]);
          dispatch(
            chatActions.onNewMessage({
              chat: { ...res.data.createdMessage.chat },
            })
          );

          socket.emit("stop typing", selectedChat._id);
          socket.emit("send new message", res.data.createdMessage);
        })
        .catch((err) => {
          console.log(err);
          toast({
            title: "An error occured!",
            description:
              err.response?.data?.message || "Failed to send message.",
            status: "error",
            duration: 6000,
            isClosable: true,
            position: "top",
          });
        });

      setSendingMessage(false);
    }
  };

  const typingHandler = (e) => {
    setEnteredMessage(e.target.value);

    if (e.target.value?.length === 0) return;
    if (!socketConnected) return;

    setIAmTyping(true);
    socket.emit("typing", selectedChat._id, authCtx.user);

    let lastTypingTime = new Date().getTime();

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      let currentTime = new Date().getTime();
      let timeDifference = currentTime - lastTypingTime;

      if (iAmTyping && timeDifference >= timerLength) {
        socket.emit("stop typing", selectedChat._id);
        setIAmTyping(false);
      }
    }, timerLength);
  };

  const updateGroupChatHandler = async (updatedGroupChat) => {
    socket.emit("push group changes", authCtx.user, updatedGroupChat);
  };

  useEffect(() => {
    socket = io(process.env.REACT_APP_BACKEND_ENDPOINT, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      // console.log(socket.id);
      setSocketConnected(true);
    });

    socket.emit("setup", authCtx.user);

    socket.on("new message recieved", (newMessage) => {
      // console.log(newMessage);
      if (
        selectedChatCompare &&
        selectedChatCompare._id === newMessage.chat._id
      ) {
        setAllMessages((prev) => [...prev, newMessage]);
        messagesEndRef.current?.scrollIntoView();
      } else {
        dispatch(chatActions.setNotifications({ newMessage }));
        // setFetchAgain((prev) => !prev);
      }
      dispatch(chatActions.onNewMessage({ chat: { ...newMessage.chat } }));
    });

    socket.on("new chat", (newChat) => {
      dispatch(chatActions.addNewChat({ chat: newChat }));
    });

    socket.on("new group chat changes", (updatedGroupChat) => {
      // console.log(updatedGroupChat);
      dispatch(chatActions.updateGroupChat({ updatedGroupChat }));
      if (selectedChatCompare?._id === updatedGroupChat._id) {
        dispatch(chatActions.setSelectedChat({ chat: updatedGroupChat }));
      }
    });

    socket.on("typing", (chatId, user) => {
      if (
        user.userId !== authCtx.user.userId &&
        selectedChatCompare?._id === chatId
      ) {
        setSomeoneElseIsTyping(true);
        setUserWhoIsTyping(user);
      }
    });

    socket.on("stop typing", (chatId) => {
      if (selectedChatCompare?._id === chatId) {
        setSomeoneElseIsTyping(false);
        setUserWhoIsTyping(null);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchAllMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat, page]);

  useEffect(() => {
    setPage(1);
    setTotalPages(0);
    setAllMessages([]);
    setLoadingMessages(false);
    setLoadingMoreMessages(false);
    setEnteredMessage("");
    setSendingMessage(false);
    setIAmTyping(false);
    setSomeoneElseIsTyping(false);
  }, [selectedChat, authCtx.user]);

  useEffect(() => {
    if (!newChat) return;

    if (socketConnected) {
      socket.emit("new chat", authCtx.user, newChat);
    }
  }, [newChat]);

  useEffect(() => {
    if (page === 1) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [allMessages, page, someoneElseIsTyping]);

  return (
    <>
      {selectedChat ? (
        <>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
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
                  <IoMdArrowBack
                    style={{ fontSize: "1.75rem", marginRight: 0 }}
                  />
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
                        : getSingleChatProfileImage(
                            authCtx.user,
                            selectedChat.users
                          )
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
          <Box
            w={"100%"}
            h={"90%"}
            px={2}
            pb={2}
            mt={2}
            bg="#E8E8E8"
            borderRadius="lg"
            display="flex"
            flexDir="column"
            justifyContent={loadingMessages ? "center" : "flex-end"}
          >
            {loadingMessages ? (
              <Spinner size={"xl"} alignSelf="center" />
            ) : (
              <>
                <Box
                  w="100%"
                  h="fit-content"
                  maxHeight="94%"
                  mb={2}
                  overflow="scroll"
                >
                  <Box textAlign="center">
                    {loadingMoreMessages ? (
                      <Spinner size="sm" alignSelf="center" />
                    ) : (
                      totalPages > page && (
                        <Text
                          cursor="pointer"
                          textDecoration="underline"
                          onClick={() => {
                            setPage((page) => page + 1);
                          }}
                        >
                          Load more...
                        </Text>
                      )
                    )}
                  </Box>
                  <MessageFeed messages={allMessages} />
                  {someoneElseIsTyping && (
                    <TypingIndicator
                      userWhoIsTyping={userWhoIsTyping}
                    ></TypingIndicator>
                  )}
                  <div ref={messagesEndRef}></div>
                </Box>
                <FormControl w="100%" h="8%" onKeyDown={sendMessage}>
                  <Box display="flex">
                    <Input
                      p={2}
                      bg="white"
                      variant="filled"
                      value={enteredMessage}
                      onChange={typingHandler}
                      placeholder="Enter a message..."
                      autoFocus
                    />
                    <Button
                      ml={2}
                      colorScheme={"blue"}
                      onClick={sendMessageHandler}
                      isLoading={sendingMessage}
                    >
                      <IoMdSend />
                    </Button>
                  </Box>
                </FormControl>
              </>
            )}
          </Box>
        </>
      ) : (
        <Box w="100%" h="100%" display="grid" placeItems="center">
          <Text fontFamily="Work sans" fontSize="xl" fontWeight="bold">
            Select a chat to start chatting.
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
