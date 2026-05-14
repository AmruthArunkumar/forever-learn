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
    useMatches,
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
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";
import Header from "@/components/Header";
import {
    checkFading,
    checkForgotten,
    checkLearning,
    difficulty,
    Grade,
    initialDifficulty,
    initialStability,
    retrievability,
    stability,
} from "@/utility/FSRS";
import { SmartLatex } from "@/utility/smartLatex";

export default function StudyPage() {
    const [user, setUser] = useState<User | null>(null);
    const [cards, setCards] = useState<Card[] | null>(null);
    const [name, setName] = useState<string>("");

    const [currCard, setCurrCard] = useState<{ card: number; section: string }>({ card: 0, section: "front" });

    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const buttonSize = useMatches({ base: "sm", xs: "sm", sm: "md" });

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
            (data as Card[])
                .filter((c) => checkLearning(c) || !c.last_review)
                .sort((a, b) => {
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                }),
        );
        const response = await supabase.from("sets").select("name").eq("set_id", id).limit(1);
        setName(response.data?.[0].name ?? "");
    };

    const handleForgot = async (card: Card) => {
        const card_id: number = card.card_id;
        const initialStab: boolean = card.stability ? false : true;
        const initialDiff: boolean = card.stability ? false : true;

        setCurrCard({ card: (currCard.card + 1) % cards!.length, section: "front" });
        const today = new Date().toISOString().split("T")[0];
        let r = 0;
        if (card.last_review) {
            const lastReview = new Date(card.last_review).getTime();
            const t = Math.max(0, (new Date(today).getTime() - lastReview) / (1000 * 60 * 60 * 24));
            r = retrievability(t, card.stability!);
        }
        const newStability = initialStab
            ? initialStability(Grade.Forgot)
            : stability(card.difficulty!, card.stability!, r, Grade.Forgot);
        const newDifficulty = initialDiff
            ? initialDifficulty(Grade.Forgot)
            : difficulty(card.difficulty!, Grade.Forgot);

        try {
            card.stability = newStability;
            card.difficulty = newDifficulty;
            card.last_review = today;
            const { data, error } = await supabase
                .from("cards")
                .update({ stability: newStability, difficulty: newDifficulty, last_review: today })
                .eq("card_id", card_id);
            if (error) throw error;
        } catch (error) {
            showErrorNotification("Card not updated. Try again later");
        }
    };

    const handleHard = async (card: Card) => {
        const card_id: number = card.card_id;
        const initialStab: boolean = card.stability ? false : true;
        const initialDiff: boolean = card.stability ? false : true;

        setCurrCard({ card: (currCard.card + 1) % cards!.length, section: "front" });
        const today = new Date().toISOString().split("T")[0];
        let r = 0;
        if (card.last_review) {
            const lastReview = new Date(card.last_review).getTime();
            const t = Math.max(0, (new Date(today).getTime() - lastReview) / (1000 * 60 * 60 * 24));
            r = retrievability(t, card.stability!);
        }
        const newStability = initialStab
            ? initialStability(Grade.Hard)
            : stability(card.difficulty!, card.stability!, r, Grade.Hard);
        const newDifficulty = initialDiff ? initialDifficulty(Grade.Hard) : difficulty(card.difficulty!, Grade.Hard);

        try {
            card.stability = newStability;
            card.difficulty = newDifficulty;
            card.last_review = today;
            const { data, error } = await supabase
                .from("cards")
                .update({ stability: newStability, difficulty: newDifficulty, last_review: today })
                .eq("card_id", card_id);
            if (error) throw error;
        } catch (error) {
            showErrorNotification("Card not updated. Try again later");
        }
    };

    const handleGood = async (card: Card) => {
        const card_id: number = card.card_id;
        const initialStab: boolean = card.stability ? false : true;
        const initialDiff: boolean = card.stability ? false : true;

        setCurrCard({ card: (currCard.card + 1) % cards!.length, section: "front" });
        const today = new Date().toISOString().split("T")[0];
        let r = 0;
        if (card.last_review) {
            const lastReview = new Date(card.last_review).getTime();
            const t = Math.max(0, (new Date(today).getTime() - lastReview) / (1000 * 60 * 60 * 24));
            r = retrievability(t, card.stability!);
        }
        const newStability = initialStab
            ? initialStability(Grade.Good)
            : stability(card.difficulty!, card.stability!, r, Grade.Good);
        const newDifficulty = initialDiff ? initialDifficulty(Grade.Good) : difficulty(card.difficulty!, Grade.Good);

        try {
            card.stability = newStability;
            card.difficulty = newDifficulty;
            card.last_review = today;
            const { data, error } = await supabase
                .from("cards")
                .update({ stability: newStability, difficulty: newDifficulty, last_review: today })
                .eq("card_id", card_id);
            if (error) throw error;
        } catch (error) {
            showErrorNotification("Card not updated. Try again later");
        }
    };

    const handleEasy = async (card: Card) => {
        const card_id: number = card.card_id;
        const initialStab: boolean = card.stability ? false : true;
        const initialDiff: boolean = card.stability ? false : true;

        setCurrCard({ card: (currCard.card + 1) % cards!.length, section: "front" });
        const today = new Date().toISOString().split("T")[0];
        let r = 0;
        if (card.last_review) {
            const lastReview = new Date(card.last_review).getTime();
            const t = Math.max(0, (new Date(today).getTime() - lastReview) / (1000 * 60 * 60 * 24));
            r = retrievability(t, card.stability!);
        }
        const newStability = initialStab
            ? initialStability(Grade.Easy)
            : stability(card.difficulty!, card.stability!, r, Grade.Easy);
        const newDifficulty = initialDiff ? initialDifficulty(Grade.Easy) : difficulty(card.difficulty!, Grade.Easy);

        try {
            card.stability = newStability;
            card.difficulty = newDifficulty;
            card.last_review = today;
            const { data, error } = await supabase
                .from("cards")
                .update({ stability: newStability, difficulty: newDifficulty, last_review: today })
                .eq("card_id", card_id);
            if (error) throw error;
        } catch (error) {
            showErrorNotification("Card not updated. Try again later");
        }
    };

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
                    <Group
                        display={"flex"}
                        justify="left"
                        h={50}
                        w={{ base: "100%", sm: "750px" }}
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
                    {!cards && (
                        <SimpleGrid spacing="md" w={{ base: "100%", sm: "750px" }}>
                            {Array.from(Array(6).keys()).map((e, i) => (
                                <Skeleton visible={true} key={i} radius="md" p="30px" display={"flex"} />
                            ))}
                        </SimpleGrid>
                    )}
                    {cards && cards.length == 0 && (
                        <Group
                            display={"flex"}
                            justify="left"
                            h={50}
                            w={{ base: "100%", sm: "750px" }}
                            mb={"8px"}
                            mt={"8px"}
                        >
                            <Title order={3} pb={"4px"} pl={"4px"}>
                                {"No Cards to Study :)"}
                            </Title>
                        </Group>
                    )}
                    {cards && cards.length > 0 && (
                        <Box
                            display={"flex"}
                            style={{ flexDirection: "column", gap: "16px", alignItems: "center", width: "100%" }}
                        >
                            <Box w={{ base: "100%", sm: "750px" }}>
                                <Paper
                                    withBorder
                                    shadow="sm"
                                    radius="md"
                                    p="16px"
                                    display={"flex"}
                                    style={{ justifyContent: "center" }}
                                    onClick={() =>
                                        setCurrCard({
                                            ...currCard,
                                            section: currCard.section == "front" ? "back" : "front",
                                        })
                                    }
                                >
                                    <Text
                                        style={{
                                            whiteSpace: "normal",
                                            overflowWrap: "break-word",
                                            wordBreak: "break-word",
                                            alignItems: "center",
                                            fontSize: "20px",
                                        }}
                                        display={"flex"}
                                        mih={"200px"}
                                    >
                                        {currCard.section == "front" ? (
                                            cards[currCard.card].special_type ? (
                                                <SmartLatex content={cards[currCard.card].front}></SmartLatex>
                                            ) : (
                                                cards[currCard.card].front
                                            )
                                        ) : cards[currCard.card].special_type ? (
                                            <SmartLatex content={cards[currCard.card].back}></SmartLatex>
                                        ) : (
                                            cards[currCard.card].back
                                        )}
                                    </Text>
                                </Paper>
                                <Group
                                    display={"flex"}
                                    justify="center"
                                    h={50}
                                    w={{ base: "100%", sm: "750px" }}
                                    visibleFrom="xs"
                                    mb={"8px"}
                                    mt={"8px"}
                                >
                                    <Button
                                        radius={"xs"}
                                        size={buttonSize}
                                        variant="default"
                                        onClick={() => {
                                            handleForgot(cards[currCard.card]);
                                        }}
                                    >
                                        <Text c={"red"} style={{ fontWeight: "bold" }}>
                                            Forgot
                                        </Text>
                                    </Button>
                                    <Button
                                        radius={"xs"}
                                        size={buttonSize}
                                        variant="default"
                                        onClick={() => {
                                            handleHard(cards[currCard.card]);
                                        }}
                                    >
                                        <Text c={"white"} style={{ fontWeight: "bold" }}>
                                            Hard
                                        </Text>
                                    </Button>
                                    <Button
                                        radius={"xs"}
                                        size={buttonSize}
                                        variant="default"
                                        onClick={() => {
                                            handleGood(cards[currCard.card]);
                                        }}
                                    >
                                        <Text c={"green"} style={{ fontWeight: "bold" }}>
                                            Good
                                        </Text>
                                    </Button>
                                    <Button
                                        radius={"xs"}
                                        size={buttonSize}
                                        variant="default"
                                        onClick={() => {
                                            handleEasy(cards[currCard.card]);
                                        }}
                                    >
                                        <Text c={"blue"} style={{ fontWeight: "bold" }}>
                                            Easy
                                        </Text>
                                    </Button>
                                </Group>
                                <Button.Group
                                    display={"flex"}
                                    h={50}
                                    w={{ base: "100%", sm: "750px" }}
                                    style={{ justifyContent: "center" }}
                                    hiddenFrom="xs"
                                    mb={"8px"}
                                    mt={"8px"}
                                >
                                    <Button
                                        radius={"xs"}
                                        size={buttonSize}
                                        variant="default"
                                        onClick={() => {
                                            handleForgot(cards[currCard.card]);
                                        }}
                                    >
                                        <Text c={"red"} style={{ fontWeight: "bold" }}>
                                            Forgot
                                        </Text>
                                    </Button>
                                    <Button
                                        radius={"xs"}
                                        size={buttonSize}
                                        variant="default"
                                        onClick={() => {
                                            handleHard(cards[currCard.card]);
                                        }}
                                    >
                                        <Text c={"white"} style={{ fontWeight: "bold" }}>
                                            Hard
                                        </Text>
                                    </Button>
                                    <Button
                                        radius={"xs"}
                                        size={buttonSize}
                                        variant="default"
                                        onClick={() => {
                                            handleGood(cards[currCard.card]);
                                        }}
                                    >
                                        <Text c={"green"} style={{ fontWeight: "bold" }}>
                                            Good
                                        </Text>
                                    </Button>
                                    <Button
                                        radius={"xs"}
                                        size={buttonSize}
                                        variant="default"
                                        onClick={() => {
                                            handleEasy(cards[currCard.card]);
                                        }}
                                    >
                                        <Text c={"blue"} style={{ fontWeight: "bold" }}>
                                            Easy
                                        </Text>
                                    </Button>
                                </Button.Group>
                            </Box>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}
