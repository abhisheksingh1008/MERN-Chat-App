import { Skeleton, Stack } from "@chakra-ui/react";

const LoadingSkeleton = () => {
  return (
    <Stack>
      <Skeleton height="30px" />
      <Skeleton height="30px" />
      <Skeleton height="30px" />
    </Stack>
  );
};

export default LoadingSkeleton;
