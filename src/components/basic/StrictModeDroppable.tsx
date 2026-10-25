import React, { useState, useEffect } from "react";
import { Droppable, DroppableProps } from "react-beautiful-dnd";

// ———— 消除 React.memo 组件上的 defaultProps 警告 ————
// 如果库内部给 Connect(Droppable) 添了 defaultProps，会触发未来不兼容提醒。
// 这里直接删掉它，就不再读取 defaultProps 了。
;((): void => {
    // @ts-ignore
    if ((Droppable as any).defaultProps) {
        // @ts-ignore
        delete (Droppable as any).defaultProps;
    }
})();

export const StrictModeDroppable: React.FC<DroppableProps> = ({ children, ...props }) => {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setEnabled(true));
        return () => {
            cancelAnimationFrame(frame);
            setEnabled(false);
        };
    }, []);

    // 首次渲染时不挂载，避免在 StrictMode 下被重复调用的问题
    if (!enabled) {
        return null;
    }

    return <Droppable {...props}>{children}</Droppable>;
};
