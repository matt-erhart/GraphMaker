let dragStart$ = subj.filter(action => action.type === 'dragStart');
let dnd$ = dragStart$.mergeMap(action => mouseMove$.takeUntil(mouseUp$).do(moveData => {
    let {x,y} = this.state.dragStart;
    let oldNode = this.state.graph.nodes[action.id]
    let dx = (moveData.clientX-action.clientX)/this.state.zoomScaleFactor;
    let dy = (moveData.clientY-action.clientY)/this.state.zoomScaleFactor;
    let newNode = {...oldNode, x: x+dx, y: y+dy}; //might be faster to mutate
    this.setState({graph: {...this.state.graph, nodes: {...this.state.graph.nodes, [action.id]: newNode}}});
}))