import { Theme } from "@mui/material";

export const mode = 'dark';
export const primaryColor = '#D4E815';


export function getTextColor(theme: Theme) {
  if (theme.palette.mode === 'light') return 'black';
  return 'white';
}