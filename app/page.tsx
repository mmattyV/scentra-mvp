"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import { fetchUserAttributes } from 'aws-amplify/auth';
import "@aws-amplify/ui-react/styles.css";

// Safely initialize Amplify configuration
try {
  // This dynamic import is used to handle the case when the file doesn't exist
  // during build time but will be generated during runtime
  const outputs = require('@/amplify_outputs.json');
  Amplify.configure(outputs);
} catch (error) {
  console.warn('Unable to load Amplify outputs, authentication features may not work correctly');
  // Provide fallback configuration or leave unconfigured
}

const client = generateClient<Schema>();

// Type for user profile data
interface UserProfile {
  givenName: string;
  familyName: string;
  email: string;
  address: string;
}

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { signOut, user } = useAuthenticator();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    givenName: '',
    familyName: '',
    email: '',
    address: '',
  });

  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  useEffect(() => {
    listTodos();
    
    // Get user profile data from authentication
    if (user) {
      const fetchUserProfile = async () => {
        try {
          // Use fetchUserAttributes to get user attributes
          const attributes = await fetchUserAttributes();
          console.log('User attributes:', attributes);
          
          // Access attributes directly as a record
          const attributesRecord = attributes as Record<string, string>;
          
          setUserProfile({
            givenName: attributesRecord.given_name || '',
            familyName: attributesRecord.family_name || '',
            email: attributesRecord.email || '',
            address: attributesRecord.address || '',
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };
      
      fetchUserProfile();
    }
  }, [user]);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content"),
    });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  return (
    <main className="flex flex-col items-stretch max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
      
      {user && (
        <div className="mb-6 p-5 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="font-medium text-gray-600">Name:</p>
              <p className="text-gray-900">{userProfile.givenName} {userProfile.familyName}</p>
            </div>
            
            <div className="space-y-1">
              <p className="font-medium text-gray-600">Email:</p>
              <p className="text-gray-900">{userProfile.email}</p>
            </div>
            
            <div className="space-y-1">
              <p className="font-medium text-gray-600">Address:</p>
              <p className="text-gray-900">{userProfile.address || 'Not provided'}</p>
            </div>
            
            <div className="space-y-1">
              <p className="font-medium text-gray-600">PayPal Username:</p>
              <p className="text-gray-500 italic">To be added in profile settings</p>
            </div>
            
            <div className="space-y-1">
              <p className="font-medium text-gray-600">Venmo Handle:</p>
              <p className="text-gray-500 italic">To be added in profile settings</p>
            </div>
          </div>
          
          <div className="mt-5 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Note: Payment information fields will be available to edit in your profile settings coming soon.
            </p>
          </div>
        </div>
      )}
      
      <h2 className="text-xl font-bold mt-4 mb-2">My Todos</h2>
      <div className="flex justify-center p-4 bg-blue-500 text-white">
        Hello Tailwind!
      </div>
      <button 
        onClick={createTodo} 
        className="rounded-lg border border-transparent px-5 py-2.5 text-base font-medium bg-gray-900 hover:border-blue-400 cursor-pointer transition-colors text-white mt-4"
      >
        + new
      </button>
      <ul className="p-0 my-2 list-none flex flex-col border border-black gap-px bg-black rounded-lg overflow-auto">
        {todos.map((todo) => (
          <li onClick={() => deleteTodo(todo.id)} key={todo.id} className="bg-white p-2 hover:bg-indigo-100">{todo.content}</li>
        ))}
      </ul>
      <div className="mt-4">
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a 
          href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/"
          className="font-extrabold no-underline"
        >
          Review next steps of this tutorial.
        </a>
      </div>
      <button 
        onClick={signOut}
        className="mt-6 rounded-lg border border-transparent px-5 py-2.5 text-base font-medium bg-red-600 hover:bg-red-700 cursor-pointer transition-colors text-white"
      >
        Sign out
      </button>
    </main>
  );
}
