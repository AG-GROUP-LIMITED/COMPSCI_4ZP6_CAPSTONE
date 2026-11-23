# Dev Note

## Start Backend Server

### Before Start
- Ensure you are connected to campus network OR mac Cisco VPN
- Have a virutal env ready at `src/backend`
- Install all packages from venv in src/backend/venv - talk to Oliver for requirements.txt
- Environment Variables
    - GRID_POSTGRES_MEMBER_PASS: @backend/src/database.py, member password to connect to postgres database server
    - GRID_AUTH_KEY: @backend/src/oauth2.py, user login token generation secrete key

### Start Server
- `cd` to root dir of this project *COMPSCI_4ZP6_CAPSTONE*
- `source src/backend/start_backend_api_from_root.sh`, this will activate virtual env and spin up the backend server
- Consult with `docs/API.md` (this will later be replaced by FastAPI official doc - 20261122, Oliver)  
- Given the Postgres server operational, you see no error message. Visit host:8000, you should receive a "YOU FOUND A SECRET PAGE!" message, indicating that the backend FastAPI server is running.

## Milestones
- ~~Basic set up with localhosts ~~
    - ~~Has GET to root dir with welcome msg~~
- ~~Database setup~~
    - ~~Connects to local postgres~~
    - ~~For Project create, read~~
- ~~User Authentication~~
- Design API 
    - discuss with front end, what type of data do they need

- Implement API
    - User - including hashing password, authentication during interaction will be implemented later
    - Node
    - Project
    - Comment
    - ...
    


## Database Management
only for running postgres server and client applicaitons, not for database interactions
username: postgres
password: talk to oliver

data ineractions
username: ag_member
password: talk to oliver

enter cli 
```
sudo -u postgres psql
```
enter cli as ag_member (recommended):
psql -U ag_member -h 127.0.0.1 -d grid_data

' /var/lib/pgsql/data/pg_hba.conf'


postgres=# show hba_file;

            hba_file             

---------------------------------

 /var/lib/pgsql/data/pg_hba.conf

(1 row)

  

postgres=# show config_file;

             config_file             

-------------------------------------

 /var/lib/pgsql/data/postgresql.conf

(1 row)

https://stackoverflow.com/questions/32439167/psql-could-not-connect-to-server-connection-refused-error-when-connecting-to



