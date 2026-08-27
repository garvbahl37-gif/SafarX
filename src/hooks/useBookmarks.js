import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { toast } from "react-hot-toast";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage(
    "safar360_bookmarks",
    []
  );

  const addBookmark = (item) => {
    const bookmark = {
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      state: item.state,
      images: item.images,
      rating: item.rating,
      addedAt: new Date().toISOString(),
    };

    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === item.id && b.type === item.type);
      if (exists) return prev;

      return [...prev, bookmark];
    });

    toast.success(`${item.title} added to bookmarks!`);
  };

  const removeBookmark = (id, type) => {
    setBookmarks((prev) =>
      prev.filter((b) => !(b.id === id && b.type === type))
    );
    toast.success("Removed from bookmarks");
  };

  const isBookmarked = (id, type) => {
    return bookmarks.some((b) => b.id === id && b.type === type);
  };

  const getBookmarksByType = (type) => {
    return bookmarks.filter((b) => b.type === type);
  };

  const clearBookmarks = () => {
    setBookmarks([]);
    toast.success("All bookmarks cleared");
  };

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    getBookmarksByType,
    clearBookmarks,
  };
}
