import { BACKEND_API_URL } from "@/utils/constants";
import { PositionInfo } from "@/utils/interfaces/misc";
import { useQuery } from "@tanstack/react-query";

export const useApiPositionInfo = ({ positionId }: { positionId: string }) => {
  return useQuery({
    queryKey: ["positionDetails", positionId],
    queryFn: async () => {
      try {
        const serverUrl = BACKEND_API_URL;
        const response = await fetch(
          `${serverUrl}/api/positions/${positionId}`,
        );
        const result = await response.json();
        return result.data as PositionInfo;
      } catch (error) {
        console.error(error);
        return undefined;
      }
    },
    enabled: true,
  });
};
