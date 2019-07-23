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

    if(req.body.code_relation)
        objJSON.code_relation = req.body.code_relation;
    else
        objJSON.code_relation = 0;

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

    // sessao do usuario
    if(req.body.code_session)
        objJSON.code_session = req.body.code_session;

    // armazena o codigo da pergunta com a resposta que sera cadastrada
    if(req.body.code_current)
        objJSON.code_current = req.body.code_current;

    // codigo da ultima pergunta que foi feita
    if(req.body.code_before)
        objJSON.code_before = req.body.code_before;

    if(req.body.code_relation)
        objJSON.code_relation = req.body.code_relation;

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

    // sessao do usuario
    if(req.body.code_session)
        objJSON.code_session = req.body.code_session;

    // armazena o codigo da pergunta com a resposta que sera cadastrada
    if(req.body.code_current)
        objJSON.code_current = req.body.code_current;

    // codigo da ultima pergunta que foi feita
    if(req.body.code_before)
        objJSON.code_before = req.body.code_before;

    if(req.body.code_relation)
        objJSON.code_relation = req.body.code_relation;

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

    if(req.body.code_relation)
        objJSON.code_relation = req.body.code_relation;    

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

app.get('/question', urlencodedParser, function(req, res){
    let objJSON = {};

    // req.query: parametro passado na URL
    if(req.query.code_user)
        objJSON.code_user = Number(req.query.code_user);
    else
        objJSON.code_user = 0;

    if(req.query.code_session)
        objJSON.code_session = Number(req.query.code_session);
    else
        objJSON.code_session = 0;

    if(req.query.code_before)
        objJSON.code_before = Number(req.query.code_before);
    else
        objJSON.code_before = 0;

    if(req.query.code_relation)
        objJSON.code_relation = Number(req.query.code_relation);
    else
        objJSON.code_relation = 0;

    if(req.query.input)
        objJSON.input = req.query.input;
    else
        objJSON.input = '';

    questionData(objJSON, function(result){
        res.send(result);
    });
});

const questionData = function(objJSON, callback){
    const collection = db.collection('chatbot');
    collection.find(objJSON).toArray(function(err, result){
        // se existir algum erro, uma excessao sera lancada
        assert.equal(null, err);

        // se nao encontrou nenhum registro com o objeto informado, busca por usuario
        if(result.length <= 0){
            let code_before = Number(objJSON.code_before);
            let objFind = {};

            if(code_before > 0){
                objFind = {
                    code_user: objJSON.code_user,
                    code_relation: code_before
                };
            }else{
                objFind = {
                    code_user: objJSON.code_user
                };
            }

            collection.find(objFind).toArray(function(err, result){
                assert.equal(null, err);
                
                // natural language processing (algoritmo de IA utilizado no tratamento de textos)
                result = nlp(objJSON.input, result);
                callback(result);
            });
        }
        else
        {
            callback(result);
        }
    });
};

// question: pergunta feita ao chatbot
// array: objetos da consulta que sera feita
const nlp = function(question, array){
    let originalQuestion = question.toString().trim();
    let findInput = 0; // quantidade de ocorrencias encontradas para a pergunta feita
    let findIndex = 0; // indice da resposta encontrada para a pergunta feita

    for(let i = 0; i < array.length; i++){
        question = question.toString().trim();
        let input = array[i].input.toString().trim();

        if(input.length <= 0)
            input = array[i].output.toString().trim();

        // normalize('NFD'): faz com que cada caractere da string seja tratado individualmente
        // expressao regular de A - Z, para remover acentos (por isso esta usando u0300 e u0360f - ASCII nao convencional)
        // se estivesse usando o caractere em si, todo ele seria substituido por vazio, ao inves de remover os devidos acentos
        question = question.normalize('NFD').replace(/[\u0300-\u0360f]/g, '').toLowerCase();
        
        // remove caracteres nao-alfanumericos
        // \s: caracteres de espaco
        question = question.replace(/[^a-zA-Z0-9\s]/g, '');

        input = input.normalize('NFD').replace(/[\u0300-\u0360f]/g, '').toLowerCase();
        input = input.replace(/[^a-zA-Z0-9\s]/g, '');

        // tokenizar e transformar cada palavra de uma string em elementos de um array
        let tokenizationQuestion = question.split(' ');
        let tokenizationInput = input.split(' ');

        // metodo map percorre cada elemento do array
        // e: cada elemento do array
        tokenizationQuestion = tokenizationQuestion.map(function(e){
            if(e.length > 3){
                // ignora os ultimos 3 caracteres para nao considerar o tempo verbal das palavras
                // ex: coloCAR, coloCOU
                return e.substr(0, e.length - 3)
            }
            else
            {
                return e;
            }
        });

        tokenizationInput = tokenizationInput.map(function(e){
            if(e.length > 3){
                // ignora os ultimos 3 caracteres para nao considerar o tempo verbal das palavras
                // ex: coloCAR, coloCOU
                return e.substr(0, e.length - 3)
            }
            else
            {
                return e;
            }
        });

        let words = 0;
        for(let x = 0; x < tokenizationQuestion.length; x++){
            // se a palavra constar em uma das perguntas
            if(tokenizationInput.indexOf(tokenizationQuestion[x]) >= 0)
                words++;
        }

        if(words > findInput){
            findInput = words;
            findIndex = i;
        }
    }

    // se alguma resposta foi encontrada
    if(findInput > 0){
        return [{
            '_id': array[findIndex]._id,
            'code_user': array[findIndex].code_user,
            'code_session': array[findIndex].code_session,
            'code_current': array[findIndex].code_current,
            'code_relation': array[findIndex].code_relation,
            'code_before': array[findIndex].code_before,
            'input': originalQuestion,
            'output': array[findIndex].output
        }];
    }
    else{
        return [{
            '_id': 0,
            'code_user': array[findIndex].code_user,
            'code_session': array[findIndex].code_session,
            'code_relation': array[findIndex].code_relation,
            'code_before': array[findIndex].code_before,
            'input': originalQuestion,
            'output': 'Não sei te responder.'
        }];
    }
};


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

    // primeiro parametro: id do registro
    // const code_current = objJSON.code_current;
    // collection.deleteOne({code_current: code_current}, function(err, result){
    collection.deleteOne(objJSON, function(err, result){
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