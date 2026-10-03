import { useQuery } from "@tanstack/react-query";
import { demoRepository } from "../../shared/demo";
export const useMetrics = (id: string) =>
  useQuery({
    queryKey: ["metrics", id],
    queryFn: () => demoRepository.metrics(id),
  });
export { FlowChart } from "./FlowChart";
