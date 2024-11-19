'use server'

import { Connection, Query, Record, Schema } from 'jsforce';
import {objectFields} from './constants'
import { SFDCUserData } from "./types";


const createConnection = async () => {
  const conn = new Connection({
    // you can change loginUrl to connect to sandbox or prerelease env.
    //loginUrl : 'https://test.salesforce.com'
  });
  
  await conn.login(process.env.SALESFORCE_USERNAME as string, process.env.SALESFORCE_PASSWORD as string+process.env.SALESFORCE_SECURITY_TOKEN as string);
  return conn;
}

const query = async (conn: Connection, q: string): Promise<Query<Schema, string, Record, "QueryResult">> => {
  let records = [] as any[];
  const qry = conn
      .query(q)
      .on('record', function (record) {
        if (record) records.push(record);
      })
      .on('error', function (err) {
          console.log('QUERY ERROR : ' + err.message);
      })
      .run({ autoFetch: true, maxFetch: 4000 });
  return qry;
}

export async function getAccount(organizationId : string) {
  try {
      const conn = await createConnection();
      //const requestType = new URL(req.url).searchParams.get('type');
      if (organizationId.length > 0) {
        const accounts = await query(conn, `SELECT ${objectFields.Account} FROM Account WHERE Organization_Id__c = '${organizationId}' LIMIT 1`);
        return accounts;
      } else {
        throw new Error('Organization Id is required');
      }
  } catch (err) {
    console.log('error :/');
    return null;
    //throw new Error('Error creating connection');
  }
}

export async function getUser(organizationId : string, userId: string) {
  try {
      const conn = await createConnection();
      //const requestType = new URL(req.url).searchParams.get('type');
      if (organizationId.length > 0) {
        const userDetails = await conn.apex.get(`/userData?userId=${userId}&organizationId=${organizationId}`);
        //const accounts = await query(conn, `SELECT ${objectFields.Organization_User__c} FROM Organization_User__c WHERE Organization__r.Organization_Id__c = '${organizationId}' LIMIT 1`);
        return JSON.parse(userDetails as string) as SFDCUserData;
      } else {
        return null;
        //throw new Error('Organization Id is required');
      }
  } catch (err) {
    console.log('error :/', err);
    return null;
    //throw new Error('Error creating connection');
  }
}

export async function updateSafeWalletDetails(userId: string, safeAddress: string) {
  try {
    const conn = await createConnection();
    //const requestType = new URL(req.url).searchParams.get('type');
    if (userId.length > 0) {
      //const userDetails = await conn.apex.post(`/appAccess`, user);
      //console.log(userDetails);
      await conn.sobject('Organization_User__c').upsert({User_Id__c: userId, Polygon_Safe_Wallet__c: safeAddress }, 'User_Id__c');
    } else {
      //return null;
      //throw new Error('User Id is required');
    }
} catch (err) {
  console.log('error :/', err);
  //throw new Error('Error creating connection');
}
}

export async function upsertUserDetails(user: SFDCUserData) {
  try {
      const conn = await createConnection();
      //const requestType = new URL(req.url).searchParams.get('type');
      if (user.userId.length > 0) {
        const userDetails = await conn.apex.post(`/userData`, user);
        //console.log(userDetails);
        //await conn.sobject('Organization_User__c').upsert({User_Id__c: userId, Email__c: email }, 'User_Id__c');
      } else {
        //return null;
        //throw new Error('User Id is required');
      }
  } catch (err) {
    console.log('error :/', err);
    //throw new Error('Error creating connection');
  }
}

export async function associateUserToOrganization(organizationId : string, userId: string) {
  try {
      const conn = await createConnection();
      console.log('associateUserToOrganization', organizationId, userId);
      //const requestType = new URL(req.url).searchParams.get('type');
      if (organizationId.length > 0 && userId.length > 0) {
        const res = await conn.sobject("Organization_User__c").upsert([{ Organization__r:{Organization_Id__c: organizationId} , User_Id__c: userId }], 'User_Id__c');
        
        return res;
      } else {
        throw new Error('Organization Id is required');
      }
  } catch (err) {
    console.log('error :/', err);
    //throw new Error('Error creating connection');
  }
}

export async function upsertOrganization(organizationId : string, name : string, licenseCount: number) {
  try {
      const conn = await createConnection();
      //const requestType = new URL(req.url).searchParams.get('type');
      if (organizationId.length > 0) {
        await conn.sobject('Organization__c').upsert({ Organization_Id__c: organizationId, Name: name, License_Count__c: licenseCount }, 'Organization_Id__c');
      } else {
        throw new Error('Organization Id is required');
      }
  } catch (err) {
    console.log('error :/');
    //throw new Error('Error creating connection');
  }
}

export async function createOrganization(organizationId : string, name : string) {
  try {
      const conn = await createConnection();
      //const requestType = new URL(req.url).searchParams.get('type');
      if (organizationId.length > 0) {
        await conn.create('Organization__c', { Organization_Id__c: organizationId, Name: name });
      } else {
        throw new Error('Organization Id is required');
      }
  } catch (err) {
    console.log('error :/');
   // throw new Error('Error creating connection');
  }
}