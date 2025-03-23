import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config";

/**
 * Uploads an image to Firebase Storage and returns the download URL
 * @param {File} file - The file object to upload
 * @returns {Promise<string>} The download URL for the uploaded file
 */
export const uploadImageToFirebase = async (file) => {
  try {
    // Create a unique filename
    const timestamp = new Date().getTime();
    const fileName = `products/${timestamp}_${file.name}`;
    
    // Create a reference to the file location
    const storageRef = ref(storage, fileName);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw error;
  }
};