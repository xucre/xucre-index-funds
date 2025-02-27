import { addItem, getTable, queryVector } from '../service/rag';
import { VectorDB } from 'imvectordb';
import { chunk } from 'llm-chunk'
import fs from 'fs/promises';

const dataSource = '/Users/jp/Desktop/Repos/xucre/xucre-index-funds/tmp';

const main = async (createData: boolean) => {
    const tbl = await getTable('appData');
    if (createData) {
        await processData(tbl);
    }
    const result = await queryVector(tbl, 'What is Xucre Investments used for?');
    console.log(result);
    process.exit(0)
};

const processData = async (tbl: VectorDB) => {
    // Loop over all files in the ../tmp folder
    const files = await fs.readdir(dataSource);
    for (const file of files) {
        if (file === 'presentation.pdf') continue;
        const filePath = `${dataSource}/${file}`;
        console.log('running job for file:', file);
        const fileText = await fs.readFile(filePath, 'utf-8');
        // const chunks = chunk(fileText, {
        //     minLength: 0,          // number of minimum characters into chunk
        //     maxLength: 10000,       // number of maximum characters into chunk
        //     splitter: "paragraph", // paragraph | sentence
        //     overlap: 10,            // number of overlap chracters
        //     delimiters: ""         // regex for base split method
        // });
        // for (const chunk of chunks) {
        //     await addItem(tbl, chunk);
        // }
        await addItem(tbl, fileText);
        console.log(`Added item from file: ${file}`);
    }
    console.log('All items have been added to the index.');
};

main(true);