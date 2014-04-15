var WIDTH = 800;
var HEIGHT = 600;

var ctx = initCanvas();
var g_graph, g_algo, g_order, g_used_colors, g_iter;

var colorAllButton = document.getElementById("colorall");
var colorNextButton = document.getElementById("nextstep");

newGraph("random8");
draw(g_graph, g_order, g_algo, g_iter, g_used_colors);


// Color all nodes
function colorAll() {
    var hasNextStep = true;

    while (hasNextStep) {
        hasNextStep = nextStep();
    }
}


// Run next step of the coloring algorithm
function nextStep() {
    var old_used_colors;

    if (g_iter < g_graph.size) {
        if (g_algo === "RLF") {
            old_used_colors = g_used_colors;
            g_used_colors = RLFStepColor(g_graph, g_iter, g_used_colors);

            if (g_used_colors > old_used_colors && g_iter > 0) {
                g_iter--;
            }
        } else {
            g_used_colors = seqStepColor(g_graph, g_order[g_iter], g_used_colors);
        }
        g_iter++;

        draw(g_graph, g_order, g_algo, g_used_colors);
    } else if (g_algo === "RLF") {
        colorAllButton.disabled = true;
        colorNextButton.disabled = true;
        draw(g_graph, g_order, "RND", g_used_colors);

        return false;
    }
    if (g_algo !== "RLF" && g_iter === g_graph.size) {
        colorAllButton.disabled = true;
        colorNextButton.disabled = true;

        return false;
    }
    return true;
}


// Prepare new graph for coloring
function newGraph(type) {
    var i;

    if (type === undefined) {
        g_graph = new Graph(g_graph.type);
    } else {
        g_graph = new Graph(type);
    }
    g_order = new Array(g_graph.size);

    for (i = 0; i < g_graph.size; i++) {
        g_order[i] = i;
    }
    if (g_algo === "RND") {
        RNDalgo();
    } else if (g_algo === "LF") {
        LFalgo();
    } else if (g_algo === "RLF") {
        RLFalgo();
    } else {
        RNDalgo();
    }
    resetColoring();

    colorAllButton.disabled = false;
    colorNextButton.disabled = false;
}


// Switch to RND algorithm
function RNDalgo() {
    if (g_algo !== "RND") {
        g_algo = "RND";
        g_order.sort(function () {
            return 0.5 - Math.random();
        });
        resetColoring();
    }
    colorAllButton.disabled = false;
    colorNextButton.disabled = false;
}


// Switch to LF algorithm
function LFalgo() {
    if (g_algo !== "LF") {
        g_algo = "LF";
        g_order.sort(function (i, j) {
            return g_graph.edges[j].length - g_graph.edges[i].length;
        });
        resetColoring();
    }
    colorAllButton.disabled = false;
    colorNextButton.disabled = false;
}


// Switch to RLF algorithm
function RLFalgo() {
    if (g_algo !== "RLF") {
        g_algo = "RLF";
        g_order.sort(function () {
            return 0.5 - Math.random();
        });
        resetColoring();
    }
    colorAllButton.disabled = false;
    colorNextButton.disabled = false;
}


// Generate new random graph
function newRandom8() {
    if (g_graph.type !== "random8") {
       newGraph("random8");
    }
}


// Generate new random graph
function newRandom16() {
    if (g_graph.type !== "random16") {
       newGraph("random16");
    }
}


// Generate new clique graph
function newClique() {
    if (g_graph.type !== "clique") {
       newGraph("clique");
    }
}


// Generate new envelope graph
function newEnvelope() {
    if (g_graph.type !== "envelope") {
       newGraph("envelope");
    }
}


