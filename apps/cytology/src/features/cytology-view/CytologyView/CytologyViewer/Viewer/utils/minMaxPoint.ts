import {IPoint} from "../interfaces/queries";

export const minMaxPoint = (array: IPoint[]) => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < array.length; i++) {
        const {x, y} = array[i];

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);

        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }

    return {
        minX,
        maxX,
        minY,
        maxY
    };
}
