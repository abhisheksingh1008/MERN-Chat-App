import { useEffect } from "react";

import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import Login from "../components/authentication/Login";
import Signup from "../components/authentication/Signup";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const LoginPage = () => {
  const authCtx = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authCtx.user) {
      navigate("/chats");
    }
  }, [authCtx.user, navigate]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        p={3}
        bg="white"
        w="100%"
        m="25px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
        textAlign={"center"}
      >
        <Text fontSize="4xl" fontFamily="Work sans" fontWeight="semibold">
          Chat App
        </Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default LoginPage;
