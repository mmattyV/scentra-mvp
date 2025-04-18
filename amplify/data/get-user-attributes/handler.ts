import type { Schema } from "../resource";
import { env } from "$amplify/env/get-user-attributes";
import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
  AttributeType
} from "@aws-sdk/client-cognito-identity-provider";
import type { UserData } from '../../../app/types';

type Handler = Schema["getUserAttributes"]["functionHandler"];

// Initialize the Cognito client
const client = new CognitoIdentityProviderClient();

export const handler: Handler = async (event) => {
  const { userId } = event.arguments;
  
  console.log('getUserAttributes called with userId:', userId);
  
  if (!userId) {
    console.error('Missing required userId parameter');
    return null;
  }
  
  try {
    console.log('Fetching user data from UserPool:', env.AMPLIFY_AUTH_USERPOOL_ID);
    
    // Create the AdminGetUser command
    const command = new AdminGetUserCommand({
      Username: userId,
      // Use the imported env variable instead of process.env
      UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID
    });
    
    // Send the command to get user data
    const userData = await client.send(command);
    console.log('Cognito response:', JSON.stringify(userData, null, 2));
    
    // Transform the user attributes into a more user-friendly format
    const attributes = userData.UserAttributes?.reduce((result: Record<string, string>, attr: AttributeType) => {
      if (attr.Name && attr.Value) {
        result[attr.Name] = attr.Value;
      }
      return result;
    }, {} as Record<string, string>) || {};
    
    // Return a formatted user object
    return {
      userId: userId,
      username: userData.Username || 'User',
      email: attributes.email || '',
      firstName: attributes.given_name || '',
      lastName: attributes.family_name || '',
      phone: attributes.phone_number || ''
    } as UserData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    
    // Return a fallback with the ID if the user cannot be found
    const shortId = userId.substring(0, 6).toUpperCase();
    return {
      userId: userId,
      username: `Seller ${shortId}`,
      email: `seller-${shortId.toLowerCase()}@example.com`,
      firstName: 'Seller',
      lastName: `#${shortId}`,
      phone: ''
    } as UserData;
  }
};
