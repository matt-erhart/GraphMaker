// @ts-check
interface nodeID { string }
interface tagID { string }
interface edgeID { string }

interface meta {
  created?: string; //date time
  description?: string;
  label?: string;
}

interface tag {
  id: tagID;
  name: string;
  type: "nominal" | "dichotomous" | "ordinal" | "interval" | "ratio" | "meta"; 
  //e.g. likert scales (meta tag) -> 1-7 (meta tag) -> '4' (ordinal tag) vs 'likert scale research' (nominal tag)
  //e.g. celsius (meta tag) -> '20' (interval tag) #0 is not 0 temperature
  //e.g. metric (meta tag) -> millimeters (meta tag) -> 1mm (ratio tag)
  //(heat)--causes 1mm expansion per 1C--(metal screws)--
  value: number | string;
  edges: Array<edgeID>; //tag to tag relationships
  for: "any" | "nodes" | "edges";
  meta?: meta;
}

interface edge { //any relationship between tags or nodes (including containment) stored as edges
  id: edgeID;
  type: "node" | "tag";
  tags?: Array<tagID>;
  target: nodeID | tagID;
  source: nodeID | tagID;
  directed: Boolean;
  meta?: meta;
}

//nodes become tags
interface node {
  id: nodeID;
  tags?: Array<tagID>;
  edges: Array<edgeID>;
  meta?: meta;
}

interface graph {
  nodes: ArrayLike<node>;
  edges: ArrayLike<edge>;
}

interface tags {
  tags: ArrayLike<tag>;
  edges: ArrayLike<edge>; //
}

interface interactionBuffer {
  started: Boolean;
  source?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface ui {
  dragToMove: interactionBuffer;
  dragToSelect: interactionBuffer;
  dragToLink: interactionBuffer;
  selected: Array<nodeID> | Array<tagID> | Array<edgeID>;
}

export namespace actions {
  export interface graph {
    //get from firebase
    //get from local storage
    //add node|edge
    //edit/delete node|edge|selected
    //get neighbors from firebase
  }
  export interface tags {
    //get from firebase
    //get from local storage
    //add/edit/delete tag|edge|selected
  }
  export interface ui {
    //select one/some/all/none
    //zoom/pan/change graph size
    //drag to move node(s)/drag to link/drag select
  }
}
