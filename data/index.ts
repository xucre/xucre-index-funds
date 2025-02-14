
import polygonTokens from './polygon.json';
import baseTokens from './base.json';
import validatedPolygonPools from './validatedPolygonPools.json';
import { Token, ValidatedPool } from '@/service/types';

export const polygonCoins = polygonTokens.map((token) =>{
    return {...token, chainId: 137} as Token;
}) as Token[];
export const baseCoins = baseTokens.map((token) => {
    return {...token, chainId: 8453} as Token;
});

export const validatedPoolsPolygon = validatedPolygonPools.map((pool) => {
    return {
        ...pool
    } as ValidatedPool
});