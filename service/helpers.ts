import * as encoding from "@walletconnect/encoding";
import { Theme } from "@mui/material";

export function distributeWeights(items: any[]): any[] {
  const totalWeight = 10000;
  const itemCount = items.length;

  // Calculate the base weight for each item (integer division)
  const baseWeight = Math.floor(totalWeight / itemCount);

  // Calculate the remainder that needs to be added to the first item
  const remainder = totalWeight % itemCount;

  // Distribute the base weight to all items and add the remainder to the first item
  const result = items.map((item, index) => {
    return {
      ...item,
      weight: index === 0 ? baseWeight + remainder : baseWeight
    };
  });

  // Confirm that all weights are integers
  result.forEach(item => {
    if (!Number.isInteger(item.weight)) {
      throw new Error(`Weight is not an integer: ${item.weight}`);
    }
  });

  return result.map((item) => item.weight);
}

export function chainValidation(chainId:number): boolean {
  return chainId === 137 || chainId === 19819 || chainId === 20208 || chainId === 1;
}

export function normalizeDevChains(chainId: number) : number {
  return chainId === 19819 ? 137 : chainId === 20208 ? 1 : chainId;
}

export function getChainNameRainbowKit(_chainId: number) : string {
  const chainId = normalizeDevChains(_chainId);
  return chainId === 1 ? 'ethereum' : chainId === 137 ? 'polygon' : 'polygon';
}
// import { TypedDataUtils } from "eth-sig-util";
// import * as ethUtil from "ethereumjs-util";

export function convertHexToNumber(hex: string) {
  try {
    return encoding.hexToNumber(hex);
  } catch (e) {
    return hex;
  }
}

export function convertHexToUtf8(hex: string) {
  try {
    return encoding.hexToUtf8(hex);
  } catch (e) {
    return hex;
  }
}

export function getTextColor(theme: Theme) {
  if (theme.palette.mode === 'light') return 'black';
  return 'white';
}

export function getDashboardBorderColor(theme: Theme) {
  if (theme.palette.mode === 'light') return '#4D25EF';
  return '#00B21F';
}

export function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}