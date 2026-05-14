import { serve } from "@upstash/workflow/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/EmailTemplate";
import { Card, CardStats } from "@/utility/types";
import { checkFading, checkForgotten, checkLearning, checkStrong } from "@/utility/FSRS";

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
            .select("front, back, last_review, stability, sets!inner ( user_id )")
            .eq("sets.user_id", user_id);
        const data = response.data;
        return {
            new: (data ?? []).filter((c) => !c.last_review),
            strong: (data ?? []).filter((c) =>
                checkStrong({ stability: c.stability, last_review: c.last_review } as CardStats),
            ),
            learning: (data ?? []).filter((c) =>
                checkLearning({ stability: c.stability, last_review: c.last_review } as CardStats),
            ),
            fading: (data ?? []).filter((c) =>
                checkFading({ stability: c.stability, last_review: c.last_review } as CardStats),
            ),
            forgotten: (data ?? []).filter((c) =>
                checkForgotten({ stability: c.stability, last_review: c.last_review } as CardStats),
            ),
        };
    });

    await context.run("send-email", async () => {
        try {
            const { data, error } = await resend.emails.send({
                from: "Forever Learn Bot <notify@mail.foreverlearn.app>",
                to: [email],
                subject: "Flashcard App Daily Review",
                html: Object.entries(cards)
                    .map(([category, cardList]) => {
                        const heading = `<h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 5px;">${category}</h2>`;

                        const cardContent = cardList
                            .map(
                                (c) => `
                        <div style="margin-bottom: 15px; padding-left: 10px; border-left: 3px solid #74c0fc;">
                            <strong>Front:</strong> ${c.front}<br />
                            <strong>Back:</strong> ${c.back}
                        </div>
                        `,
                            )
                            .join("");

                        return heading + cardContent;
                    })
                    .join("<br />"),
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
