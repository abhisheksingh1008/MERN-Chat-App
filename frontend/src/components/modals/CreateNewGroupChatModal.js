import { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormLabel,
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
import { useAuth } from "../../store/AuthContext";
import { chatActions } from "../../store/ChatStore/chat-slice";
import LoadingSkeleton from "../miscellaneous/ChatLoadingSkeleton";
import UserBadgeItem from "../miscellaneous/UserBadgeItem";

const GroupChatModal = ({ children }) => {
  const authCtx = useAuth();
  const toast = useToast();
  const dispatch = useDispatch();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [foundUsers, setFoundUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupChatName, setGroupChatName] = useState("");
  const [loadingSearchResults, setLoadingSearchResults] = useState(false);

  const userSearchHandler = async () => {
    if (!search) {
      toast({
        title: "Please enter something in the input.",
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
        console.log(err.response);
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

  const addUserHandler = (user) => {
    if (selectedUsers.find((u) => u._id === user._id)) {
      toast({
        title: "User already added",
        status: "success",
        duration: 6000,
        isClosable: true,
        position: "top",
      });
    } else {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const createChatHandler = async () => {
    if (groupChatName.trim().length <= 0) {
      toast({
        title: "Please enter the chat name.",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });

      return;
    }
    if (selectedUsers.length < 2) {
      toast({
        title: "A group must contain 3 or more members.",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });

      return;
    }

    setLoading(true);

    await axios
      .post(
        `/api/chats/group`,
        {
          chatName: groupChatName,
          users: selectedUsers.map((u) => u._id),
        },
        {
          headers: {
            Authorization: `Bearer ${authCtx.user.token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        dispatch(chatActions.addNewChat({ chat: response.data.chat }));
        dispatch(chatActions.setSelectedChat({ chat: response.data.chat }));
        dispatch(chatActions.setNewChat({ chat: response.data.chat }));

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
            err.response?.data?.message || "Failed to create new group chat.",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      });

    setLoading(false);
    modalCloseHandler();
  };

  const modalCloseHandler = () => {
    setSearch("");
    setFoundUsers([]);
    setGroupChatName("");
    setSelectedUsers([]);
    onClose();
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="30px"
            fontFamily="Work sans"
            fontWeight="bold"
            textAlign="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton onClick={modalCloseHandler} />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Group Name</FormLabel>
              <Input
                name="email"
                value={groupChatName}
                placeholder="Enter your chat name here..."
                onChange={(e) => {
                  setGroupChatName(e.target.value);
                }}
              />
            </FormControl>
            <Box display="flex" gap="4px" mt={3}>
              <Input
                placeholder="Search by name or email..."
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
            <Box display="flex" flexWrap="wrap" mt={3}>
              {selectedUsers.length > 0 &&
                selectedUsers.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    onRemoveUser={(userId) => {
                      setSelectedUsers((prev) =>
                        prev.filter((u) => u._id !== userId)
                      );
                    }}
                  />
                ))}
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
                    addUserHandler(user);
                  }}
                >
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
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              colorScheme="blue"
              isLoading={loading}
              loadingText="Creating..."
              onClick={createChatHandler}
            >
              Create
            </Button>
            <Button
              colorScheme="blue"
              onClick={modalCloseHandler}
              disabled={loading}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
