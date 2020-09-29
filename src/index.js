require('dotenv').config();

const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const Entities = require('html-entities').XmlEntities;
const pretty = require('pretty')

const app = express();
const port = process.env.PORT || 3000;
const ebkey = process.env.EBKEY;

app.get('/', (req, res) => {
    res.send('Enter an event ID on the url like: http://localhost:3000/12345234234');
});
app.get('/:id', async (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.send('NO ID');
    }

    let apiResponse;
    try {
        apiResponse = await fetch(`https://www.evbqaapi.com/v3/events/${id}/description/?token=${ebkey}`)
    } catch(er) {
        res.send(JSON.stringify({
            'failure': true,
            'message': er.message,
        }));
    }

    const json = await apiResponse.json()

    const entities = new Entities();


    res.send(`<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.1.2/build/styles/default.min.css">
        <script src="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.1.2/build/highlight.min.js"></script>
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
    <body>
        <div class="rendered">
            ${json.description}
        </div>
        <pre><code class="html">${entities.encode(pretty(json.description))}</code></pre>
    </body>
    <script type="text/javascript">
        document.addEventListener('DOMContentLoaded', (event) => {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        });
    </script>
</html>
`);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
