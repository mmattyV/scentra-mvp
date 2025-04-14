import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below defines the data models for our Scentra marketplace
application, including Fragrances, Listings, and Users.
=========================================================================*/
const schema = a.schema({
  Fragrance: a
    .model({
      productId: a.string().required(), // Unique identifier for the fragrance
      name: a.string().required(),
      brand: a.string().required(),
      description: a.string(),
      category: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()]),

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
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()]),

  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
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

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
