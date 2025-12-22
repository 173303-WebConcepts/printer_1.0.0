import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { ThemedText } from "./ThemeText";
import AppIcon from "../components/AppIcon";

interface PaginationProps {
  paginationData: {
    documentCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  paginationData = { documentCount: 0, totalPages: 0, currentPage: 1, pageSize: 10 },
  onPageChange,
}) => {
  const { totalPages, currentPage } = paginationData;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Generate page numbers (with ellipsis)
  const generatePages = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= halfVisible + 1) {
        for (let i = 1; i <= maxVisiblePages - 1; i++) pages.push(i);
        pages.push("...", totalPages);
      } else if (currentPage >= totalPages - halfVisible) {
        pages.push(1, "...");
        for (let i = totalPages - (maxVisiblePages - 2); i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, "...");
        for (let i = currentPage - halfVisible; i <= currentPage + halfVisible; i++) pages.push(i);
        pages.push("...", totalPages);
      }
    }

    return pages;
  };

  return (
    <View className="flex-row items-center justify-center gap-3 mt-6">
      {/* Prev */}
      <TouchableOpacity
        disabled={currentPage <= 1}
        onPress={() => handlePageChange(currentPage - 1)}
        className={`p-2 ${currentPage <= 1 ? "opacity-40" : "opacity-100"}`}
      >
        <AppIcon name="arrow-back-outline" className="text-primary" />
      </TouchableOpacity>

      {/* Page Numbers */}
      {generatePages().map((page, index) =>
        typeof page === "number" ? (
          <TouchableOpacity
            key={index}
            onPress={() => handlePageChange(page)}
            className={`w-10 h-10 rounded-full items-center justify-center border ${
              page === currentPage ? "bg-primary border-primary" : "border-primary bg-transparent"
            }`}
          >
            <ThemedText className={`${page === currentPage ? "text-white" : "text-primary"}`}>{page}</ThemedText>
          </TouchableOpacity>
        ) : (
          <View key={index} className="w-10 h-10 items-center justify-center">
            <Text className="text-primary text-lg">...</Text>
          </View>
        ),
      )}

      {/* Next */}
      <TouchableOpacity
        disabled={currentPage >= totalPages}
        onPress={() => handlePageChange(currentPage + 1)}
        className={`p-2 ${currentPage >= totalPages ? "opacity-40" : "opacity-100"}`}
      >
        <AppIcon name="arrow-forward-outline" className="text-primary" />
      </TouchableOpacity>
    </View>
  );
};

export default Pagination;
