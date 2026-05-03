"use client";

import { ActionIcon, Box, Button, Group, Input, NativeSelect, SegmentedControl, Text, Textarea } from "@mantine/core";
import { useEffect, useState } from "react";
import TabHeader from "@/components/TabHeader";
import { supabase } from "@/app/supabase/config";
import { useParams, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconButton } from "@mui/material";
import { showErrorNotification, showSuccessNotification } from "@/utility/notification";

export default function AddCard() {
    const [user, setUser] = useState<User | null>(null);

    const router = useRouter();
    const params = useParams();
    const id = params.id;

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

    const [front, setFront] = useState<string>("");
    const [back, setBack] = useState<string>("");

    const handleAddCard = async () => {
        if (front == "" || back == "") {
            showErrorNotification("Front and back text are required");
        } else {
            try {
                const { data, error } = await supabase.from("cards").insert({set_id: id, front: front, back: back});
                if (error) throw error;
                showSuccessNotification("Card added to set!")
            } catch (error) {
                showErrorNotification("Try again later");
            }
        }
    }

    return (
        <Box style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
            <Box style={{ height: "60px" }}>
                <Header />
            </Box>
            {user && (
                <Box
                    flex={1}
                    display={"flex"}
                    p={"8px"}
                    w="100%"
                    style={{ flexDirection: "column", alignSelf: "center" }}
                    maw={"1000px"}
                >
                    <Group display={"flex"} justify="space-between" h={50}>
                        <ActionIcon variant="default" size="lg" onClick={() => router.back()} radius={"xs"}>
                            <ArrowBackIcon />
                        </ActionIcon>
                        <Button
                            rightSection={<SaveIcon />}
                            radius={"xs"}
                            size="md"
                            color="pale-green"
                            onClick={handleAddCard}
                        >
                            Save
                        </Button>
                    </Group>
                    <Text fw={700} size="lg" pb={"10px"} pt={"10px"}>Front</Text>
                    <Textarea
                        value={front}
                        onChange={(e) => setFront(e.currentTarget.value)}
                        size="md"
                        radius="xs"
                        placeholder="Enter Text Here"
                        autosize
                        minRows={4}
                    />
                    <Text fw={700} size="lg" pb={"10px"} pt={"10px"}>Back</Text>
                    <Textarea
                        value={back}
                        onChange={(e) => setBack(e.currentTarget.value)}
                        size="md"
                        radius="xs"
                        placeholder="Enter Text Here"
                        autosize
                        minRows={4}
                    />
                </Box>
            )}
        </Box>
    );
}
