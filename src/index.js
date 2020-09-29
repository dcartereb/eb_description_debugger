require('dotenv').config();

const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const Entities = require('html-entities').XmlEntities;
const pretty = require('pretty');

const app = express();
const port = process.env.PORT || 3000;
const ebkey = process.env.EBKEY;
const apiroot = process.env.APIROOT || '';

const html = ({body = '', head = ''} = {}) => `<!DOCTYPE html>
<html>
    <head>${head}
        <style type="text/css">
            html, body {
                background-color: #222;
                margin: 0;
                padding: 0;
            }
            body {
                padding: 2em;
            }
            .rendered {
                padding: 2em;
                border: 1px solid black;
                background-color: white;
            }
        </style>
    </head>
    <body>${body}</body>
</html>`;

app.get('/', (req, res) => {
    res.send(
        html({body: '<p class="rendered">Enter an event ID on the url like: http://localhost:3000/event/12345234234</p>'})
    );
});
app.get('/event/:id', async (req, res) => {
    if (!apiroot) {
        return res.send('NO APIROOT SPECIFIED');
    }

    const id = req.params.id;

    if (!id) {
        return res.send('NO ID');
    }

    let apiResponse;
    try {
        apiResponse = await fetch(`https://www.evbqaapi.com/v3/events/${id}/description/?token=${ebkey}`)
    } catch(er) {
        res.send(
            html({body: 'Fetch totally failed. Thats pretty bad.'})
        );
        return;
    }

    if (apiResponse.status !== 200) {
        res.send(
            html({body: `
                <div class="rendered">
                    <h1>Sorry, something went wrong :(</h1>
                    <p>HTTP code ${apiResponse.status}</p>
                </div>
            `})
        );
        return;
    }

    const json = await apiResponse.json()

    const entities = new Entities();


    res.send(
        html({
            head: `
                <link rel="stylesheet" href="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.1.2/build/styles/default.min.css">
                <script src="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.1.2/build/highlight.min.js"></script>
            `,
            body: `
                <div class="rendered">
                    ${json.description}
                </div>
                <pre><code class="html">${entities.encode(pretty(json.description))}</code></pre>
                <script type="text/javascript">
                    document.addEventListener('DOMContentLoaded', (event) => {
                        document.querySelectorAll('pre code').forEach((block) => {
                            hljs.highlightBlock(block);
                        });
                    });
                </script>
            `,
        })
    );
});

app.listen(port, () => {
    console.log(`EB description app listening at http://localhost:${port}`);
});
