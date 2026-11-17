from ollama import chat
from schemas import GraphState


response = chat(
  model='capstone-model',
  messages=[{'role': 'user', 'content': 'Tell me about Canada.'}],
  think=False,
  format=GraphState.model_json_schema(),
)

graph = GraphState.model_validate_json(response.message.content)
print(graph)