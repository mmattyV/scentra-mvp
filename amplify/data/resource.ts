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

  // New model for seller payment preferences
  SellerPaymentPreference: a
    .model({
      sellerId: a.string().required(),
      preferredMethod: a.string().required(), // "paypal" or "venmo"
      paymentHandle: a.string().required(), // Username or email for the payment method
      updatedAt: a.datetime().required(),
    })
    .authorization((allow) => [
      // Only authenticated users can access their own payment preferences
      allow.authenticated(),
      // Admin group has full access
      allow.group("ADMINS"),
      // Application-level authorization will ensure users can only access their own preferences
    ]),

  Listing: a
    .model({
      sellerId: a.string().required(),
      fragranceId: a.string().required(), // References productId in Fragrance model
      bottleSize: a.string().required(),
      condition: a.string().required(), // "new" or "used" 
      percentRemaining: a.integer(), // Only applies if condition is "used"
      hasOriginalBox: a.boolean().default(false), // Whether the item comes with its original box
      askingPrice: a.float().required(),
      status: a.string().default("active"), // "active", "sold", "removed"
      imageKey: a.string().required(), // S3 key for the image in Amplify Storage
      createdAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
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
    
  // Order model for checkout
  Order: a
    .model({
      buyerId: a.string().required(),
      shippingAddress: a.json().required(),
      subtotal: a.float().required(),
      total: a.float().required(),
      paymentStatus: a.string().required(), // 'awaiting_payment', 'paid', 'refunded'
      orderStatus: a.string().required(), // 'unconfirmed', 'shipping_to_scentra', 'verifying', 'shipping_to_buyer', 'completed'
      paymentMethod: a.string().required(), // 'venmo', 'paypal'
      paymentInstructions: a.string().required(),
      createdAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
      notes: a.string(),
    })
    .authorization((allow) => [
      // Only authenticated users can access orders
      allow.authenticated(),
      // Admin group has full access
      allow.group("ADMINS"),
      // Application-level authorization will ensure users can only see their own orders
    ]),
    
  // OrderItem model for individual items in an order
  OrderItem: a
    .model({
      orderId: a.string().required(),
      listingId: a.string().required(),
      sellerId: a.string().required(),
      fragranceId: a.string().required(),
      fragranceName: a.string().required(),
      brand: a.string().required(),
      bottleSize: a.string().required(),
      condition: a.string().required(),
      percentRemaining: a.integer(),
      hasOriginalBox: a.boolean().default(false),
      price: a.float().required(),
      imageUrl: a.string().required(),
      status: a.string().required(),
    })
    .authorization((allow) => [
      // Only authenticated users can access order items
      allow.authenticated(),
      // Admin group has full access
      allow.group("ADMINS"),
      // Application-level authorization will ensure users can only see their own order items
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