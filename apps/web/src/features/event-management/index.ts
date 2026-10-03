import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { demoRepository } from "../../shared/demo";
export const useEvents = () =>
  useQuery({ queryKey: ["events"], queryFn: demoRepository.listEvents });
export const useEvent = (id: string) =>
  useQuery({
    queryKey: ["events", id],
    queryFn: () => demoRepository.event(id),
  });
export function useDemoMutation<T, R>(action: (input: T) => Promise<R>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: () => client.invalidateQueries(),
  });
}
export { CreateEvent } from "./CreateEvent";
