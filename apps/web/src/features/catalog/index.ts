import { useQuery } from "@tanstack/react-query";
import { apiRepository } from "../../shared/api";
export const useProducts = () =>
  useQuery({ queryKey: ["products"], queryFn: apiRepository.products });
