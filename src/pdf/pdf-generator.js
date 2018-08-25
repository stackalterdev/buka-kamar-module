var PdfPrinter = require('pdfmake');
var fontsDescriptor = require('./fonts-descriptor');
var printer = new PdfPrinter(fontsDescriptor);


function generate(pdfDefinition) {
    return new Promise((resolve, reject) => {

        var pdfDoc = printer.createPdfKitDocument(pdfDefinition);
        var chunks = [];

        var result;

        pdfDoc.on('data', function(chunk) {
            chunks.push(chunk);
        });

        pdfDoc.on('end', function() {
            result = Buffer.concat(chunks);
            resolve(result);
        });
        pdfDoc.end();
    })
}

module.exports = generate;