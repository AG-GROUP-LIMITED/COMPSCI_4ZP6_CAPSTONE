from llm import generate_graph_changes
from prompts.chat_input import SYSTEM_PROMPT
from schemas.GraphChange import GraphChange
from schemas.GraphState import GraphState
from utils import get_graph_state, get_user_mapping

import json

from ollama import chat
import streamlit as st


# Load mock graph state
graph_state = get_graph_state()
user_mapping = get_user_mapping()


# Basic UI
st.title("GRID - LLM POC")
st.subheader("Natural Language Project Update")

st.subheader("Current Graph State")
st.json(graph_state.model_dump(mode="json"))

st.subheader("User Input")
user_input = st.text_area("Enter a progress update...")

if st.button("Generate"):
    with st.spinner("Generating..."):
        response = generate_graph_changes(user_input, graph_state, user_mapping)

    st.subheader("Model Response")
    st.json(response.model_dump(mode="json"))