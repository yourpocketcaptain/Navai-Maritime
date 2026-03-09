import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const langDir = path.join(process.cwd(), 'src/content/blog');
const fileName = 'eu-buys-100-of-russian-arctic-lng-just-9-months-before-planned-gas-ban.md';
const fullPath = path.join(langDir, fileName);
const fileContents = fs.readFileSync(fullPath, 'utf8');
const { data, content } = matter(fileContents);

console.log("Parsed Frontmatter Data:");
console.log(data);
console.log("Missing fields check:");
console.log("title:", !!data.title, "date:", !!data.date);
