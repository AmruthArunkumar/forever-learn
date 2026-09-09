"use client";

import { ActionIcon, Box, Button, Group, Input, NativeSelect, SegmentedControl, Text, Textarea } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import TabHeader from "@/components/TabHeader";
import { supabase } from "@/app/supabase/config";
import { useParams, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconButton } from "@mui/material";
import { showErrorNotification, showSuccessNotification } from "@/utility/notification";
import { SmartLatex } from "@/utility/smartLatex";
import Canvas from "@/components/Canvas";
import { Stroke } from "@/utility/types";

const BASE_URL = process.env.APP_URL ? `https://${process.env.APP_URL}` : `http://localhost:3000`;

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

    const front = useRef<Stroke[]>([]);
    const back = useRef<Stroke[]>([]);

    const frontCanvasRef = useRef<HTMLCanvasElement>(null);
    const backCanvasRef = useRef<HTMLCanvasElement>(null);

    const sizeRef = useRef({ width: 0, height: 0 });

    const exportImage = async () => {
        if (front.current.length == 0 || back.current.length == 0) {
            showErrorNotification("Front and back drawings are required");
        } else {
            const fCanvas = frontCanvasRef.current;
            const bCanvas = backCanvasRef.current;
            const fImage = fCanvas?.toDataURL("image/png");
            const bImage = bCanvas?.toDataURL("image/png");
            const cardId = crypto.randomUUID();
            try {
                const [responseFront, responseBack, insertResult] = await Promise.all([
                    fetch(`${BASE_URL}/api/image`, {
                        method: "POST",
                        body: JSON.stringify({ image: fImage, folder: `${user!.id}/${id}`, name: `${cardId}-front` }),
                    }),
                    fetch(`${BASE_URL}/api/image`, {
                        method: "POST",
                        body: JSON.stringify({ image: bImage, folder: `${user!.id}/${id}`, name: `${cardId}-back` }),
                    }),
                    supabase.from("cards").insert({
                        card_id: cardId,
                        set_id: id,
                        front: `${user!.id}/${id}/${cardId}-front`,
                        back: `${user!.id}/${id}/${cardId}-back`,
                        special_type: "draw",
                    }),
                ]);
                if (!responseFront.ok || !responseBack.ok) {
                    throw new Error("Image upload failed");
                }
                if (insertResult.error) {
                    throw insertResult.error;
                }
                front.current = [];
                back.current = [];
                const fctx = frontCanvasRef.current?.getContext("2d");
                const { width, height } = sizeRef.current;
                fctx?.clearRect(0, 0, width, height);
                const bctx = backCanvasRef.current?.getContext("2d");
                bctx?.clearRect(0, 0, width, height);
                const [fData, bData] = await Promise.all([responseFront.json(), responseBack.json()]);
                console.log(fData, bData, insertResult.data);
                showSuccessNotification("Card added to set!");
            } catch (error) {
                console.log(error);
                showErrorNotification("Image Not Uploaded");
            }
        }
    };

    return (
        <Box
            style={{
                width: "100vw",
                height: "100dvh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Box style={{ height: "60px" }}>
                <Header />
            </Box>
            {user && (
                <Box
                    flex={1}
                    display={"flex"}
                    p={"8px"}
                    w="100%"
                    style={{ flexDirection: "column", alignSelf: "center", minHeight: 0 }}
                    maw={"1000px"}
                >
                    <Group display={"flex"} justify="space-between" h={50} style={{ flexShrink: 0 }}>
                        <ActionIcon variant="default" size="lg" onClick={() => router.back()} radius={"xs"}>
                            <ArrowBackIcon />
                        </ActionIcon>
                        <Button
                            rightSection={<SaveIcon />}
                            radius={"xs"}
                            size="sm"
                            color="pale-green"
                            onClick={exportImage}
                        >
                            Create
                        </Button>
                    </Group>
                    <Canvas
                        front={front}
                        back={back}
                        frontCanvas={frontCanvasRef}
                        backCanvas={backCanvasRef}
                        sizeRef={sizeRef}
                    />
                </Box>
            )}
        </Box>
    );
}
