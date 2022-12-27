const cheerio = require("cheerio");
const axios = require("axios");

const url = "https://tasty.co/recipe/salmon-sinigang-as-made-by-ruby-ibarra";
// const url = "https://www.york.ac.uk/teaching/cws/wws/webpage1.html";

async function getRecipe(url){
    try{
        const res = await axios.get(url, {
            headers: { "Accept-Encoding": "gzip,deflate,compress" } 
        })
        const $ = cheerio.load(res.data);
        var food = {
            title: $("h1.recipe-name").text(),
            imgurl: $("div.main-image").find("img").attr('src'),
            prepTime: $("div.recipe-time-container").find("p").eq(2).text(),
            cookTime: $("div.recipe-time-container").find("p").eq(4).text(),
            servingSize: parseInt($("p.servings-display").eq(0).text().replace(/[a-zA-Z]|\s/g, '')),
            ingredients: [],
            source: url,
            webName: ""
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

        console.log(food);
    } catch (err) {
        console.error(err);
    }
}

getRecipe(url);