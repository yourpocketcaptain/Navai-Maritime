import admin from 'firebase-admin';
import dot from 'dotenv';
dot.config({ path: '.env.local' });

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
}

const db = admin.firestore();

async function check() {
    console.log("Checking Firestore for 'en' posts...");
    const enSnapshot = await db.collection('posts').where('lang', '==', 'en').get();
    console.log(`Found ${enSnapshot.size} en posts.`);

    console.log("Checking Firestore for 'es' posts...");
    const esSnapshot = await db.collection('posts').where('lang', '==', 'es').get();
    console.log(`Found ${esSnapshot.size} es posts.`);

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
