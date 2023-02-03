const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const productCol = require("./db/schema");
const { printPdf } = require("./helpers/converter");
const { ProductsData } = require("./helpers/ProductsData");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/api/products", async (req, res) => {
    try {
        let data = await productCol.find({});
        res.send(data);
    } catch (err) {
        res.sendStatus(400);
    }
});

app.post("/api/products", async (req, res) => {
    try {
        let data = req.body;
        console.log("data " + data);
        if (data.length === 0) res.sendStatus(400);
        else {
            let parameter = await ProductsData(data);
            printPdf(parameter, () => {
                const pathes = { pdf: path.join(__dirname, "invoice.pdf") };
                var file = fs.createReadStream(pathes.pdf);
                var stat = fs.statSync(pathes.pdf);
                res.setHeader("Content-Length", stat.size);
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader(
                    "Content-Disposition",
                    "inline; filename=invoice.pdf"
                );
                res.status(200);
                file.pipe(res);
            });
        }
    } catch (err) {
        console.log(err);
        res.status(405).send(err);
    }
});

if (process.env.NODE_ENV == "production") {
    app.get("/", (req, res) => {
        app.use(express.static(path.resolve(__dirname, "client", "build")));
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
}

app.listen(process.env.PORT || 8000, () => {
    console.log("server started");
});
