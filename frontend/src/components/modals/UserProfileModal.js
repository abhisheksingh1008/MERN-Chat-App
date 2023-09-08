import {
  Button,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { BsEyeFill } from "react-icons/bs";

const UserProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <Button onClick={onOpen}>
          <BsEyeFill />
        </Button>
      )}
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        m="2px"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="30px"
            fontFamily="Work sans"
            fontWeight="bold"
            textAlign="center"
          >
            {user?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Image
              borderRadius="full"
              boxSize="150px"
              src={user?.profileImage}
              alt={user?.name}
              mb="10px"
            />
            <Text
              fontSize={{ base: "22px", md: "25px" }}
              fontFamily="Work sans"
              fontWeight="semibold"
            >
              Email : {user?.email}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UserProfileModal;
