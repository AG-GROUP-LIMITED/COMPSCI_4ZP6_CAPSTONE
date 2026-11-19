Attendees:
- Kris Vuong
- Hudson Sheng
- Oliver Li
- James Jeon
- Gray Niederhuber
- Eunsu Kim

Notes:
Currently:
Gray plans to get it done by end of tmr (including detail view of the task)
Kris about LLM:
- input: natrual lang and current snapshot
- output:
    - structured
    - first way: propose new graph
    - second way: series of proposed actions
- showed several examples: natural lang scenario description -> operations in form of JSON
- ambiguity, what to do next, all proposes may be an option, or further prompt is encouraged
- for now, a small graph takes around 20sec on a local machine. Future optimization is needed. 
- Graph, right now every ask needs to feed in entire graph for each response
- context can be preserved throughout conversations
- bad response: ambiguity
- pulls 
- For demo, llm can just be a separate feature aside from the app

James - undo redo
- take snapshots
- needs to change to series of operations
- periodical push to back end - reduce server load



Oliver:
TODO: Check stats of server
TODO: check server preload data for dev purpose

Demo video:
Hudson: script
Gray: go through UI, graph manipulations, technologies (including backend)
Kris: LLM feature (separate)
Oliver: make slides (1 slide: problem statement, features)
James: video editing