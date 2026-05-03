"use client";

import {
    ActionIcon,
    Box,
    Burger,
    Button,
    Divider,
    Drawer,
    Group,
    Tabs,
    useComputedColorScheme,
    useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { supabase } from "@/app/supabase/config";
import { HomeRounded, FolderOpenRounded, TimelineOutlined } from "@mui/icons-material";
import { LibraryPage, DailyPage, ProgressPage, titleCase } from "@/utility/strings";

export default function TabHeader({ tab }: { tab: number }) {
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });

    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user ?? null);
        };
        getSession();
    }, []);

    const handleLogInClick = () => {
        router.push("/log-in");
    };

    const handleLogOutClick = async () => {
        closeDrawer();
        await supabase.auth.signOut();
        setUser(null);
        router.push("/");
    };

    const handleSignUpClick = () => {
        router.push("/sign-up");
    };

    return (
        <Box style={{ height: "60px" }}>
            <header
                style={{
                    position: "fixed",
                    top: 0,
                    left: "8px",
                    right: "8px",
                    height: "60px",
                    borderBottom: "2px solid light-dark(#DDDDDD, #444444)",
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Group justify="left" h="100%">
                    {user && (
                        <Box style={{ height: "60px", display: "flex", alignItems: "flex-end" }} visibleFrom="sm">
                            <Tabs
                                color="pale-green"
                                radius="xs"
                                defaultValue={DailyPage}
                                value={tab === 0 ? DailyPage : tab === 1 ? LibraryPage : ProgressPage}
                                onChange={(value) => {
                                    if (value === DailyPage) router.push("/home");
                                    if (value === LibraryPage) router.push("/library");
                                    if (value === ProgressPage) router.push("/progress");
                                }}
                            >
                                <Tabs.List>
                                    <Tabs.Tab
                                        value={DailyPage}
                                        leftSection={<HomeRounded />}
                                    >
                                        {titleCase(DailyPage)}
                                    </Tabs.Tab>
                                    <Tabs.Tab
                                        value={LibraryPage}
                                        leftSection={<FolderOpenRounded />}
                                    >
                                        {titleCase(LibraryPage)}
                                    </Tabs.Tab>
                                    <Tabs.Tab
                                        value={ProgressPage}
                                        leftSection={<TimelineOutlined />}
                                    >
                                        {titleCase(ProgressPage)}
                                    </Tabs.Tab>
                                </Tabs.List>
                            </Tabs>
                        </Box>
                    )}
                </Group>

                <Group justify="right" h="100%">
                    <ActionIcon
                        variant="default"
                        size="lg"
                        onClick={() => setColorScheme(computedColorScheme === "light" ? "dark" : "light")}
                        radius={"xs"}
                    >
                        {mounted &&
                            (computedColorScheme === "light" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />)}
                    </ActionIcon>
                    {!user ? (
                        <Group visibleFrom="sm">
                            <Button variant="default" onClick={handleLogInClick} radius={"xs"}>
                                Log in
                            </Button>
                            <Button onClick={handleSignUpClick} color="pale-green" radius={"xs"}>
                                Sign up
                            </Button>
                        </Group>
                    ) : (
                        <Group visibleFrom="sm">
                            <Button variant="default" onClick={handleLogOutClick} radius={"xs"}>
                                Log Out
                            </Button>
                        </Group>
                    )}

                    <Burger opened={false} onClick={toggleDrawer} hiddenFrom="sm" />
                </Group>
            </header>

            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                withCloseButton={false}
                size="75%"
                padding="sm"
                hiddenFrom="sm"
                zIndex={1000}
            >

                <Group justify="center" grow px="md" pt={"16px"}>
                    <Button.Group orientation="vertical">
                        <Button
                            variant={tab == 0 ? "light" : "default"}
                            color={"pale-green"}
                            onClick={() => {
                                router.push("/home");
                                closeDrawer();
                            }}
                            radius={"xs"}
                        >
                            {titleCase(DailyPage)}
                        </Button>
                        <Button
                            variant={tab == 1 ? "light" : "default"}
                            color={"pale-green"}
                            onClick={() => {
                                router.push("/library");
                                closeDrawer();
                            }}
                            radius={"xs"}
                        >
                            {titleCase(LibraryPage)}
                        </Button>
                        <Button
                            variant={tab == 2 ? "light" : "default"}
                            color={"pale-green"}
                            onClick={() => {
                                router.push("/progress");
                                closeDrawer();
                            }}
                            radius={"xs"}
                        >
                            {titleCase(ProgressPage)}
                        </Button>
                    </Button.Group>
                </Group>

                <Divider my="lg" />

                {!user ? (
                    <Group justify="center" grow pb="xl" px="md">
                        <Button variant="default" onClick={handleLogInClick} radius={"xs"}>
                            Log in
                        </Button>
                        <Button onClick={handleSignUpClick} color="pale-green" radius={"xs"}>
                            Sign up
                        </Button>
                    </Group>
                ) : (
                    <Group justify="center" grow pb="xl" px="md">
                        <Button variant="default" onClick={handleLogOutClick} radius={"xs"}>
                            Log Out
                        </Button>
                    </Group>
                )}
            </Drawer>
        </Box>
    );
}