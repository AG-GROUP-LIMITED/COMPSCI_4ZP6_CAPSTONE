# LLM Proof-of-Concept

## How to run locally

1. Download Ollama
    - https://ollama.com/download

2. Download a model of your choice
    - Recommended: Best reasoning, needs ~5.5gb install:

          ollama pull qwen3.5:9b
    - Moderate reasoning, needs ~2.5gb install:

          ollama pull qwen3.5:4b

3. Verify your downloaded succeeded

       ollama list

4. Serve the model (on port 11434):

       ollama serve
    - http://localhost:11434/ should show `Ollama is running`
    - http://localhost:11434/api/tags should show your model

5. Run
    - `python llm.py` to run the POC script (terminal output only)
    - `streamlit run streamlit_app.py` to run the POC streamlit app (demo UI)

6. Run `llm.py` to run the POC


## Design choices

- Single Agent vs Multi Agent/Skills/Orchestration
    - for this POC, we use a single agent architecture
    - the task at hand is well-defined, sequential, state-dependent, low complexity
    - multi-agent would increase cost while enabling a distributed/parallel workload but that is not necessary for this use case
    - for this POC, simplicity, speed, low cost, and a clearly defined workflow is higher priority


## Intended workflow

1. Receive user natural language input from frontend -> backend
2. Sanitize user input, check prompt injection, etc.
3. Fetch graph state as JSON from DB via api
4. Pass sanitized user prompt + system prompt + graph state to LLM
5. LLM responds in deterministic format validated with Pydantic
    - proposes sequential change operations to the graph
    - POC stops here; the rest is frontend/backend, not concerned with LLM
6. LLM response is served on frontend in "staging" area for user to review
