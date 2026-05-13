"use client";

// Rich-text blog post editor based on TipTap v3.
//
// Standard + advanced toolbar per the approved plan:
//   bold, italic, underline, strike, H2/H3, bullet list, numbered
//   list, blockquote, link, image, table, callout (info/warn/success),
//   code, code block, text align, text color, horizontal rule, undo,
//   redo.
//
// Body content is stored as HTML (TipTap's getHTML() output) and
// sanitized server-side via blog-sanitize.ts before persisting.
//
// Image uploads pass through /api/admin/blog/upload-image and return
// a URL under /blog-images/<filename> which is then inserted at the
// caret position.

// TipTap v3 reorganized exports: every extension package is named
// rather than default-exported, and the table sub-modules merged into
// @tiptap/extension-table (Table, TableRow, TableCell, TableHeader).
// Color also moved from its own package into extension-text-style.
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from "@tiptap/extension-table";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Info,
  AlertTriangle,
  CheckCircle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Undo,
  Redo,
  Palette,
  Type,
} from "lucide-react";
import { Callout, type CalloutVariant } from "./BlogCalloutExtension";

// ACP brand palette for the text-color popover. Charcoal default plus
// the three brand accents and a muted gray for de-emphasis.
const COLOR_PALETTE: ReadonlyArray<{ name: string; value: string }> = [
  { name: "Default", value: "" },
  { name: "Charcoal", value: "#1A1A1A" },
  { name: "Navy", value: "#1E3D8C" },
  { name: "Red", value: "#D72638" },
  { name: "Gray", value: "#6B7280" },
];

interface BlogEditorProps {
  initialHtml?: string;
  onChange?: (html: string) => void;
  editable?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      title={title}
      aria-label={title}
      className={
        "inline-flex items-center justify-center h-8 w-8 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-navy disabled:opacity-40 disabled:cursor-not-allowed " +
        (active
          ? "bg-navy text-white"
          : "bg-white text-charcoal hover:bg-navy/10")
      }
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-6 w-px bg-gray-300" aria-hidden />;
}

export function BlogEditor({
  initialHtml = "",
  onChange,
  editable = true,
}: BlogEditorProps) {
  // Image upload state. Imperative file input fires the upload, which
  // returns a URL that we then insert into the editor at the current
  // selection.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showColors, setShowColors] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Keep heading levels constrained to H2/H3/H4 in the editor;
        // H1 is reserved for the page title (rendered by BlogPost,
        // not authored in the body).
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        // Loose default: width/height come from the uploaded file's
        // intrinsic dimensions. CSS in the prose styling clamps to
        // container width.
        inline: false,
        allowBase64: false,
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Callout,
    ],
    content: initialHtml,
    editable,
    immediatelyRender: false, // SSR safety
    onUpdate({ editor: e }) {
      if (onChange) onChange(e.getHTML());
    },
  });

  // Re-sync the editor content if the parent passes a new initialHtml
  // (e.g. after the Markdown-import button populates it).
  useEffect(() => {
    if (!editor) return;
    if (initialHtml && editor.getHTML() !== initialHtml) {
      editor.commands.setContent(initialHtml, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHtml, editor]);

  // Convenience callbacks. Defined at the top level so the toolbar
  // doesn't recreate closures on every render.
  const handleInsertLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Link URL (https:// or mailto:)", prev);
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url, target: "_blank", rel: "noopener noreferrer" })
      .run();
  }, [editor]);

  const handleUploadClick = useCallback(() => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/blog/upload-image", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          const msg = await res.text().catch(() => "Upload failed");
          alert(`Image upload failed: ${msg}`);
          return;
        }
        const json = (await res.json()) as { url?: string };
        if (!json.url) {
          alert("Upload succeeded but no URL returned.");
          return;
        }
        editor
          .chain()
          .focus()
          .setImage({ src: json.url, alt: file.name })
          .run();
      } finally {
        setUploading(false);
      }
    },
    [editor],
  );

  const handleInsertTable = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  const handleCallout = useCallback(
    (variant: CalloutVariant) => {
      if (!editor) return;
      editor.chain().focus().toggleCallout(variant).run();
    },
    [editor],
  );

  const handleColor = useCallback(
    (value: string) => {
      if (!editor) return;
      if (value === "") {
        editor.chain().focus().unsetColor().run();
      } else {
        editor.chain().focus().setColor(value).run();
      }
      setShowColors(false);
    },
    [editor],
  );

  if (!editor) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-sm text-charcoal/60">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar. Sticky inside the editor wrapper so it stays
          accessible during long posts. Flex-wrap means it gracefully
          collapses to two rows on narrow screens. */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 bg-cream border-b border-gray-200">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (Cmd+B)"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (Cmd+I)"
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline (Cmd+U)"
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={handleInsertLink} title="Insert link">
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleUploadClick}
          disabled={uploading}
          title={uploading ? "Uploading..." : "Insert image"}
        >
          <ImageIcon size={16} />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
        <ToolbarButton onClick={handleInsertTable} title="Insert table">
          <TableIcon size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => handleCallout("info")}
          active={editor.isActive("callout", { variant: "info" })}
          title="Info callout"
        >
          <Info size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => handleCallout("warn")}
          active={editor.isActive("callout", { variant: "warn" })}
          title="Warning callout"
        >
          <AlertTriangle size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => handleCallout("success")}
          active={editor.isActive("callout", { variant: "success" })}
          title="Success callout"
        >
          <CheckCircle size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline code"
        >
          <Code size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code block"
        >
          <Type size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align left"
        >
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align center"
        >
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align right"
        >
          <AlignRight size={16} />
        </ToolbarButton>

        <Divider />

        {/* Text-color popover. Tiny inline menu, no library needed. */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowColors((v) => !v)}
            active={showColors}
            title="Text color"
          >
            <Palette size={16} />
          </ToolbarButton>
          {showColors && (
            <div className="absolute z-20 mt-1 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex flex-col gap-1 min-w-[140px]">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleColor(c.value)}
                  className="flex items-center gap-2 px-2 py-1 rounded text-xs text-charcoal hover:bg-navy/10 transition-colors text-left"
                >
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: c.value || "#000" }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <Minus size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Cmd+Z)"
        >
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo size={16} />
        </ToolbarButton>
      </div>

      {/* Editor canvas. The `prose` class gives us the same styling
          editors as the public render path so authors see a faithful
          preview. focus:outline removed because TipTap manages its
          own caret indicator. */}
      <EditorContent
        editor={editor}
        className="prose prose-slate max-w-none px-4 py-6 min-h-[400px] focus:outline-none"
      />
    </div>
  );
}

// Expose a helper for parents that need imperative HTML extraction
// (e.g. the Save button needs the latest content even if no onChange
// fired since the last keystroke).
export function getEditorHtml(editor: Editor | null): string {
  return editor ? editor.getHTML() : "";
}
