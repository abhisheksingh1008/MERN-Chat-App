import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from "@chakra-ui/react";

const REACT_APP_CLOUDINARY_CLOUD_NAME = "dmndmxhsc";

const initialFromState = {
  name: "",
  email: "",
  password: "",
  confirmedPassword: "",
  isSubmitting: false,
  isError: "",
};

const handleFileUpload = async (filetype, file) => {
  try {
    if (!file) return;
    if (!filetype) filetype = "auto";

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${REACT_APP_CLOUDINARY_CLOUD_NAME}/${filetype}/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chat_app_preset");

    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to upload file.");
    }

    const { secure_url } = data;

    return secure_url;
  } catch (error) {
    console.log(error);
  }
};

const Signup = () => {
  const authCtx = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState(initialFromState);
  const [profilePicture, setProfilePicture] = useState(null);

  const inputChangeHandler = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const formSubmitHandler = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmedPassword) {
      toast({
        title: "Passwords did not match.",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      isSubmitting: true,
    }));

    const image_url = await handleFileUpload("image", profilePicture);

    if (!image_url) {
      toast({
        title: "Failed to upload file.",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });

      setFormData((prev) => ({
        ...prev,
        isSubmitting: false,
      }));

      return;
    }

    await axios
      .post(`/api/users/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        profileImage: image_url,
      })
      .then((response) => {
        if (response.data.success) {
          authCtx.signup(response.data?.user);
        }
        toast({
          title: response.data.message,
          status: "success",
          duration: 6000,
          isClosable: true,
          position: "top",
        });

        navigate("/chats");
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

    setFormData((prev) => ({
      ...prev,
      isSubmitting: false,
    }));
  };

  return (
    <form onSubmit={formSubmitHandler}>
      <VStack spacing={"5px"}>
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            name="name"
            placeholder="Enter your Name"
            onChange={inputChangeHandler}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            name="email"
            placeholder="Enter your Email"
            onChange={inputChangeHandler}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            name="password"
            type={"password"}
            placeholder="Enter your password"
            onChange={inputChangeHandler}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <Input
            name="confirmedPassword"
            placeholder="Re-enter password"
            type={"password"}
            onChange={inputChangeHandler}
          />
        </FormControl>
        <FormControl isRequired>
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
        <Button
          type="submit"
          colorScheme={"blue"}
          width="100%"
          color={"white"}
          style={{ marginTop: "10px" }}
          isLoading={formData.isSubmitting}
          loadingText="Submitting"
        >
          Register
        </Button>
      </VStack>
    </form>
  );
};

export default Signup;
