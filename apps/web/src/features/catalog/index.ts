import { useQuery } from "@tanstack/react-query";
import { demoRepository } from "../../shared/demo";
export const useProducts = () =>
  useQuery({ queryKey: ["products"], queryFn: demoRepository.products });
