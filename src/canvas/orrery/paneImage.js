export const MAX_W = 1024;
const cache = new Map(); // url -> Promise<string>
const ready = new Map(); // url -> string, once resolved

export const paneSrc = (p) =>
  p?.imageKind === "logo" ? p.thumb : (p?.image ?? p?.thumb);

export const readySrc = (url) => ready.get(url);

// Resolves to `url`, or to a webp data URL when the image is wider than MAX_W (animated GIFs
// become a still frame). Cached per url.
export function loadPaneImage(url) {
  if (!url) return Promise.resolve(null);
  if (!cache.has(url)) {
    cache.set(
      url,
      new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          let out = url;
          if (img.naturalWidth > MAX_W) {
            const c = document.createElement("canvas");
            c.width = MAX_W;
            c.height = Math.round((img.naturalHeight * MAX_W) / img.naturalWidth);
            c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
            out = c.toDataURL("image/webp", 0.85);
          }
          ready.set(url, out);
          resolve(out);
        };
        img.onerror = () => resolve(url); // let the <img> show its own failure
        img.src = url;
      }),
    );
  }
  return cache.get(url);
}
