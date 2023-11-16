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
  VStack,
} from "@chakra-ui/react";
import { useAuth } from "../../store/AuthContext";
import { handleFileUpload } from "../../utils/cloudinary";

const MyAccountModal = ({ children }) => {
  const toast = useToast();
  const authCtx = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [name, setName] = useState(authCtx.user.name);
  const [about, setAbout] = useState(authCtx.user.about);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const saveChangesHandler = async () => {
    if (name.trim().length === 0) {
      toast({
        title: "Name cannot be empty.",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setIsSubmitting(true);

    let image_url, public_id;
    if (profilePicture) {
      try {
        const res = await handleFileUpload(profilePicture, "image");
        if (!res.image_url || !res.public_id) {
          toast({
            title: "Failed to upload profile picture. Please try again later.",
            status: "error",
            duration: 6000,
            isClosable: true,
            position: "top",
          });
          setIsSubmitting(false);
          return;
        }
        image_url = res.image_url;
        public_id = res.public_id;
      } catch (error) {
        toast({
          title: error.message,
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
        setIsSubmitting(false);
        return;
      }
    }
    await axios
      .post(
        `/api/users/${authCtx.user.userId}/update`,
        {
          updatedUser: {
            name,
            about,
            profileImage: profilePicture
              ? {
                  image_url,
                  public_id,
                }
              : authCtx.user.profileImage,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${authCtx.user.token}`,
          },
        }
      )
      .then((res) => {
        authCtx.login(res.data.user);
        toast({
          title: res.data.message,
          status: "success",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
        setIsEditing(false);
        setProfilePicture(null);
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: "An error occured!",
          description: err.response.data.message,
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      });

    setIsSubmitting(false);
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>
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
            {authCtx.user?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column">
            {!isEditing ? (
              <>
                <Image
                  borderRadius="full"
                  boxSize="150px"
                  src={authCtx.user?.profileImage?.image_url}
                  alt={authCtx.user?.name}
                  mb="10px"
                  alignSelf={"center"}
                />
                <Text
                  fontSize={{ base: "18px", md: "20px" }}
                  fontFamily="Work sans"
                  fontWeight="semibold"
                  textAlign={"center"}
                >
                  {authCtx.user?.about}
                </Text>
                <Text
                  fontSize={{ base: "18px", md: "20px" }}
                  fontFamily="Work sans"
                  fontWeight="semibold"
                  textAlign={"center"}
                >
                  Email : {authCtx.user?.email}
                </Text>
              </>
            ) : (
              <VStack spacing={"5px"}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    value={name}
                    placeholder="Enter your Name"
                    onChange={(e) => setName(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>About</FormLabel>
                  <Input
                    name="about"
                    value={about}
                    placeholder="Enter about yourself here"
                    onChange={(e) => setAbout(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Upload Your Image</FormLabel>
                  <Input
                    name="profilePicture"
                    type={"file"}
                    accept="image/*"
                    p={"1.5"}
                    onChange={(e) => {
                      setProfilePicture(e.target.files[0]);
                    }}
                  />
                </FormControl>
                {profilePicture && (
                  <>
                    <FormLabel>Selected image : </FormLabel>
                    <Image
                      borderRadius="lg"
                      src={`${URL.createObjectURL(profilePicture)}`}
                      alt={"profile-picture"}
                    />
                  </>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            {!isEditing ? (
              <>
                <Button
                  mr={3}
                  variant="solid"
                  colorScheme="blue"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  mr={3}
                  variant="ghost"
                  colorScheme="blue"
                  onClick={onClose}
                >
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button
                  mr={3}
                  variant="solid"
                  colorScheme="blue"
                  onClick={saveChangesHandler}
                  isLoading={isSubmitting}
                  loadingText="Saving..."
                >
                  Save
                </Button>
                <Button
                  mr={3}
                  variant="solid"
                  colorScheme="blue"
                  onClick={() => {
                    setName(authCtx.user.name);
                    setAbout("");
                    setProfilePicture(null);
                    setIsEditing(false);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MyAccountModal;
