import { useContext, useEffect } from "react";
import { Flex, Timeline } from "antd";

import { ModalContext } from "@medml/ui";
import { ICytologyHistory } from "@cytology/core/types/cytology";

import CytologyHistoryCard from "./CytologyHistoryCard/CytologyHistoryCard";

import "./CytologyHistory.css";

interface CytologyHistoryProps {
    history: ICytologyHistory;
}

const CytologyHistory: React.FC<CytologyHistoryProps> = ({ history }) => {
    const { changeModalProps } = useContext(ModalContext);

    useEffect(() => {
        // Настраиваем модалку один раз при монтировании истории
        changeModalProps({
            title: "История изменений",
            footer: [],
            centered: true,
            height: "80%",
            rootClassName: "cytology-history-wrapper",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Flex className="cytology-history-container" vertical>
            <Timeline
                mode="left"
                items={history.results.map((historyItem) => ({
                    children: <CytologyHistoryCard {...historyItem} />,
                }))}
            />
        </Flex>
    );
};

export default CytologyHistory;
