$(document).ready(() => {

  let nodes = JSON.parse(localStorage.getItem('nodes')) || [
    { id: 'root', label: 'Ship Backwards Plan' },
    { id: 'child1', label: 'Write the code for it' },
  ];
  let edges = JSON.parse(localStorage.getItem('edges')) || [
    {
      source: 'root',
      target: 'child1',
    }
  ];
  let selected;

  const $goalInput = $('#autoComplete');
  const $modal = $('#new-modal');

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
    _.each(edges, (edge) => {
      cy.add({
        group: 'edges',
        data: edge,
      });
    });
    runLayout();
    selectNode(selected);
  }

  const addEdge = (source, target) => {
    const edge = {
      source,
      target,
    };
    cy.add({
      group: 'edges',
      data: edge,
    });
    edges.push(edge);
    localStorage.setItem('edges', JSON.stringify(edges));
  }

  const addNode = (label) => {
    const cyNode = cy.add({
      group: 'nodes',
      data: { label },
    });
    const id = cyNode.id();
    nodes.push({
      id,
      label,
    });
    localStorage.setItem('nodes', JSON.stringify(nodes));
    addEdge(selected.id(), id);
    runLayout();
  }

  const getFirstAbove = () => selected.incomers().nodes().eq(0);
  const getFirstBelow = () => selected.outgoers().nodes().eq(0);
  const getSiblings = () => getFirstAbove().outgoers().nodes().sort((e1, e2) => e1.position('x') - e2.position('x'));

  const getNextSibling = (i) => {
    const siblings = getSiblings();
    const siblingIds = siblings.map(s => s.id());
    const index = siblingIds.indexOf(selected.id());
    return siblings[(index + i + siblingIds.length) % siblingIds.length];
  }
  
  const openModal = () => {
    $modal.show();
    $goalInput.focus();
  }

  initCy();

  cy.on('select', (e) => {
    selectNode(e.target);
  });

  $goalInput.blur(() => {
    $modal.hide();
  })

  $('#new').submit((e) => {
    e.preventDefault();
    addNode($goalInput.val());
    $goalInput.val('');
    $goalInput.blur();
    $modal.hide();
  });


  new autoComplete({
    data: {
      // src: () => {
      //   console.log('hello?', nodes);
      //   return nodes;
      // },
      src: ['hello', 'goodbye', 'yolo'],
      // key: ['label'],
      cache: true,
    },
    searchEngine: 'loose',
  })

  Mousetrap.bind('ctrl+n', () => {
    openModal();
  });

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