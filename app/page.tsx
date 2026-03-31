"use client"

import Header from "@/components/Header";
import { Box } from "@mantine/core";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase/config";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session?.user ?? null) {
                router.push("/dashboard");
            }
        };
        getSession();
    }, []);

    return (
        <Box style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
            <Header />
        </Box>
    );
}
