import { useDispatch } from "react-redux";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
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
import { BsEyeFill } from "react-icons/bs";
import { useAuth } from "../../store/AuthContext";
import { chatActions } from "../../store/ChatStore/chat-slice";

const ViewGroupModal = ({ chat, setFetchAgain, onUpdateGroup }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const authCtx = useAuth();
  const toast = useToast();
  const dispatch = useDispatch();

  const leaveGroupHandler = async () => {
    await axios
      .patch(
        `/api/chats/group/leave/${chat?._id}`,
        {
          userId: authCtx.user?.userId,
        },
        {
          headers: {
            Authorization: `Bearer ${authCtx.user?.token}`,
          },
        }
      )
      .then((res) => {
        // console.log(res);
        dispatch(chatActions.setSelectedChat({ chat: null }));
        setFetchAgain((prev) => !prev);
        onUpdateGroup(res.data.chat);

        toast({
          title: res.data?.message,
          status: "success",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: "An error occured",
          description: err.response?.data?.message || "Failed to leave group.",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      });
  };

  return (
    <>
      <Button onClick={onOpen}>
        <BsEyeFill />
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
            {chat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {chat?.users.length > 0 &&
              chat?.users.map((user) => (
                <Box
                  key={user._id}
                  p={2}
                  my={2}
                  bg="#E8E8E8"
                  display="flex"
                  borderRadius="md"
                  alignItems="center"
                >
                  <Avatar
                    size={{ base: "md", md: "md" }}
                    name={user?.name}
                    src={user?.profileImage?.image_url}
                  />
                  <Box ml={2}>
                    <Box display="flex" gap={2} alignItems="center">
                      <Text
                        fontSize={{ base: "1.1rem", md: "1.2rem" }}
                        fontFamily="Work sans"
                        fontWeight="bold"
                      >
                        {user.name}
                      </Text>
                      {chat.groupAdmin?._id === user._id && (
                        <Box
                          px={2}
                          py={0.5}
                          h="fit-content"
                          borderRadius={"lg"}
                          backgroundColor="teal"
                        >
                          <Text
                            fontSize="0.75rem"
                            fontWeight="extrabold"
                            fontFamily="Work sans"
                            color={"white"}
                          >
                            Admin
                          </Text>
                        </Box>
                      )}
                    </Box>
                    <Text fontSize="xs">
                      <b>Email: </b>
                      {user.email.substring(0, 28)}
                      {user.email.length > 28 && <span>...</span>}
                    </Text>
                  </Box>
                </Box>
              ))}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={leaveGroupHandler}>
              Leave gorup
            </Button>
            <Button ml={2} colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ViewGroupModal;
