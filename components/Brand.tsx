export function Brand({ small = false }: { small?: boolean }) {
  return (
    <div className="inline-flex flex-col items-center leading-none">
      <span
        className={`bg-brand font-display text-white tracking-wide rounded-[3px] ${small ? "px-2 py-1 text-sm" : "px-3 py-1.5 text-xl"}`}
      >
        SHAREEFS
      </span>
      <span className={`mt-1 font-semibold tracking-[0.18em] text-brand ${small ? "text-[7px]" : "text-[9px]"}`}>
        THE SHAWARMA SOCIAL CLUB
      </span>
    </div>
  );
}
