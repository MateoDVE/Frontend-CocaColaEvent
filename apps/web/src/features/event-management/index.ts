import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRepository } from "../../shared/api";
export const useEvents = () =>
  useQuery({ queryKey: ["events"], queryFn: apiRepository.listEvents });
export const useEvent = (id: string) =>
  useQuery({
    queryKey: ["events", id],
    queryFn: () => apiRepository.event(id),
  });
export function useDemoMutation<T, R>(action: (input: T) => Promise<R>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: () => client.invalidateQueries(),
  });
}
export { CreateEvent } from "./CreateEvent";
