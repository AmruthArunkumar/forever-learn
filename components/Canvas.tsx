"use client";

import { ActionIcon, Box, ColorSwatch, Flex, Group, SegmentedControl, Slider, Tooltip } from "@mantine/core";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import UndoIcon from "@mui/icons-material/Undo";
import ClearIcon from "@mui/icons-material/DeleteOutline";
import { showErrorNotification } from "@/utility/notification";
import { Stroke } from "@/utility/types";
import { Circle } from "@mui/icons-material";

const BASE_URL = process.env.APP_URL ? `https://${process.env.APP_URL}` : `http://localhost:3000`;

const CARD_ASPECT_RATIO = 3 / 2;
const STROKE_COLORS = ["#1a1b1e", "#e03131", "#1971c2", "#2f9e44", "#f08c00"];

export default function Canvas({ front, back }: { front: RefObject<Stroke[]>; back: RefObject<Stroke[]> }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);

    const currentStroke = useRef<Stroke | null>(null);
    const sizeRef = useRef({ width: 0, height: 0 });

    const [color, setColor] = useState(STROKE_COLORS[0]);
    const [strokeWidth, setStrokeWidth] = useState(3);

    const [imageSide, setImageSide] = useState("front");

    const redraw = useCallback((side: string) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const { width, height } = sizeRef.current;

        ctx.clearRect(0, 0, width, height);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const allStrokes = currentStroke.current
            ? [...(side == "front" ? front : back).current, currentStroke.current]
            : (side == "front" ? front : back).current;

        for (const stroke of allStrokes) {
            if (stroke.points.length === 0) continue;
            ctx.strokeStyle = stroke.color;
            ctx.beginPath();
            const [first, ...rest] = stroke.points;
            ctx.moveTo(first.x * width, first.y * height);
            for (const p of rest) {
                ctx.lineWidth = stroke.width * (0.5 + p.pressure);
                ctx.lineTo(p.x * width, p.y * height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(p.x * width, p.y * height);
            }
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            sizeRef.current = { width: rect.width, height: rect.height };

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            const ctx = canvas.getContext("2d");
            if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            redraw(imageSide);
        };

        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        return () => observer.disconnect();
    }, [redraw]);

    const getNormalizedPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height,
        };
    };

    const exportImage = async () => {
        const canvas = canvasRef.current;
        const image = canvas?.toDataURL("image/png");
        try {
            const response = await fetch(`${BASE_URL}/api/image`, {
                method: "POST",
                body: JSON.stringify({ image: image, folder: "UUID/setID", name: "name-front-back" }),
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(error);
            showErrorNotification("Image Not Uploaded");
        }
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        drawing.current = true;
        const { x, y } = getNormalizedPos(e);
        const pressure = e.pressure > 0 ? e.pressure : 0.5;
        currentStroke.current = { points: [{ x, y, pressure }], color, width: strokeWidth };
        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawing.current || !currentStroke.current) return;
        const { x, y } = getNormalizedPos(e);
        const pressure = e.pressure > 0 ? e.pressure : 0.5;
        currentStroke.current.points.push({ x, y, pressure });
        redraw(imageSide);
    };

    const handlePointerUp = () => {
        if (currentStroke.current) {
            (imageSide == "front" ? front : back).current.push(currentStroke.current);
            currentStroke.current = null;
        }
        drawing.current = false;
    };

    const handleUndo = () => {
        (imageSide == "front" ? front : back).current.pop();
        redraw(imageSide);
    };

    const handleClear = () => {
        // exportImage();
        (imageSide == "front" ? front : back).current = [];
        redraw(imageSide);
    };

    return (
        <Box>
            <Flex
                justify="space-around"
                align="center"
                pb={8}
                pt={8}
                mt={8}
                mb={16}
                style={{ border: "2px solid light-dark(#DDDDDD, #444444)" }}
                bdrs={4}
                direction={{ base: "column", sm: "row" }}
                gap={"16px"}
            >
                <SegmentedControl
                    value={imageSide}
                    onChange={(e) => {
                        setImageSide(e);
                        redraw(e);
                    }}
                    variant="default"
                    size="sm"
                    color="pale-green"
                    style={{ minWidth: "200px" }}
                    data={[
                        { label: "Front", value: "front" },
                        { label: "Back", value: "back" },
                    ]}
                />
                <Group gap={8}>
                    {STROKE_COLORS.map((c) => (
                        <ColorSwatch
                            key={c}
                            color={c}
                            size={22}
                            style={{
                                cursor: "pointer",
                                outline: color === c ? "2px solid light-dark(#DDDDDD, #444444)" : "none",
                                outlineOffset: 2,
                            }}
                            onClick={() => setColor(c)}
                        />
                    ))}
                </Group>
                <Group gap={12} style={{ flex: 1, maxWidth: 200, minWidth: 200 }}>
                    <Circle sx={{ fontSize: 14 }} />
                    <Slider
                        size="sm"
                        min={1}
                        max={10}
                        value={strokeWidth}
                        onChange={setStrokeWidth}
                        style={{ flex: 1 }}
                        color="pale-green"
                    />
                    <Circle fontSize="medium" />
                </Group>
                <Group gap={8}>
                    <Tooltip label="Undo stroke">
                        <ActionIcon variant="default" radius="xs" size="lg" onClick={handleUndo}>
                            <UndoIcon fontSize="small" />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Clear">
                        <ActionIcon variant="default" radius="xs" size="lg" onClick={handleClear}>
                            <ClearIcon fontSize="small" />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Flex>
            <Box
                ref={containerRef}
                style={{
                    width: "100%",
                    aspectRatio: `${CARD_ASPECT_RATIO}`,
                    borderRadius: 4,
                    border: "2px solid light-dark(#DDDDDD, #444444)",
                    background: "var(--mantine-color-white)",
                    overflow: "hidden",
                    touchAction: "none",
                }}
            >
                <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    style={{ display: "block", cursor: "crosshair" }}
                />
            </Box>
        </Box>
    );
}
