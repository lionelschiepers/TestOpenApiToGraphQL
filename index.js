const express = require('express')
const graphqlHTTP = require('express-graphql')
const { createGraphQLSchema } = require('openapi-to-graphql')
const fs = require('fs');
const util = require("util");
const axios = require("axios");

const readFile = util.promisify(fs.readFile);

const getData = async url => {
    try {
      const response = await axios.get(url);
      const data = response.data;
      return data;
    } catch (error) {
      console.log(error);
    }
  };

async function main() {
    // let oas = JSON.parse(await readFile('./pmr3.json'));
    // let oas = JSON.parse('https://raw.githubusercontent.com/lionelschiepers/TestOpenApiToGraphQL/master/PMR3.json');

    let oas = await getData('https://raw.githubusercontent.com/lionelschiepers/TestOpenApiToGraphQL/master/PMR3.json');
    let oas2 = await getData('https://raw.githubusercontent.com/lionelschiepers/TestOpenApiToGraphQL/master/PMR3-2.json');

    if (oas == null || oas2 == null)
        throw new Error('failed to load the file');

    const { schema, report } = await createGraphQLSchema([oas, oas2], 
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