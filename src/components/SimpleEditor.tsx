import React, { useRef, useState, useEffect } from "react";

export default function MicrosoftStyleEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const execCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    document.execCommand(command, false, value || undefined);
    updateToolbarState();
  };

  const updateToolbarState = () => {
    setIsBold(document.queryCommandState("bold"));
    setIsItalic(document.queryCommandState("italic"));
    setIsUnderline(document.queryCommandState("underline"));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editorRef.current) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        execCommand("bold");
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        execCommand("italic");
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
        e.preventDefault();
        execCommand("underline");
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        execCommand("undo");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update toolbar on selection
  useEffect(() => {
    const update = () => updateToolbarState();
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-24 border border-[#4F2A7E]/20 rounded-2xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-[#4F2A7E] text-white px-6 py-3 flex items-center gap-2 border-b">
        <div className="flex items-center gap-2 mr-6">
          <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
            <span className="text-[#4F2A7E] text-xl font-bold">B</span>
          </div>
          <span className="font-semibold tracking-wide">
            Blessing Attorney Editor
          </span>
        </div>

        {/* Formatting */}
        <div className="flex items-center gap-1 border-r border-white/20 pr-4">
          <button
            onClick={() => execCommand("bold")}
            className={`w-9 h-9 flex items-center justify-center rounded hover:bg-white/10 transition-all ${
              isBold ? "bg-white/20" : ""
            }`}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => execCommand("italic")}
            className={`w-9 h-9 flex items-center justify-center rounded hover:bg-white/10 transition-all ${
              isItalic ? "bg-white/20" : ""
            }`}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => execCommand("underline")}
            className={`w-9 h-9 flex items-center justify-center rounded hover:bg-white/10 transition-all ${
              isUnderline ? "bg-white/20" : ""
            }`}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r border-white/20 pr-4">
          <button
            onClick={() => execCommand("justifyLeft")}
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-white/10"
            title="Align Left"
          >
            ↤
          </button>
          <button
            onClick={() => execCommand("justifyCenter")}
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-white/10"
            title="Center"
          >
            ↔
          </button>
          <button
            onClick={() => execCommand("justifyRight")}
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-white/10"
            title="Align Right"
          >
            ↦
          </button>
          <button
            onClick={() => execCommand("justifyFull")}
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-white/10"
            title="Justify"
          >
            ⇌
          </button>
        </div>

        {/* Lists - Fixed */}
        {/* <div className="flex items-center gap-1 border-r border-white/20 pr-4">
          <button
            onClick={() => execCommand("insertUnorderedList")}
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-white/10"
            title="Bullet List"
          >
            •
          </button>
          <button
            onClick={() => execCommand("insertOrderedList")}
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-white/10"
            title="Numbered List"
          >
            1.
          </button> 
        </div>*/}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => execCommand("undo")}
            className="px-4 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            Undo
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable="true"
        className="min-h-[500px] p-12 outline-none text-[17px] leading-relaxed text-gray-800"
        style={{
          fontFamily: "Calibri, Arial, sans-serif",
        }}
        onInput={updateToolbarState}
      />

      {/* Footer */}
      <div className="bg-[#4F2A7E] text-white/80 text-xs py-2 px-6 flex items-center justify-between">
        <div>Blessing Attorney • Microsoft-Style Editor</div>
        <div>All shortcuts active • Lists fixed</div>
      </div>
    </div>
  );
}
