import {
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useAuth } from "../../store/AuthContext";

const LogoutConfimationModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const authCtx = useAuth();

  const logoutHandler = () => {
    authCtx.logout();
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Are sure you want to logout?</ModalHeader>
          <ModalCloseButton />
          <ModalFooter>
            <Button variant="ghost" colorScheme="blue" onClick={logoutHandler}>
              Confirm
            </Button>
            <Button ml={2} variant="ghost" colorScheme="blue" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LogoutConfimationModal;
