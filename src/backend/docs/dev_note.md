# Dev Note
## Milestones
- ~~Basic set up with localhosts ~~
    - ~~Has GET to root dir with welcome msg~~
- Database setup
    - ~~Connects to local postgres~~
    - For Project create, read
- User Authentication
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



