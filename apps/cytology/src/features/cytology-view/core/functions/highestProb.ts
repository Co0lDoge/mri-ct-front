export const getHighestProbIndex = (probs?: number[]) =>
    probs
        ? `Bethesda ${BETHESDA_CATEGORIES[
              probs.reduce(
                  (maxIndex, prob, currentIndex) =>
                      prob > probs[maxIndex] ? currentIndex : maxIndex,
                  0
              )
          ]}`
        : "Нет информации";

export const BETHESDA_CATEGORIES = ["I", "II", "III", "IV", "V", "VI"];
