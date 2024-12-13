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
      <span className="material-icons-round">search</span>
      <input
        onChange={(e) => {
          props.onChange(e.target.value.toLowerCase());
        }}
        type="text"
        placeholder={`Search ${props.searchProp} by name...`}
        style={{
          width: "100%",
          height: "40px",
          backgroundColor: "var(--background-100)",
        }}
      />
    </div>
  );
}
