var express = require('express');
var app = express();

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));
app.use('/spritesheets',express.static(__dirname + '/lcp/spritesheets'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

app.get('/jogo',function(req,res){
    res.sendFile(__dirname+'/jogo.html');
});
app.get('/admin',function(req,res){
    res.sendFile(__dirname+'/admin.html');
});
app.get('/teste',function(req,res){
    res.sendFile(__dirname+'/teste.html');
});

app.get('/lcp',function(req,res){
    res.sendFile(__dirname+'/lcp/index.html');
});
app.get('/jhash-2.1.min.js',function(req,res){
    res.sendFile(__dirname+'/lcp/jhash-2.1.min.js');
});
app.get('/sources/chargen.js',function(req,res){
    res.sendFile(__dirname+'/lcp/sources/chargen.js');
});
app.get('/chargen.css',function(req,res){
    res.sendFile(__dirname+'/lcp/chargen.css');
});
app.get('/spritesheets',function(req,res){
    res.sendFile(__dirname + req.url);
});
app.get('/turn',function(req,res){
    res.sendFile(__dirname + '/contador.html');
});