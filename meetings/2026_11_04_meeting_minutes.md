Attendees:
- Kris Vuong
- Hudson Sheng
- Oliver Li
- James Jeon
- Gray Niederhuber
- Eunsu Kim

Notes:
## Front End
Gray presents
tail-winds is used, so far thereès view and documents side bar with title bar.

James presents
With some data, some notes are displayed on the screen with visual edges

a minimap, magnification functionalities are implemented

proposed feature, click on a task, all dependent tasks are highlighted

Hudson: auto griding formatting

Persistence of visual display: should we store the location info of each task?
Location is important, it contains important info for the views
React should have some mechanism to implement this position problem.


## Back End
Hudson presents
sqlite and react app are served with different portss
saplite creates .db database file
the front-back integration is shown to be successful
Kris: data design
- Breaks tasks into nodes and edges (with types)

Types of edges?
dependencies on top of parent-child relationships
files would only be supporting articles, not a task, representation wise nor data wise

Future meeting minutes will need pull request to get into main branch

Oliver presents
showed the backend server, orm management system, and postman.

Eunsu presents
Sample data with SQL commands

Demos only need server.py
Demos should be pulling from sqlite

## Next step:
Gray + James: full UI front end
James: create a new branch from Gray's, insert back to Gray's
Graph first, list later
Hudson: work on integration
Oliver: look into server
Eunsu: mock date