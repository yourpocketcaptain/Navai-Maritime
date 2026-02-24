import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    description: string;
    category: string;
    image: string;
    author: string;
    content: string;
}

export function getAllPosts(lang: string = 'en'): BlogPost[] {
    const langDir = lang === 'es' ? path.join(postsDirectory, 'es') : postsDirectory;

    if (!fs.existsSync(langDir)) return [];

    const fileNames = fs.readdirSync(langDir);
    const allPostsData = fileNames
        .filter((fileName) => fileName.endsWith('.md'))
        .map((fileName) => {
            const slug = fileName.replace(/\.md$/, '');
            const fullPath = path.join(langDir, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data, content } = matter(fileContents);

            if (!data.title || !data.date) return null;

            return {
                slug,
                ...(data as Omit<BlogPost, 'slug' | 'content'>),
                content,
            };
        })
        .filter((post): post is BlogPost => post !== null);

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string, lang: string = 'en'): BlogPost | null {
    try {
        const langDir = lang === 'es' ? path.join(postsDirectory, 'es') : postsDirectory;
        const fullPath = path.join(langDir, `${slug}.md`);

        if (!fs.existsSync(fullPath)) {
            // Fallback to English if Spanish version doesn't exist? 
            // Better to stay consistent with the requested lang.
            return null;
        }

        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        if (!data.title || !data.date) return null;

        return {
            slug,
            ...(data as Omit<BlogPost, 'slug' | 'content'>),
            content,
        };
    } catch (error) {
        return null;
    }
}

export async function parseMarkdown(content: string) {
    return marked.parse(content);
}
