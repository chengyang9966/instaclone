const express = require("express"),
  router = express.Router();
const invoices = require("../db.json");

const sendEmail = require("../utils/sendgridEmail");
const { base64_encode } = require("../utils/base64EnCode");
const printPDFHTML = require("../utils/printPDF");
const { getInvoiceData } = require("../utils/templateDataForInvoice");

router.get("/", function (req, res) {
  res.render("invoice-list", {
    invoices: invoices,
    // Accepts errors and successes as query string arguments
    success: req.query["success"],
    error: req.query["error"],
  });
});
router.get("/test", async function (req, res) {
  try {
    let temp = [];
    let dataArray = [
      {
        itemName: "testing",
        unitCost: 22,
        quantity: 3,
        total: 66,
        itemDesc: "this is a test",
      },
      {
        itemName: "testing 22",
        unitCost: 11,
        quantity: 3,
        total: 33,
        itemDesc: "this is a test",
      },
    ];

    const date = new Date().toLocaleDateString("en", {
      year: "numeric",
      day: "2-digit",
      month: "2-digit",
    });
    dataArray.forEach((x) => {
      let item = {
        ...x,
        unitCost: `RM ${x.unitCost.toFixed(2)}`,
        total: `RM ${x.total.toFixed(2)}`,
      };
      temp.push(getInvoiceData(item, "INDIVIDUAL"));
    });

    let allInvoiceDataParams = {
      individualItem: temp.join(""),
      date,
      Alltotal: `RM ${dataArray
        .reduce((prev, x) => prev + x.total, 0)
        .toFixed(2)}`,
      subTotal: `RM ${dataArray
        .reduce((prev, x) => prev + x.total, 0)
        .toFixed(2)}`,
    };

    let invoice = getInvoiceData(allInvoiceDataParams, "ALL");

    res.writeHead(200, {
      "Content-Type": "text/html",
    });
    res.write(invoice);
  } catch (error) {
    res.send(error);
  }
});

router.get("/:id", function (req, res) {
  let userInvoice = invoices.filter(({ id }) => id === req.params["id"].trim());

  if (!userInvoice) {
    res.redirect("/invoices");
  }
  userInvoice = userInvoice.map((w) => {
    return {
      ...w,
      subTotal: (w.quantity * w.amount).toFixed(2),
      total: (w.quantity * w.amount - w.discount).toFixed(2),
      discount: w.discount.toFixed(2),
    };
  });
  const date = new Date().toLocaleDateString("en", {
    year: "numeric",
    day: "2-digit",
    month: "2-digit",
  });

  const totalCount = (name) =>
    userInvoice.reduce((current, w) => current + Number(w[name]), 0).toFixed(2);
  let feesList = [
    {
      name: "Sub Total",
      value: totalCount("total"),
    },
    {
      name: "Shipping Fees Total",
      value: totalCount("fee"),
    },
    {
      name: "Total",
      value: totalCount("total") - totalCount("fee"),
    },
  ];

  res.render("invoice-single", {
    customer: userInvoice[0],
    createdDate: date,
    orderDate: new Date(userInvoice[0].created_date).toLocaleDateString("en", {
      year: "numeric",
      day: "2-digit",
      month: "2-digit",
    }),
    invoiceList: userInvoice,
    feesList,
  });
});

router.get("/:id/email", async function (req, res) {
  try {
    let userInvoice = invoices.filter(
      ({ id }) => id === req.params["id"].trim()
    );

    if (!userInvoice || userInvoice.length === 0) {
      return res.redirect("/invoices?error=1");
    }
    userInvoice = userInvoice.map((w) => {
      return {
        ...w,
        subTotal: (w.quantity * w.amount).toFixed(2),
        total: (w.quantity * w.amount - w.discount).toFixed(2),
        discount: w.discount.toFixed(2),
      };
    });
    const totalCount = (name) =>
      userInvoice
        .reduce((current, w) => current + Number(w[name]), 0)
        .toFixed(2);
    let urlPath = `${process.env.CLIENT_URL}:${process.env.PORT}/invoices/${userInvoice[0].id}`;

    let pages = await printPDFHTML(urlPath);

    const month = new Date().toLocaleDateString("en", {
      month: "long",
    });
    const year = new Date().toLocaleDateString("en", {
      year: "numeric",
    });

    if (pages) {
      let emailResult = await sendEmail({
        to: "chengyang9966@gmail.com",
        subject: `Your Insta Clone Invoice is here | ${month} ${year} | RM ${
          totalCount("total") - totalCount("fee")
        }`,
        html: pages.html,
        text: "Your Invoice from Insta Clone is ready ",
        attachments: [
          {
            filename: `Invoice-${userInvoice[0].customer}.pdf`,
            content: base64_encode(pages.pdf),
            contentType: "application/pdf",
            disposition: "attachment",
          },
        ],
      });
      if (emailResult && emailResult.status === "success") {
        return res.send(pages.html);
      }
    }
  } catch (error) {
    console.log("🚀 ~ file: invoice.js ~ line 162 ~ error", error);
    res.status(400).send({ msg: "Failed", ...error });
  }
});

module.exports = router;
