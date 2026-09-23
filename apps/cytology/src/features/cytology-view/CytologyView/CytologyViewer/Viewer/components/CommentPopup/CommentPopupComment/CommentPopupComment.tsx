import React from "react";
import {Flex, Typography} from "antd";

import './CommentPopupComment.scss';

const {Text} = Typography;

interface CommentPopupCommentProps {
    children?: React.ReactNode;
    isSelf?: boolean;
    dateStamp: string;
    author: string;
}

export const CommentPopupComment: React.FC<CommentPopupCommentProps> = ({ children, isSelf = false, dateStamp, author }) => {
    const styles = (isSelf ? 'self ' : '') + 'comment';

    return (
        <Flex vertical className={styles}>
            <Text type="secondary" className="comment-mark">{dateStamp} {author}</Text>
            <Text className="comment-value">{children}</Text>
        </Flex>
    )
};