interface nodeID { string }
interface tagID { string }
interface edgeID { string }

//nodes are variables with a state
interface node {
  id: nodeID;
  label: string;
  type: "nominal" | "dichotomous" | "ordinal" | "interval" | "ratio";
  edges: Array<edgeID>;
}

interface edge {
  id: edgeID;
  label: string;
  target: nodeID | tagID;
  source: nodeID | tagID;
  directed: Boolean;
}

interface graph {
  nodes: ArrayLike<node>;
  edges: ArrayLike<edge>;
}
