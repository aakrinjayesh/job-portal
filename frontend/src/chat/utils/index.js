// Importing necessary modules
import axios from "axios";

// A utility function for handling API requests with loading, success, and error handling
export const requestHandler = async (api, setLoading, onSuccess, onError) => {
  // Show loading state if setLoading function is provided
  if (setLoading) setLoading(true);

  try {
    // Make the API request
    const response = await api();
    const { data } = response;

    if (data?.success) {
      // Call the onSuccess callback with the response data
      onSuccess(data);
    }
  } catch (error) {
    // Handle error cases, including unauthorized and forbidden cases
    // if ([401, 403].includes(error?.response?.data?.statusCode)) {
    //   localStorage.clear(); // Clear local storage on authentication issues
    //   if (isBrowser) window.location.href = "/login"; // Redirect to login page
    // }
    
    // IMPORTANT: Always call onError if it's provided
    if (onError) {
      onError(error?.response?.data?.message || "Something went wrong");
    }
  } finally {
    // Hide loading state if setLoading function is provided
    if (setLoading) setLoading(false);
  }
};

// A utility function to concatenate CSS class names with proper spacing
export const classNames = (...className) => {
  // Filter out any empty class names and join them with a space
  return className.filter(Boolean).join(" ");
};

// Check if the code is running in a browser environment
export const isBrowser = typeof window !== "undefined";

// This utility function generates metadata for chat objects.
// It takes into consideration both group chats and individual chats.
export const getChatObjectMetadata = (chat, loggedInUser) => {
  //  console.log('caht in utils', chat)
  console.log('user in utils',loggedInUser )
  // Determine the content of the last message, if any.
  const lastMessage = chat.lastMessage?.content
    ? chat.lastMessage?.content
    : chat.lastMessage
    ? `${chat.lastMessage?.attachments?.length} attachment${
        chat.lastMessage.attachments.length > 1 ? "s" : ""
      }`
    : "No messages yet"; // Placeholder text if there are no messages.

  if (chat.isGroupChat) {
    // Case: Group chat
    return {
      avatar: "https://via.placeholder.com/100x100.png", // Default group avatar
      title: chat.name,
      description: `${chat.participants.length} members in the chat`,
      lastMessage: chat.lastMessage
        ? chat.lastMessage?.sender?.username + ": " + lastMessage
        : lastMessage,
    };
  } else {
    // Case: Individual chat
    const participant = chat.participants.find(
      (p) => p._id !== loggedInUser?._id
    );
    return {
      avatar: participant?.avatar?.url,
      title: participant?.username,
      description: participant?.email,
      lastMessage,
    };
  }
};

// A class that provides utility functions for working with local storage
export class LocalStorage {
  // Get a value from local storage by key
  static get(key) {
    if (!isBrowser) return;
    const value = localStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  // Set a value in local storage by key
  static set(key, value) {
    if (!isBrowser) return;
    // localStorage.setItem(key, JSON.stringify(value));
  }

  // Remove a value from local storage by key
  static remove(key) {
    if (!isBrowser) return;
    // localStorage.removeItem(key);
  }

  // Clear all items from local storage
  static clear() {
    if (!isBrowser) return;
    localStorage.clear();
  }
}