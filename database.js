const { MongoClient, ObjectID, ObjectId } = require('mongodb');	// require the mongodb driver

/**
 * Uses mongodb v4.2+ - [API Documentation](http://mongodb.github.io/node-mongodb-native/4.2/)
 * Database wraps a mongoDB connection to provide a higher-level abstraction layer
 * for manipulating the objects.
 */
function Database(mongoUrl, dbName){
	if (!(this instanceof Database)) return new Database(mongoUrl, dbName);
	this.connected = new Promise((resolve, reject) => {
		MongoClient.connect(
			mongoUrl,
			{
				useNewUrlParser: true
			},
			(err, client) => {
				if (err) reject(err);
				else {
					resolve(client.db(dbName));
				}
			}
		)
	});
	this.status = () => this.connected.then(
		db => ({ error: null, url: mongoUrl, db: dbName }),
		err => ({ error: err })
	);
}

Database.prototype.addUser = function(userData){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
            try{
                if(userData)
                    // Only update the exist user
                    db.collection("users").replaceOne({"userTelInfo.username": userData.userTelInfo.username}, userData, { upsert: true }, function(err, result){
                        if(err) reject(err);

                        if(result.acknowledged) resolve(result);
                        else reject();
                    });
            } catch(err){
                reject(new Error(err));
            }
		})
	)
}

/*  
 * accepts a single username argument and queries the users collection 
 * for a document with the username field equal to the given username 
 */
Database.prototype.getUser = function(username){
    return this.connected.then(db =>
		new Promise((resolve, reject) => {
            try{
                if(username)
                    db.collection("users").findOne({"userTelInfo.username": username}, function(err, result){
                        if(err) reject(err);
                        resolve(result);
                    });
            } catch(err){
                reject(new Error(err));
            }
        })
    )
}

Database.prototype.addFood = function(foodData){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
            try{
                if(foodData)
                    // Only update the exist user
                    db.collection("allFood").replaceOne({"source": foodData.source}, foodData, { upsert: true }, function(err, result){
                        if(err) reject(err);

                        if(result.acknowledged) resolve(result);
                        else reject();
                    });
            } catch(err){
                reject(new Error(err));
            }
		})
	)
}

Database.prototype.getOneRandomFoodExecpt = function(arrayID){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
            try{
                db.collection("allFood").findOne({"_id": {$nin: arrayID}}, {$sample: { size : 1 }}, function(err, result){
                    if(err) reject(err);
                    resolve(result);
                });
            } catch(err){
                reject(new Error(err));
            }
		})
	)
}

Database.prototype.getBatchRandomFood = function(batchSize){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
            try{
                db.collection("allFood").aggregate([{ $sample: { size: batchSize } }]).toArray(function(err, result){
                    if(err) reject(err);
                    resolve(result);
                });
            } catch(err){
                reject(new Error(err));
            }
		})
	)
}

Database.prototype.get5FoodsMatched = function(ingredients, numMeals){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
            try{
                db.collection("allFood").aggregate([
                    {
                      $unwind: "$search"
                    },
                    {
                      $match: {
                        search: { $in: ingredients }
                      }
                    },
                    {
                      $group: {
                        _id: "$_id",
                        count: { $sum: 1 }
                      }
                    },
                    {
                      $sort: {
                        count: -1
                      }
                    },
                    {
                      $limit: numMeals
                    }
                ]).toArray(function(err, result){
                    if(err) reject(err);
                    resolve(result);
                });
            } catch(err){
                reject(new Error(err));
            }
		})
	)
}

module.exports = Database;