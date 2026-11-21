const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
module.exports = async () => {
  if (process.platform === "linux") {
    process.env.LANG = "C.UTF-8";
    process.env.LC_ALL = "C.UTF-8";
  }
  if (!process.env.CHROMIUM_MODULE) return chromium.launch({ headless: true });
  const m = require(process.env.CHROMIUM_MODULE);
  return chromium.launch({
    args: m.args.filter((x) => x !== "--single-process"),
    executablePath: await m.executablePath(),
    headless: true,
  });
};
