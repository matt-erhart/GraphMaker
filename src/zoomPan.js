import Rx from 'rxjs';
import {rxBus, rxActions} from './rxBus';
import {store} from './index';

// //pan ---------------------------------------------------------------------------------------------- pan
// let panStart$ = rxBus.middleMouseDown$.do(_ => 
// store.dispatch({type: 'SET_PAN_START', panStart: {x: } })
//     .do(x => this.setState({ panStart: { x: this.state.panX, y: this.state.panY } }))
// let panEnd$ = subj.filter(action => action.type === 'mouseUp').do(x => console.log(x))
// const setPan = (panStart, moveData) => {
//     let { x, y } = this.state.panStart;
//     let dx = (moveData.clientX - panStart.clientX) / this.state.zoomScaleFactor;
//     let dy = (moveData.clientY - panStart.clientY) / this.state.zoomScaleFactor;
//     this.setState({ panX: x + dx });
//     this.setState({ panY: y + dy });
// }
// let pan$ = panStart$.switchMap(panStart => {
//     return mouseMove$.do(moveData => setPan(panStart, moveData)).takeUntil(panEnd$)
// })

// //zoom ---------------------------------------------------------------------------------------------- zoom
// let zoom$ = subj.filter(action => action.type === 'mouseWheel')
//     .do(action => {
//         const dxFactor = .2
//         const zoomDx = action.deltaY > 0 ? -1 * dxFactor : 1 * dxFactor;
//         let oldZoom = this.state.zoomScaleFactor;
//         this.setState({ zoomScaleFactor: oldZoom + zoomDx })
//     })