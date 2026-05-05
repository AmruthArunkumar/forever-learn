import { Client } from "@upstash/workflow";
import { serve } from "@upstash/workflow/nextjs";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

const client = new Client({
    baseUrl: process.env.QSTASH_URL!,
    token: process.env.QSTASH_TOKEN!,
});

const BASE_URL = process.env.APP_URL ? `https://${process.env.APP_URL}` : `http://localhost:3000`;

export const { POST } = serve(async (context) => {
    const users = await context.run("get-users", async () => {
        const response = await supabase.from("users").select("user_id, email");
        return response.data ?? []
    });

    await context.run("start-workers", async () => {
        await Promise.all(
            users.map((user) =>
                client.trigger({
                    url: `${BASE_URL}/api/workflow/worker`,
                    body: { user_id: user.user_id, email: user.email },
                    retries: 3,
                }),
            ),
        );
    });
});
