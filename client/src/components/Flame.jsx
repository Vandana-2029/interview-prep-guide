// The pink streak flame, drawn as SVG so it follows the theme colours.
export default function Flame({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 4c4 10 16 16 16 32a16 16 0 0 1-32 0c0-8 4-13 8-17 0 6 3 9 6 10-2-9 0-17 2-25z" fill="var(--accent)" />
      {size > 24 && <path d="M32 30c3 5 8 8 8 15a8 8 0 0 1-16 0c0-4 2-6 4-8 0 3 1 4 3 5-1-4 0-8 1-12z" fill="var(--h1)" />}
    </svg>
  );
}
