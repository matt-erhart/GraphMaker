// @ts-check

//reducers
interface nodeID {String};
interface tag {String};

interface node {
    id: nodeID; //node-uid
    x: Number;
    y: Number;
    text: String;
    selected: Boolean;
    tags: Array<tag>;
}

interface link {
    id: String; //link-uid
    source: nodeID;
    target: nodeID;
    label: String;
    tags: Array<tag>;
}

export interface graphState {
    nodes: Array<node>;
    links: Array<link>;
}

export interface graphAction {
    type: String;
    node?: node;
    link?: link;
}