const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyAqmJbqwTSND0ElBoT-y7Qea1lg0Adcbio",
    authDomain: "navai-151f5.firebaseapp.com",
    projectId: "navai-151f5",
    storageBucket: "navai-151f5.firebasestorage.app",
    messagingSenderId: "47292512558",
    appId: "1:47292512558:web:3be70819759764e7c322bf",
    measurementId: "G-MJQ47SVWET"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchLesson() {
    try {
        const q = query(collection(db, "lessons"), where("title", "==", "Bowline Knot"));
        const snap = await getDocs(q);
        if (snap.empty) { console.log("No lesson found"); process.exit(0); }
        const lesson = snap.docs[0];
        console.log("Lesson ID:", lesson.id);
        console.log("Lesson Data:", JSON.stringify(lesson.data(), null, 2));

        const teoriaRef = collection(db, "lessons", lesson.id, "teoria");
        const teoriaSnap = await getDocs(teoriaRef);
        if (teoriaSnap.empty) { console.log("No teoria found"); process.exit(0); }
        const data = teoriaSnap.docs[0].data();
        console.log("Teoria Data:", JSON.stringify(data, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("Error fetching lesson:", error);
        process.exit(1);
    }
}

fetchLesson();
