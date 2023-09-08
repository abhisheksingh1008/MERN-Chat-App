import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { BiEdit } from "react-icons/bi";
import { useAuth } from "../../store/AuthContext";
import { chatActions } from "../../store/ChatStore/chat-slice";
import UserBadgeItem from "../miscellaneous/UserBadgeItem";
import LoadingSkeleton from "../miscellaneous/ChatLoadingSkeleton";

const UpdateGroupModal = ({ setFetchAgain, onUpdateGroup }) => {
  const authCtx = useAuth();
  const toast = useToast();
  const dispatch = useDispatch();

  const selectedChat = useSelector((state) => state.chat.selectedChat);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [foundUsers, setFoundUsers] = useState([]);
  const [groupChatName, setGroupChatName] = useState(selectedChat?.chatName);
  const [groupChatMembers, setGroupChatMembers] = useState(selectedChat?.users);
  const [loadingSearchResults, setLoadingSearchResults] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const userSearchHandler = async () => {
    if (search.trim().length === 0) {
      toast({
        title: "Please enter something in the name field.",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setLoadingSearchResults(true);

    await axios
      .get(`/api/users/find?search=${search}`, {
        headers: {
          Authorization: `Bearer ${authCtx.user?.token}`,
        },
      })
      .then((response) => {
        setFoundUsers(response.data.users);
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: "An error occured!",
          description: "Failed to load search results.",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      });

    setLoadingSearchResults(false);
  };

  const groupRenameHandler = async () => {
    if (groupChatName.trim().length === 0) {
      toast({
        title: "Please enter the chat name.",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });

      return;
    }

    setLoading(true);

    await axios
      .patch(
        `/api/chats/group/rename/${selectedChat?._id}`,
        {
          newName: groupChatName,
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
        setFetchAgain((prev) => !prev);
        onUpdateGroup(response.data.chat);

        toast({
          title: response.data.message,
          status: "success",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: "An error occured!",
          description:
            err.response?.data?.message || "Failed to update group chat.",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      });

    setLoading(false);
  };

  const addUserHandler = async (userId) => {
    if (groupChatMembers.find((u) => u._id === userId)) {
      toast({
        title: "User is already in the group.",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setLoading(true);

    await axios
      .patch(
        `/api/chats/group/add-member/${selectedChat?._id}`,
        {
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${authCtx.user.token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setGroupChatMembers(response.data.chat.users);
        dispatch(chatActions.setSelectedChat({ chat: response.data.chat }));
        setFetchAgain((prev) => !prev);
        onUpdateGroup(response.data.chat);

        toast({
          title: response.data.message,
          status: "success",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: "An error occured!",
          description:
            err.response?.data?.message || "Failed to update group chat.",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      });

    setLoading(false);
  };

  const removeUserHandler = async (userId) => {
    if (!groupChatMembers.find((u) => u._id === userId)) {
      toast({
        title: "User is not in the group",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setLoading(true);

    await axios
      .patch(
        `/api/chats/group/remove-member/${selectedChat?._id}`,
        {
          userId,
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
        setFetchAgain((prev) => !prev);
        if (userId === authCtx.user?.userId) {
          dispatch(chatActions.setSelectedChat({ chat: null }));
        } else {
          setGroupChatMembers(response.data.chat.users);
          dispatch(chatActions.setSelectedChat({ chat: response.data.chat }));
        }
        onUpdateGroup(response.data.chat);

        toast({
          title: response.data.message,
          status: "success",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: "An error occured!",
          description:
            err.response?.data?.message || "Failed to update group chat.",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      });

    setLoading(false);
  };

  const deleteGroupHandler = async () => {
    if (!selectedChat?.groupAdmin._id === authCtx.user.userId) {
      toast({
        title: "Only admin can delete the group.",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setLoading(true);

    await axios
      .delete(
        `/api/chats/group/${selectedChat?._id}`,
        {
          headers: {
            Authorization: `Bearer ${authCtx.user.token}`,
          },
        }
      )
      .then((response) => {
        // console.log(response.data);
        dispatch(chatActions.setSelectedChat({ chat: null }));
        setFetchAgain((prev) => !prev);

        toast({
          title: response.data.message,
          status: "success",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: "An error occured!",
          description:
            err.response?.data?.message || "Failed to update group chat.",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      });

    setLoading(false);
  };

  const modalCloseHandler = () => {
    setSearch("");
    setFoundUsers([]);
    setGroupChatName(selectedChat?.chatName);
    setGroupChatMembers(selectedChat?.users);
    onClose();
  };

  return (
    <>
      <Button px={3} onClick={onOpen}>
        <BiEdit style={{ fontSize: "1.3rem" }} />
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="30px"
            fontFamily="Work sans"
            fontWeight="bold"
            textAlign="center"
          >
            Edit Group
          </ModalHeader>
          <ModalCloseButton onClick={modalCloseHandler} />
          <ModalBody>
            <Text
              fontSize={{ base: "1.1rem", md: "1.2rem" }}
              fontFamily="Work sans"
              fontWeight="bold"
            >
              Members :
            </Text>
            <Box display="flex" flexWrap="wrap">
              {groupChatMembers?.length > 0 &&
                groupChatMembers.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    onRemoveUser={removeUserHandler}
                    isLoggedInUser={u._id === authCtx.user.userId}
                  />
                ))}
            </Box>
            <Box display="flex" gap="4px" mt={3}>
              <Input
                value={groupChatName}
                placeholder="Enter your chat name here..."
                onChange={(e) => {
                  setGroupChatName(e.target.value);
                }}
              />
              <Button
                colorScheme="blue"
                onClick={groupRenameHandler}
                isLoading={loading}
              >
                Update
              </Button>
            </Box>
            <Box display="flex" gap="4px" mt={3}>
              <Input
                placeholder="Search users to add to the chat"
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                value={search}
              />
              <Button
                variant="outline"
                colorScheme="blue"
                onClick={userSearchHandler}
                isLoading={loadingSearchResults}
              >
                Go
              </Button>
            </Box>
            {loadingSearchResults ? (
              <LoadingSkeleton />
            ) : (
              foundUsers.length > 0 &&
              foundUsers.map((user) => (
                <Box
                  key={user._id}
                  p={2}
                  my={2}
                  display="flex"
                  alignItems="center"
                  cursor="pointer"
                  borderRadius="md"
                  bg="#E8E8E8"
                  _hover={{
                    background: "#38B2AC",
                    color: "white",
                  }}
                  onClick={() => {
                    addUserHandler(user._id);
                  }}
                >
                  <Avatar
                    size={{ base: "md", md: "md" }}
                    name={user?.name}
                    src={user?.profileImage}
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
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              onClick={() => {
                removeUserHandler(authCtx.user.userId);
              }}
              disabled={loading}
            >
              Leave Group
            </Button>
            <Button
              ml={2}
              colorScheme="red"
              onClick={deleteGroupHandler}
              disabled={loading}
            >
              Delete Group
            </Button>
            <Button
              ml={2}
              colorScheme="blue"
              onClick={modalCloseHandler}
              disabled={loading}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupModal;
