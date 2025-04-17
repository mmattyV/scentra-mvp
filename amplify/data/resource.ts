import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { getUserAttributes } from "./get-user-attributes/resource";

const schema = a.schema({
  Fragrance: a
    .model({
      productId: a.string().required(), // Unique identifier for the fragrance
      name: a.string().required(),
      brand: a.string().required(),
      description: a.string(),
      category: a.string(),
    })
    .authorization((allow) => [
      // Public API key users can only read
      allow.publicApiKey().to(['read']),
      // Regular authenticated users can only read
      allow.authenticated().to(['read']),
      // Only ADMINS group can create/update/delete fragrances
      allow.group("ADMINS")
    ]),

  Listing: a
    .model({
      sellerId: a.string().required(),
      fragranceId: a.string().required(), // References productId in Fragrance model
      bottleSize: a.string().required(),
      condition: a.string().required(), // "new" or "used" 
      percentRemaining: a.integer(), // Only applies if condition is "used"
      askingPrice: a.float().required(),
      status: a.string().default("active"), // "active", "sold", "removed"
      imageKey: a.string().required(), // S3 key for the image in Amplify Storage
      createdAt: a.datetime().required(),
    })
    .authorization((allow) => [
      // Public API key users can only read
      allow.publicApiKey().to(['read']),
      // Authenticated users have full access
      allow.authenticated(),
      // Admin group has full access
      allow.group("ADMINS"),
      // For regular users, we'll handle additional authorization at the application level
      // by comparing the current user's ID with the sellerId field
    ]),
    
  // Custom query to get user attributes (admin only)
  getUserAttributes: a
    .query()
    .arguments({
      userId: a.string().required()
    })
    .authorization((allow) => [allow.group("ADMINS")])
    .handler(a.handler.function(getUserAttributes))
    .returns(a.json())
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});