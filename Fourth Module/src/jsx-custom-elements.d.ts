import type * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "bim-label": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        icon?: string;
      };
    }
  }
}

export {};
