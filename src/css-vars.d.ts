// The board and the control pad size themselves off CSS variables set in inline styles, which
// React.CSSProperties otherwise rejects. Widening it once beats casting at each site.
//
// The empty export is load-bearing: without it this file is a script rather than a module, and
// `declare module "react"` in a script declares an ambient module — replacing all of
// @types/react instead of adding to it.
export {};

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}
