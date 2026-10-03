import { useQuery } from "@tanstack/react-query";
import { apiRepository } from "../../shared/api";
export const useFeedback = (id: string) =>
  useQuery({
    queryKey: ["feedback", id],
    queryFn: () => apiRepository.feedback(id),
  });
