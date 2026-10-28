Attendees:
- Kris Vuong
- Hudson Sheng
- Oliver Li
- James Jeon
- Gray Niederhuber
- Eunsu Kim

# Notes:
## Updates
- starts with tasks
- User control
    - zoom in out
    - click on the note - detail on the side
    - not enough? -> extend feature
    - dependencies, good stuff
    - drag and drop elements from left side bar to the graph - James
    - island is ok (isolated tasks)
    - for P0: just visualization page
    - future: AI at bottom of page: ask whats going on
    - two add. 1 is add task, 2 is add documents / meeting notes...
- front end: Gray will be in charge with designing styling, another person will be implementing
- Gray: oxlint will be used
- Frontend and backend can progress together
- Tables
    - tasks
        - created 
        - last updated
        - type enum
        - change it to more general object (document, test...)
        - deadline
    - no isolated groups, one group of tasks per project
    - project manager should be able to modify

- Database
    - Postgres
    - Hudson will lookinto Postgres, sqlite if time permits

- Timeline visualization
    - section by deadline
    - Agile case (sprints)
        - timeframe diff from teams
    - color coding to signify deadline

- Kris: horizontal table if adding fields become frequent
- Concerns with agile
    - new tasks will only be added to non-completed parent tasks
## Next steps
Gray:  will continue will front end

Oliver: set up postgres, make up a set up guide, continue fastapi

Hudson: do research on setting up database on server, and query commands

Kris: instruction guide: unify front and back end

James: research design react components with Gray

Eunsu: generate mock data to database
    - insert SQL commands