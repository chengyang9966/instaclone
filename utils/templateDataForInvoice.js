const { templateString } = require("./returnTemplateString");

const ALLDATA = {
  INDIVIDUAL: {
    data: {
      "{{itemName}}": "",
      "{{unitCost}}": "",
      "{{quantity}}": "",
      "{{total}}": "",
      "{{itemDesc}}": "",
    },
    template: "template/invoiceIndividual.html",
  },
  EXTRA: {
    data: {
      "{{name}}": "",
      "{{value}}": "",
    },
    template: "template/invoiceExtra.html",
  },
  ALL: {
    data: {
      "{{date}}": "",
      "{{IndividualItem}}": "",
      "{{invNumber}}": "",
      "{{subTotal}}": "",
      "{{Alltotal}}": "",
      "{{customerName}}": "",
      "{{extraItem}}": "",
      "{{address1}}": "",
      "{{address2}}": "",
    },
    template: "template/invoice.html",
  },
};

/**
 *
 * @param templateData object consist data from template
 * @param templateName INDIVIDUAL OR ALL OR EXTRA
 * @returns html template string
 */
const getInvoiceData = (templateData, templateName) => {
  let defaultValue = ALLDATA[templateName].data;

  Object.entries(defaultValue).forEach(([k, v]) => {
    Object.entries(templateData).forEach(([x, item]) => {
      if (k.toLowerCase().includes(x.toLowerCase())) {
        defaultValue[k] = item;
      }
    });
  });

  let invoiceHTML = templateString(ALLDATA[templateName].template);
  Object.entries(defaultValue).map(([k, v], i) => {
    invoiceHTML = invoiceHTML.replace(new RegExp(k, "g"), v);
  });
  return invoiceHTML;
};

module.exports = { getInvoiceData };
