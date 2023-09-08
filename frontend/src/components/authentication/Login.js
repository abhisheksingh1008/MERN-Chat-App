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
  InputGroup,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";

const initialFromState = {
  email: "",
  password: "",
  isSubmitting: false,
};

const Login = () => {
  const authCtx = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState(initialFromState);
  const [showPassword, setShowPassword] = useState(false);

  const inputChangeHandler = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const formSubmitHandler = async (event) => {
    event.preventDefault();

    setFormData((prev) => ({
      ...prev,
      isSubmitting: true,
    }));

    await axios
      .post(`/api/users/login`, {
        email: formData.email,
        password: formData.password,
      })
      .then((response) => {
        if (response.data.success) {
          authCtx.login(response.data?.user);
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
          title: err?.response?.data?.message || "Something went wrong.",
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
      <VStack spacing={"6px"}>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            name="email"
            value={formData.email}
            placeholder="Enter your Email"
            onChange={inputChangeHandler}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              name="password"
              value={formData.password}
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              onChange={inputChangeHandler}
            />
            <InputRightElement width="4.5rem">
              <Button
                size="sm"
                h="1.75rem"
                onClick={() => {
                  setShowPassword((showPassword) => !showPassword);
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
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
          Login
        </Button>
        <Button
          colorScheme={"teal"}
          width="100%"
          color={"white"}
          style={{ marginTop: "10px" }}
          onClick={() => {
            setFormData((prev) => ({
              ...prev,
              email: "guestuser@example.com",
              password: "12345678",
            }));
          }}
          isLoading={formData.isSubmitting}
        >
          Get Guest user credentials
        </Button>
      </VStack>
    </form>
  );
};

export default Login;
