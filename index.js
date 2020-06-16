const express = require('express')
const graphqlHTTP = require('express-graphql')
const { createGraphQLSchema } = require('openapi-to-graphql')
const fs = require('fs');
const util = require("util");

const readFile = util.promisify(fs.readFile);

async function main() {
    let oas = JSON.parse(await readFile('./pmr3.json'));

    if (oas == null)
        throw new Error('failed to load the file');

    const { schema, report } = await createGraphQLSchema(oas, 
        {
            operationIdFieldNames:true,
            requestOptions:
            {
                // https://github.com/request/request#requestoptions-callback
                // baseUrl: 'http://127.0.0.1:4010', 
                // proxy:'http://127.0.0.1:8888'
            }
        })
        .catch(error => console.log(error));


    const app = express()
    app.use(
        '/graphql',
        graphqlHTTP({
            schema,
            graphiql: true,
            customFormatErrorFn: (error) => console.log(error)
        })
    )
    app.listen(10000)
    console.log('listening')
}

main().catch(error => console.log(error));
