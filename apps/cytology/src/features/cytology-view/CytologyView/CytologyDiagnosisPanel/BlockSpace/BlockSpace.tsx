import React from "react";

import { useAppSelector } from "@cytology/core/hooks";

const BlockSpace: React.FC = () => {
    const height = useAppSelector((state) => state.ref.toolPanelHeight);

    return <div style={{ height: height }}></div>;
};

export default BlockSpace;
