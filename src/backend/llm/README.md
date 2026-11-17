<!-- To create the model locally -->
ollama create capstone-model -f <path to ./Modelfile>
ollama list

<!-- To run locally via CLI -->
ollama run capstone-model --think=false


<!-- 
Design Rationale 

- Single Agent vs Multi Agent/Skills/Orchestration
    - for this POC, we use a single agent architecture
    - the task at hand is well-defined, sequential, state-dependent, lower complexity
    - multi-agent would increase cost while enabling a distributed/parallel workload but that is not necessary for this use case
    - for this POC, simplicity, speed, low cost, and a clearly defined workflow is higher priority

 -->