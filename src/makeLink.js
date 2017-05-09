      //make links ------------------------------------------------------------------------------------------ make links
      const initLink = (link1) => {
        let { nodeID, x1, y1 } = this.state.linkStart;
        if (this.state.linkStart.nodeID === '') {
          let { x, y, id } = this.state.graph.nodes[link1.id];
          this.setState({ linkStart: { nodeID: id, x1: x, y1: y } })
        }
      }

      const previewLink = (link1, moveData) => {
          let { nodeID, x1, y1 } = this.state.linkStart;
          let dx = (moveData.clientX - link1.clientX)/this.state.zoomScaleFactor;
          let dy = (moveData.clientY - link1.clientY)/this.state.zoomScaleFactor;
          let newLink = { ...this.state.linkStart, x2: x1 + dx, y2: y1 + dy }; //might be faster to mutate
          this.setState({ linkStart: newLink })
      }

      const newLink = (source, target) => ({id: 'link-' + uid.sync(8), source, target, label: ''});
      const setLink = (link1, click2) => {
          if (click2.hasOwnProperty('id') && click2.id.length > 0 && click2.id !== link1.id) {
            let link = newLink(link1.id, click2.id)
            this.setState({graph: {...this.state.graph, links: {...this.state.graph.links, [link.id]: link}}});
            this.setState({ linkStart: { nodeID: '' } })
          } else {
            this.setState({ linkStart: { nodeID: '' } })
          }
        }

      let linkClick$     = subj.filter(action => action.type === 'link' || action.type === 'linkMouseDown')
      let linkMouseUp$   = subj.filter(action => action.type === 'linkMouseUp')
      let stopPreview$ = Rx.Observable.merge(linkClick$, clickBG$, linkMouseUp$)
      /*the trick to getting this to work for any number of pairs of clicks
       is the take(1) at the begining and the repeat() at the end */
      let initLink$ = linkClick$.take(1).do(link1=>initLink(link1))
      

      let addLink$ = initLink$.switchMap(link1 => {
              return mouseMove$.do(moveData=>previewLink(link1, moveData))
                    .takeUntil(stopPreview$.do(click2 => setLink(link1, click2)))
      }).repeat();