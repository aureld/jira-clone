import { useRouter } from "next/navigation";
import { InferResponseType } from "hono";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api.auth.logout)["$post"]>;

export const useLogout = () => {
  const router = useRouter();
  const QueryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.auth.logout["$post"]();
      return await response.json();
    },
    onSuccess: () => {
      router.refresh();
      QueryClient.invalidateQueries({ queryKey: ["current"] });
    },
  });

  return mutation;
};
