import React from "react";
import { SvgIcon } from "@material-ui/core";

function StackOverflowIcon() {
  return (
    <SvgIcon fontSize="small">
      <svg
        aria-hidden="true"
        className="svg-icon iconLogoGlyph"
        width="25"
        height="30"
        viewBox="0 0 25 30"
      >
        <path d="M21 27v-8h3v11H0V19h3v8h18z" fill="#BCBBBB" />
        <path
          d="M17.1.2L15 1.8l7.9 10.6 2.1-1.6L17.1.2zm3.7 14.7L10.6 6.4l1.7-2 10.2 8.5-1.7 2zM7.2 12.3l12 5.6 1.1-2.4-12-5.6-1.1 2.4zm-1.8 6.8l13.56 1.96.17-2.38-13.26-2.55-.47 2.97zM19 25H5v-3h14v3z"
          fill="#F48024"
        />
      </svg>
    </SvgIcon>
  );
}

export { StackOverflowIcon };
