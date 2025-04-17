import { defineStorage } from '@aws-amplify/backend';

// Define storage with proper access permissions for authenticated users and guests
export const storage = defineStorage({
  name: 'scentraStorage',
  access: (allow) => ({
    // Grant authenticated users access to their own files, admin access to all files
    'listings/*': [
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']), // Admin access to all files
      allow.authenticated.to(['read', 'write', 'delete']),      // Regular users
      allow.guest.to(['read'])                                  // Guest read-only
    ]
  })
});
