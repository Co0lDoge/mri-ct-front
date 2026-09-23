import {PresetColorKey} from "antd/es/theme/interface/presetColors";

interface IClassificationItem {
    text: string,
    color: PresetColorKey | 'default'
}

interface IClassification {
    [key: string]: IClassificationItem;
}

export const classification: IClassification = {
    tirads_23: {
        text: 'TI-RADS 2-3',
        color: 'lime'
    },
    tirads_4: {
        text: 'TI-RADS 4',
        color: 'orange'
    },
    tirads_5: {
        text: 'TI-RADS 5',
        color: 'magenta'
    }
}