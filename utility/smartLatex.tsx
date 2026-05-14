import { InlineMath, BlockMath } from "react-katex";

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
