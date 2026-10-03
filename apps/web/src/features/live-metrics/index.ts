import { useQuery } from "@tanstack/react-query";
import { apiRepository } from "../../shared/api";
export const useMetrics = (id: string) =>
  useQuery({
    queryKey: ["metrics", id],
    queryFn: () => apiRepository.metrics(id),
  });
export { FlowChart } from "./FlowChart";
