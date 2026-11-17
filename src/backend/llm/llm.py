from ollama import chat
from schemas.GraphState import GraphState
from schemas.GraphChange import GraphChange
from prompts.chat_input import SYSTEM_PROMPT


def main():

    # graph_state = GraphState.model_validate_json(None) # TODO mock graph state

    # Get user_id : name mapping

    user_prompt = """
        Kris is no longer working on the database migration, it is Hudson now. 
        Also we need a task to generate sample data.
    """

    user_prompt = "The graph is empty. Create a task node called Sample and assign it to user 123."

    response = chat(
        model='capstone-model',
        messages=[
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': user_prompt}
        ],
        think=False,
        format=GraphChange.model_json_schema(),
        options={
            "temperature": 0.2,
            "presence_penalty": 0
        }
    )

    print(response)

    # graph = GraphState.model_validate_json(response.message.content)
    # print(graph)


if __name__ == "__main__":
    main()



# user_prompt = "The graph is empty. Create a task node called Sample and assign it to user 123."

# output =
# content={
#   "operations": [
#     {
#       "operation": "create_node",
#       "changes": {
#         "type": "task",
#         "title": "Sample",
#         "description": "",
#         "progress": "backlog",
#         "assignee_id": 123
#       }
#     }
#   ]
# }