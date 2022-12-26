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
                    db.collection("users").insertOne(userData, function(err, result){
                        if(err) reject(err);

                        db.collection("users").findOne({"_id": ObjectId.createFromHexString(result.insertedId.toHexString())}, function(err, result){
                            if(err) reject(err);
                            resolve(result);
                        });
                    })
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

module.exports = Database;