import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
}

const db = admin.firestore();

async function migrate() {
    const postsDir = path.join(__dirname, '../src/content/blog');
    const categories = [
        { dir: postsDir, lang: 'en' },
        { dir: path.join(postsDir, 'es'), lang: 'es' }
    ];

    for (const { dir, lang } of categories) {
        if (!fs.existsSync(dir)) continue;

        const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
        console.log(`Migrating ${files.length} posts for language: ${lang}`);

        for (const file of files) {
            const fullPath = path.join(dir, file);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data, content } = matter(fileContents);
            const slug = file.replace(/\.md$/, '');

            if (!data.title || !data.date) {
                console.warn(`Skipping ${file}: missing title or date`);
                continue;
            }

            const postData = {
                slug,
                lang,
                title: data.title,
                date: data.date,
                description: data.description || '',
                category: data.category || 'General',
                image: data.image || '',
                author: data.author || 'NAVAI Team',
                content: content,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('posts').doc(`${lang}_${slug}`).set(postData, { merge: true });
            console.log(`Successfully migrated: ${lang}/${slug}`);
        }
    }
    console.log('Migration complete!');
}

migrate().catch(console.error);
