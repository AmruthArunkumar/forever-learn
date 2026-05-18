import { InlineMath } from "react-katex";

export const SmartLatex = ({ content }: { content: string }) => {
    const parts = content.split(/(\$.*?\$)/gs);

    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith("$") && part.endsWith("$")) {
                    return <InlineMath key={index} math={part.slice(1, -1)} />;
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

function latexifier(content: string) {
    const parts = content.split(/(\$.*?\$)/gs);
    return parts
        .map((part) => {
            if (part.startsWith("$") && part.endsWith("$")) {
                return part.slice(1, -1);
            }
            return `\\text{${part}}`;
        })
        .join("");
}

export function getLatexImageUrl(latex: string): string {
    const cleanLatex = latexifier("$\\space\\vphantom{\\int^{X}}$" + latex + "$\\vphantom{\\int_{X}}\\space$");

    const encodedLatex = encodeURIComponent(cleanLatex);

    console.log(encodedLatex);

    return `https://www.underleaf.ai/latex/svg?latex=${encodedLatex}&bg=FFFFFF`;
}
