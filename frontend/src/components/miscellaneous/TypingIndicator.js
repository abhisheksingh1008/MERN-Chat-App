import { Avatar, Box, Tooltip } from "@chakra-ui/react";
import loadingAnimation from "../../animations/typing.json";
import { useLottie } from "lottie-react";

const animationOptions = {
  loop: true,
  autoplay: true,
  animationData: loadingAnimation,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const TypingIndicator = ({ userWhoIsTyping }) => {
  const { View } = useLottie(animationOptions);
  return (
    <Box m={1} display="flex" alignItems="center">
      <Tooltip label={userWhoIsTyping?.name} placement="bottom" hasArrow>
        <Avatar
          mt="7px"
          size="xs"
          cursor="pointer"
          name={userWhoIsTyping?.name}
          src={userWhoIsTyping?.profileImage}
        />
      </Tooltip>
      <div style={{ marginLeft: "8px" }}>{View}</div>
    </Box>
  );
};

export default TypingIndicator;
