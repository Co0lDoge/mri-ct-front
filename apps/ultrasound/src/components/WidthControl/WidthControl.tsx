import type { CSSProperties, ReactNode } from "react";
import "./WidthControl.scss";

interface WidthControlProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function WidthControl({
  children,
  className = "",
  style = {},
}: WidthControlProps) {
  return (
    <div className={`width-control ${className}`} style={style}>
      <div className="width-control__inner">{children}</div>
    </div>
  );
}
