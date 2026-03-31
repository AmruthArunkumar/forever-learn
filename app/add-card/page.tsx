"use client";

import { ActionIcon, Box, Button, Group, Input, NativeSelect, SegmentedControl } from "@mantine/core";
import { useEffect, useState } from "react";
import TabHeader from "@/components/TabHeader";
import { supabase } from "@/app/supabase/config";
import { useRouter } from "next/navigation";
import CardSetsPage from "@/components/CardSetsPage";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from "@mui/material";

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);

    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getUser();
            if (!(data.user ?? null)) {
                router.push("/");
            }
            setUser(data.user);
        };
        getSession();
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

    const [name, setName] = useState<string>("");
    const [type, setType] = useState<string>("txt");

    return (
        <Box style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
            <Box style={{ height: "60px" }}>
                <Header />
            </Box>
            {user && (
                <Box flex={1} display={"flex"} m={"8px"} style={{ flexDirection: "column" }}>
                    <Group display={"flex"} justify="flex-start" h={60} pb={"8px"}>
                        <ActionIcon
                            variant="default"
                            size="lg"
                            onClick={() => router.back()}
                            radius={"xs"}
                        >
                            <ArrowBackIcon />
                        </ActionIcon>
                        <SegmentedControl
                            size="md"
                            radius="xs"
                            color="pale-green"
                            withItemsBorders={false}
                            transitionDuration={500}
                            value={type}
                            onChange={setType}
                            data={[
                                { label: "Text", value: "txt" },
                                { label: "Handwritten", value: "hw" },
                            ]}
                        />
                        <Input
                            value={name}
                            onChange={(e) => setName(e.currentTarget.value)}
                            size="md"
                            radius="xs"
                            flex={1}
                            placeholder="Card Set Name"
                        />
                        <Button
                            rightSection={<SaveIcon />}
                            radius={"xs"}
                            size="md"
                            color="pale-green"
                            onClick={async () => {
                                console.log(name);
                                console.log(type);
                            }}
                        >
                            Save
                        </Button>
                    </Group>
                </Box>
            )}
        </Box>
    );
}
