import { defineStorage } from '@aws-amplify/backend';

// Define storage with proper access permissions for authenticated users and guests
export const storage = defineStorage({
  name: 'scentraStorage',
  access: (allow) => ({
    // Grant authenticated users full access to the entire bucket
    '*': [
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.guest.to(['read'])
    ]
  })
});
