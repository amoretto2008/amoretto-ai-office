"use client";

import { useState } from "react";

export function useCopyFeedback() {
  const [copiedLabel, setCopiedLabel] = useState("");

  async function copyText(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopiedLabel(label);
    window.setTimeout(() => setCopiedLabel(""), 1800);
  }

  return { copiedLabel, copyText };
}
