"use client";

import {
    ActionIcon,
    Affix,
    Box,
    Button,
    Center,
    Divider,
    Flex,
    Group,
    Input,
    Loader,
    Menu,
    Modal,
    Paper,
    rem,
    SegmentedControl,
    SimpleGrid,
    Skeleton,
    Stack,
    Text,
    Title,
    Typography,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import TabHeader from "@/components/TabHeader";
import { supabase } from "@/app/supabase/config";
import { useRouter, useParams } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { showErrorNotification, showLoadingNotification, showSuccessNotification } from "@/utility/notification";
import { Card } from "@/utility/types";

import KeyboardRoundedIcon from "@mui/icons-material/KeyboardRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import AddIcon from "@mui/icons-material/Add";
import StyleRoundedIcon from "@mui/icons-material/StyleRounded";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Header from "@/components/Header";

export default function SetViewer() {
    const [user, setUser] = useState<User | null>(null);
    const [cards, setCards] = useState<Card[] | null>(null);
    const [name, setName] = useState<string>("");

    const router = useRouter();
    const params = useParams();
    const id = params.id;

    useEffect(() => {
        let ignore = false;
        const getSession = async () => {
            const { data } = await supabase.auth.getUser();
            if (ignore) return;
            if (!(data.user ?? null)) {
                router.push("/");
            }
            setUser(data.user);
            await handleGetAllCardsInSet();
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

    const handleGetAllCardsInSet = async () => {
        const { data, error } = await supabase.from("cards").select("*").eq("set_id", id);
        setCards(data as Card[]);
        const response = await supabase.from("sets").select("name").eq("set_id", id).limit(1);
        setName(response.data?.[0].name ?? "")
    };

    const handleDeleteCard = async (card_id: number) => {
        try {
            const { data, error } = await supabase.from("cards").delete().eq("card_id", card_id);
            if (error) throw error;
            showSuccessNotification("Card removed from set!")
            await handleGetAllCardsInSet()
        } catch (error) {
            showErrorNotification("Try again later");
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
                    m={"8px"}
                    style={{ flexDirection: "column", overflowY: "auto", alignItems: "center" }}
                >
                    <Title order={1} pb={"8px"}>{name}</Title>
                    {!cards && (
                        <SimpleGrid spacing="md" w={{ base: "100%", md: "975px" }}>
                            {Array.from(Array(6).keys()).map((e, i) => (
                                <Skeleton visible={true} key={i} radius="md" p="30px" display={"flex"} />
                            ))}
                        </SimpleGrid>
                    )}
                    <Box
                        display={"flex"}
                        style={{ flexDirection: "column", gap: "16px", alignItems: "center", width: "100%" }}
                    >
                        <SimpleGrid spacing="md" w={{ base: "100%", md: "975px" }}>
                            {(cards ?? []).map((c, i) => {
                                return (
                                    <Paper withBorder shadow="sm" radius="md" p="8px" key={i} display={"flex"} style={{ flexDirection: "column" }}>
                                        <Box ml={"auto"} display={"flex"} style={{ flexDirection: "row" }}>
                                        <ActionIcon variant="subtle" color="gray" mr={"8px"} onClick={() => handleDeleteCard(c.card_id)}>
                                            <DeleteIcon />
                                        </ActionIcon>
                                        <ActionIcon variant="subtle" color="gray" mr={"4px"}>
                                            <EditIcon />
                                        </ActionIcon>
                                        </Box>
                                        <Flex direction={{ base: "column", xs: "row" }} w={"100%"} gap="xs" align="stretch">
                                            <Box p="8px" display={"flex"} flex={1}>
                                                <Text style={{ whiteSpace: "normal", overflowWrap: "break-word", wordBreak: "break-word"}}>
                                                    {c.front}
                                                </Text>
                                            </Box>
                                            <Divider orientation="horizontal" hiddenFrom="xs" ml={"4px"} mr={"4px"} />
                                            <Divider orientation="vertical" visibleFrom="xs" mt={"4px"} mb={"4px"} />
                                            <Box p="8px" display={"flex"} flex={1}>
                                                <Text style={{ whiteSpace: "normal", overflowWrap: "break-word", wordBreak: "break-word"}}>
                                                    {c.back}
                                                </Text>
                                            </Box>
                                        </Flex>
                                    </Paper>
                                );
                            })}
                        </SimpleGrid>
                        <Affix position={{ bottom: 25, right: 25 }}>
                            <ActionIcon color="pale-green" radius="xl" size={60} onClick={() => {router.push(`/set/${id}/add-card`)}}>
                                <AddIcon />
                            </ActionIcon>
                        </Affix>
                    </Box>
                </Box>
            )}
        </Box>
    );
}
