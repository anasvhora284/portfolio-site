import { AdditiveBlending, CanvasTexture } from "three";

let tex;
function glowTexture() {
  if (!tex) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    tex = new CanvasTexture(c);
  }
  return tex;
}

export function Glow({ color, scale, opacity = 1 }) {
  return (
    <sprite scale={[scale, scale, 1]}>
      <spriteMaterial
        map={glowTexture()}
        color={color}
        blending={AdditiveBlending}
        depthWrite={false}
        transparent
        opacity={opacity}
      />
    </sprite>
  );
}
