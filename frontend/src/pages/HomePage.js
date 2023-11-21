import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { useAuth } from "../store/AuthContext";
import ChatBox from "../components/ChatBox";
import MyChats from "../components/MyChats";

const HomePage = () => {
  const authCtx = useAuth();
  const navigate = useNavigate();

  const [fetchAgain, setFetchAgain] = useState(false);

  useEffect(() => {
    if (!authCtx.user) {
      navigate("/");
    }
  }, [authCtx.user, navigate]);

  return (
    <div style={{ width: "100%" }}>
      {authCtx.user && (
        <>
          <Box
            height={"100dvh"}
            gap="5px"
            display="flex"
            alignItems="flex-start"
            justifyContent="space-around"
            p={{ base: "3px", md: "8px" }}
          >
            <MyChats fetchAgain={fetchAgain}></MyChats>
            <ChatBox setFetchAgain={setFetchAgain}></ChatBox>
          </Box>
        </>
      )}
    </div>
  );
};

export default HomePage;
