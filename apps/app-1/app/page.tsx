"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../lib/firebase";

export default function Page() {
  const [text, setText] = useState("Loading...");

  useEffect(() => {
    async function loadText() {
      const snapshot = await getDoc(doc(db, "config", "main"));

      if (snapshot.exists()) {
        setText(snapshot.data().text as string);
      }
    }

    void loadText();
  }, []);

  return <h1>{text}</h1>;
}
