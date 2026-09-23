export enum TagsKeys {
    last,
    updated,
    created,
}

export const tagTexts = {
    [TagsKeys.last]: "Последние изменения",
    [TagsKeys.updated]: "Обновлён",
    [TagsKeys.created]: "Создан",
};

export const tagColors = {
    [TagsKeys.last]: "#108ee9",
    [TagsKeys.updated]: "#2db7f5",
    [TagsKeys.created]: "#87d068",
};
