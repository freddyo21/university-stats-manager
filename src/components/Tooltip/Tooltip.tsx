import { type ReactNode } from "react";

interface TooltipProps {
    className?: string;
    content: ReactNode | string; // 🚀 Thay đổi từ string thành ReactNode để chấp nhận cả Text lẫn List/Component custom
    children: ReactNode; // Phần tử kích hoạt hover
    placement?: "top" | "bottom" | "left" | "right";
    id?: string; // ID tùy chọn để định danh Tooltip
}

const Tooltip: React.FC<TooltipProps> = ({
    className = "",
    content,
    children,
    placement = "bottom",
    id
}) => {
    const placementClasses = {
        top: "tooltip-top",
        bottom: "tooltip-bottom",
        left: "tooltip-left",
        right: "tooltip-right",
    };

    const placementClass = placementClasses[placement] ?? "tooltip-top";

    // Nếu content là String thô, dùng cơ chế CSS data-tip mặc định của DaisyUI / Tailwind
    if (typeof content === "string") {
        return (
            <div
                className={`tooltip ${className} ${placementClass} z-2147483647`}
                data-tip={content}
                id={id}>
                {children}
            </div>
        );
    }

    // 🚀 Nếu content là Component/List Custom (ReactNode), render layout bọc để định vị popup custom
    return (
        <div
            className={`tooltip ${className} ${placementClass} group z-2147483647 relative inline-block`}
            id={id}>
            {/* Cục content tùy biến nổi lên khi hover */}
            <div className="tooltip-content pointer-events-none absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-2147483647">
                {content}
            </div>
            {children}
        </div>
    );
};

export { Tooltip };