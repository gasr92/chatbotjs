const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert'); // utilizado para comparacao de excessão
const bodyParser = require('body-parser');

let db = null;

const url = 'mongodb://localhost:27017';
const dbName = 'chatbotdb';

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({
    extended: false
});

// adicionando recursos ao express
app.use(jsonParser);
app.use(urlencodedParser);

// o parametro cliente contem a conexao
MongoClient.connect(url, { useNewUrlParser: true }, function(err, client){
    // se o erro não for nulo, irá gerar uma excessão
    assert.equal(null, err);
    console.log('Banco de dados conectado com sucesso!');
    db = client.db(dbName);
});

app.listen(3000);
console.log('Servidor executando!');


app.post('/insert', urlencodedParser, function(req, res){
    let objJSON = {};

    // verifica se possui usuario
    if(req.body.code_user)
        objJSON.code_user = req.body.code_user;
    else
        objJSON.code_user = 0;

    // sessao do usuario
    if(req.body.code_session)
        objJSON.code_session = req.body.code_session;
    else
        objJSON.code_session = 0;

    // armazena o codigo da pergunta com a resposta que sera cadastrada
    if(req.body.code_current)
        objJSON.code_current = req.body.code_current;
    else
        objJSON.code_current = cod();

    // codigo da ultima pergunta que foi feita
    if(req.body.code_before)
        objJSON.code_before = req.body.code_before;
    else
        objJSON.code_before = 0;

    // referente a pergunta
    if(req.body.input)
        objJSON.input = req.body.input;
    else
        objJSON.input = '';

    // referente a resposta
    if(req.body.output)
        objJSON.output = req.body.output;
    else
        objJSON.output = 'Desculpe, não entendi.';

    insertData(objJSON, function(result){
        res.send(result);
    });
});


app.post('/update', urlencodedParser, function(req, res){
    let objJSON = {};

    // verifica se possui usuario
    if(req.body.code_user)
        objJSON.code_user = req.body.code_user;
    else
        objJSON.code_user = 0;

    // sessao do usuario
    if(req.body.code_session)
        objJSON.code_session = req.body.code_session;

    // armazena o codigo da pergunta com a resposta que sera cadastrada
    if(req.body.code_current)
        objJSON.code_current = req.body.code_current;
    else
        objJSON.code_current = 0;

    // codigo da ultima pergunta que foi feita
    if(req.body.code_before)
        objJSON.code_before = req.body.code_before;

    // referente a pergunta
    if(req.body.input)
        objJSON.input = req.body.input;

    // referente a resposta
    if(req.body.output)
        objJSON.output = req.body.output;

    updateData(objJSON, function(result){
        res.send(result);
    });
});


app.post('/delete', urlencodedParser, function(req, res){
    let objJSON = {};

    // verifica se possui usuario
    if(req.body.code_user)
        objJSON.code_user = req.body.code_user;
    else
        objJSON.code_user = 0;

    // sessao do usuario
    if(req.body.code_session)
        objJSON.code_session = req.body.code_session;

    // armazena o codigo da pergunta com a resposta que sera cadastrada
    if(req.body.code_current)
        objJSON.code_current = req.body.code_current;
    else
        objJSON.code_current = 0;

    // codigo da ultima pergunta que foi feita
    if(req.body.code_before)
        objJSON.code_before = req.body.code_before;

    // referente a pergunta
    if(req.body.input)
        objJSON.input = req.body.input;

    // referente a resposta
    if(req.body.output)
        objJSON.output = req.body.output;

    deleteData(objJSON, function(result){
        res.send(result);
    });
});


app.post('/find', urlencodedParser, function(req, res){
    let objJSON = {};

    // verifica se possui usuario
    if(req.body.code_user)
        objJSON.code_user = req.body.code_user;

    // sessao do usuario
    if(req.body.code_session)
        objJSON.code_session = req.body.code_session;

    // armazena o codigo da pergunta com a resposta que sera cadastrada
    if(req.body.code_current)
        objJSON.code_current = req.body.code_current;

    // codigo da ultima pergunta que foi feita
    if(req.body.code_before)
        objJSON.code_before = req.body.code_before;

    // referente a pergunta
    if(req.body.input)
        objJSON.input = req.body.input;

    // referente a resposta
    if(req.body.output)
        objJSON.output = req.body.output;

    findData(objJSON, function(result){
        res.send(result);
    });
});


function cod(){
    const data = new Date();
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const dia = data.getDate();
    const hora = data.getHours();
    const minuto = data.getMinutes();
    const segundo = data.getSeconds();
    const milisegundos = data.getMilliseconds();
    const result = parseInt(Number(ano+''+mes+''+dia+''+hora+''+minuto+''+segundo+''+milisegundos) / 2);

    return result;
}

const insertData = function(objJSON, callback){
    // collection e uma tabela
    const collection = db.collection('chatbot');
    collection.insertOne(objJSON, function(err, result){
        assert.equal(null, err);
        callback(result);
    });
};

const updateData = function(objJSON, callback){
    // collection e uma tabela
    const collection = db.collection('chatbot');
    const code_current = objJSON.code_current;

    // primeiro parametro: id do registro
    // segundo parametro: campos que deverao ser atualizados (no caso os campos que estao no objJSON)
    collection.updateOne({code_current: code_current}, {$set: objJSON}, function(err, result){
        assert.equal(null, err);
        callback(result);
    });
};

const deleteData = function(objJSON, callback){
    // collection e uma tabela
    const collection = db.collection('chatbot');
    const code_current = objJSON.code_current;

    // primeiro parametro: id do registro
    collection.deleteOne({code_current: code_current}, function(err, result){
        assert.equal(null, err);
        callback(result);
    });
};

const findData = function(objJSON, callback){
    // collection e uma tabela
    const collection = db.collection('chatbot');
    collection.find(objJSON).toArray(function(err, result){
        assert.equal(null, err);
        callback(result);
    });
};