export * from "./dateDisplay";
export * from "./imageFiles";
export * from "./jwt";
export * from "./cacheBuster";

export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString();
};

export const isHaveEmailErrors = (email: string): boolean => {
  return !String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

