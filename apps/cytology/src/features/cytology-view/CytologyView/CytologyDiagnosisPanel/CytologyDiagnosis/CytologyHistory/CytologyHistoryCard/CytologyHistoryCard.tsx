import { Card, Tag, Typography } from "antd";
import { Link } from "react-router-dom";

import { ICytologyHistoryItem } from "@cytology/core/types/cytology";
import { getHighestProbIndex } from "@cytology/core/functions/highestProb";

import { tagColors, TagsKeys, tagTexts } from "./props";

const { Text } = Typography;

type CytologyHistoryCardProps = ICytologyHistoryItem;

const CytologyHistoryCard: React.FC<CytologyHistoryCardProps> = (props) => {
    const tagKey =
        props.prev === null ? TagsKeys.created : props.is_last ? TagsKeys.last : TagsKeys.updated;

    return (
        <Link to={`/cytology/${encodeURIComponent(String(props.id))}`} key={props.id}>
            <Card
                title={new Date(props.diagnos_date).toLocaleDateString()}
                extra={<Tag color={tagColors[tagKey]}>{tagTexts[tagKey]}</Tag>}
                hoverable
            >
                {props.details?.probs?.length ? (
                    getHighestProbIndex(props.details.probs)
                ) : (
                    <Text type="secondary">Нет данных</Text>
                )}
            </Card>
        </Link>
    );
};

export default CytologyHistoryCard;
