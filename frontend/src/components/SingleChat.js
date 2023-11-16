import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { IoMdSend } from "react-icons/io";
import { MdOutlineAttachFile } from "react-icons/md";
import { useAuth } from "../store/AuthContext";
import { chatActions } from "../store/ChatStore/chat-slice";
import MessageFeed from "./miscellaneous/MessageFeed";
import classes from "../styles/SingleChat.module.css";
import { handleFileUpload } from "../utils/cloudinary";
import SingleChatTopSection from "./SingleChatTopSection";
import TypingIndicator from "./miscellaneous/TypingIndicator";

let socket, selectedChatCompare, timeout;
const timerLength = 3500;

const SingleChat = ({ setFetchAgain }) => {
  const authCtx = useAuth();
  const toast = useToast();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
  const [file, setFile] = useState(null);
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
    let file_url, public_id;
    if (file) {
      try {
        const res = await handleFileUpload(file, "image");
        if (!res.image_url || !res.public_id) {
          toast({
            title: "Failed to upload file. Please try again later.",
            status: "error",
            duration: 6000,
            isClosable: true,
            position: "top",
          });
          setSendingMessage(false);
          return;
        }
        file_url = res.image_url;
        public_id = res.public_id;
      } catch (error) {
        toast({
          title: error.message,
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
        setSendingMessage(false);
        return;
      }
    }
    await axios
      .post(
        `/api/messages/create/${selectedChat?._id}`,
        {
          message: {
            messageContent: enteredMessage.trim(),
            isFile: file ? true : false,
            ...(file && {
              fileInfo: {
                file_url,
                public_id,
              },
            }),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${authCtx.user?.token}`,
          },
        }
      )
      .then((res) => {
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
    setFile(null);
    onClose();
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
    let t;
    const callback = () => {
      if (page === 1) messagesEndRef.current?.scrollIntoView();
    };
    t = setTimeout(callback, 400);
    return () => clearTimeout(t);
  }, [allMessages, page]);

  useEffect(() => {
    if (page === 1) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [page, someoneElseIsTyping]);

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

  return (
    <>
      {selectedChat ? (
        <>
          <SingleChatTopSection
            setFetchAgain={setFetchAgain}
            updateGroupChatHandler={updateGroupChatHandler}
          />
          <Box
            w={"100%"}
            h={{ base: "92%", md: "90%", lg: "90%" }}
            mt={2}
            pb={2}
            bg="#E8E8E8"
            borderRadius="lg"
            display="flex"
            flexDir="column"
            justifyContent={loadingMessages ? "center" : "flex-end"}
            overflow="hidden"
          >
            {loadingMessages ? (
              <Spinner size={"xl"} alignSelf="center" />
            ) : (
              <>
                <Box
                  mb={2}
                  w="100%"
                  height="98%"
                  display={"flex"}
                  flexDirection={"column"}
                  justifyContent={"flex-end"}
                  bgImage={`url(${authCtx.user.chatWallpaper.image_url})`}
                  bgSize="cover"
                  bgPosition="center"
                  bgRepeat="no-repeat"
                >
                  <Box overflow={"scroll"} pt={10}>
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
                </Box>
                <FormControl
                  px={1.5}
                  w="100%"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessageHandler();
                  }}
                >
                  <Box display="flex" alignItems={"center"}>
                    <input
                      type="file"
                      accept="image/*"
                      id="file-input"
                      onChange={(e) => setFile(e.target.files[0])}
                      hidden
                    />
                    <label
                      htmlFor="file-input"
                      className={classes["file-label"]}
                      onClick={onOpen}
                    >
                      <MdOutlineAttachFile size={"1.5rem"} color="white" />
                    </label>
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
                  <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                      <ModalCloseButton />
                      <ModalHeader>Selected File :</ModalHeader>
                      <ModalBody
                        display="flex"
                        flexDir="column"
                        justifyContent="space-between"
                      >
                        {file && (
                          <>
                            <Image
                              borderRadius="lg"
                              src={`${URL.createObjectURL(file)}`}
                              alt={"selected-image"}
                            />
                            <FormControl mt={2}>
                              <FormLabel>Message</FormLabel>
                              <Input
                                p={2}
                                value={enteredMessage}
                                onChange={typingHandler}
                                placeholder="Enter a message..."
                              />
                            </FormControl>
                          </>
                        )}
                      </ModalBody>
                      <ModalFooter>
                        {file ? (
                          <>
                            <Button
                              variant="solid"
                              colorScheme="blue"
                              onClick={sendMessageHandler}
                              isLoading={sendingMessage}
                              loadingText="Sending..."
                            >
                              Send
                            </Button>
                            <Button
                              ml={2}
                              variant="solid"
                              colorScheme="blue"
                              onClick={() => {
                                setFile(null);
                                setEnteredMessage("");
                                onClose();
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            ml={2}
                            variant="ghost"
                            colorScheme="blue"
                            onClick={onClose}
                          >
                            Close
                          </Button>
                        )}
                      </ModalFooter>
                    </ModalContent>
                  </Modal>
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
