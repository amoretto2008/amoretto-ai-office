import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function assemble(sourceDirectory, destination) {
  const source = join(root, sourceDirectory);
  const files = (await readdir(source))
    .filter((name) => name.endsWith(".part"))
    .sort((a, b) => a.localeCompare(b, "en"));
  if (!files.length) throw new Error(`No source parts found: ${sourceDirectory}`);
  const contents = await Promise.all(files.map((name) => readFile(join(source, name), "utf8")));
  const output = join(root, destination);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, contents.join(""), "utf8");
  console.log(`assembled ${destination} from ${files.length} parts`);
}

await assemble("source/standard-operations/browser", "public/standard/operations.js");
await assemble("source/standard-operations/route", "app/api/standard/operations/route.ts");
