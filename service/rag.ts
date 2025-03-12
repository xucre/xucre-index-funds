'use server'
import { VectorDB } from 'imvectordb';
import path from 'path';
import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const db = new VectorDB();

export const getTable = async (name: string) => {
    try {
        db.loadFile('../data/vectorDB/vectorDB.json');
    }catch(err){
        console.error("Error loading vector database:", err);
    }
    return db;
}

export async function addItem(tbl: VectorDB, text: string) {
    await tbl.addText(text);
    await tbl.dumpFile('data/vectorDB/vectorDB.json');
}

export async function queryVector(tbl: VectorDB, query: string) {
    // const vector = await openai.embeddings.create({
    //     input: query,
    //     model: 'text-embedding-3-small',
    // });
    //const results = await tbl.query(vector.data[0].embedding, 1);
    const results = await tbl.queryText(query, 1);
    if (results && results.length > 0) {
        return results[0].document.metadata.text;
    } else {
        return {error: 'No results found.'};
    }
}