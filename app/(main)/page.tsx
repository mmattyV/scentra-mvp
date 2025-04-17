"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import Image from "next/image";
import Link from "next/link";
import outputs from "@/amplify_outputs.json";

// Amplify is now configured at the root level in AuthenticatorProvider

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

export default function App() {
  const { signOut } = useAuthenticator();
  
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
      </main>
    </div>
  );
}
