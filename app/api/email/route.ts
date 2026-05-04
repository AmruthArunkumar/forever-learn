import { NextRequest } from "next/server";
import { Resend } from "resend";

import { EmailTemplate } from "@/components/EmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return new Response('Unauthorized', {
            status: 401,
        });
    }

    const response = await supabase
        .from("cards")
        .select("back");

    try {
        const { data, error } = await resend.emails.send({
            from: "Forever Learn Bot <notify@mail.foreverlearn.app>",
            to: ["amruth1.618@gmail.com"],
            subject: "Flashcard App Daily Review",
            html: JSON.stringify(response.data),
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
}
