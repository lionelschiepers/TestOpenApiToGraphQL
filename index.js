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
    // links between schema use the title and not the address like defined in the openapi 3.0
    // https://www.npmjs.com/package/@mikestaub/openapi-to-graphql
    let oas1 = JSON.parse(await readFile('./pmr3.json'));
    let oas2 = JSON.parse(await readFile('./pmr3-2.json'));
    
    // let oas1 = await getData('https://raw.githubusercontent.com/lionelschiepers/TestOpenApiToGraphQL/master/PMR3.json');
    // let oas2 = await getData('https://raw.githubusercontent.com/lionelschiepers/TestOpenApiToGraphQL/master/PMR3-2.json');

    if (oas1 == null || oas2 == null)
        throw new Error('failed to load the file');

    const { schema, report } = await createGraphQLSchema([oas1, oas2], 
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

    let server = app.listen({ port:process.env.PORT || 10000 }, () =>
    {
        console.log(`listening on port ${server.address().port}`);
    });
}

main()
    .catch(error => console.log(error));