import {
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";

const DisplayImageModal = ({ children, image_url }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <span onClick={onOpen}>{children}</span>
      <Modal
        size={"3xl"}
        isOpen={isOpen}
        onClose={onClose}
        blockScrollOnMount={true}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody mt={1} mb={4}>
            <Image borderRadius="lg" src={image_url} alt={"image"} mx="auto" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DisplayImageModal;
