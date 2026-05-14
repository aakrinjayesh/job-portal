import axiosInstance from "./axiosInstance";

// CREATE POST
export const createPost = (data) =>
  axiosInstance.post("/api/posts", data);

  export const uploadPostMedia = (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return axiosInstance.post("/api/posts/upload-media", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// GET FEED
export const getFeed = () => axiosInstance.get("/api/feed");

// LIKE POST
export const likePost = (postId) =>
  axiosInstance.post("/api/posts/like", { postId });

export const getPostLikes = (postId) =>
  axiosInstance.get("/api/posts/${postId}/likes");

// UNLIKE POST
export const unlikePost = (postId) =>
  axiosInstance.post("/api/posts/unlike", { postId });

// GET COMMENTS
export const getComments = (postId) =>
  axiosInstance.get(`/api/posts/${postId}/comments`);

// ADD COMMENT
export const commentPost = (data) =>
  axiosInstance.post("/api/posts/comment", data);

// FOLLOW / UNFOLLOW
export const followUser = (userId) =>
  axiosInstance.post(`/api/users/${userId}/follow`);
export const unfollowUser = (userId) => axiosInstance.post("/api/unfollow", { userId });

// SUGGESTED USERS
export const getSuggestedUsers = (page = 1, limit = 5) =>
  axiosInstance.get(`/api/users/suggested?page=${page}&limit=${limit}`);

export const getShareSuggestions = (postId) =>
  axiosInstance.get(`/api/posts/${postId}/share-suggestions`);

export const sendPostToUser = (data) =>
  axiosInstance.post("/api/posts/send", data);

export const getUserProfile = (userId) =>
  axiosInstance.get(`/api/users/${userId}`);

export const repostPost = (data) => axiosInstance.post("/api/posts/repost", data);

export const getSuggestedCompanies = () => axiosInstance.get("api/users/suggested-companies");
export const followCompany = (companyId) => axiosInstance.post("api/users/follow-company", { companyId });
export const unfollowCompany = (companyId) => axiosInstance.post("api/users/unfollow-company", { companyId });