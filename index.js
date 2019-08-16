$(document).ready(() => {

  let nodes = [
    { id: 'root', label: 'root' },
  ];
  let selected;

  const goalInput = $('#goal');

  const cy = cytoscape({
    container: document.getElementById('cy'), // container to render in
    boxSelectionEnabled: false,
    style: [
      {
        "selector": ".focused",
        "style": {
          "background-color": "red"
        }
      },
      {
        "selector": "node[label]",
        "style": {
          "label": "data(label)"
        }
      },
      {
        "selector": "edge[label]",
        "style": {
          "label": "data(label)",
          "width": 3
        }
      }
    ]
  });


  const selectNode = (node) => {
    if (!node) return;
    if (!node.isNode()) return;
    selected.removeClass('focused');
    selected = node;
    selected.addClass('focused');
  }

  const runLayout = () => {
    cy.elements().layout({
      name: 'breadthfirst',
      roots: ['root']
    }).run();
  }

  const initCy = () => {
    _.each(nodes, (node) => {
      selected = cy.add({
        group: 'nodes',
        data: node
      })
    });
    runLayout();
    selectNode(selected);
  }

  const addNode = (label) => {
    const ele = cy.add({
      group: 'nodes',
      data: { label },
      position: { x: 50, y: 50 }
    });
    cy.add({
      group: 'edges',
      data: {
        source: selected.id(),
        target: ele.id()
      }
    })
    runLayout();
  }

  // var selected = cy.add([
  //   { group: 'nodes', data: { id: 'root', label: 'root' }},
  // ]);
  initCy();

  cy.on('select', (e) => {
    selectNode(e.target);
  });

  $('#new').submit((e) => {
    e.preventDefault();
    addNode(goalInput.val());
    goalInput.val('');
  });

  const getFirstAbove = () => selected.incomers().nodes().eq(0);
  const getFirstBelow = () => selected.outgoers().nodes().eq(0);
  const getSiblings = () => getFirstAbove().outgoers().nodes().sort((e1, e2) => e1.position('x') - e2.position('x'));

  const getNextSibling = (i) => {
    const siblings = getSiblings();
    const siblingIds = siblings.map(s => s.id());
    const index = siblingIds.indexOf(selected.id());
    return siblings[(index + i + siblingIds.length) % siblingIds.length];
  }

  Mousetrap.bind('right', (e) => {
    selectNode(getNextSibling(1));
  })
  Mousetrap.bind('left', (e) => {
    selectNode(getNextSibling(-1));
  })

  Mousetrap.bind('up', (e) => {
    selectNode(getFirstAbove());
  })
  Mousetrap.bind('down', (e) => {
    selectNode(getFirstBelow());
  })
})