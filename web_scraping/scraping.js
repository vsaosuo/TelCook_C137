const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const Database = require('./../Database.js');
const natural = require('natural');
const {tel_token, db_username, db_pass} = require('../env.json');


/** 
 * MongoDB setup
 *  Default url: mongodb://localhost:27017
 *  Database name: glipglopfood
 *  On success: [MongoClient] Connected to mongodb://localhost:27017/glipglopfood
 */
// var db = Database("mongodb://localhost:27017", "glipglopfood");
var db = Database("mongodb+srv://" + db_username + ":"+ db_pass + "@cluster0.zhwxxac.mongodb.net/?retryWrites=true&w=majority", "glipglopfood");


var tastyURL = [
    "https://tasty.co/recipe/homemade-dumplings",
    "https://tasty.co/recipe/salmon-sinigang-as-made-by-ruby-ibarra",
    "https://tasty.co/recipe/chicken-teriyaki-chow-mein",
    "https://tasty.co/recipe/chicken-biscuits-bake",
    "https://tasty.co/recipe/taco-soup",
    "https://tasty.co/recipe/one-pot-lemon-garlic-shrimp-pasta",
    "https://tasty.co/recipe/chicken-veggie-stir-fry",
    "https://tasty.co/article/jesseszewczyk/back-to-school-family-dinner-mealplan-recipes",
    "https://tasty.co/recipe/easy-butter-chicken",
    "https://tasty.co/recipe/bacon-and-egg-ramen",
    "https://tasty.co/recipe/easy-chicken-alfredo-penne",
    "https://tasty.co/recipe/weekday-meal-prep-pesto-chicken-veggies",
    "https://tasty.co/recipe/protein-packed-buddha-bowl",
    "https://tasty.co/recipe/3-ingredient-teriyaki-chicken",
    "https://tasty.co/recipe/cheesy-chicken-alfredo-pasta-bake",
    "https://tasty.co/recipe/paprika-chicken-rice ",
    "https://tasty.co/recipe/creamy-tuscan-chicken",
    "https://tasty.co/recipe/one-pot-garlic-parmesan-pasta",
    "https://tasty.co/recipe/chicken-veggie-stir-fry",
    "https://tasty.co/recipe/creamy-lemon-chicken",
    "https://tasty.co/recipe/one-pan-honey-garlic-chicken",
    "https://tasty.co/recipe/one-pot-chicken-fajita-pasta",
    "https://tasty.co/recipe/creamy-chicken-penne-pasta",
    "https://tasty.co/recipe/slow-cooker-chicken-biscuits",
    "https://tasty.co/recipe/cheesy-chicken-and-broccoli-pasta",
    "https://tasty.co/recipe/garlic-brown-sugar-chicken",
    "https://tasty.co/recipe/easy-chicken-piccata",
    "https://tasty.co/recipe/one-pot-chicken-and-mushroom-pasta",
    "https://tasty.co/recipe/chicken-teriyaki-chow-mein",
    "https://tasty.co/recipe/chicken-teriyaki-fried-rice",
    "https://tasty.co/recipe/cajun-chicken-alfredo",
    "https://tasty.co/recipe/classic-chicken-noodle-soup"
];

var tastyObj = [];

async function getRecipe_Tasty(url, tags){
    try{
        const res = await axios.get(url, {
            headers: { "Accept-Encoding": "gzip,deflate,compress" } 
        })
        const $ = cheerio.load(res.data);
        var food = {
            title: $("h1.recipe-name").text() || $('meta[property="og:title"]').attr('content'),
            description: $("p.description").text() || $('meta[property="og:description"]').attr('content'),
            imgurl: $("div.main-image").find("img").attr('src') || $('meta[property="og:image"]').attr('content'),
            prepTime: $("div.recipe-time-container").find("p").eq(2).text(),
            cookTime: $("div.recipe-time-container").find("p").eq(4).text(),
            servingSize: parseInt($("p.servings-display").eq(0).text().replace(/[a-zA-Z]|\s/g, '')),
            ingredients: [],
            source: url,
            webName: "",
            nutrition: [],
            tags: tags,
            search: ""
        }

        // Get a list of ingredients
        $("div.ingredients__section").find("li").toArray().forEach((ele) => {
            var i = $(ele).text();
            if(!food.ingredients.includes(i))
                food.ingredients.push(i);
        })
        
        // Get site name
        var weblink= new URL(url);
        food.webName = weblink.hostname;

        // Get nutrition details
        $("div.nutrition-details").find("li").toArray().forEach((ele) => {
            var i = $(ele).text();
            if(!food.nutrition.includes(i))
                food.nutrition.push(i);
        })

        // Get searchable string of ingredients
        food.search = getIngredientTasty(food.ingredients);

        // Add data to tastyObj
        tastyObj.push(food);

        // console.log(food);
        return food;
    } catch (err) {
        console.error(err);
    }
}

function getIngredientTasty(arr){
    var rgxUnits = /teaspoon|tablespoon|fluid ounce|cup|pint|quart|gallon|milliliter|liter|gram|kilogram/g;
    var rgxPar = /\(([^)]+)\)/g;
    var rgxNum = /\d+/g;
    var rgxPun = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;

    var outputString = "";
    var outputArray = [];
    for(var i of arr){
        // Convert to lower case
        var low_case = i.toLowerCase();

        // Remove using regex above
        low_case = low_case.replace(rgxUnits, '');
        low_case = low_case.replace(rgxPar, '');
        low_case = low_case.replace(rgxNum, '');
        low_case = low_case.replace(rgxPun, '');

        // extract nouns
        // Tokenize the text
        var tokenizer = new natural.WordTokenizer();
        const tokens = tokenizer.tokenize(low_case);

        // Tag the tokens with their parts of speech
        const language = "EN"
        const defaultCategory = 'N';
        const defaultCategoryCapitalized = 'NNP';

        var lexicon = new natural.Lexicon(language, defaultCategory, defaultCategoryCapitalized);
        var ruleSet = new natural.RuleSet('EN');
        var tagger = new natural.BrillPOSTagger(lexicon, ruleSet);
        const tags = tagger.tag(tokens);


        // Extract the nouns from the tagged tokens and put into outputString
        for (var word in tags.taggedWords){
            if(tags.taggedWords[word].tag === 'NN'){
                outputString += " " + tags.taggedWords[word].token; 
            }
                
        }

        // Remove douplicated words
        const words = outputString.split(' ');
        outputArray = words.filter((word, i) => words.indexOf(word) === i);

    }

    return outputArray;
}

async function findTasty(){
    for(var i of tastyURL){
        var food = await getRecipe_Tasty(i);

        console.log(food);

        // Add food the Database
        await db.addFood(food).then((data)=>{
            console.log("Added food, ", i);
        }, (err)=> console.log(err));
    }
    // fs.writeFile('./web_scraping/food_documents.json', JSON.stringify(tastyObj), 'utf8', ()=>{});
    console.log("done");
    return ;
}

findTasty();





