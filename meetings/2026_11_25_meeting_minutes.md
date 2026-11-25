Attendees:
- Kris Vuong
- Hudson Sheng
- Oliver Li
- James Jeon
- Gray Niederhuber
- Eunsu Kim

Notes:
- Don't need to reach out to Derrick to set up the permissions to log in to postgres on CAS server
  - Oliver says it can be manually configured via some postgres UI
  - Hudson to work with Oliver on getting his permissions set up
  - Oliver: we can connect to postgres via some GUI bypassing the CAS linux server
- Kris: work on synthetic dataset generation for LLM validation and metrics
  - brainstorm with team on more concrete metric generation
  - idea: divide into subcategory test cases of basic, medium, complex cases
- Oliver on backend progress:
  - databases for Project and User are created
  - FK and UNIQUE implemented
  - refer to Modelfile to see if the table is modelled correctly (maybe not 100% implemented yet)
  - Modelfile can be used to add constraints
- Question: is (project_id, node_id) PK implemented?
  - Yes, Hudson implemented this in initial backend
  - uses composite PK of (project_id, node_id)
  - Oliver: maybe build it into the Project table
    - pro: fetching the "next node ID" is a lookup
    - con: introduces coupling between node and project
- Frontend
  - clean up file structure, types,
  - login page
- Backend
  - maybe start user auth and project access control
- Docs
  -  frontend to add desired endpoints to `API.md`
-  QA
  -  set up test case infrastructure on github actions
  -  dummy unit test case
  -  linting both frontend and backend

 
