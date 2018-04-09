const express = require('express');
const hbs = require('hbs');
const request = require('request');
const fs = require('fs');
const bodyParser = require('body-parser');

const APP_ID = 'b070a23c';
const APP_KEY = '55d54d87820425aa905bf3f36d2b1585';

var app = express();
var resultRecipes = '';
var searchParams = []

app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/imgs'));
app.use(bodyParser.urlencoded({
	extended:true
}));

hbs.registerHelper('getCopyRights', () => {
	return "Rest in Pepperonis";
})

app.get('/', (request, response) => {    
    response.render('login.hbs')
})

app.get('/home', (request, response) => {
    response.render('main.hbs', {
    	resultRecipes: resultRecipes
    })
})

app.post('/search', function (req, res) {
	getRecipes = (params, callback) => {
		console.log(params.health);
		var paramString = '';
		if (params.diet) {
			paramString += 'diet=' + params.diet + '&';
		}

		if (params.health) {
			paramString += 'health=' + params.health;
		}

		console.log(`https://api.edamam.com/search?app_id=${APP_ID}&app_key=${APP_KEY}&q=${params.q}&dietLabels=${params.diet}&healthLabels=${params.health}`);

		request({
			url: `https://api.edamam.com/search?app_id=${APP_ID}&app_key=${APP_KEY}&q=${params.q}&dietLabels=${params.diet}&healthLabels=${params.health}`,
			json: true
		}, (error, response, body) => {
			if (error) {
				callback("Cannot connect to API");
			} else if (body.hits) {
				callback(undefined, {
					recipes: body.hits
				})
			} else {
				console.log(body + 'FOOOOOOOBAAAAAAAAAR');			
			}
		})
	}

	getRecipes(req.body, (error, results) => {
		resultRecipes = JSON.stringify(results.recipes);
		res.render('main.hbs', {
			resultRecipes: resultRecipes
		})	
	});
})

app.post('/download', function (req, res) {
	var recipe = JSON.parse(req.body.recipe);
	fs.writeFileSync(recipe.label.replace(' ', '-') + '.txt', req.body.recipe);
})

var chefRecords = [];
app.post('/registerchef', (request, response) => {
	function AddtoFile() {
		var record = {
			"username": request.body.username,
			"password": request.body.password
		};
		chefRecords.push(record);
		newChef = JSON.stringify(chefRecords);
		fs.writeFileSync('userpass.json', newChef);
	}; 
	checkRecords();
	AddtoFile(); 
	response.render('login.hbs');
});

app.post('/getpass', (request, response) => {
	checkRecords()
	inpUsername = request.body.username;
	inpPassword = request.body.password;
	function AuthenticateChef(inpUsername, inpPassword){	
		for (var i = 0; i < chefRecords.length; i++){
			if(chefRecords[i].username == inpUsername){
				if(chefRecords[i].password == inpPassword){
					response.redirect('/home');
				} else {response.redirect('/')}
			} 
		}
	}
	AuthenticateChef(inpUsername, inpPassword);

});

function checkRecords() {
	if (fs.existsSync('userpass.json') && fs.readFileSync('userpass.json').length !== 0) {
    	getFile = fs.readFileSync('userpass.json');
    	chefRecords = JSON.parse(getFile);
	}
}

app.listen(8081, () => {
    console.log('Server is up on the port 8081');
})