const express = require('express');
const server = express();
const port = process.env.PORT ? process.env.PORT : 8080;
const fs = require('fs');
const body_parser = require('body-parser');
const database = {};

server.use(body_parser.json());
server.use(express.static('public'));

server.post('/create', (req, res)=>{
    body = req.body;
    if(body.html == undefined){
        res.status(400).json({status : false, data : {msg : "Invalid request body, html is required."}});
    }else{
        html = body.html;
        if(body.replace != undefined){
            replaceData = body.replace;
            replaceData.forEach((each)=>{
                html = html.replace(each.value, each.replaceWith);
            });
        }
        former_file_keys = Object.keys(database);
        new_key = former_file_keys.length + 1;
        file_name = `${(new Date()).getTime()}-${Math.floor((Math.random() * 10000000) + 10000)}.html`;
        fs.writeFile(`public/${file_name}`, html, (err)=>{
            if(err){
                console.log(err);
                res.status(500).json({status : false, data : {msg : "Sorry an internal server error occured."}});
            }else{
                database[`${new_key}`] = file_name;
                res.status(200).json({status : true, data : {msg : "File created", id : new_key}});
            }
        });
    }
});

server.get('/', (req, res)=>{
    res.send("Deployment successful....");
})

server.get('/routes', (req, res)=>{
    database_keys = Object.keys(database);
    response_list = [];
    for(let i = 0; i < database_keys.length; i++){
        key = database_keys[i];
        response_list.push({key: key, file_name : database[`${key}`]});
    }
    res.status(200).json({status : true, data : {msg : "Route fetched successfully", routes : response_list}});
});

server.get('/get/webview/:id', (req, res)=>{
    id = parseInt(req.params.id);
    if(typeof(id) != "number"){
        res.status(400).send("Invalid Page ID");
    }else{
        if(database[`${id}`] == "undefined"){
            res.status(404).send("Page not found");
        }else{
            res.status(200).sendFile(`${__dirname}/public/${database[`${id}`]}`);
        }
    }
});

server.listen(port, "0.0.0.0", ()=>{
    fs.readdir('public', (err, files)=>{
        files.forEach((file)=>{
            fs.unlink(`public/${file}`, (err)=>{
                if(err){
                    console.log(err);
                }
            });
        });
    })
    console.log("Server have been started, this means that all initially saved routes in the database object will be wiped out.")}
);