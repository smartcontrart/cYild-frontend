import { BACKEND_API_URL } from "@/utils/constants";
import { PositionInfo } from "@/utils/interfaces/misc";
import { useQuery } from "@tanstack/react-query";
import { useConnection } from "wagmi";

export const usePositions = () => {
  const { address } = useConnection();
  return useQuery({
    queryKey: ["positions", address],
    queryFn: async () => {
      try {
        const serverUrl = BACKEND_API_URL;
        const response = await fetch(
          `${serverUrl}/api/positions/owner/${address}`,
        );
        const result = await response.json();
        return result.data as PositionInfo[];
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    enabled: true,
  });
};
