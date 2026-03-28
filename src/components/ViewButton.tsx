"use client";

/**
 * ViewButton — matches the training-report "highlight-tag" button style.
 * Double-layered pill: outer container with inset shadow + gradient,
 * inner pill with orange gradient and gold (#ffdd66) text.
 */
export function ViewButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex p-1 rounded-lg self-start cursor-pointer select-none active:translate-y-px"
      style={{
        background: "linear-gradient(180deg, #f5f5f5 0%, #ececec 100%)",
        boxShadow:
          "0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
        WebkitTapHighlightColor: "transparent",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <span
        className="flex items-center justify-center px-2 py-1 rounded overflow-hidden relative"
        style={{
          background: "linear-gradient(180deg, #ff5a10 0%, #ff4400 100%)",
          border: "1px solid #fa591f",
          borderRadius: 4,
          boxShadow:
            "0 2px 4px rgba(200,80,20,0.3), inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        <span
          className="relative z-10 text-xs font-medium"
          style={{
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            lineHeight: 1.6,
            color: "#ffdd66",
          }}
        >
          {label}
        </span>
      </span>
    </button>
  );
}
