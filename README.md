# Developer Hangout Coding Challenge
## May 2018 - e-commerce backend
*lokeshrmitra#8590*
*External libraries - express, body-parser, monogoose, jsonwebtoken, bcryptjs*

*Database - mLab*

**Endpoints :**
Most of the endpoints return	JSON object with `success` or `error` message

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

***Products***
These endpoints don't need the JWT
* `GET https://lokeshrmitra-devhosts.herokuapp.com/products/`
Returns a JSON array of objects with the products/services and their information.
(note: the object will contain the unique product id used for the route below)
* `GET https://lokeshrmitra-devhosts.herokuapp.com/products/:id`
Returns a specific product/service identified by the 'id' in the URL.

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
___
* `GET https://lokeshrmitra-devhosts.herokuapp.com/user/order`
Returns all the products purchased by the user. Also returns a field `mothly_total` for all the `Active` products.

* `POST https://lokeshrmitra-devhosts.herokuapp.com/user/order`
Transfer all the products from the cart to the to purchased products (`order_history` field in the user document in MongoDB). The cart will be emptied, and purchased products' status will be `Active`. The object in `order-history` will also contain a field `iat` (issued_at) that will contain the timestamp of when the purchase has been made

* `POST https://lokeshrmitra-devhosts.herokuapp.com/user/order/:id`
Transfer only a single item from cart to purchased products.

* `PUT https://lokeshrmitra-devhosts.herokuapp.com/user/order/:id`
Set the state of any purchased product as `Inactive`.  The `inactivation_date` will be added, this will contain the timestamp of the inactivation time
