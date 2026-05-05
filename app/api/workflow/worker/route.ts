import { serve } from "@upstash/workflow/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/EmailTemplate";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

const resend = new Resend(process.env.RESEND_API_KEY);

interface WorkflowPayload {
    user_id: string;
    email: string;
}

export const { POST } = serve<WorkflowPayload>(async (context) => {
    const { user_id, email } = context.requestPayload;

    const cards = await context.run("get-user-cards", async () => {
        const response = await supabase
            .from("cards")
            .select("front, back, sets!inner ( user_id )")
            .eq("sets.user_id", user_id);
        return response.data
    });

    await context.run("send-email", async () => {
        try {
            const { data, error } = await resend.emails.send({
                from: "Forever Learn Bot <notify@mail.foreverlearn.app>",
                to: [email],
                subject: "Flashcard App Daily Review",
                html: JSON.stringify(cards),
            });

            if (error) {
                console.error("Resend API Error:", error);
                return Response.json({ error }, { status: 500 });
            }

            console.log("Email sent successfully:", data);
            return Response.json(data);
        } catch (error: any) {
            console.error("Caught Exception:", error.message || error);
            return Response.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
    });
});
