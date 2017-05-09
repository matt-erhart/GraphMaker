//rxjs helps manage complex sequences of events
import Rx from 'rxjs';

export let rxBus = new Rx.Subject();

const actionList = ['leftMouseUp$', 'mouseMove$', 'clickBG$', 'rightClickBG$', 'middleMouseDown$', 'mouseWheel$']

export let rxActions = actionList.reduce((acc, actionName) => 
             Object.assign(acc, {[actionName]: rxBus.filter(rxAction => rxAction.type === actionName)})
        , {})

