"use client";

import { useState } from "react";
import axios from "axios";
import {
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
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../../store/AuthContext";
import { handleFileUpload } from "../../utils/cloudinary";

const ChatWallpaperModal = ({ children }) => {
  const toast = useToast();
  const { user, editChatWallpaper } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [isEditing, setIsEditing] = useState(false);
  const [wallpaper, setWallpaper] = useState(null);
  const [loading, setLoading] = useState(false);

  const addNewWallpaper = async () => {
    if (!wallpaper) {
      toast({
        title: "Please upload an image",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setLoading(true);

    let image_url, public_id;

    try {
      const result = await handleFileUpload(wallpaper, "image");
      if (!result.image_url || !result.public_id) {
        toast({
          title: "Failed to upload wallpaper. Please try again later.",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
        setLoading(false);
        return;
      }
      image_url = result.image_url;
      public_id = result.public_id;
    } catch (error) {
      toast({
        title: error.message,
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
      return;
    }

    await axios
      .post(
        `/api/users/${user.userId}/chat-wallpaper`,
        {
          wallpaper: { image_url, public_id },
          remove: false,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      .then((response) => {
        if (response.data.success) {
          editChatWallpaper(response.data?.chatWallpaper);
          toast({
            title: response.data.message,
            status: "success",
            duration: 6000,
            isClosable: true,
            position: "top",
          });
          setWallpaper(null);
          setIsEditing(false);
        }
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: err.response.data.message,
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      });

    setLoading(false);
  };

  const removeWallpaper = async () => {
    setLoading(true);

    await axios
      .post(
        `/api/users/${user.userId}/chat-wallpaper`,
        {
          remove: true,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      .then((response) => {
        if (response.data.success) {
          editChatWallpaper(response.data?.chatWallpaper);
          toast({
            title: response.data.message,
            status: "success",
            duration: 6000,
            isClosable: true,
            position: "top",
          });
          setWallpaper(null);
        }
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: err.response.data.message,
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      });

    setLoading(false);
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign={"center"}>Chats Wallpaper</ModalHeader>
          <ModalBody
            display="flex"
            flexDir="column"
            justifyContent="space-between"
          >
            {user.chatWallpaper?.image_url?.trim()?.length > 0 ? (
              <Image
                borderRadius="lg"
                src={user?.chatWallpaper?.image_url}
                alt={"wallpaper"}
                mb="10px"
              />
            ) : (
              !wallpaper && <Text>No wallpaper.</Text>
            )}
            {isEditing && (
              <FormControl>
                <FormLabel>Upload Wallpaper</FormLabel>
                <Input
                  name="wallpaper"
                  type={"file"}
                  accept="image/*"
                  p={"1.5"}
                  onChange={(e) => {
                    setWallpaper(e.target.files[0]);
                  }}
                />
              </FormControl>
            )}
            {wallpaper && (
              <>
                <FormLabel mt={2}>Selected image : </FormLabel>
                <Image
                  borderRadius="lg"
                  src={`${URL.createObjectURL(wallpaper)}`}
                  alt={"wallpaper"}
                />
              </>
            )}
          </ModalBody>
          <ModalFooter>
            {isEditing ? (
              <>
                <Button
                  isLoading={loading}
                  variant="solid"
                  colorScheme="blue"
                  onClick={addNewWallpaper}
                  loadingText="Submitting"
                >
                  Save
                </Button>
                <Button
                  ml={2}
                  variant="solid"
                  colorScheme="blue"
                  onClick={() => {
                    setIsEditing(false);
                    setWallpaper(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="solid"
                  colorScheme="blue"
                  onClick={() => setIsEditing(true)}
                >
                  {user.chatWallpaper?.image_url ? "Change" : "Add"}
                </Button>
                {user.chatWallpaper?.image_url.trim().length > 0 && (
                  <Button
                    ml={2}
                    variant="solid"
                    colorScheme="red"
                    isLoading={loading}
                    loadingText="Deleting..."
                    onClick={removeWallpaper}
                  >
                    Remove
                  </Button>
                )}
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ChatWallpaperModal;
