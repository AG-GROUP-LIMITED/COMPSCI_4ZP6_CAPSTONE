// Functions to load/persist graph layout

export interface NodePosition {
  taskId: number;
  x: number;
  y: number;
}

export interface GraphLayout {
  positions: NodePosition[];
}

// GET graph layout
export const getGraphLayout = 
  async (projectId: number): Promise<GraphLayout | null> => {
    console.log("getGraphLayout() called for project ID ", projectId)
    // TODO: implement GET /api/projects/{projectId}/graph/layout
    // TODO: replace below mock function with api response
    let response = mockGetGraphLayout(projectId);
    console.log("Response: ", response)
    return response;
  }

// PUT node position
export const saveNodePosition = 
  async (projectId: number, position: NodePosition): Promise<void> => {
    console.log("saveNodePosition() called for: ", projectId, position)
    // TODO: implement PUT /api/projects/{projectId}/graph/layout/{taskId}
  }



// TODO: delete below function once endpoint is implemented: GET /api/projects/{projectId}/graph/layout
const mockGetGraphLayout = async (projectId: number) => {
  console.log("mockGetGraphLayout() called for project ID: ", projectId)
  // add delay to mock load time
  await new Promise((resolve) => setTimeout(resolve, 500));
  // return node positions for that project ID
  return {
    positions: [
      { taskId: 101, x: 100, y: 150 },
      { taskId: 102, x: 400, y: 50 },
      { taskId: 103, x: 400, y: 350 },
      { taskId: 104, x: 700, y: 50 },
      { taskId: 105, x: 700, y: 350 },
      { taskId: 106, x: 1000, y: 50 },
      { taskId: 107, x: 100, y: 550 },
      { taskId: 108, x: 100, y: 700 },
    ]
  }
}