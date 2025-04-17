/**
 * Admin API client
 * This module provides client functions to interact with the admin API endpoints
 */
import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { Schema } from '@/amplify/data/resource';

// Initialize a separate client specifically for admin operations with userPool authorization
const adminClient = generateClient<Schema>({
  authMode: 'userPool' // This ensures we use Cognito User Pool groups for auth
});

/**
 * User data interface
 */
export interface UserData {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Checks if the current user is in the ADMINS group
 * @returns Promise resolving to boolean indicating if user is admin
 */
async function isUserAdmin(): Promise<boolean> {
  try {
    // Get the current user's session with tokens
    const session = await fetchAuthSession();
    
    // Extract groups from the ID token
    const groups = session.tokens?.idToken?.payload['cognito:groups'] || [];
    
    // Check if user is in the ADMINS group
    if (Array.isArray(groups) && groups.includes('ADMINS')) {
      console.log('User is in ADMINS group, granting access');
      return true;
    } else {
      console.log('User is not in ADMINS group, denying access');
      return false;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Retrieves user data by user ID (admin only)
 * This requires the user to be in the ADMINS group
 * @param userId - The Cognito user ID
 * @returns Promise containing user data
 */
export async function fetchUserById(userId: string): Promise<UserData> {
  try {
    console.log('Fetching user attributes for ID:', userId);
    
    // First verify the current user has admin permissions
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      console.error('Permission denied: Current user is not in the ADMINS group');
      throw new Error('Permission denied: Admin access required');
    }
    
    // Call the custom getUserAttributes query (admin-only) with the admin client
    const response = await adminClient.queries.getUserAttributes({
      userId: userId
    });
    
    console.log('Full getUserAttributes response:', JSON.stringify(response, null, 2));
    
    if (!response || !response.data) {
      console.warn('No response or data received from getUserAttributes query');
      // This likely means the function isn't deployed or there's a permissions issue
      throw new Error('getUserAttributes returned no data. Please check your Amplify deployment.');
    }
    
    // The data comes back as a JSON string, so we need to parse it
    let userData: UserData;
    try {
      // Parse the string into a JavaScript object
      userData = JSON.parse(response.data as string) as UserData;
      console.log('Successfully parsed user data:', userData);
    } catch (parseError) {
      console.error('Error parsing user data JSON:', parseError);
      throw new Error('Failed to parse user data response');
    }
    
    // If we have valid user data, return it
    if (userData && userData.userId) {
      return userData;
    }
    
    // If we reach here, the data is missing or invalid - use fallback
    console.log('No valid user data from API, using fallback for:', userId);
    
    // Generate fallback data
    const shortId = userId.substring(0, 6).toUpperCase();
    return {
      userId,
      username: `Seller ${shortId}`,
      email: `seller-${shortId.toLowerCase()}@example.com`,
      firstName: 'Seller',
      lastName: `#${shortId}`,
      phone: ''
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    
    // Return fallback data if API fails
    const shortId = userId.substring(0, 6).toUpperCase();
    return {
      userId,
      username: `Seller ${shortId}`,
      email: `seller-${shortId.toLowerCase()}@example.com`,
      firstName: 'Seller',
      lastName: `#${shortId}`,
      phone: ''
    };
  }
}

/**
 * Fetches multiple users by their IDs in parallel (admin only)
 * @param userIds - Array of user IDs to fetch
 * @returns Promise containing a mapping of userId to UserData
 */
export async function fetchUsersByIds(userIds: string[]): Promise<Record<string, UserData>> {
  try {
    // First verify the current user has admin permissions
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      console.error('Permission denied: Current user is not in the ADMINS group');
      throw new Error('Permission denied: Admin access required');
    }
    
    // Remove duplicates using filter
    const uniqueIds: string[] = userIds.filter((id, index) => 
      userIds.indexOf(id) === index
    );
    
    // Fetch all users in parallel
    const userPromises = uniqueIds.map(id => fetchUserById(id));
    const users = await Promise.all(userPromises);
    
    // Create a record mapping userId to userData
    return users.reduce((acc, user) => {
      if (user && user.userId) {
        acc[user.userId] = user;
      }
      return acc;
    }, {} as Record<string, UserData>);
  } catch (error) {
    console.error('Error fetching multiple users:', error);
    return {};
  }
}