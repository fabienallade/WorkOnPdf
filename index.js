const express = require('express')

const fs = require("fs");
const path = require("path");
const { html_to_pdf, html_to_pdf_handlebars} = require("./puppet");
const app = express()
const port = 3000
const nunjucks = require("nunjucks")
const {static} = require("express");
app.use(static("public"))

nunjucks.configure('views', {
    autoescape: true,
    express: app
});


app.get('/',async  (req, res) => {
    try {
        await (async () => {
            const responses =Array(9000)
            responses.fill(1,0,8999)
            // console.log(responses)
            const dataBinding = {
                items: [
                    {
                        name: "item 1",
                        price: 100,
                    },
                    {
                        name: "item 2",
                        price: 200,
                    },
                    {
                        name: "item 3",
                        price: 300,
                    },
                ],
                responses:responses,
                total: 600,
                isWatermark: true,
            };

            const templateHtml = fs.readFileSync(
                path.join(process.cwd(), "invoice.html"),
                "utf8"
            );

            const options = {
                format: "A4",
                headerTemplate: "<p>fabien est dans la place</p>",
                footerTemplate: `
                <div style="border-top: solid 1px #bbb; width: 100%; font-size: 9px;
        padding: 5px 5px 0; color: #bbb; position: relative;">
        <div style="position: absolute; left: 5px; top: 5px;"><span class="date"></span></div>
        <div style="position: absolute; right: 5px; top: 5px;">Page <span class="pageNumber"></span>/<span class="totalPages"></span></div>
    </div>`,
                displayHeaderFooter: true,
                margin: {
                    top: "40px",
                    bottom: "60px",
                },
                printBackground: true,
                path: "invoice.pdf",
                timeout: 0,
            };

            await html_to_pdf({ templateHtml, dataBinding, options });

            console.log("Done: invoice.pdf is created!");
        })();
    } catch (err) {
        console.log("ERROR:", err);
    }
    res.send('Hello World!')
})

app.get("/wkHtmlToPdf",(req, res) => {
    res.send("fabien")
})
app.get("/showPdf",(req, res) => {
    res.render('index.html');
})

// app.get("/showPdf2",(req, res) => {
//     res.render('invoice.html');
// })

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
