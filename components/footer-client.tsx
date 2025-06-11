"use client";
import { useState } from "react";
import ContactModal from "@/components/contact-modal";

export default function FooterClient() {
  const [contactOpen, setContactOpen] = useState(false);
  return (
    <>
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; 2024 QR Generator. Made by luckyviki</p>
        <button onClick={() => setContactOpen(true)} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Contact Us</button>
      </footer>
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </>
  );
} 