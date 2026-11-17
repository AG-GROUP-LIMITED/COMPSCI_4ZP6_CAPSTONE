# Notes

`ctrl + k v` to view this doc in vscode

## Set up
install fastapi with `pip3 install fastapi[all]`, which includes all dependencies necessary for an app (for now).
After instantiate a `FastAPI` instance in a python file, one can spin up server with `uvicorn <filename no ext.>:<instance name>`. The local machine will serve as a host only for the local machine. And when requested by any machine of local network, the client will receive messages according to the program in main and other files.

### Test / Preview API - Postman
When implementing backend logic, many HTTP request methods does not have a simple way to be previewed without having at least a front end. When user sends a post request, how do we know the data being posted is added to the database completely without needing to build a frontend first? Use [Postman](postman.com). 

In Postman, we can explicitely send HTTP request (GET, POST...), and the tool will tell us the reply from the server. With this, we don't need any front end to know that our backend is processing correctly: with some request, the server sends back complete and correct responses displayed explicitely in JSON format.

Environment: we can define certain variables to be scoped in an environment. A practical use here is to have a DEV environment and PROD enviroment. Each having their own hostname. So that when we call APIs, we can dynamically call different servers depending on the environment we are in.

run-time var: automated token passing. In test of an API request, set a variable to be the token by ``


## Post - Semantics
When a client sends a post request to the server, the server should expect the message to be conformed into a specific format, such that it can process the message as expected, including storing the content of the message into some database. This forms a contract between client and server. A handy library: `Pydantic` is recommended here for this purpose.

## CRUD
Create, read, update, delete. These four operations summarize most of the user facing applications in the perspective of data.
In FastAPI, 
Create: 
- POST
- @app.post("/posts")

Read:
- GET
- @app.get("/posts") - for multiple posts
- @app.get("/posts/{id}") - for a single post

Update:
- PUT
- @app.put("/posts/{id}")

delete:
- DELETE
- @app.delete("/posts/{id}")

### Processing Sequence
When a user requests with a path, the api will look through all available definitions and invoke the earliest match. If no method-path conbination is duplicated, then this is no problem. However, be careful with variable path like "/posts/{id}". If a function that handles this request is defined before any other path of the form "post/something", the function taking variable path will be invoked regardless of whether the something was meant for {id} or not.

### Response Code
When returning a request, many scenarios may happen. To keep the user informed, we need to return the response that fits the context. Like 200 OK or 404 NOT FOUND if we couldn't retrieve what the user is reuqesting for.

## Documentation
FastAPI provides automatically updated documentations on APIs, access through `/docs` or `/redoc` after root path.

## File Structure
Python groups programs into packages. Each package is signified by a `__init__.py` file inside a sub dir of the root dir. So we should move our `main.py` under that package dir. Say our package dir is named `app`, then the file structure of our project should be:
`Project / app / {main.py, __init__.py}`. Note that to run the server, we command `uvicorn app.main.app`

### Routers
As the applicaiton grows, there would be many types of routes, each groups a set of HTTP requests that surronds a similar data source.
To organize the program, we put each group of HTTP request functions into a separate file, and assign them to a `router`. Then in package, create a subdir called `routers`, which contains files that define routers. Then in `main.py`, routers are included for final interpretation.
Inside each router page, one can define the prefix for each api call, and tag / group them in auto-generated doc by specifying these settings when initialize routers.


## Database
Each postgres instance can serve multiple databases for separate applications.
By default, a postgres instance will come with a database called "postgres". This is to facilitate the connection to the database.

Due to technical issues, I cannot install pgadmin desktop ubuntu application on my ubuntu. However, I installed python version, which would launch a website hosted locally. To enter pgadmin python:
- `source pgadmin4/bin/activate` to activate virtual env
- `pgadmin4` to spin up server, which serves admin app at port 5050 on local server

When using python served pgadmin, the port for gui itself is 5050, but the pg database server port is 5432. 

Postgres Server / Databases / Database / Schemas / Public / Tables

A created: timestamp with time zone, set default to NOW().

### Relationships
Many-to-one: have a foreign key column in table at many side. Each record in many will reference to one record in one table.

When setting up a foreign key, __make sure__ to configure the actions: what to do when the record the fkey references to is deleted. 

