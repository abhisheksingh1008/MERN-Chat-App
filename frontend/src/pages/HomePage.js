import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { useAuth } from "../store/AuthContext";
import ChatBox from "../components/ChatBox";
import MyChats from "../components/MyChats";
import TopSection from "../components/TopSection";

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
          <TopSection></TopSection>
          <Box
            height={{ base: "90.5dvh", md: "88vh" }}
            gap="5px"
            display="flex"
            alignItems="flex-start"
            justifyContent="space-around"
            p={{ base: "4px", md: "10px" }}
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
