from prompts.chat_input import SYSTEM_PROMPT
from schemas.GraphChange import GraphChange
from utils import get_graph_state, get_user_mapping

import json

from ollama import chat


def main():

    # Mock user input 
    user_input = """
        Kris is no longer working on the database migration, it is Jane now. 
    """
        # Also we need a new task to generate sample data.

    graph_state = get_graph_state()

    user_mapping = get_user_mapping()

    user_prompt = f"""
AVAILABLE USERS:
{json.dumps(user_mapping, indent=2)}

CURRENT GRAPH:
{graph_state.model_dump_json(indent=2)}

USER INPUT:
{user_input}
    """

    print("user prompt is:")
    print(user_prompt)


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

    print("model response is:")
    print(response)


if __name__ == "__main__":
    main()



# EXAMPLES:

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



user_input = "Kris is no longer working on the database migration, it is Jane now. "


# model response is:
content={
  "operations": [
    {
      "operation": "update_node",
      "node_id": 1,
      "changes": {
        "type": "task",
        "title": "Migrate Database",
        "description": "Move the existing database from MSSQL to Snowflake.",
        "progress": "in-progress",
        "assignee_id": 456
      }
    }
  ]
}