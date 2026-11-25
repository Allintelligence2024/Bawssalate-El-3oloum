const { buildSync } = require("esbuild"),
  fs = require("node:fs"),
  path = require("node:path"),
  os = require("node:os"),
  a = require("node:assert/strict");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "boussole-curiosite-"));
try {
  buildSync({
    entryPoints: ["src/explore.ts", "src/entry.ts"],
    bundle: true,
    platform: "node",
    format: "cjs",
    outdir: dir,
    outExtension: { ".js": ".cjs" },
  });
  const {
    ids,
    files,
    freshSession,
    examine,
    interpret,
    sharedQuestion,
    labFromHash,
  } = require(path.join(dir, "explore.cjs"));
  const { ENTRY_KEY, destination, edited, newBook, latest } = require(
    path.join(dir, "entry.cjs"),
  );
  a.equal(ids.length, 4);
  const a0 = freshSession();
  for (const k of ids) {
    const def = files[k];
    a.equal(labFromHash("#explore-" + k), k);
    a.equal(destination("#explore-" + k).page, "home");
    a.equal(interpret(a0, k, 1), a0);
    const x = examine(a0, k, 1);
    a.equal(a0[k].compared, false);
    a.equal(x[k].compared, true);
    for (const other of ids.filter((x) => x !== k))
      a.equal(x[other].compared, false);
    a.equal(examine(x, k, 0)[k].compared, true);
    a.equal(interpret(x, k, def.supported)[k].thought, def.supported);
    const publicText = sharedQuestion(
      k,
      "https://example.org/atelier/?classe=XYZ#draft-inhibit",
    );
    a.equal(
      publicText,
      def.invitation + "\nhttps://example.org/atelier/#explore-" + k,
    );
    for (const url of [
      "file:///my/secret/name/index.html",
      "about:srcdoc",
      "http://localhost:4180/?x=1",
      "bad",
    ])
      a.equal(sharedQuestion(k, url), def.invitation);
  }
  a.deepEqual(files.protein.values, [10, 20]);
  a.equal(destination("#protein-doc").page, "protein-doc");
  a.deepEqual(files.enzyme.values, [1, 4]);
  a.deepEqual(files.immunity.values, [2, 9]);
  a.equal(destination("#doc1-traces").page, "doc1");
  a.equal(destination("#doc2-fig-b").page, "doc2");
  a.equal(destination("#answer-inhibit").page, "answer");
  a.equal(latest(edited(newBook(), "inhibit", "\u200f \t")), null);
  a.equal(latest(edited(newBook(), "events", "فكرتي ١٢")), "events");
  a.equal(ENTRY_KEY, "boussole.bac.classe16.carnet.1");
  console.log(
    "PASS — dossiers, données, interprétations, liens, partage et isolation du carnet.",
  );
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
