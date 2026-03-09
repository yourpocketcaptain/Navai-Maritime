import RSSParser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new RSSParser();
const FEEDS = [
    'https://gcaptain.com/feed/',
    'https://www.maritime-executive.com/rss',
    'https://www.marinelink.com/rss/news',
    'https://www.marineinsight.com/feed/',
    'https://splash247.com/feed/'
];

const API_KEY = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

async function fetchNews() {
    console.log('Fetching news from feeds...');
    const allItems = [];
    for (const url of FEEDS) {
        try {
            const feed = await parser.parseURL(url);
            allItems.push(...feed.items.map(item => ({
                title: item.title,
                link: item.link,
                content: item.contentSnippet || item.content,
                source: feed.title
            })));
        } catch (e) {
            console.error(`Failed to fetch ${url}:`, e.message);
        }
    }
    return allItems;
}

async function getAvailableModel() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        const model = data.models.find(m => m.name.includes('gemini-1.5-flash') || m.name.includes('gemini-pro'));
        return model ? model.name : 'models/gemini-1.5-flash';
    } catch (e) {
        return 'models/gemini-1.5-flash';
    }
}

async function generatePost(newsItem, lang = 'en') {
    const modelName = await getAvailableModel();
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent`;

    const todayDate = new Date().toISOString().split('T')[0];
    const prompt = `
    You are a professional maritime journalist and nautical SEO expert for NAVAI (the ultimate AI-powered maritime assistant).
    Your goal is to write a highly engaging, SEO-optimized blog post based on this news: "${newsItem.title}".
    
    Original News Context: ${newsItem.content}
    
    NAVAI App Context: NAVAI is an AI tool for sailors that helps with:
    - Smart Anchoring (calculating chain/scope).
    - Navigation & Great Circle math.
    - Weather routing and GRIB file analysis.
    - IALA Buoy identification.
    - Maritime regulations and exam preparation.

    Requirements for the post:
    1. Tone: "Expert Captain" - authoritative, helpful, tech-savvy, and visionary. Avoid generic corporate speak.
    2. SEO Focus: Use keywords related to "sailing technology", "maritime AI", "safe navigation", and "yachting life".
    3. Content Structure:
       - Engaging Headline: Make it "click-worthy" for sailors.
       - The Hook: Why does this news matter to a boat owner or professional mariner?
       - The Body: Summarize the news but add expert nautical perspective.
       - **NAVAI Integration**: Explicitly mention how NAVAI (the app) helps sailors deal with issues related to this news (e.g., if it's about weather, mention navai's weather tools).
       - Call to Action: Encourage them to try NAVAI for safer and smarter voyages.
    4. Format: Markdown with Frontmatter. You MUST include the exact following date in the frontmatter: \`date: "${todayDate}"\`
    5. Language: ${lang === 'es' ? 'Spanish' : 'English'}.
    6. Author: "NAVAI Editorial Team".
    7. Image: Use a high-quality Unsplash URL related to the topic.
    
    Return ONLY the raw markdown content.
    `;

    if (!API_KEY) {
        console.warn('No AI_API_KEY found. Generating a mock post for testing.');
        return `---
title: "${newsItem.title} - Mock Post"
date: "${new Date().toISOString().split('T')[0]}"
description: "MOCK: ${newsItem.title}"
category: "Technology"
image: "https://images.unsplash.com/photo-1544281679-5357165b89a9?auto=format&fit=crop&q=80&w=2000"
author: "NAVAI Team"
---
# ${newsItem.title}
This is a mock post because no API key was provided. 
`;
    }

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            let text = data.candidates[0].content.parts[0].text;
            // Strip markdown code block wrappers if they exist
            text = text.replace(/^```markdown\n?/i, '').replace(/```$/i, '').trim();
            return text;
        } else {
            console.error('API Error:', JSON.stringify(data));
            return null;
        }
    } catch (e) {
        console.error('Fetch Error:', e.message);
        return null;
    }
}

async function run() {
    const news = await fetchNews();
    if (news.length === 0) {
        console.log('No news found today.');
        return;
    }

    // Pick a random top news item (or the first one for simplicity)
    const topNews = news[0];
    console.log(`Selected story: ${topNews.title}`);

    const slug = topNews.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Generate English
    const enPost = await generatePost(topNews, 'en');
    if (enPost) {
        fs.writeFileSync(path.join(__dirname, '../src/content/blog', `${slug}.md`), enPost);
        console.log(`Published EN: ${slug}.md`);
    }

    // Generate Spanish
    const esPost = await generatePost(topNews, 'es');
    if (esPost) {
        fs.writeFileSync(path.join(__dirname, '../src/content/blog/es', `${slug}.md`), esPost);
        console.log(`Published ES: ${slug}.md`);
    }
}

run();
