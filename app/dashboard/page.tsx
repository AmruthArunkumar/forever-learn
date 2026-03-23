"use client";

import { Box } from "@mantine/core";
import { useEffect, useState } from "react";
import TabHeader from "@/components/TabHeader";
import { supabase } from "@/app/supabase/config";
import { useRouter } from "next/navigation";
// import DocumentPage from "@/components/DocumentPage";
// import ChatbotPage from "@/components/ChatbotPage";
// import StudyToolPage from "@/components/StudyToolPage";

export default function Dashboard() {
    const [tab, setTab] = useState<number>(0);

    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (!(data.session?.user ?? null)) { router.push("/"); }
        };
        getSession();
    }, []);

    return (
        <Box style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
            <Box style={{ height: "60px" }}>
                <TabHeader tab={tab} setTab={setTab} />
            </Box>
            {/* <Box flex={1} display={"flex"} m={"8px"} style={{ flexDirection: "column" }}>
                {tab === 0 && <DocumentPage />}
                {tab === 1 && <ChatbotPage />}
                {tab === 2 && <StudyToolPage />}
            </Box> */}
        </Box>
    );
}