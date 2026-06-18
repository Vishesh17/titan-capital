/**
 * Studio segment layout — wraps the Studio in a full-viewport fixed overlay
 * so the site's global Navbar (rendered by the root layout) is visually
 * covered when an editor is working inside /studio. The Navbar still exists
 * in the DOM, just hidden underneath — a low-risk way to keep the studio
 * full-screen without restructuring the root layout into route groups.
 */
export const metadata = {
  title: "Titan Capital — Content Studio",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#fff",
        overflow: "auto",
      }}
    >
      {children}
    </div>
  );
}
