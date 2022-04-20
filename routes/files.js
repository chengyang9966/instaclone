const express = require("express");
const router = express.Router();
const path = require("path"),
  fs = require("fs");

var options = {
  keyLength: 128,
  password: process.env.DEFAULT_PASSWORD,
  restrictions: {
    modify: "none",
    extract: "n",
  },
};

router.get("/securepdf", async function (req, res) {
  try {
    let localpath = path.resolve("EBOOK SETUP - EA Padu Viral V.100.pdf");
    let output = path.resolve("tmp/encrypted.pdf");
    const pdf = {
      //   ...options,
      input: localpath,
      output,
      password: "1234",
    };
    console.log("🚀 ~ine 27 ~ result", result);

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Access-Control-Allow-Origin": "*",
      "Content-Disposition": "inline; filename=order.pdf",
    });
    return res.send(fs.readFileSync(output));
  } catch (error) {
    console.log("error", JSON.stringify(error));
  }
});

router.get("/previewpdf:name", function (req, res) {
  let newPath =
    req.params.name !== "1213123123123"
      ? req.params.name
      : "pdf/invoice-Bins and Sons.pdf";
  let data = fs.readFileSync(path.resolve(newPath));
  console.log("🚀 ~ file: files.js ~ line 46 ~ data", data);
  res.contentType("application/pdf");
  return res.send(data);
});

router.get("/downloadpdf", function (req, res) {
  return res.download(path.resolve("EBOOK SETUP - EA Padu Viral V.100.pdf"));
});
module.exports = router;
