import { getAllPosts, getPostBySlug } from './src/lib/blog.js';
console.log(getAllPosts('en').map(p => p.slug));
console.log(getAllPosts('es').map(p => p.slug));
