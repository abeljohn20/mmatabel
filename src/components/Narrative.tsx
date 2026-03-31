export function NarrativeText({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-sm font-medium leading-[1.4] text-[var(--text-heading,#161616)] w-full"
      style={{ fontFamily: "var(--font-dm-sans)" }}
      data-narrative
    >
      {children}
    </p>
  );
}

export function Headline({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[20px] font-medium leading-[1.32] text-[var(--text-heading,#161616)] tracking-[-0.5px]"
      style={{ fontFamily: "var(--font-dm-sans)" }}
      data-narrative="headline"
    >
      {children}
    </p>
  );
}
