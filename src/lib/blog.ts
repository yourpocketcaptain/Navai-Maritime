import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, doc, getDoc, limit } from 'firebase/firestore';
import { marked } from 'marked';

export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    description: string;
    category: string;
    image: string;
    author: string;
    content: string;
    lang: string;
}

export async function getAllPosts(lang: string = 'en'): Promise<BlogPost[]> {
    try {
        const postsRef = collection(db, 'posts');
        const q = query(
            postsRef,
            where('lang', '==', lang),
            orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const posts: BlogPost[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            posts.push({
                slug: data.slug,
                title: data.title,
                date: data.date,
                description: data.description || '',
                category: data.category || 'General',
                image: data.image || '',
                author: data.author || 'NAVAI Team',
                content: data.content || '',
                lang: data.lang || 'en'
            });
        });

        return posts;
    } catch (error) {
        console.error("Error fetching all posts from Firestore:", error);
        return [];
    }
}

export async function getPostBySlug(slug: string, lang: string = 'en'): Promise<BlogPost | null> {
    try {
        // We use the composite ID format lang_slug we set in migration/journalist
        const docId = `${lang}_${slug}`;
        const docRef = doc(db, 'posts', docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                slug: data.slug,
                title: data.title,
                date: data.date,
                description: data.description || '',
                category: data.category || 'General',
                image: data.image || '',
                author: data.author || 'NAVAI Team',
                content: data.content || '',
                lang: data.lang || 'en'
            } as BlogPost;
        }

        return null;
    } catch (error) {
        console.error(`Error fetching post ${slug} from Firestore:`, error);
        return null;
    }
}

export async function parseMarkdown(content: string) {
    return marked.parse(content);
}
