import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

/**
 * Updates a listing's status and syncs the change to any related order items
 * This ensures status consistency between listings and order items after purchase
 */
export async function updateListingWithStatusSync(
  listingId: string, 
  newStatus: string,
  authMode: 'userPool' | 'apiKey' | 'iam' = 'userPool'
): Promise<void> {
  const client = generateClient<Schema>({ authMode });
  
  try {
    // 1. Update the listing status
    await client.models.Listing.update({
      id: listingId,
      status: newStatus
    });
    
    // 2. Find any order items related to this listing
    const { data: relatedOrderItems } = await client.models.OrderItem.list({
      filter: { listingId: { eq: listingId } }
    });
    
    // 3. Update all related order items with the same status
    if (relatedOrderItems && relatedOrderItems.length > 0) {
      // Update each order item with the same status
      await Promise.all(
        relatedOrderItems.map(item => 
          client.models.OrderItem.update({
            id: item.id,
            status: newStatus
          })
        )
      );
      
      console.log(`Updated status for listing ${listingId} and ${relatedOrderItems.length} related order items to ${newStatus}`);
    } else {
      console.log(`Updated status for listing ${listingId} to ${newStatus} (no related order items)`);
    }
  } catch (error) {
    console.error(`Error updating listing ${listingId} status:`, error);
    throw new Error('Failed to update listing status');
  }
}
