import { defineStorage } from '@aws-amplify/backend';

// Define storage with simple configuration, matching Amplify Gen2 docs
export const storage = defineStorage({
  name: 'scentraStorage',
});
