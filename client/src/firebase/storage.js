import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config";

/**
 * Uploads an image to Firebase Storage and returns the download URL
 * @param {File} file - The file object to upload
 * @returns {Promise<string>} The download URL for the uploaded file
 */
export const uploadImageToFirebase = async (file) => {
  if (!file) {
    console.error("No file provided to uploadImageToFirebase");
    return null;
  }

  console.log("Starting to upload file:", file.name, "Size:", file.size);
  
  try {
    // Log storage to check if it's initialized properly
    console.log("Storage instance:", storage ? "Available" : "Not available");
    
    // Create a unique filename
    const timestamp = new Date().getTime();
    const fileName = `products/${timestamp}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
    console.log("Generated filename:", fileName);
    
    // Create a reference to the file location
    const storageRef = ref(storage, fileName);
    console.log("Storage reference created");
    
    // Upload the file
    console.log("Starting upload...");
    const snapshot = await uploadBytes(storageRef, file);
    console.log("Upload successful, snapshot:", snapshot);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Got download URL:", downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image: ", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      serverResponse: error.serverResponse
    });
    throw error;
  }
};
