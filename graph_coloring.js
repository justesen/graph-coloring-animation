var WIDTH = 400;
var HEIGHT = 400;

var ctx = initCanvas();
var g_graph, g_algo, g_order, g_hasNextStep;

var colorAllButton = document.getElementById("colorall");
var colorNextButton = document.getElementById("nextstep");

g_algo = "RND";
newGraph("random8");


// Color all nodes
function colorAll() {
    var hasNextStep = true;

    while (hasNextStep) {
        hasNextStep = nextStep();
    }
}


// Run next step of the coloring algorithm
function nextStep() {
    if (g_hasNextStep) {
        g_hasNextStep = g_graph.stepColor(g_algo, g_order);
        draw(g_graph, g_algo, g_order);
    }
    if (!g_hasNextStep) {
        colorAllButton.disabled = true;
        colorNextButton.disabled = true;
    }
    return g_hasNextStep;
}


// Prepare new graph for coloring
function newGraph(type) {
    if (type === undefined) {
        g_graph = new Graph(g_graph.type());
    } else {
        g_graph = new Graph(type);
    }
    g_order = resetOrder(g_graph.size());
    resetColoring();

    if (g_algo === "RND") {
        RNDalgo();
    } else if (g_algo === "LF") {
        LFalgo();
    } else if (g_algo === "SL") {
        SLalgo();
    } else if (g_algo === "RLF") {
        RLFalgo();
    } else {
        throw "Invalid algorithm type: " + g_algo;
    }
    draw(g_graph, g_algo, g_order);
}


// Reset graph coloring and buttons
function resetColoring() {
    g_hasNextStep = true;
    g_graph.clearColors();
    colorAllButton.disabled = false;
    colorNextButton.disabled = false;
}


// Switch to RND algorithm
function RNDalgo() {
    if (g_algo !== "RND") {
        g_algo = "RND";
        g_graph.sortNodes("RND", g_order);
    }
    resetColoring();
    draw(g_graph, g_algo, g_order);
}


// Switch to LF algorithm
function LFalgo() {
    if (g_algo !== "LF") {
        g_algo = "LF";
        g_graph.sortNodes("LF", g_order);
    }
    resetColoring();
    draw(g_graph, g_algo, g_order);
}


// Switch to SL algorithm
function SLalgo() {
    if (g_algo !== "SL") {
        g_algo = "SL";
        g_graph.sortNodes("SL", g_order);
    }
    resetColoring();
    draw(g_graph, g_algo, g_order);
}


