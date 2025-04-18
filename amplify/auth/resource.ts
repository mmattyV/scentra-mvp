import { defineAuth } from "@aws-amplify/backend";
import { getUserAttributes } from "../data/get-user-attributes/resource";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },

  userAttributes: {
    // Standard attributes
    givenName: {
      required: true,
      mutable: true,
    },
    familyName: {
      required: true,
      mutable: true,
    },
  },
  
  // Define admin group for user management
  groups: ["ADMINS"],
  
  // Grant specific permissions to our function to access user data
  access: (allow) => [
    allow.resource(getUserAttributes).to(["getUser", "listUsers"])
  ]
});
