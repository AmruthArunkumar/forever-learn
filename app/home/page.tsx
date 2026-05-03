"use client";

import { Box, Button, Center, Group, Input, Modal, rem, SegmentedControl, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import TabHeader from "@/components/TabHeader";
import { supabase } from "@/app/supabase/config";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { showErrorNotification, showLoadingNotification, showSuccessNotification } from "@/utility/notification";
import { Set } from "@/utility/types";

import KeyboardRoundedIcon from "@mui/icons-material/KeyboardRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";

export default function Home() {
    const [user, setUser] = useState<User | null>(null);

    const router = useRouter();

    useEffect(() => {
        let ignore = false;
        const getSession = async () => {
            const { data } = await supabase.auth.getUser();
            if (ignore) return;
            if (!(data.user ?? null)) {
                router.push("/");
            }
            setUser(data.user);
        };
        getSession();
        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        const repairIfMissing = async () => {
            const { data } = await supabase.from("users").select("*").eq("user_id", user!.id);
            if (!data?.length) {
                try {
                    const { error } = await supabase.from("users").upsert({
                        user_id: user!.id,
                        email: user!.email,
                    });
                    if (error) {
                        throw error;
                    }
                    console.log("User info patched");
                } catch (error) {
                    console.log("User not patched");
                }
            }
        };
        if (user) {
            repairIfMissing();
        }
    }, [user]);

    return (
        <Box style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
            <Box style={{ height: "60px" }}>
                <TabHeader tab={0} />
            </Box>
            {user && (
                <Box flex={1} display={"flex"} m={"8px"} style={{ flexDirection: "column" }}>
                    Home Page: Under Construction
                </Box>
            )}
        </Box>
    );
}
