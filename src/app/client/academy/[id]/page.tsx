import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import LessonView from "./LessonView";

export async function generateStaticParams() {
    try {
        const querySnapshot = await getDocs(collection(db, "lessons"));
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
        }));
    } catch (e) {
        console.warn("Could not fetch static params for lessons. Using empty list.", e);
        return [];
    }
}

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    return <LessonView lessonId={id} />;
}
