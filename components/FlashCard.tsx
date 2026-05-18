"use client";

import { ActionIcon, Box, Divider, Flex, Paper, Text } from "@mantine/core";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { SmartLatex } from "@/utility/smartLatex";
import { Card } from "@/utility/types";

export function RowCard({ handleDeleteCard, c }: { handleDeleteCard: (id: string) => {}; c: Card }) {
    return (
        <Paper withBorder shadow="sm" radius="md" p="8px" display={"flex"} style={{ flexDirection: "column" }}>
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
                    <Text
                        style={{
                            whiteSpace: "normal",
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                        }}
                    >
                        {c.special_type ? <SmartLatex content={c.front}></SmartLatex> : c.front}
                    </Text>
                </Box>
                <Divider orientation="horizontal" hiddenFrom="xs" ml={"4px"} mr={"4px"} />
                <Divider orientation="vertical" visibleFrom="xs" mt={"4px"} mb={"4px"} />
                <Box p="8px" display={"flex"} flex={1}>
                    <Text
                        style={{
                            whiteSpace: "normal",
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                        }}
                    >
                        {c.special_type ? <SmartLatex content={c.back}></SmartLatex> : c.back}
                    </Text>
                </Box>
            </Flex>
        </Paper>
    );
}

export function FlipCard({
    handleClick,
    currCard,
    cardInfo,
}: {
    handleClick: () => void;
    currCard: { card: number; section: string };
    cardInfo: Card;
}) {
    return (
        <Paper
            withBorder
            shadow="sm"
            radius="md"
            p="16px"
            display={"flex"}
            style={{ justifyContent: "center" }}
            onClick={handleClick}
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
                    cardInfo.special_type ? (
                        <SmartLatex content={cardInfo.front} />
                    ) : (
                        cardInfo.front
                    )
                ) : cardInfo.special_type ? (
                    <SmartLatex content={cardInfo.back} />
                ) : (
                    cardInfo.back
                )}
            </Text>
        </Paper>
    );
}
