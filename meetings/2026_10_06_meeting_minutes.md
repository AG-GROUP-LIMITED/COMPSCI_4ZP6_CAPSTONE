Goal: go over each person's work on the SRS, get group feedback, finalize document

Attendees:
- (K) Kris Vuong
- (H) Hudson Sheng
- (O) Oliver Li
- (J) James Jeon
- (G) Gray Niederhuber
- (E) Eunsu Kim

Executive Summary & Purpose
- H:
  - want to shift focus to visualization, put document generation second
- H/G/K: adjust wording to be more precise/natural
 
Stakeholders and User Personas
- K/H/G: change archetype to be more broad/general to describe the user as personal attributes, change expectations to be specific about the product

Constraints and Assumptions
- Group: unsure where to host website, CAS? other?
  - Leaning toward self-hosting LLM model to avoid external service cost
- H: add domain cost
- O: how important is privacy concern during prototyping stage?
  - Group: not that important, mostly mock data, locally run
 
Functional Requirements (P0, P1, P2)
- O: concern about lazy loading graph infon
  - H: lazy loading probably more efficient than eager loading, dependent on framework
- O: believes we should separate parent/child relationship vs task-task dependency
  - K/H/G: believes all parent-child relationships can be modelled as task-task directional dependency
  - K/H: think we could have different node types (ex. idea, task) but only need one relation type (dependent)
- K/H/O: add cycle detection as a feature
- K: add new P0 for dependency manipulation specifically targeted on frontend part
- Group: how to store files?
  - concern: either need to securely store files on server, or add cloud storage cost
  - concern: adds complexity, security, cost
  - pro: this is a core-ish element of traceabilty
  - O: concern about feasibility
  - K: suggestion: store unique file id, refer to file system
- H: unsure about automatic document generation
  - O: we (software) provides specific standardized SRS formats, user just inputs in fields
  - G/K/H: considering generating other type of documents
    - maybe: email update, short digest, progress update
      - can involve LLM for summary, or non-LLM for strictly informational update
      - can target internal project members, or external stakeholders
    - if we want to keep document generation: maybe dont choose a specific industry SRS format, but rather, our own custom export format
      - i.e. information solely from our graph information + maybe LLM summary
  - put a pin in this!! circle back team!!!
- H: reduce access control to just read and write
- O: maybe use third-party sign-on as well as custom login
  - ex. sign in with google
- O/K/H: automatic task completion
  - maybe: when parent marked done, add option for "mark all children as done"
  - maybe: when parent marked done but not child, add warning "child xxx not done yet"

Data Strategy & Quantitative Metrics
- No notes

Non-Functional Requirements
- No notes

Risk list
- K/H: a few concerns, we think a number of risks should change places in the risk matrix

Team communication and meeting cadence
- TODO: team meeting date either mon or wed during capstone lecture time

PR review:
- to main: everyone needs review

Frameworks
- Backend: choosing between Python/JS/C#
  - d


