import { Box } from "@chakra-ui/react";
import { IoMdClose } from "react-icons/io";

const UserBadgeItem = ({ user, onRemoveUser, isLoggedInUser }) => {
  return (
    <Box
      px={2}
      py={1}
      m={1}
      mb={2}
      fontSize={12}
      bg="teal"
      color="white"
      variant="solid"
      borderRadius="lg"
      display="flex"
      alignItems="center"
    >
      {user.name} {isLoggedInUser && <span> (You)</span>}
      <IoMdClose
        style={{
          color: "white",
          fontSize: "1rem",
          marginLeft: "2px",
          cursor: "pointer",
        }}
        onClick={() => {
          onRemoveUser(user._id);
        }}
      />
    </Box>
  );
};

export default UserBadgeItem;
