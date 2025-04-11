"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  useEffect(() => {
    listTodos();
  }, []);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content"),
    });
  }

  return (
    <main className="flex flex-col items-stretch">
      <h1 className="text-xl font-bold">My todos</h1>
      <div className="flex justify-center p-4 bg-blue-500 text-white">
        Hello Tailwind!
      </div>
      <button 
        onClick={createTodo} 
        className="rounded-lg border border-transparent px-5 py-2.5 text-base font-medium bg-gray-900 hover:border-blue-400 cursor-pointer transition-colors text-white"
      >
        + new
      </button>
      <ul className="p-0 my-2 list-none flex flex-col border border-black gap-px bg-black rounded-lg overflow-auto">
        {todos.map((todo) => (
          <li key={todo.id} className="bg-white p-2 hover:bg-indigo-100">{todo.content}</li>
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
    </main>
  );
}
