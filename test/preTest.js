import '../config/dbConfig';
import Source from '../models/Source';
import fs from 'fs';
import path from 'path';

if (process.env.NODE_ENV === 'test') {
    console.log(__dirname);
    Source.remove({}, () => {
        let sources = JSON.parse(fs.readFileSync(path.join(__dirname, 'testSources.json')));
        sources.forEach(async (source) => {
            let _id = source._id.$oid;
            delete source._id;
            delete source.__v;
            await Source.create({
                _id,
                ...source
            });
        });
    });
}
