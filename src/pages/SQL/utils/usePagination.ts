import { useState, useMemo } from "react";

interface UsePaginationOptions {
  itemsPerPage: number;
  totalItems: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  pagedData: T[];
}

export const usePagination = <T>(
  data: T[],
  options: UsePaginationOptions
): UsePaginationReturn<T> => {
  const { itemsPerPage, totalItems } = options;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage]
  );

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, currentPage, itemsPerPage]);

  return {
    currentPage,
    totalPages,
    setCurrentPage,
    pagedData,
  };
};

