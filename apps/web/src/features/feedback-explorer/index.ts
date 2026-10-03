import { useQuery } from "@tanstack/react-query";
import { demoRepository } from "../../shared/demo";
export const useFeedback = (id: string) =>
  useQuery({
    queryKey: ["feedback", id],
    queryFn: () => demoRepository.feedback(id),
  });
