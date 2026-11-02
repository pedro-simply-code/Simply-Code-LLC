"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { QuoteNode } from "@lexical/rich-text";
import { useEffect } from "react";
import {
  $createQuoteInnerNode,
  $isQuoteInnerNode,
} from "~/components/lexical/quote-inner-node";

/** Ensures each quote blockquote wraps content in a bordered inner span. */
export function QuoteLayoutPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(QuoteNode, (quote) => {
      const first = quote.getFirstChild();
      if ($isQuoteInnerNode(first)) return;

      const inner = $createQuoteInnerNode();
      const children = quote.getChildren();
      children.forEach((child) => inner.append(child));
      quote.append(inner);
    });
  }, [editor]);

  return null;
}
