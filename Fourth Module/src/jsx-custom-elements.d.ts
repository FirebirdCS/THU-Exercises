import type * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "bim-button": any;
      "bim-label": any;
      "bim-text-input": any;
    }
  }
}

export {};
