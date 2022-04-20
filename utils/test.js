const printPDFHTML = require("./printPDF");
require("dotenv").config({ path: "../.env" });

let urlPath = `http://localhost:8081/invoices/47427759-9362-4f8e-bfe4-2d3733534e83`;

const allDAta = async () => {
  let page = await printPDFHTML(urlPath);
  console.log(page);
};

allDAta();
