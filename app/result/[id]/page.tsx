import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import QuizInterface from "@/components/features/QuizInterface"

interface PageProps {
    params: Promise<{id:string}>;
}

export default async function ResultPage({ params }: PageProps){
    const {id} = await params; 
    const supabase = await createClient();
    const{data,error} = await supabase.from("questions").select("*").eq("id", id).single(); 
    if (error != null || data == null) {
        notFound();
    }
    return(
        <main className="...">
            <QuizInterface question={data.question_text} code ={data.code_snippet} options={data.options} correctIndex={data.correct_option_index} explanation={data.explanation}/>
        </main>
    );
}