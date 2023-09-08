import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BiSearch, BiSolidBell } from "react-icons/bi";
import { HiChevronDown } from "react-icons/hi";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../store/AuthContext";
import { chatActions } from "../store/ChatStore/chat-slice";
import { getSingleChatName } from "../utils/ChatLogics";
import LoadingSkeleton from "./miscellaneous/ChatLoadingSkeleton";
import UserListItem from "./miscellaneous/UserListItem";
import UserProfileModal from "./modals/UserProfileModal";
import LogoutConfimationModal from "./modals/LogoutConfimationModal";
import "../styles/NotificationButton.css";

const TopSection = () => {
  const authCtx = useAuth();
  const toast = useToast();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const notifications = useSelector((state) => state.chat.notifications);

  const [search, setSearch] = useState("");
  const [loadingSearchResults, setLoadingSearchResults] = useState(false);
  const [foundUsers, setFoundUsers] = useState([]);
  const [buttonIsHighlighted, setButtonIsHighlighted] = useState(false);

  const userSearchHandler = async () => {
    if (!search) {
      toast({
        title: "Please enter something in the input.",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setLoadingSearchResults(true);

    await axios
      .get(`/api/users/find?search=${search}`, {
        headers: {
          Authorization: `Bearer ${authCtx.user?.token}`,
        },
      })
      .then((response) => {
        setFoundUsers(response.data.users);
      })
      .catch((err) => {
        console.log(err.response);
        toast({
          title: "An error occured!",
          description: "Failed to load search results.",
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
      });

    setLoadingSearchResults(false);
  };

  const drawerCloseHandler = () => {
    setSearch("");
    setFoundUsers([]);
    onClose();
  };

  useEffect(() => {
    if (notifications.length === 0) return;

    setButtonIsHighlighted(true);

    const timer = setTimeout(() => {
      setButtonIsHighlighted(false);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [notifications.length]);

  return (
    <>
      <Box
        p={{ base: "8px 4px", md: "8px" }}
        w="100%"
        bg="white"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        borderWidth={{ base: "3px", md: "5px" }}
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button
            p={{ base: "2px", md: "0px 6px" }}
            colorScheme="linkedin"
            onClick={onOpen}
          >
            <BiSearch style={{ fontSize: "1.3rem" }} />
            <Text display={{ base: "none", md: "block" }} ml="4px">
              Search Users
            </Text>
          </Button>
        </Tooltip>
        <Text
          fontSize={{ base: "xl", md: "3xl" }}
          fontFamily="Work sans"
          fontWeight="extrabold"
        >
          Chat App
        </Text>
        <Box display="flex" alignItems="center">
          <Menu>
            <MenuButton
              mr={3}
              display="flex"
              alignItems="center"
              style={{ position: "relative" }}
              className={buttonIsHighlighted ? "bump" : ""}
            >
              <BiSolidBell
                style={{
                  display: "inline",
                  fontSize: "1.75rem",
                  margin: 0,
                }}
              />
              <span
                style={{
                  paddingInline: "5px",
                  color: "white",
                  fontSize: "0.7rem",
                  fontWeight: "bolder",
                  position: "absolute",
                  top: 0,
                  marginLeft: "-12px",
                  backgroundColor: "red",
                  borderRadius: "50%",
                  display: notifications.length > 0 ? "inline" : "none",
                }}
              >
                {notifications.length > 0 ? notifications.length : ""}
              </span>
            </MenuButton>
            <MenuList>
              {notifications.length === 0 ? (
                <MenuItem>No notifications.</MenuItem>
              ) : (
                <>
                  {notifications.length > 0 &&
                    notifications.map((notification) => (
                      <MenuItem
                        key={notification?._id}
                        onClick={() => {
                          dispatch(
                            chatActions.setSelectedChat({
                              chat: notification.chat,
                            })
                          );
                          dispatch(
                            chatActions.removeNotifications({
                              chat: notification.chat,
                            })
                          );
                        }}
                      >
                        {notification.chat.isGroupChat
                          ? `New message in ${notification.chat.chatName}`
                          : `New message from ${getSingleChatName(
                              authCtx.user,
                              notification.chat.users
                            )}`}
                      </MenuItem>
                    ))}
                </>
              )}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<HiChevronDown style={{ fontSize: "1.5rem" }} />}
              p="3px 4px"
            >
              <Avatar
                size={{ base: "xs", md: "sm" }}
                name={authCtx.user?.name}
                src={authCtx.user?.profileImage}
              />
            </MenuButton>
            <MenuList>
              <MenuItem width="100%">
                <UserProfileModal user={authCtx.user}>
                  My Profile
                </UserProfileModal>
              </MenuItem>
              <MenuItem width="100%">
                <LogoutConfimationModal>Logout</LogoutConfimationModal>
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton
            onClick={() => {
              setSearch("");
              setFoundUsers([]);
            }}
          />
          <DrawerHeader>Find users to chat</DrawerHeader>
          <DrawerBody>
            <Box display="flex" gap="4px">
              <Input
                placeholder="Search by name or email..."
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                value={search}
              />
              <Button
                onClick={userSearchHandler}
                isLoading={loadingSearchResults}
              >
                Go
              </Button>
            </Box>
            {loadingSearchResults ? (
              <LoadingSkeleton />
            ) : (
              foundUsers.length > 0 &&
              foundUsers.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  closeSideDrawer={drawerCloseHandler}
                />
              ))
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default TopSection;
