import express from "express";
import routerProduct from "./routes/products.routes.js";
import { __dirname, __filename } from "./path.js";
import multer from 'multer'
import { engine } from 'express-handlebars';
import * as path from 'path'
import { Server } from "socket.io";
import { Socket } from "dgram";
import { ProductManager } from "./controllers/ProductManager.js";
import routerSocket from "./routes/socket.routes.js";
import { info } from "console";

const productManager = new ProductManager('src/models/products.json');


const app = express()
const PORT = 8080


const server = app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`)
})

//Server io para socket.io
const io = new Server(server)





io.on("connection", async (socket) => {
    console.log("Cliente conectado")

    socket.on("addProduct", async info => { //El socket "on" es cuando se recibe información del lado del cliente
        const newProduct = { ...info, status: true };
        var mensajeAgregar = await productManager.addProduct(newProduct); //Agregar un producto y guarda el mensaje en un variable para mandarlo al usuario y mostrarlo al servidor
        socket.emit("mensajeProductoAgregado", mensajeAgregar)
        console.log(mensajeAgregar)
    })
    socket.on("deleteProduct", async id => {
        var mensajeBorrar = await productManager.deleteProductById(id)
        socket.emit("mensajeProductoEliminado", mensajeBorrar)
        console.log(mensajeBorrar) //Para mostrar al servidor el mensaje
    })
    socket.emit("getProducts", await productManager.getAllProducts()); //Envia los productos del carrito al cliente
})


//Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, './views'));

//Routes
app.use('/', express.static(__dirname + '/public'))
app.use('/api/products', routerProduct)
app.use('/', routerSocket)