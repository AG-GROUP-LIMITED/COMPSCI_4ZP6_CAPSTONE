from prompts.chat_input import SYSTEM_PROMPT
from schemas.GraphChange import GraphChange
from utils import get_graph_state, get_user_mapping

import json

from ollama import chat


def main():

    # Mock user input 
    user_input = """
        Jane is working on the Snowflake task. 
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
        model='qwen3.5:9b',
        messages=[
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': user_prompt}
        ],
        think=True,
        stream=True,
        options={
            "temperature": 0.1,
            "presence_penalty": 0,
            "num_ctx": 16384,  # 4096 default
        },
        format=GraphChange.model_json_schema()
    )

    print("model response is:")
    for chunk in response:
        print(chunk.message.content or "", end="", flush=True)


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


#  added 'confidence' estimate and made the "changes" object strictly the delta

user_input = "Kris is no longer working on the database migration, it is Jane now. "

content={
  "operations": [
    {
      "operation": "update_node",
      "node_id": 1,
      "changes": {
        "assignee_id": 456
      },
      "confidence": 0.95
    }
  ]
}



#  WITH THINKING:
#  (context: there are two Snowflake tasks, so this should be ambiguous)
user_input = "Jane is working on the Snowflake task."

content={
  "operations": [
    {
      "operation": "update_node",
      "node_id": 1,
      "changes": {
        "assignee_id": 456
      },
      "confidence": "LOW"
    },
    {
      "operation": "update_node",
      "node_id": 2,
      "changes": {
        "assignee_id": 456
      },
      "confidence": "LOW"
    }
  ]
}



#  **BEST SO FAR**: WITH THINKING AND QWEN3.5:9B AND  AMBIGUITY INSTRUCTIONS:
#  (context: there are two Snowflake tasks, so this should be ambiguous)
user_input = "Jane is working on the Snowflake task."

content={
    "operations": [], 
    "ambiguities": [
        {"ambiguous_instruction": "Jane is working on the Snowflake task", 
         "clarification_needed": "Which Snowflake task should Jane be assigned to? There are two Snowflake-related tasks: \'Migrate to Snowflake Database\' (node 1) and \'Migrate to Snowflake database\' (node 2)."}]}
