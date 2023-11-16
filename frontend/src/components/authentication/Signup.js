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
import { handleFileUpload } from "../../utils/cloudinary";

const initialFromState = {
  name: "",
  email: "",
  password: "",
  confirmedPassword: "",
  isSubmitting: false,
  isError: "",
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

    let image_url, public_id;
    try {
      const result = await handleFileUpload(profilePicture, "image");
      if (!result.image_url || !result.public_id) {
        toast({
          title: "Failed to upload wallpaper. Please try again later.",
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
        profileImage: {
          image_url,
          public_id,
        },
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
