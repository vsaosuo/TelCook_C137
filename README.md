# TelCook
This project aims to study the use of Telegram chatbot to query data from a server. The project centers round providing food recommendations to users from it's own database. There are two main features:
 - **Food search by name**, user can ask the bot on specific food they want to cook. The bot will suggests possible match for the food they ask for with a link to the recipe.
 - **Food search by items**, user can list all the possible vegetables and meats they have in their fridge, and the bot will return 5 suggested food they can cook with from the provided items.
 
 # Data
 There is not available API to a list of food with structural data like list of ingredients, recipes, or instructions. This challenge is solve by creating a web scripting methods on a certian website. Axios is used to do HTTP requests which then filter out important information via DOM manipulation.
 
 In total, there a total of 1390 recipes webscrapped from various websites. The data is stored in MongoDB Atlas. Below is a sample of a data point,
 ```
 {
    "_id":  {"$oid":"63ba8e1327ac8c098e69f684"},
    "title":"Easy Glazed Pork Chops",
    "source":"https://tasty.co/recipe/easy-glazed-pork-chops",
    "search":["thick-cut pork chops","paprika","cayenne pepper","garlic powder","black pepper","salt","brown sugar","olive oil"]
  }
 ```
 
 
 # API and Library
```
{
  "dependencies": {
    "axios": "^1.2.1",
    "cheerio": "^1.0.0-rc.12",
    "dotenv": "^16.0.3",
    "mongodb": "^4.13.0",
    "natural": "^6.0.1",
    "telegraf": "^4.11.2"
  }
}
```

# Environment setup
Below is a sample .env file
```
tel_token=123456789TOKEN
db_url=123456789TOKEN
```
# Contact
Feel free to contact me for detail at visal.saosuo@gmail.com.