// Switch to RLF algorithm
function RLFalgo() {
    if (g_algo !== "RLF") {
        g_algo = "RLF";
        g_graph.sortNodes("RLF", g_order);
    }
    resetColoring();
    draw(g_graph, g_algo, g_order);
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
function draw(graph, algo, order) {
    var coords = getNodeCoords(graph.size(), graph.type);
    var v, w;
    var i, j;

    clearCanvas();

    // Draw edges between nodes
    for (i = 0; i < graph.size(); i++) {
        for (j = i + 1; j < graph.size(); j++) {
            v = order[i];
            w = order[j];

            if (graph.adjacent(v, w)) {
                ctx.beginPath();
                ctx.moveTo(coords[v][0], coords[v][1]);
                ctx.lineTo(coords[w][0], coords[w][1]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = getEdgeColor(graph, algo, v, w);
                ctx.stroke();
            }
        }
    }

    // Draw nodes
    for (i = 0; i < graph.size(); i++) {
        v = order[i];
        ctx.beginPath();
        ctx.arc(coords[v][0], coords[v][1], 10, 0, 2*Math.PI);
        ctx.fillStyle = getNodeColor(graph, algo, v);
        ctx.strokeStyle = getNodeBorderColor(graph, algo, v);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}


function getEdgeColor(graph, algo, v, w) {
    if (algo === "RLF") {
        if (graph.color(v) >= 0 || graph.color(w) >= 0 || (graph.isInU2(v) && graph.isInU2(w))) {
            return "#CCCCCC";
        } else if ((graph.isInU1(v) && graph.isInU2(w)) || (graph.isInU1(w) && graph.isInU2(v))) {
            return "#FF0000";
        }
    }
    return "#000000";
}


function getNodeColor(graph, algo, v) {
    if (algo === "RLF" && graph.isInU2(v)) {
        return "#CCCCCC";
    }
    return colorToString(graph.color(v));
}


function getNodeBorderColor(graph, algo, v) {
    if (algo === "RLF" && graph.isInU2(v)) {
        return "#CCCCCC";
    }
    return "#000000";
}


// Calculate coordinates of nodes
function getNodeCoords(size, type) {
    var coords = new Array(size);
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


// Return color name based on integer value
function colorToString(i) {
    var colors = ['red' , 'yellow', 'blue', 'fuchsia', 'green', 'purple',
                  'orange', 'maroon', 'navy', 'olive', 'lime', 'aqua',
                  'silver', 'teal', 'gray'];

    if (i === -1) {
        return 'black';
    } else if (i >= colors.length) {
        console.log("Color higher than available: " + i);
        return 'white';
    } else {
        return colors[i];
    }
}


// Reset order
function resetOrder(size) {
    var order = new Array(size);
    var i;

    for (i = 0; i < size; i++) {
        order[i] = i;
    }
    return order;
}


// Undirected graph
function Graph(type) {
    // Construct n node graph
    var size;
    var edges;
    var color;
    var used_colors = 0;
    var next;
    var iter = 0;
    var E, F;

    var i, j;
    var edge_prob = 0.35;

    RLFinit();

    if (type === "random8") {
        init(8);

        for (i = 0; i < size - 1; i++) {
            for (j = i + 1; j < size; j++) {
                if (Math.random() < edge_prob) {
                    addEdge(i, j);
                }
            }
        }
    } else if (type === "random16") {
        init(16);

        for (i = 0; i < size - 1; i++) {
            for (j = i + 1; j < size; j++) {
                if (Math.random() < edge_prob) {
                    addEdge(i, j);
                }
            }
        }
    } else if (type === "clique") {
        init(8);

        for (i = 0; i < size - 1; i++) {
            for (j = i + 1; j < size; j++) {
                addEdge(i, j);
            }
        }
    } else if (type === "envelope") {
        init(7);

        addEdge(0, 2);
        addEdge(0, 3);
        addEdge(0, 5);
        addEdge(0, 6);
        addEdge(1, 2);
        addEdge(1, 4);
        addEdge(1, 5);
        addEdge(1, 6);
        addEdge(2, 3);
        addEdge(2, 4);
        addEdge(3, 4);
    } else {
        throw "Invalid graph type: " + type;
    }

    // Are v and w adjacent?
    this.adjacent = function (v, w) {
        return edges[v].indexOf(w) !== -1;
    };

    this.color = function (v) {
        return color[v];
    };

    // Clear coloring of all nodes
    this.clearColors = function () {
        var i;

        next = 0;
        iter = 0;
        used_colors = 0;

        for (i = 0; i < size; i++) {
            color[i] = -1;
        }
    };

    // Is node v in U1?
    this.isInU1 = function (v) {
        return E[v] >= 0;
    };

    // Is node v in U2?
    this.isInU2 = function (v) {
        return E[v] < 0 && F[v] >= 0;
    };

    this.size = function () {
        return size;
    };

    // Sort nodes according to algorithm
    this.sortNodes = function (algo, order) {
        if (algo === "RND") {
            order.sort(function () {
                return 0.5 - Math.random();
            });
        } else if (algo === "LF") {
            order.sort(function (i, j) {
                return degree(j) - degree(i);
            });
        } else if (algo === "SL") {
            SLsort(order);
        } else if (algo === "RLF") {
            // No initial randomization/sorting
        } else {
            throw "Invalid algorithm: " + algo;
        }
    };

    this.type = function () {
        return type;
    };

    // Color the next node according to algorithm
    this.stepColor = function (algo, order) {
        var v = order[iter];

        if (algo === "RLF") {
            return RLFStepColor();
        } else {
            return seqStepColor(v);
        }
    };

    // Initialize edges and colors
    function init(n) {
        size = n;
        edges = new Array(size);
        color = new Array(size);

        for (i = 0; i < size; i++) {
            edges[i] = [];
            color[i] = -1;
        }
    }

    // Add undirected edge
    function addEdge(v, w) {
        edges[v].push(w);
        edges[w].push(v);
    }

    // Degree of node v
    function degree(v) {
        return edges[v].length;
    }

    // Sort nodes in SL order
    function SLsort(order) {
        var sl_degree = new Array(size);
        var v;
        var i, j;

        for (i = 0; i < size; i++) {
            sl_degree[i] = degree(i);
        }
        swapSL(order, sl_degree, size - 1);

        for (i = size - 1; i > 0; i--) {
            for (j = 0; j < degree(i); j++) {
                v = edges[i][j];
                sl_degree[v]--;
            }
            swapSL(order, sl_degree, i - 1);
        }
    }

    // Swap the nodes with smallest degree to index l in order
    function swapSL(order, sl_degree, l) {
        var min_index = l;
        var i, tmp;

        for (i = 0; i < l; i++) {
            if (sl_degree[i] < sl_degree[min_index]) {
                min_index = i;
            }
        }
        tmp = order[l];
        order[l] = order[min_index];
        order[min_index] = tmp;
    }

    // Color the next node of the node sequential algorithm
    function seqStepColor(v) {
        var adj_colors = new Array(used_colors);
        var w;
        var i;

        for (i = 0; i < used_colors; i++) {
            adj_colors[i] = false;
        }
        for (i = 0; i < degree(v); i++) {
            w = edges[v][i];

            if (color[w] >= 0) {
                adj_colors[color[w]] = true;
            }
        }
        for (i = 0; i < used_colors; i++) {
            if (!adj_colors[i]) {
                color[v] = i;
                break;
            }
        }
        if (color[v] === -1) {
            color[v] = used_colors;
            used_colors++;
        }
        iter++;

        return iter < size;
    }

    // Color the next node of the RLF algorithm
    function RLFStepColor() {
        var hasNextStep = true;
        var i;

        if (iter === 0) {
            RLFinit();
        }
        if (iter < size) {
            if (E[next] < 0 || iter === 0) {
                used_colors++;

                for (i = 0; i < size; i++) {
                    if (F[i] > F[next]) {
                        next = i;
                    }
                    E[i] = F[i];
                }
                if (iter !== 0) {
                    iter--;
                }
            }
            color[next] = used_colors - 1;
            updateEandF(next);
            next = findNextInU1(next, size);
            iter++;
        }
        return hasNextStep;
    }

    // Initialize state variables for RLF
    function RLFinit() {
        var i;

        E = [size];
        F = [size];
        next = 0;

        for (i = 0; i < size; i++) {
            E[i] = F[i] = degree(i);
        }
    }

    // Update E and F after node next has just been colored
    function updateEandF(next) {
        var v;
        var i;

        update(E, next);
        update(F, next);

        for (i = 0; i < degree(next); i++) {
            v = edges[next][i];

            if (E[v] >= 0) {
                update(E, v);
            }
        }
    }

    // Update array D according to node v
    function update(D, v) {
        var w;
        var i;

        D[v] = -1;

        for (i = 0; i < degree(v); i++) {
            w = edges[v][i];
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
}
