# Developer Hangout Coding Challenge
## May 2018 - e-commerce backend

*lokeshrmitra#8590*

*External libraries - express, body-parser, monogoose, jsonwebtoken, bcryptjs*

*Database - mLab*

**Endpoints :**
Most of the endpoints return	JSON object with `success` or `error` message
___
***User***
* `POST https://lokeshrmitra-devhosts.herokuapp.com/user/register`

_x-www-form-urlencoded'_ parameters : email, password, name, age, address
	
* `POST https://lokeshrmitra-devhosts.herokuapp.com/user/login`

	Form data passed: email, password
	This will return a JSON object as:
	```javascript
	{
    "success": "Logged in successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imxva2VzaHJtaXRyYUBnbWFpbC5jb20iLCJpYXQiOjE1Mjc3NjQ5MjYsImV4cCI6MTUyNzc2ODUyNn0.ItzS6uSOfoyUPIOmmXFrYnkrxy9zPSisba8FyjKAsWs"
	}
	```
	This JWT("token") has to be sent with every request, that is specific to the user ( i.e. in the /user/ ), in the `Authorization` header. The JWT expiration time has been set to 2hr
* 	`PUT https://lokeshrmitra-devhosts.herokuapp.com/user/`

	Used for updating user info with the parameters : name, age, address.
	Email and password can't be updated
* `GET https://lokeshrmitra-devhosts.herokuapp.com/user/`

	Returns basic user information.
*	`DELETE https://lokeshrmitra-devhosts.herokuapp.com/user/`

	Deletes the user .
___
***Products***

These endpoints don't need the JWT

* `GET https://lokeshrmitra-devhosts.herokuapp.com/products/`

Returns a JSON array of objects with the products/services and their information.
(note: the object will contain the unique product id used for the route below)
* `GET https://lokeshrmitra-devhosts.herokuapp.com/products/:id`

Returns a specific product/service identified by the 'id' in the URL.
___
***User's interaction with products/services***

These endpoints NEED the JWT

* `GET https://lokeshrmitra-devhosts.herokuapp.com/user/cart`

Will return a JSON object with all items in the cart along with `cart_total` field.

* `POST https://lokeshrmitra-devhosts.herokuapp.com/user/cart/:id`

This will add the product/service with the `prodid` equal to 'id'specified in the URL. If a product/service is already in user's cart or the user has already subscribed to that product/service, it won't be added to the cart.

* `DELETE https://lokeshrmitra-devhosts.herokuapp.com/user/cart`

Will empty the entire cart with purchasing them.

* `DELETE https://lokeshrmitra-devhosts.herokuapp.com/user/cart/:id`

Will remove the specific product from the cart as given by the 'id'. 'id' should be present in the cart.

* `GET https://lokeshrmitra-devhosts.herokuapp.com/user/order`

Returns all the products purchased by the user. Also returns a field `mothly_total` for all the `Active` products.

* `POST https://lokeshrmitra-devhosts.herokuapp.com/user/order`

Transfer all the products from the cart to the to purchased products (`order_history` field in the user document in MongoDB). The cart will be emptied, and purchased products' status will be `Active`. The object in `order-history` will also contain a field `iat` (issued_at) that will contain the timestamp of when the purchase has been made

* `POST https://lokeshrmitra-devhosts.herokuapp.com/user/order/:id`

Transfer only a single item from cart to purchased products.

* `PUT https://lokeshrmitra-devhosts.herokuapp.com/user/order/:id`

Set the state of any purchased product as `Inactive`.  The `inactivation_date` will be added, this will contain the timestamp of the inactivation time


### App Description

I had first thought of having different Schemas for every different type of product, and also include functions regarding manipulating the products' attribute. But then, this type of management comes under some automated tracking service (or an admin), so I skipped it.
I have just put all the products as documents(with their specific attributes) in a collection

An example document:
```javascript
{
    "_id": "5b0daee20c25c335a0f50797",
    "name": "Panther",
    "type": "server",
    "prodid": "13",
    "memory": "4 GB",
    "cpu": 2,
    "storage": "100 GB",
    "transefer": "10 TB",
    "price": 25
}
```
I had intially used the `prodid`s and `type` attributes to differentiate products. But now i don't use them. They are free to be used in the front end in any correct way



Next, to track `cart` and `order_history` I've just added object Arrays in the user document
An example document of user:
```javascript
{
    "_id": {
        "$oid": "5b0fd71755cd09001404862f"
    },
    "cart": [
    	 {
            "prodid": "31",
            "name": "Load Balancer",
            "price": 25,
            "iat": 1527769536136,
            "status": "Active"
        },
        {
            "prodid": "11",
            "name": "Lynx",
            "price": 15,
            "iat": 1527769536136,
            "status": "Active"
        }
    ],
    "order_history": [
        {
            "prodid": "13",
            "name": "Panther",
            "price": 25,
            "iat": 1527769536136,
            "status": "Inactive",
            "inactivation_date": 1527769585615
        },
        {
            "prodid": "51",
            "name": "Telescope Andromeda",
            "price": 25,
            "iat": 1527769536136,
            "status": "Active"
        }
    ],
    "name": "Lokesh R Mitra",
    "email": "lokeshrmitra@gmail.com",
    "password": "$2a$10$pl1ApxX1CIQXdNsdsKzv5.no3mOclIJOdhGVW8c6NPw7086z3xnPS",
    "age": 21,
    "address": "RH 4, GuruganeshNagar, Aurangabad 431003",
    "__v": 0
}
```

One issue I faced was dealing with authentication. I couldn't find a way to maually expire the JWTs that are issued (I didn't want to use blacklisting). This problem still exists. You can use the JWT to delete your own account. Then after that you should not be able to access any user specific routes,  but this does not happen. You can't get any other user's data, but still I don't find this OK/

Thanks for the challenge, it was really helpful.
