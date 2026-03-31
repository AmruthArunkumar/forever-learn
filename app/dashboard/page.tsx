"use client";

import { Box, Button, Group, Input, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import TabHeader from "@/components/TabHeader";
import { supabase } from "@/app/supabase/config";
import { useRouter } from "next/navigation";
import CardSetsPage from "@/components/CardSetsPage";
import { User } from "@supabase/supabase-js";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { showNotification } from "@mantine/notifications";
import { showErrorNotification } from "@/utility/notification";
import { Set } from "@/utility/types";

export default function Dashboard() {
    const [tab, setTab] = useState<number>(0);
    const [user, setUser] = useState<User | null>(null);
    const [allSets, setAllSets] = useState<Set[]>([]);

    const router = useRouter();

    useEffect(() => {
        let ignore = false;
        const getSession = async () => {
            const { data } = await supabase.auth.getUser();
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
        console.log(data as Set[]);
    };

    const [opened, { open, close }] = useDisclosure(false);
    const [name, setName] = useState<string>("");

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
                });
                if (error) throw error;
                router.push("/add-card");
            } catch (error) {
                showErrorNotification("Try again later");
            }
        }
    };

    return (
        <Box style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
            <Modal opened={opened} onClose={close} title="Create Card Set" centered>
                <Group display={"flex"} justify="flex-start" h={60} pb={"8px"}>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.currentTarget.value)}
                        size="md"
                        radius="xs"
                        flex={1}
                        placeholder="Set Name"
                        // error="here"
                    />
                    <Button
                        // rightSection={<SaveIcon />}
                        radius={"xs"}
                        size="md"
                        color="pale-green"
                        onClick={async () => {
                            handleSaveSetClicked();
                        }}
                    >
                        Save
                    </Button>
                </Group>
            </Modal>
            <Box style={{ height: "60px" }}>
                <TabHeader tab={tab} setTab={setTab} />
            </Box>
            {user && (
                <Box flex={1} display={"flex"} m={"8px"} style={{ flexDirection: "column" }}>
                    {tab === 1 && <CardSetsPage handleAddSetClicked={handleAddSetClicked} sets={allSets} />}
                    {/* {tab === 1 && <ChatbotPage />}
                {tab === 2 && <StudyToolPage />} */}
                </Box>
            )}
        </Box>
    );
}
