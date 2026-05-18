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
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import Header from "@/components/Header";
import { checkFading, checkForgotten, checkLearning, checkStrong, interval, retrievability } from "@/utility/FSRS";
import { SmartLatex } from "@/utility/smartLatex";
import { RowCard } from "@/components/FlashCard";

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
        setCards(
            (data as Card[]).sort((a, b) => {
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            }),
        );
        const response = await supabase.from("sets").select("name").eq("set_id", id).limit(1);
        setName(response.data?.[0]?.name ?? null);
    };

    const handleDeleteCard = async (card_id: string) => {
        try {
            const { data, error } = await supabase.from("cards").delete().eq("card_id", card_id);
            if (error) throw error;
            showSuccessNotification("Card removed from set!");
            await handleGetAllCardsInSet();
        } catch (error) {
            showErrorNotification("Try again later");
        }
    };

    return (
        <Box style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
            <Box style={{ height: "60px" }}>
                <Header />
            </Box>
            {user && name == null && (
                <Box
                    flex={1}
                    display={"flex"}
                    m={"8px"}
                    style={{ flexDirection: "column", overflowY: "auto", alignItems: "center" }}
                >
                    <Group
                        display={"flex"}
                        justify="left"
                        h={50}
                        w={{ base: "100%", md: "975px" }}
                        mb={"8px"}
                        mt={"8px"}
                    >
                        <ActionIcon variant="default" size="lg" onClick={() => router.back()} radius={"xs"}>
                            <ArrowBackIcon />
                        </ActionIcon>
                        <Title order={1} pb={"4px"} pl={"4px"}>
                            Set Not Found
                        </Title>
                    </Group>
                </Box>
            )}
            {user && name && (
                <Box
                    flex={1}
                    display={"flex"}
                    m={"8px"}
                    style={{ flexDirection: "column", overflowY: "auto", alignItems: "center" }}
                >
                    <Group
                        display={"flex"}
                        justify="left"
                        h={50}
                        w={{ base: "100%", md: "975px" }}
                        mb={"8px"}
                        mt={"8px"}
                    >
                        <ActionIcon variant="default" size="lg" onClick={() => router.back()} radius={"xs"}>
                            <ArrowBackIcon />
                        </ActionIcon>
                        <Title order={1} pb={"4px"} pl={"4px"}>
                            {name}
                        </Title>
                    </Group>
                    <Divider orientation="horizontal" w={{ base: "100%", md: "975px" }} />
                    <Group
                        display={"flex"}
                        justify="left"
                        h={50}
                        w={{ base: "100%", md: "975px" }}
                        mb={"16px"}
                        mt={"16px"}
                    >
                        <Button
                            radius={"xs"}
                            size="md"
                            variant="default"
                            onClick={() => router.push(`/set/${id}/study`)}
                        >
                            Study Now
                        </Button>
                    </Group>
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
                            {(cards ?? []).filter((c) => !c.last_review).length > 0 && (
                                <Text size="lg" fw={700} c={"white"}>
                                    New
                                </Text>
                            )}
                            {(cards ?? [])
                                .filter((c) => !c.last_review)
                                .map((c, i) => {
                                    return <RowCard key={i} handleDeleteCard={handleDeleteCard} c={c} />;
                                })}
                            {(cards ?? []).filter((c) => checkStrong(c)).length > 0 && (
                                <Text size="lg" fw={700} c={"blue"}>
                                    Strong
                                </Text>
                            )}
                            {(cards ?? [])
                                .filter((c) => checkStrong(c))
                                .map((c, i) => {
                                    return <RowCard key={i} handleDeleteCard={handleDeleteCard} c={c} />;
                                })}
                            {(cards ?? []).filter((c) => checkLearning(c)).length > 0 && (
                                <Text size="lg" fw={700} c={"green"}>
                                    Learning
                                </Text>
                            )}
                            {(cards ?? [])
                                .filter((c) => checkLearning(c))
                                .map((c, i) => {
                                    return <RowCard key={i} handleDeleteCard={handleDeleteCard} c={c} />;
                                })}
                            {(cards ?? []).filter((c) => checkFading(c)).length > 0 && (
                                <Text size="lg" fw={700} c={"orange"}>
                                    Fading
                                </Text>
                            )}
                            {(cards ?? [])
                                .filter((c) => checkFading(c))
                                .map((c, i) => {
                                    return <RowCard key={i} handleDeleteCard={handleDeleteCard} c={c} />;
                                })}
                            {(cards ?? []).filter((c) => checkForgotten(c)).length > 0 && (
                                <Text size="lg" fw={700} c={"red"}>
                                    Forgotten
                                </Text>
                            )}
                            {(cards ?? [])
                                .filter((c) => checkForgotten(c))
                                .map((c, i) => {
                                    return <RowCard key={i} handleDeleteCard={handleDeleteCard} c={c} />;
                                })}
                        </SimpleGrid>
                        <Affix position={{ bottom: 25, right: 25 }}>
                            <ActionIcon
                                color="pale-green"
                                radius="xl"
                                size={60}
                                onClick={() => {
                                    router.push(`/set/${id}/add-card`);
                                }}
                            >
                                <AddIcon />
                            </ActionIcon>
                        </Affix>
                    </Box>
                </Box>
            )}
        </Box>
    );
}
