import { useState, useCallback } from 'react';
import { useReactFlow, type Node, type Edge } from '@xyflow/react';

type HistoryItem = {
  nodes: Node[];
  edges: Edge[];
};

export function useUndoRedo(maxHistorySize = 15) {
  const [past, setPast] = useState<HistoryItem[]>([]);
  const [future, setFuture] = useState<HistoryItem[]>([]);

  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

  const takeSnapshot = useCallback(() => {
    setPast((old) => [
      ...old.slice(-maxHistorySize + 1),
      {
        nodes: structuredClone(getNodes()),
        edges: structuredClone(getEdges()),
      },
    ]);

    setFuture([]);
  }, [getNodes, getEdges, maxHistorySize]);

  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];

    setFuture((old) => [
      {
        nodes: structuredClone(getNodes()),
        edges: structuredClone(getEdges()),
      },
      ...old,
    ]);

    setPast(past.slice(0, -1));
    setNodes(previous.nodes);
    setEdges(previous.edges);
  }, [past, getNodes, getEdges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];

    setPast((old) => [
      ...old.slice(-maxHistorySize + 1),
      {
        nodes: structuredClone(getNodes()),
        edges: structuredClone(getEdges()),
      },
    ]);

    setFuture(future.slice(1));
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [future, getNodes, getEdges, setNodes, setEdges, maxHistorySize]);

  return {
    takeSnapshot,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}