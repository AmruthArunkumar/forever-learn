import { Client } from "@upstash/workflow";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { UserType } from "@/utility/types";

const client = new Client({
    baseUrl: process.env.QSTASH_URL!,
    token: process.env.QSTASH_TOKEN!,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

const BASE_URL = process.env.APP_URL ? `https://${process.env.APP_URL}` : `http://localhost:3000`;

export async function GET(request: NextRequest) {
    if (process.env.APP_URL) {
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return new Response("Unauthorized", {
                status: 401,
            });
        }
    }

    // const response = await supabase.from("users").select("user_id, email");

    // const users: UserType[] = response.data as UserType[];
    // const users = Array.from({ length: 100 }, (_, i) => ({
    //     user_id: `mock-uuid-${i}`,
    //     email: `amruth+test${i}@gmail.com` // Using + aliases lets you receive all to one inbox
    // }));

    try {
        await client.trigger({
            url: `${BASE_URL}/api/workflow/manager`,
            retries: 3,
        });
        return Response.json({ message: "successfully started manager" }, { status: 200 });
    } catch (error: any) {
        console.error("Caught Exception:", error.message || error);
        return Response.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
