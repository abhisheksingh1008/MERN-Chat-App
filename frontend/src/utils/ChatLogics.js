export const getSingleChatName = (loggedUser, users) => {
  return users[0]._id === loggedUser.userId
    ? users[1].name
    : users[1]._id === loggedUser.userId
    ? users[0].name
    : "";
};

export const getSingleChatProfileImage = (loggedUser, users) => {
  return users[0]._id === loggedUser.userId
    ? users[1].profileImage?.image_url
    : users[1]._id === loggedUser.userId
    ? users[0].profileImage?.image_url
    : "";
};

export const loggedUserIsGroupAdmin = (loggedUser, groupAdmin) => {
  return groupAdmin._id === loggedUser.userId;
};
