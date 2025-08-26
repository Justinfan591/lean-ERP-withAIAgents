export default function DevBanner() {
    return (
      <div style={{
        position: "fixed", top: 8, left: 8, zIndex: 9999,
        padding: "6px 10px", borderRadius: 8,
        background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)",
        color: "#a7f3d0", fontSize: 12, fontFamily: "ui-monospace, SFMono-Regular",
      }}>
        App mounted ✓
      </div>
    );
  }
  