#### Auto Fetch
When defining a model in alchemy, use `relationship("<Related Model>")`. Then, in response schemas, make sure to add the schemas related to the model one wishes to return alongside the main table.

### SQL statements
- LIKE: string match, regular expression
    - `WHERE name LIKE 'TV%'`
    - Where name starts with "TV"
- OFFSET
    - `LIMIT 10 OFFSET 2`
    - Return top 10 records, offset by 2
    - Useful in pagenation
- INSERT
    - `INSERT INTO products (name, price) VALUES ('tortillas', 20)`
    - `INSERT INTO products (name, price) VALUES ('tortillas', 20), ('chips', 30)`

- RETURNING
    - `INSERT INTO products () VALUES () RETURNING <cols to be returne>`
    - Will return the inserted row(s) immediately afterwards

- DELETE
    - `DELETE FROM products WHERE <conditions>`
    - Can be comboed with `RETURNING` to fetch the deleted row immediately afterwards

- UPDATE
    - `UPDATE products SET name = 'super tortilla', price = 12 WHERE id = 2`

### Connect to a Postgres Database in Python

We use `psycopg2` library as the connector to our postgres database
Use cursor to execute commands, and retrieve query results with cursor too.
Commit with connection if any changes are made to the database.

### Object Relational Mapper (ORM)
An abstract layer that handles interactions with SQL. User only needs to talk in python.
Many commands can be abstracted in forms of OOP, then they will be translated to SQL comannds by ORM.
Note that an ORM relies on a database connector that feeds command to database. So in this case, we would let ORM use `psycopg2`.
We use a popular postgres ORM called `SQLAlchemy`.

Several files for preparations:
- `database.py`: defines ORM instance and engine, __purpose unknown for now__
- `models.py`: defines table schemas as classes

#### Table Creations
in `main.py`, the line `models.Base.metadata.create_all(bind=engine)` will create tables defined in `models.py` only if they don't exist yet in `engine`, which is defined by the database created in `database.py`, through connection to a postgres database.
SQLalchemy is not designed for migration: modifying the schemas of tables (add/remove columns, editing column properties)

#### Schemas
Define the structure of the input structure from request and the output structure from response. May leverage inheritance to manage fields.
Ensure the field names are defined exactly the same, such that fastAPI can coordinate show/hide of certain fields between the model and the datasource instance, a returned record from database

### User System
User data's handling is much like a regular object, we create and modify user records. An important aspect of storing user info is their passwords. We should always store only the hashed passwords, in case of data leaking. 

First, install passlib: `pip3 install passlib[bcrypt]`, where bcrypt is the recommended algorithm for hashing, among many supported algorithms in passlib.

#### Authentication

##### JWD Token
It's stateless, meaning we do not store anything in the backend. The flow looks awfully like cookie:
1) User: login request with *username* and *password*
2) Server: return a *token*, which embeds many info
3) User: request login required data with *token*
4) Server: Verify *token*, provide data if passed 

Anytime a request involves authentication / sensitive data, the token will be passed over, get verified at backend. Thus, token needs to be lightweight for quick transaction.

##### Token structure
- Header: metadata (algo, type)
- Payload: 1) some id of user 2) optional: role 3)
- Signature: hash(header, payload, API key)

The API key is absolutely __secretive__ to public and user. This ensures that the payload is intact.

Quick note about encoding. One of the popular payload item would be token expiry time. The encode function cannot serialize a datetime object. So we need to first convert that to string through `.isoformat()`. Then when we try to use the datetime from decoded JSON, we use `datetime.fromisoformat(<string>)` to convert it back to datetime object.

When login, instead of defining the schemas as {username, password}, we use a predefined OAuthRequestForm as a input schemas. So far no obvious advantage. When testing using postman, one needs to use form-data, rather than raw JSON.

When any function (e.g. create a post) requires user credential, just add the `get_current_user` in `oauth2.py` as a depend. So whenever front end invokes some action that require authentication, the backend will call `get_current_user`, which will call `oauth2_scheme` which obtains the token from the request. If token is invalide, an exception will be raised, effectively prohibite access.

Once logged in, a user would possess a token. When performing authentication requiring actions, user will have to provide the token in the header section of the request in form: `{"Authentication": "Bearer this-is-a-token"}`

ensure the expire time field in the json that was to be fed into encoder is named `exp`, exactly. Decoder will verify expiration against this field. Otherwise, this field will be disregarded.