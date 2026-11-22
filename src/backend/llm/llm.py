from prompts.chat_input import SYSTEM_PROMPT
from schemas.GraphChange import GraphChange
from schemas.GraphState import GraphState
from utils import get_graph_state, get_user_mapping

import json

from ollama import chat


def main():

    # Mock user input 
    easy_case_1 = "Jane is now repointing Python jobs to Snowflake, not Kris"
    easy_node_delete = "We no longer need to migrate data to Snowflake, delete the task"
    med_case_1 = "We no longer need to migrate data to Snowflake."
    med_case_2 = "Jane needs to consult with the business before jobs can be repointed to Snowflake"
    ambiguous_case = "Jane is working on the Snowflake task."

    graph_state = get_graph_state()

    user_mapping = get_user_mapping()

    generate_graph_changes(med_case_2, graph_state, user_mapping)


def generate_graph_changes(user_input: str, graph_state: GraphState, user_mapping, stream=False):

    user_prompt = (
      "AVAILABLE USERS:"
      f"{json.dumps(user_mapping, indent=2)}"

      "CURRENT GRAPH:"
      f"{graph_state.model_dump_json(indent=2)}"

      "USER INPUT:"
      f"{user_input}"
    )
    print("user_prompt =", user_input)

    options = {
      "temperature": 0.1,
      "presence_penalty": 0,
      "num_ctx": 16384,  # 4096 default
    }

    response = chat(
        model='qwen3.5:9b',
        messages=[
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': user_prompt}
        ],
        think=True,
        stream=stream,
        options=options,
        format=GraphChange.model_json_schema()
    )
    print("response = ", end="")
    if stream:
      for chunk in response:
          if chunk.message.content:
              # yield chunk.message.content
              print(chunk.message.content or "", end="", flush=True)
    else:
        print(response)
        return GraphChange.model_validate_json(response.message.content)


if __name__ == "__main__":
    main()







########################################


# EXAMPLES:

# straight-forward node update (change assignee)
user_prompt = "Jane is now repointing Python jobs to Snowflake, not Kris"
response = {
  "operations": [
    {
      "operation": "update_node",
      "node_id": 2,
      "changes": {
        "assignee_id": 456
      },
      "confidence": "HIGH"
    }
  ],
  "ambiguities": []
}

# straight-forward node deletion
user_prompt = "We no longer need to migrate data to Snowflake, delete the task"
response = {
  "operations": [
    {
      "operation": "delete_node",
      "node_id": 1,
      "confidence": "HIGH"
    },
    {
      "operation": "delete_edge",
      "edge_id": 1,
      "confidence": "HIGH"
    }
  ],
  "ambiguities": []
}

# multi-step node and edge creation
user_prompt = "Jane needs to consult with the business before jobs can be repointed to Snowflake"
response = {
  "operations": [
    {
      "operation": "create_node",
      "changes": {
        "type": "task",
        "title": "Consult with business",
        "description": "Jane needs to consult with the business before jobs can be repointed to Snowflake",
        "progress": "backlog",
        "assignee_id": 456
      }
    ,
      "confidence": "HIGH"
    },
    {
      "operation": "create_edge",
      "changes": {
        "source_node_id": 2,
        "target_node_id": 3,
        "edge_type": "depends_on"
      },
      "confidence": "HIGH"
    }
  ]
,
  "ambiguities": []
}


# ambiguous node deletion
user_prompt = "We no longer need to migrate data to Snowflake."
response = {"operations": [], 
            "ambiguities": [
                {"ambiguous_instruction": "We no longer need to migrate data to Snowflake", 
                 "clarification_needed": "Should the 'Migrate data to Snowflake' task be deleted, marked as complete, or cancelled?"}]}

# ambiguous node reference (there are two snowflake tasks)
user_prompt = "Jane is working on the Snowflake task now."
response = {"operations": [], 
            "ambiguities": [
                {"ambiguous_instruction": "the Snowflake task", 
                 "clarification_needed": "Which Snowflake task do you mean? There are two tasks related to Snowflake: 'Migrate data to Snowflake' (node 1) and 'Repoint Python jobs to Snowflake' (node 2)."}
            ]}


# TODO: resolve the "temp ID" issue for proposed new nodes