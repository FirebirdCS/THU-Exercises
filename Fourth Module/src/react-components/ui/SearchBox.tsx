import * as React from "react";

interface Props {
  onChange: (value: string) => void;
  searchProp: string;
  size: string;
}

export function SearchBox(props: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        columnGap: 10,
        width: props.size || "40%",
      }}
    >
      <bim-text-input
        debounce="200"
        style={
          {
            minHeight: "2.5rem",
            "--bim-input--p": "0.75rem 0.75rem",
          } as React.CSSProperties
        }
        oninput={(e) => {
          props.onChange(e.target.value.toLowerCase());
        }}
        placeholder={`Buscar ${props.searchProp} por nombre...`}
      ></bim-text-input>
    </div>
  );
}