// Draw nodes
function draw(graph, order, algo, used_colors) {
    var coords = getNodeCoords(graph.size, graph.type);
    var i, j;

    clearCanvas();

    // Draw edges between nodes
    for (i = 0; i < graph.size; i++) {
        for (j = i + 1; j < graph.size; j++) {
            if (graph.adj(order[i], order[j])) {
                ctx.beginPath();
                ctx.moveTo(coords[order[i]][0], coords[order[i]][1]);
                ctx.lineTo(coords[order[j]][0], coords[order[j]][1]);
                ctx.lineWidth = 2;

                if (algo === "RLF") {
                    if (graph.color[order[i]] >= 0 || graph.color[order[j]] >= 0
                     || isInU2(order[i], graph, used_colors) && isInU2(order[j], graph, used_colors)) {
                        ctx.strokeStyle = "#CCCCCC";
                    } else if (isInU1(order[i], graph, used_colors) && isInU2(order[j], graph, used_colors)
                            || isInU2(order[i], graph, used_colors) && isInU1(order[j], graph, used_colors)) {
                        ctx.strokeStyle = "#FF0000";
                    } else {
                        ctx.strokeStyle = "#000000";
                    }
                } else {
                    ctx.strokeStyle = '#000000';
                }
                ctx.stroke();
            }
        }
    }

    // Draw nodes
    for (i = 0; i < graph.size; i++) {
        ctx.beginPath();
        ctx.arc(coords[order[i]][0], coords[order[i]][1], 10, 0, 2*Math.PI);

        if (algo === "RLF" && isInU2(order[i], graph, used_colors)) {
            ctx.fillStyle = "#CCCCCC";
            ctx.strokeStyle = '#CCCCCC';
        } else {
            ctx.fillStyle = toString(graph.color[order[i]]);
            ctx.strokeStyle = '#000000';
        }
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}


// Calculate coordinates of nodes
function getNodeCoords(size, type) {
    var coords = [size];
    var center_x = WIDTH/2;
    var center_y = HEIGHT/2;
    var radius = Math.min(WIDTH, HEIGHT)/2 - 20;
    var angle;
    var i;

    if (type === "envelope") {
        coords[0] = [WIDTH/4,   HEIGHT/4];
        coords[1] = [3*WIDTH/4, HEIGHT/4];
        coords[2] = [WIDTH/2, HEIGHT/2];
        coords[3] = [WIDTH/4, 3*HEIGHT/4];
        coords[4] = [3*WIDTH/4, 3*HEIGHT/4];
        coords[5] = [WIDTH/2, HEIGHT/4];
        coords[6] = [WIDTH/2, 15];
    } else {
        for (i = 0; i < size; i++) {
            angle = 2*Math.PI / size * i;
            coords[i] = [center_x + Math.cos(angle)*radius,
                         center_y - Math.sin(angle)*radius];
        }
    }
    return coords;
}


// Initialize canvas
function initCanvas() {
    var c = document.getElementById('content');
    c.width = WIDTH;
    c.height = HEIGHT;

    return c.getContext('2d');
}


// Clear canvas
function clearCanvas() {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.closePath();
    ctx.fill();
}


// Reset coloring
function resetColoring() {
    g_used_colors = 0;
    g_iter = 0;

    g_graph.clearColors();
    draw(g_graph, g_order, g_algo, g_used_colors);
}


// Return color name based on integer value
function toString(color) {
    var colors = ['red' , 'yellow', 'blue', 'fuchsia', 'green', 'purple',
                  'orange', 'maroon', 'navy', 'olive', 'lime', 'aqua',
                  'silver', 'teal', 'gray'];

    if (color === -1) {
        return 'black';
    } else if (color >= colors.length) {
        return 'white';
    } else {
        return colors[color];
    }
}


// Undirected graph
function Graph(type) {
    // Add undirected edge
    this.addEdge = function(v, w) {
        this.edges[v].push(w);
        this.edges[w].push(v);
    };

    // Are v and w adjacent?
    this.adj = function(v, w) {
        return this.edges[v].indexOf(w) !== -1;
    };

    // Is v adjacent to a node colored c?
    this.adjacentToColor = function(v, c) {
        var w;
        var i;

        for (i = 0; i < this.edges[v].length; i++) {
            w = this.edges[v][i];

            if (this.color[w] === c) {
                return true;
            }
        }
        return false;
    };

    // Clear coloring of all nodes
    this.clearColors = function() {
        var i;

        for (i = 0; i < this.size; i++) {
            this.color[i] = -1;
        }
    };

    // Initialize edges and colors
    this.init = function(size) {
        this.size = size;
        this.edges = new Array(size);
        this.color = new Array(size);

        for (i = 0; i < size; i++) {
            this.edges[i] = [];
            this.color[i] = -1;
        }
    };

    // Construct n node graph
    var i, j;
    var edge_prob = 0.35;

    this.type = type;

    if (type === "random8") {
        this.init(8);

        for (i = 0; i < this.size - 1; i++) {
            for (j = i + 1; j < this.size; j++) {
                if (Math.random() < edge_prob) {
                    this.addEdge(i, j);
                }
            }
        }
    } else if (type === "random16") {
        this.init(16);

        for (i = 0; i < this.size - 1; i++) {
            for (j = i + 1; j < this.size; j++) {
                if (Math.random() < edge_prob) {
                    this.addEdge(i, j);
                }
            }
        }
    } else if (type === "clique") {
        this.init(8);

        for (i = 0; i < this.size - 1; i++) {
            for (j = i + 1; j < this.size; j++) {
                this.addEdge(i, j);
            }
        }
    } else if (type === "envelope") {
        this.init(7);

        this.addEdge(0, 2);
        this.addEdge(0, 3);
        this.addEdge(0, 5);
        this.addEdge(0, 6);
        this.addEdge(1, 2);
        this.addEdge(1, 4);
        this.addEdge(1, 5);
        this.addEdge(1, 6);
        this.addEdge(2, 3);
        this.addEdge(2, 4);
        this.addEdge(3, 4);
    } else {
        throw "Invalid graph type: " + type;
    }
}


// Color the next node of the node sequential algorithm
function seqStepColor(graph, v, used_colors) {
    var adj_colors = new Array(used_colors);
    var w;
    var i;

    for (i = 0; i < used_colors; i++) {
        adj_colors[i] = false;
    }
    for (i = 0; i < graph.edges[v].length; i++) {
        w = graph.edges[v][i];

        if (graph.color[w] >= 0) {
            adj_colors[graph.color[w]] = true;
        }
    }
    for (i = 0; i < used_colors; i++) {
        if (!adj_colors[i]) {
            graph.color[v] = i;
            break;
        }
    }
    if (graph.color[v] === -1) {
        graph.color[v] = used_colors;
        used_colors++;
    }
    return used_colors;
}


var E;
var F;
var next;


// Color the next node of the RLF algorithm
function RLFStepColor(graph, iter, used_colors) {
    var i;

    if (iter === 0) {
        RLFinit(graph);
    }
    if (iter < graph.size) {
        if (E[next] < 0 || iter === 0) {
            used_colors++;

            for (i = 0; i < graph.size; i++) {
                if (F[i] > F[next]) {
                    next = i;
                }
                E[i] = F[i];
            }
            if (iter !== 0) {
                return used_colors;
            }
        }
        graph.color[next] = used_colors - 1;
        updateEandF(graph, next);
        next = findNextInU1(next, graph.size);
    }
    return used_colors;
}


// Initialize state variables for RLF
function RLFinit(graph) {
    var i;

    E = [graph.size];
    F = [graph.size];
    next = 0;

    for (i = 0; i < graph.size; i++) {
        E[i] = F[i] = graph.edges[i].length;
    }
}


// Update E and F after node next has just been colored
function updateEandF(graph, next) {
    var v;
    var i;

    update(E, next, graph);
    update(F, next, graph);

    for (i = 0; i < graph.edges[next].length; i++) {
        v = graph.edges[next][i];

        if (E[v] >= 0) {
            update(E, v, graph);
        }
    }
}


// Update array D according to node v
function update(D, v, graph) {
    var w;
    var i;

    D[v] = -1;

    for (i = 0; i < graph.edges[v].length; i++) {
        w = graph.edges[v][i];
        D[w] -= 1;
    }
}


// Find the next uncolored node in U1
function findNextInU1(next, n) {
    var i = 0;

    while (i < n && E[i] < 0) {
        i++;
    }
    if (i < n) {
        next = i;

        for (i = i + 1; i < n; i++) {
            if (E[i] >= 0) {
                if (F[i] - E[i] > F[next] - E[next]) {
                    next = i;
                } else if (F[i] - E[i] == F[next] - E[next]) {
                    if (E[i] < E[next]) {
                        next = i;
                    }
                }
            }
        }
    }
    return next;
}


// Is node v in U2?
function isInU2(v, graph, used_colors) {
    return used_colors > 0 && graph.color[v] < 0 && graph.adjacentToColor(v, used_colors-1);

}

// Is node v in U1?
function isInU1(v, graph, used_colors) {
    return !isInU2(v, graph, used_colors) && graph.color[v] < 0;
}
