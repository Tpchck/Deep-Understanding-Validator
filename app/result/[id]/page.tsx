import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import QuizInterface from "@/components/features/QuizInterface"
import { getTempSession } from "@/lib/temp-store";
import type { QuizTurn } from "@/types";

const isTempStoreMode = () => process.env.STORAGE_MODE === "temp";

// Don't cache this page — data changes after AI generates questions
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{id:string}>;
}

export default async function ResultPage({ params }: PageProps){
    const {id} = await params; 

    if (isTempStoreMode()) {
        const tempSession = getTempSession(id);
        if (!tempSession) notFound();
        return (
            <main className="min-h-screen py-8">
                <QuizInterface
                    sessionId={id}
                    question={tempSession.question}
                    explanation={tempSession.explanation}
                    codeSnippet={tempSession.codeSnippet}
                    language={tempSession.language}
                    initialTurns={tempSession.turns}
                    initialFinished={tempSession.finished}
                    initialFollowUp={null}
                />
            </main>
        );
    }

    const supabase = await createClient();

    const { data: current, error } = await supabase
        .from("questions")
        .select("id, question_text, code_snippet, language, explanation, turns, finished, follow_up_question")
        .eq("id", id)
        .single();

    if (error || !current) notFound();

    return (
        <main className="min-h-screen py-8">
            <QuizInterface
                key={id}
                sessionId={id}
                question={current.question_text}
                explanation={current.explanation}
                codeSnippet={current.code_snippet}
                language={current.language}
                initialTurns={(current.turns as unknown as QuizTurn[]) ?? []}
                initialFinished={current.finished ?? false}
                initialFollowUp={(current.follow_up_question as string) ?? null}
            />
        </main>
    );
}