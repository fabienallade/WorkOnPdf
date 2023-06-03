const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const nunjucks = require("nunjucks");
const barcode = require("barcode");
const bwipjs = require('bwip-js');
const util = require('util');

module.exports.html_to_pdf = async ({templateHtml, dataBinding, options}) => {
    console.time('fabien');
    nunjucks.configure('views', { autoescape: true});
    console.time("transpiled")
    const codeBar = await generateBarCode()

    const content = nunjucks.render('invoice.html', {
        foo: 'bar',
        codebar: codeBar,
        ...dataBinding
    })
    console.timeEnd("transpiled")

    const browser = await puppeteer.launch({
        userDataDir: './userData',
        args: [
            "--no-sandbox",
            '--disable-extensions',
            '--headless',
            '--hide-scrollbars',
            '--mute-audio',
            '--disable-gl-drawing-for-tests',
            '--no-first-run',
            '--disable-infobars',
            '--disable-breakpad',
            '--no-zygote',
            '--use-gl=egl'
        ],
        headless: "new",
    });

    const page = await browser.newPage();
    console.time("setContent")
    await page.setContent(content);
    console.timeEnd("setContent")

    console.time("makePdf")
    await page.pdf({...options, omitBackground: false, printBackground: true});
    console.timeEnd("makePdf")
    await browser.close();
    console.timeEnd('fabien')
};

module.exports.html_to_pdf_handlebars = async ({templateHtml, dataBinding, options}) => {
    console.time('final');
    console.time("transpiled")
    const template = handlebars.compile(templateHtml);
    const transpiledHtml = template(dataBinding)
    const finalHtml = encodeURIComponent(transpiledHtml);
    console.timeEnd("transpiled")

    const browser = await puppeteer.launch({
        args: ["--no-sandbox",
            '--disable-extensions',
            '--headless',
            '--hide-scrollbars',
            '--mute-audio',
            '--disable-gl-drawing-for-tests',
            '--no-first-run',
            '--disable-infobars',
            '--disable-breakpad',
            '--no-zygote',
            '--use-gl=egl'
        ],
        headless: "new",
    });

    const page = await browser.newPage();
    // await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
    //     waitUntil: "networkidle2",
    // });

    console.time("setContent")
    await page.setContent(transpiledHtml);
    console.timeEnd("setContent")
    // await page.setCacheEnabled(true)
    console.time("makePdf")
    await page.pdf({...options, omitBackground: false, printBackground: true, scale: 1});
    console.timeEnd("makePdf")
    await browser.close();
    console.timeEnd('final')
}

async function generateBarCode() {
    let base64image

    const toBuffer = util.promisify(bwipjs.toBuffer)
    const png = await toBuffer({
        bcid: 'code128',       // Barcode type
        text: '0758083339',    // Text to encode
        scale: 3,               // 3x scaling factor
        height: 10,              // Bar height, in millimeters
        includetext: true,            // Show human-readable text
        textxalign: 'center',        // Always good to set this
    });

    base64image = Buffer.from(png).toString('base64')


    return 'data:image/png;base64,' + base64image
}
