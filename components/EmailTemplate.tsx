import { Html, Head, Body, Container, Section, Heading, Text, Button, Hr, Img } from "react-email";
import * as React from "react";
import { Card } from "@/utility/types";
import { SmartLatex } from "@/utility/smartLatex";
import { PaleGreen } from "@/utility/colors";

interface DailyReviewEmailProps {
    cards: {
        front: string;
        back: string;
        special: string | null;
        frontImageUrl: string | null;
        backImageUrl: string | null;
    }[];
}

export function DailyReviewEmail({ cards = [] }: DailyReviewEmailProps) {
    return (
        <Html data-theme="light">
            <Head />
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Heading style={header}>Forever Learn</Heading>
                    <Text style={subTitle}>Here is your daily review set!</Text>

                    <Hr style={divider} />

                    {/* Loop through the cards */}
                    {cards.map((card, index) => (
                        <Section key={index} style={cardWrapper}>
                            <Section style={frontSide}>
                                <Text style={sideLabel}>Q{index}</Text>
                                {card.special == "latex" ? (
                                    <Img
                                        src={card.backImageUrl!}
                                        alt="Math Equation"
                                        style={{
                                            display: "block",
                                            margin: "10px 0",
                                            maxHeight: "80px",
                                            backgroundColor: "#ffffff",
                                            imageRendering: "crisp-edges",
                                        }}
                                    />
                                ) : (
                                    <Text style={cardContent}>{card.back}</Text>
                                )}
                            </Section>
                        </Section>
                    ))}

                    {/* Bottom Action Call */}
                    <Section style={actionSection}>
                        <Text style={footerText}>Ready to check your answers?</Text>
                        <Button href="https://foreverlearn.app/home" style={ctaButton}>
                            Open Review Session
                        </Button>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: "#f8fafc",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: "40px 0",
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "32px 24px",
    borderRadius: "12px",
    maxWidth: "520px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
};

const header = {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center" as const,
    margin: "0 0 4px 0",
};

const subTitle = {
    fontSize: "15px",
    color: "#64748b",
    textAlign: "center" as const,
    margin: "0 0 24px 0",
};

const divider = {
    borderColor: "#cbd5e1",
    margin: "24px 0",
};

const cardWrapper = {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
};

const frontSide = {
    padding: "4px 0",
};

const sideLabel = {
    fontSize: "10px",
    fontWeight: "600",
    color: PaleGreen[6],
    margin: "0 0 4px 0",
};

const cardContent = {
    fontSize: "16px",
    color: "#334155",
    margin: "0",
    fontWeight: "500",
};

const actionSection = {
    textAlign: "center" as const,
    marginTop: "32px",
};

const footerText = {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 16px 0",
};

const ctaButton = {
    backgroundColor: PaleGreen[6],
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    padding: "12px 32px",
    borderRadius: "6px",
    textDecoration: "none",
    display: "inline-block",
};
