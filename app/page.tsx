"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import Image from "next/image";
import Link from "next/link";

const SAMPLE_FRAGRANCES = [
  {
    id: 1,
    name: "Bleu de Chanel",
    brand: "CHANEL",
    price: 145,
    image: "/fragrances/bleu.jpg",
  },
  {
    id: 2,
    name: "Sauvage",
    brand: "Dior",
    price: 155,
    image: "/fragrances/sauvage.jpg",
  },
  {
    id: 3,
    name: "Eros",
    brand: "Versace",
    price: 120,
    image: "/fragrances/eros.jpg",
  },
  { id: 4, name: "Y", brand: "YSL", price: 140, image: "/fragrances/y.jpg" },
  {
    id: 5,
    name: "La Nuit",
    brand: "YSL",
    price: 135,
    image: "/fragrances/lanuit.jpg",
  },
  {
    id: 6,
    name: "Light Blue",
    brand: "D&G",
    price: 118,
    image: "/fragrances/lightblue.jpg",
  },
  {
    id: 7,
    name: "The One",
    brand: "D&G",
    price: 125,
    image: "/fragrances/theone.jpg",
  },
  {
    id: 8,
    name: "Acqua di Gio",
    brand: "Armani",
    price: 150,
    image: "/fragrances/acqua.jpg",
  },
  {
    id: 9,
    name: "L'Homme Ideal",
    brand: "Guerlain",
    price: 130,
    image: "/fragrances/lhomme.jpg",
  },
];

// Safely initialize Amplify configuration
try {
  // This dynamic import is used to handle the case when the file doesn't exist
  // during build time but will be generated during runtime
  const outputs = require("@/amplify_outputs.json");
  Amplify.configure(outputs);
} catch (error) {
  console.warn(
    "Unable to load Amplify outputs, authentication features may not work correctly"
  );
  // Provide fallback configuration or leave unconfigured
}

const client = generateClient<Schema>();

export default function App() {
  const { signOut, user } = useAuthenticator();

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SAMPLE_FRAGRANCES.map((fragrance) => (
            <Link
              href={`/product/${fragrance.id}`}
              key={fragrance.id}
              className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square">
                <Image
                  src={fragrance.image}
                  alt={fragrance.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {fragrance.name}
                </h3>
                <p className="text-sm text-gray-500">{fragrance.brand}</p>
                <p className="mt-2 text-lg font-medium text-gray-900">
                  ${fragrance.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <button
          onClick={signOut}
          className="mt-6 rounded-lg border border-transparent px-5 py-2.5 text-base font-medium bg-red-600 hover:bg-red-700 cursor-pointer transition-colors text-white"
        >
          Sign out
        </button>
      </main>
    </div>
  );
}
