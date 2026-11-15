"use client";

/**
 * Rich text for notes — TipTap (ProseMirror), stored as its JSON document.
 * Toolbar: bold / italic / underline / strike, headings, lists, text size,
 * text colour and highlight. `editable={false}` renders a saved note. Each
 * paragraph takes the direction of its own first letters, so Hebrew and
 * French lines mix naturally.
 */

import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import { Color, FontSize, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";

import { ToggleButton } from "@repo/ui/toggle-button";

import type { RichDoc } from "@/lib/study-logic";

import { Select } from "./Select";

export type RichEditorTexts = {
  bold: string;
  italic: string;
  underline: string;
  strike: string;
  heading: string;
  subheading: string;
  bulletList: string;
  orderedList: string;
  size: string;
  sizes: { small: string; normal: string; large: string; huge: string };
  color: string;
  highlight: string;
  none: string;
};

const SIZES = {
  small: "13px",
  normal: "",
  large: "20px",
  huge: "26px",
} as const;
type SizeKey = keyof typeof SIZES;

/** Readable on paper and on the dark theme alike. */
const COLORS = ["#c0392b", "#27458f", "#2f7a4d", "#a86b12", "#7d3c98"];
const HIGHLIGHTS = ["#fde68a", "#bbf7d0", "#bfdbfe", "#fbcfe8"];

export const EXTENSIONS = [
  StarterKit.configure({ link: false, code: false, codeBlock: false }),
  TextStyle,
  Color,
  FontSize,
  Highlight.configure({ multicolor: true }),
];

export function RichEditor({
  content,
  onChange,
  editable = true,
  t,
}: {
  content: RichDoc;
  /** The document and its plain text, on every change. */
  onChange?: (doc: RichDoc, text: string) => void;
  editable?: boolean;
  t?: RichEditorTexts;
}) {
  const editor = useEditor({
    extensions: EXTENSIONS,
    content: content as JSONContent,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `rich-text focus:outline-none ${editable ? "min-h-64 px-4 py-3" : ""}`,
      },
    },
    // A JSON round trip: ProseMirror's attrs are prototype-less objects, which
    // a server action can't send (they'd arrive as opaque references).
    onUpdate: ({ editor }) =>
      onChange?.(
        JSON.parse(JSON.stringify(editor.getJSON())) as RichDoc,
        editor.getText({ blockSeparator: "\n" }),
      ),
  });

  return (
    <div className={editable ? "sheet overflow-hidden" : ""}>
      {editable && editor && t && <Toolbar editor={editor} t={t} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor, t }: { editor: Editor; t: RichEditorTexts }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      size: (e.getAttributes("textStyle").fontSize as string | undefined) ?? "",
      color: (e.getAttributes("textStyle").color as string | undefined) ?? "",
      highlight:
        (e.getAttributes("highlight").color as string | undefined) ?? "",
    }),
  });

  const chain = () => editor.chain().focus();
  const toggles = [
    {
      key: "bold",
      label: "B",
      title: t.bold,
      cls: "font-bold",
      on: state.bold,
      run: () => chain().toggleBold().run(),
    },
    {
      key: "italic",
      label: "I",
      title: t.italic,
      cls: "italic",
      on: state.italic,
      run: () => chain().toggleItalic().run(),
    },
    {
      key: "underline",
      label: "U",
      title: t.underline,
      cls: "underline",
      on: state.underline,
      run: () => chain().toggleUnderline().run(),
    },
    {
      key: "strike",
      label: "S",
      title: t.strike,
      cls: "line-through",
      on: state.strike,
      run: () => chain().toggleStrike().run(),
    },
    {
      key: "h2",
      label: "H1",
      title: t.heading,
      cls: "",
      on: state.h2,
      run: () => chain().toggleHeading({ level: 2 }).run(),
    },
    {
      key: "h3",
      label: "H2",
      title: t.subheading,
      cls: "",
      on: state.h3,
      run: () => chain().toggleHeading({ level: 3 }).run(),
    },
    {
      key: "bullet",
      label: "•",
      title: t.bulletList,
      cls: "",
      on: state.bullet,
      run: () => chain().toggleBulletList().run(),
    },
    {
      key: "ordered",
      label: "1.",
      title: t.orderedList,
      cls: "",
      on: state.ordered,
      run: () => chain().toggleOrderedList().run(),
    },
  ];
  const size =
    (Object.keys(SIZES) as SizeKey[]).find((k) => SIZES[k] === state.size) ??
    "normal";

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-line bg-sunken px-2 py-1.5">
      {toggles.map((b) => (
        <ToggleButton
          key={b.key}
          size="sm"
          isSelected={b.on}
          onChange={b.run}
          aria-label={b.title}
          className={`min-w-8 px-2 ${b.cls}`}
        >
          {b.label}
        </ToggleButton>
      ))}

      <Select
        aria-label={t.size}
        options={(Object.keys(SIZES) as SizeKey[]).map((k) => ({
          key: k,
          label: t.sizes[k],
        }))}
        value={size}
        onChange={(key) => {
          const value = SIZES[key as SizeKey];
          if (value) chain().setFontSize(value).run();
          else chain().unsetFontSize().run();
        }}
        className="w-28 text-sm"
      />

      <Swatches
        label={t.color}
        none={t.none}
        colors={COLORS}
        current={state.color}
        kind="text"
        onPick={(c) =>
          c ? chain().setColor(c).run() : chain().unsetColor().run()
        }
      />
      <Swatches
        label={t.highlight}
        none={t.none}
        colors={HIGHLIGHTS}
        current={state.highlight}
        kind="highlight"
        onPick={(c) =>
          c
            ? chain().setHighlight({ color: c }).run()
            : chain().unsetHighlight().run()
        }
      />
    </div>
  );
}

function Swatches({
  label,
  none,
  colors,
  current,
  kind,
  onPick,
}: {
  label: string;
  none: string;
  colors: string[];
  current: string;
  kind: "text" | "highlight";
  onPick: (color: string | null) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-0.5 ps-1"
    >
      <ToggleButton
        size="sm"
        isSelected={!current}
        onChange={() => onPick(null)}
        aria-label={`${label} — ${none}`}
        className="min-w-7 px-1.5"
      >
        <span className="text-xs">{kind === "text" ? "A" : "▢"}</span>
      </ToggleButton>
      {colors.map((c) => (
        <ToggleButton
          key={c}
          size="sm"
          isSelected={current.toLowerCase() === c}
          onChange={() => onPick(c)}
          aria-label={`${label} ${c}`}
          className="min-w-7 px-1.5"
        >
          {kind === "text" ? (
            <span className="font-bold" style={{ color: c }}>
              A
            </span>
          ) : (
            <span
              className="block size-4 rounded-sm"
              style={{ background: c }}
            />
          )}
        </ToggleButton>
      ))}
    </div>
  );
}
