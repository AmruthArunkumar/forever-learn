"use client";

import {
    ActionIcon,
    Affix,
    Box,
    Button,
    Center,
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
} from "@mantine/core";
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
import AddIcon from "@mui/icons-material/Add";
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function Library() {
    const [user, setUser] = useState<User | null>(null);
    const [allSets, setAllSets] = useState<Set[] | null>(null);

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
            await handleGetAllDocuments(data!.user!);
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

    const handleGetAllDocuments = async (user: User) => {
        const { data, error } = await supabase.from("sets").select("*").eq("user_id", user.id);
        setAllSets(data as Set[]);
    };

    const handleDeleteSet = async (set_id: number) => {
        try {
            showLoadingNotification("Deleting Set...", `loading-delete-${set_id}`);
            const { data, error } = await supabase.from("sets").delete().eq("set_id", set_id);
            if (error) throw error;
            if (user) await handleGetAllDocuments(user!);
            showSuccessNotification("Set Successfully Deleted", `loading-delete-${set_id}`, true);
        } catch (error) {
            showErrorNotification("Try again later", `loading-delete-${set_id}`, true);
        }
    };

    const [opened, { open, close }] = useDisclosure(false);
    const [name, setName] = useState<string>("");
    const [cardType, setCardType] = useState("text");

    const handleAddSetClicked = () => {
        open();
    };

    const handleSaveSetClicked = async () => {
        if (name == "") {
            showErrorNotification("Set name cannot be empty");
        } else {
            try {
                const { data, error } = await supabase.from("sets").insert({
                    user_id: user!.id,
                    name: name,
                    maintain: true,
                    type: cardType,
                });
                if (error) throw error;
                router.push("/add-card");
            } catch (error) {
                showErrorNotification("Try again later");
            }
        }
    };

    const handleSetClicked = (id: number) => {
        router.push(`/set/${id}`)
    }

    return (
        <Box style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
            <Modal opened={opened} onClose={close} title="Create Card Set" centered radius="md">
                <Stack gap="md">
                    <Group align="flex-end" gap="xs">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.currentTarget.value)}
                            size="md"
                            radius="xs"
                            flex={1}
                            placeholder="Set Name"
                        />
                        <Button radius="xs" size="md" color="pale-green" onClick={handleSaveSetClicked}>
                            Create
                        </Button>
                    </Group>
                    <SegmentedControl
                        value={cardType}
                        onChange={setCardType}
                        fullWidth
                        size="md"
                        radius="xs"
                        color="pale-green"
                        data={[
                            {
                                value: "text",
                                label: (
                                    <Center style={{ gap: rem(10) }}>
                                        <KeyboardRoundedIcon />
                                        <span>Text</span>
                                    </Center>
                                ),
                            },
                            {
                                value: "handwritten",
                                label: (
                                    <Center style={{ gap: rem(10) }}>
                                        <CreateRoundedIcon />
                                        <span>Handwritten</span>
                                    </Center>
                                ),
                            },
                        ]}
                    />
                </Stack>
            </Modal>
            <Box style={{ height: "60px" }}>
                <TabHeader tab={1} />
            </Box>
            {user && (
                <Box flex={1} display={"flex"} m={"8px"} style={{ flexDirection: "column" }}>
                    {!allSets && (
                        <SimpleGrid
                            cols={{ base: 1, xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
                            spacing="md"
                            style={{ width: "100%" }}
                        >
                            {Array.from(Array(6).keys()).map((e, i) => (
                                <Skeleton visible={true} key={i} radius="md" p="30px" display={"flex"} />
                            ))}
                        </SimpleGrid>
                    )}
                    <Box display={"flex"} style={{ flexDirection: "column", gap: "16px" }}>
                        <SimpleGrid
                            cols={{ base: 1, xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
                            spacing="md"
                            style={{ width: "100%" }}
                        >
                            {(allSets ?? [])
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((n, i) => {
                                    return (
                                        <Paper withBorder shadow="sm" radius="md" p="16px" key={i} display={"flex"} onClick={() => handleSetClicked(n.set_id)}>
                                            <StyleRoundedIcon sx={{ color: "", mr: "16px" }} />
                                            <Text flex={1} truncate="end">
                                                {n.name}
                                            </Text>
                                            <Menu shadow="md" width={200}>
                                                <Menu.Target>
                                                    <ActionIcon variant="subtle" color="gray">
                                                        <MoreVertIcon />
                                                    </ActionIcon>
                                                </Menu.Target>

                                                <Menu.Dropdown>
                                                    <Menu.Item onClick={() => {}}>Add Cards</Menu.Item>
                                                    <Menu.Item color="red" onClick={() => handleDeleteSet(n.set_id)}>
                                                        Delete
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Paper>
                                    );
                                })}
                        </SimpleGrid>
                        <Affix position={{ bottom: 25, right: 25 }}>
                            <ActionIcon color="pale-green" radius="xl" size={60} onClick={handleAddSetClicked}>
                                <AddIcon />
                            </ActionIcon>
                        </Affix>
                    </Box>
                </Box>
            )}
        </Box>
    );
}
