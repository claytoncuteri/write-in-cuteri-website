// Custom TipTap node for callout boxes (info / warn / success).
//
// Serializes as:   <div data-callout="info">child content</div>
// Parses on load:  any <div data-callout="..."> in stored HTML
//
// The variant is held in a node attribute (`variant`), persisted via
// the data-callout attribute on the DOM. The visual styling comes
// from Tailwind classes added in the renderer; same selectors apply
// on the public /blog/[slug] page so the editor preview matches the
// final post.

import { Node, mergeAttributes } from "@tiptap/core";

export type CalloutVariant = "info" | "warn" | "success";

const VARIANT_CLASSES: Record<CalloutVariant, string> = {
  info:
    "border-l-4 border-navy bg-navy/5 text-charcoal rounded-r-md p-4 my-4",
  warn:
    "border-l-4 border-red-accent bg-red-accent/5 text-charcoal rounded-r-md p-4 my-4",
  success:
    "border-l-4 border-green-600 bg-green-50 text-charcoal rounded-r-md p-4 my-4",
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (variant: CalloutVariant) => ReturnType;
      toggleCallout: (variant: CalloutVariant) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: "info" as CalloutVariant,
        parseHTML: (el) => {
          const v = (el as HTMLElement).getAttribute("data-callout");
          return v === "warn" || v === "success" ? v : "info";
        },
        renderHTML: (attrs) => ({
          "data-callout": attrs.variant,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-callout]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const variant = (node.attrs.variant as CalloutVariant) ?? "info";
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-callout": variant,
        class: VARIANT_CLASSES[variant],
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (variant) =>
        ({ commands }) =>
          commands.wrapIn(this.name, { variant }),
      toggleCallout:
        (variant) =>
        ({ commands }) =>
          commands.toggleWrap(this.name, { variant }),
      unsetCallout:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },
});
