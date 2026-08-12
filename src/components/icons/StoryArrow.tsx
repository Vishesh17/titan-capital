/**
 * The diagonal "open this" arrow that fades in over a photo on hover.
 *
 * Shared by the Their Stories cards (ImpactAtGlance) and the founder portraits
 * (LedByFounders) so the two are the same mark at the same size, not two
 * copies that drift apart. The size is baked in for that reason.
 *
 * Colour is the one thing that varies: Their Stories sits on the untinted top
 * of its photo and reads black, while the founder portraits darken on hover
 * and need white. It defaults to black so the original caller is unchanged.
 */
export default function StoryArrow({ color = "black" }: { color?: string }) {
  return (
    <svg
      viewBox="0 0 37 37"
      fill="none"
      aria-hidden
      style={{ width: "min(2.14vw, 3.31vh)", height: "min(2.14vw, 3.31vh)" }}
    >
      <path
        d="M0.585786 33.5858C-0.195262 34.3668 -0.195262 35.6332 0.585786 36.4142C1.36683 37.1953 2.63317 37.1953 3.41421 36.4142L2 35L0.585786 33.5858ZM37 2C37 0.89543 36.1046 0 35 0H17C15.8954 0 15 0.89543 15 2C15 3.10457 15.8954 4 17 4H33V20C33 21.1046 33.8954 22 35 22C36.1046 22 37 21.1046 37 20V2ZM2 35L3.41421 36.4142L36.4142 3.41421L35 2L33.5858 0.585786L0.585786 33.5858L2 35Z"
        fill={color}
      />
    </svg>
  );
}
