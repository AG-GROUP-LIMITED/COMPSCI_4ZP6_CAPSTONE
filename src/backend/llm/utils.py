import csv
from pathlib import Path
from schemas.GraphState import GraphState

BASE_DIR = Path(__file__).resolve().parent

def get_graph_state():
    with open(f"{BASE_DIR}/mock_data/sample_graph_state.json", "r") as f:
        return GraphState.model_validate_json(f.read())
    
def get_user_mapping():
    with open(f"{BASE_DIR}/mock_data/sample_user_mapping.csv", "r") as f:
        return list(csv.DictReader(f))
