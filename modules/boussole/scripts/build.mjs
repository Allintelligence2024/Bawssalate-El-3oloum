import { build } from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";

const { version } = JSON.parse(await fs.readFile("package.json", "utf8"));
const folder = "../../public/boussole";
const options = {
  entryPoints: ["src/main.tsx"],
  bundle: true,
  minify: true,
  charset: "utf8",
  target: "es2021",
  jsx: "automatic",
  format: "iife",
  write: false,
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "inline",
};
const packed = await build({ ...options, outdir: '_packed', loader: { '.woff2': 'dataurl', '.png': 'dataurl', '.webp':'dataurl' } });
const byExt = (b, ext) => b.outputFiles.find((f) => f.path.endsWith(ext));
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="9" fill="#1b4739"/><circle cx="20" cy="20" r="13" fill="none" stroke="#b1c7a0" stroke-dasharray="1 3"/><path d="m29 9-6 15-13 8 7-16z" fill="#f1c875"/><circle cx="20" cy="20" r="2.2" fill="#305540"/></svg>`;
const notices = (
  await Promise.all(
    [
      "assets/LICENSE-Noto.txt",
      "assets/licences/React.txt",
      "assets/licences/React-DOM.txt",
      "assets/licences/Scheduler.txt",
    ].map(
      async (file) =>
        `${path.basename(file)}\n\n${await fs.readFile(file, "utf8")}`,
    ),
  )
).join("\n\n");
const html = (favicon, styles, script) =>
  `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#113c3a"><meta name="color-scheme" content="light"><meta name="boussole-version" content="${version}"><meta name="description" content="مختبر الفضول من بوصلة العلوم: بدّل الشرط، قارن الدليل، ثم جرّب بيدك على ورقة البكالوريا."><link rel="icon" href="${favicon}"><title>بوصلة العلوم | مختبر الفضول</title>${styles}</head><body><div id="root"></div><noscript>لتفتح الورشة التفاعلية، فعِّل تشغيل البرامج النصية في متصفّحك.</noscript>${script}</body></html>`;
const inline = html(
  "data:image/svg+xml," + encodeURIComponent(icon),
  `<style>${byExt(packed, ".css").text}</style>`,
  `<script>${byExt(packed, ".js").text.replace(/<\/script/gi, "<\\/script")}</script>`,
).replace("</body>", `<!--\n${notices.replace(/-->/g, "-- >")}\n-->\n</body>`);
await fs.mkdir(folder,{recursive:true});
await fs.writeFile(`${folder}/index.html`,inline);
console.log(`Laboratoire autonome: ${Buffer.byteLength(inline)} octets.`);
