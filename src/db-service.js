import { db } from "./firebase-config";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";

// Define your collection name (e.g., "todos", "users", "products")
const COLLECTION_NAME = "my_items"; 
const itemsCollectionRef = collection(db, COLLECTION_NAME);

// --- CREATE ---
// Replaces: localStorage.setItem(...)
export const addItem = async (itemData) => {
  try {
    const data = await addDoc(itemsCollectionRef, itemData);
    return data.id; // Returns the auto-generated ID
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};

// --- READ ---
// Replaces: JSON.parse(localStorage.getItem(...))
export const getItems = async () => {
  try {
    const data = await getDocs(itemsCollectionRef);
    // Map data to an array format
    return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  } catch (error) {
    console.error("Error getting documents: ", error);
    return [];
  }
};

// --- UPDATE ---
// Replaces: Finding item in array, modifying, saving back to localStorage
export const updateItem = async (id, updatedFields) => {
  try {
    const itemDoc = doc(db, COLLECTION_NAME, id);
    await updateDoc(itemDoc, updatedFields);
  } catch (error) {
    console.error("Error updating document: ", error);
  }
};

// --- DELETE ---
// Replaces: Filtering array and saving back to localStorage
export const deleteItem = async (id) => {
  try {
    const itemDoc = doc(db, COLLECTION_NAME, id);
    await deleteDoc(itemDoc);
  } catch (error) {
    console.error("Error deleting document: ", error);
  }
};