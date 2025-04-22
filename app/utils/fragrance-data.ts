// Import fragrance data from the generated JSON file
import fragranceData from './fragrance-data.json';

// Export the fragrances array to maintain compatibility with existing code
export const FRAGRANCES = fragranceData;

// Type definition for a fragrance
export interface Fragrance {
  productId: string;
  name: string;
  brand: string;
  description: string;
  gender: string;
  imageUrl: string;
}
