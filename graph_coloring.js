var WIDTH = 400;
var HEIGHT = 400;
var DEFAULT_COLOR = "#000000";
var U2_COLOR = "#e6e6e6";
var U2_EDGE_COLOR = "#ee5f5b";

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
    switchAlgo(g_algo);
    draw(g_graph, g_algo, g_order);
}


// Switch coloring algorithm
function switchAlgo(algo) {
    var algos = ["RND", "SF", "LF", "SL", "RLF"];

    if (algos.indexOf(algo) === -1) {
        throw "Invalid algorithm type: " + algo;
    }
    g_algo = algo;
    g_graph.sortNodes(algo, g_order);
    resetColoring();
    draw(g_graph, g_algo, g_order);
}


// Switch graph type
function switchGraph(type) {
    if (g_graph.type() !== type) {
        newGraph(type);
    }
}


// Reset graph coloring and buttons
function resetColoring() {
    g_hasNextStep = true;
    g_graph.clearColors();
    colorAllButton.disabled = false;
    colorNextButton.disabled = false;
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


// Draw nodes
function draw(graph, algo, order) {
    var coords = getNodeCoords(graph.size(), graph.type());
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


// Return color of edge (v, w)
function getEdgeColor(graph, algo, v, w) {
    if (algo === "RLF" && graph.coloredNodes() <= graph.size()) {
        if (graph.color(v) >= 0 || graph.color(w) >= 0 || (graph.isInU2(v) && graph.isInU2(w))) {
            return U2_COLOR;
        } else if ((graph.isInU1(v) && graph.isInU2(w)) || (graph.isInU1(w) && graph.isInU2(v))) {
            return U2_EDGE_COLOR;
        }
    }
    return DEFAULT_COLOR;
}


// Return color of node v
function getNodeColor(graph, algo, v) {
    if (algo === "RLF" && graph.isInU2(v)) {
        return U2_COLOR;
    }
    return colorToString(graph.color(v));
}


// Return border color of node v
function getNodeBorderColor(graph, algo, v) {
    if (algo === "RLF" && graph.isInU2(v)) {
        return U2_COLOR;
    }
    return DEFAULT_COLOR;
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
        coords[0] = [WIDTH/4, HEIGHT/4];
        coords[1] = [3*WIDTH/4, HEIGHT/4];
        coords[2] = [WIDTH/2, HEIGHT/2];
        coords[3] = [WIDTH/4, 3*HEIGHT/4];
        coords[4] = [3*WIDTH/4, 3*HEIGHT/4];
        coords[5] = [WIDTH/2, HEIGHT/4];
        coords[6] = [WIDTH/2, 15];
    } else if (type === "prismatoid") {
        coords[0] = [WIDTH/2, 15];
        coords[1] = [WIDTH - 15, HEIGHT/2];
        coords[2] = [WIDTH/2, HEIGHT - 15];
        coords[3] = [15, HEIGHT/2];
        coords[4] = [WIDTH/3, HEIGHT/3];
        coords[5] = [2*WIDTH/3, HEIGHT/3];
        coords[6] = [2*WIDTH/3, 2*HEIGHT/3];
        coords[7] = [WIDTH/3, 2*HEIGHT/3];
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
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.closePath();
    ctx.fill();
}


// Return color name based on integer value
function colorToString(i) {
    var colors = ["#0088cc", "#fbb450", "#ee5f5b", "#62c462", "#7d47b7",
                  "#87623f", "#468446", "#f7f785", "#961313", "#5bc0de"];

    if (i === -1) {
        return DEFAULT_COLOR;
    } else if (i >= colors.length) {
        console.log("Color higher than available: " + i);
        return "#ffffff";
    } else {
        return colors[i];
    }
}


// Undirected graph
function Graph(type) {
    // Construct n node graph
    var size;
    var edges;
    var color;
    var used_colors = 0;
    var next = 0;
    var colored_nodes = 0;
    var skip_on_new_color = false;
    var E, F;

    var i, j;
    var edge_prob = 0.40;

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
    } else if (type === "random32") {
        init(32);

        for (i = 0; i < size - 1; i++) {
            for (j = i + 1; j < size; j++) {
                if (Math.random() < edge_prob) {
                    addEdge(i, j);
                }
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
    } else if (type === "prismatoid") {
        init(8);

        addEdge(0, 3);
        addEdge(0, 4);
        addEdge(0, 5);
        addEdge(0, 1);
        addEdge(1, 5);
        addEdge(1, 6);
        addEdge(1, 2);
        addEdge(2, 6);
        addEdge(2, 7);
        addEdge(2, 3);
        addEdge(3, 7);
        addEdge(3, 4);
        addEdge(4, 5);
        addEdge(4, 7);
        addEdge(5, 6);
        addEdge(6, 7);
    } else {
        throw "Invalid graph type: " + type;
    }

    // Are v and w adjacent?
    this.adjacent = function (v, w) {
        return edges[v].indexOf(w) !== -1;
    };

    // Return color of v
    this.color = function (v) {
        return color[v];
    };

    // Return number of nodes colored so far
    this.coloredNodes = function () {
        return colored_nodes;
    };

    // Clear coloring of all nodes
    this.clearColors = function () {
        var i;

        next = 0;
        colored_nodes = 0;
        used_colors = 0;
        skip_on_new_color = false;

        RLFinit();

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

    // Return number of nodes
    this.size = function () {
        return size;
    };

    // Sort nodes according to algorithm
    this.sortNodes = function (algo, order) {
        if (algo === "RND") {
            randomOrder(order);
        } else if (algo === "SF") {
            randomOrder(order);
            order.sort(function (i, j) {
                return degree(i) - degree(j);
            });
        } else if (algo === "LF") {
            randomOrder(order);
            order.sort(function (i, j) {
                return degree(j) - degree(i);
            });
        } else if (algo === "SL") {
            order.sort(function (i, j) {
                return i - j;
            });
            SLsort(order);
        } else if (algo === "RLF") {
            // No initial randomization/sorting
        } else {
            throw "Invalid algorithm: " + algo;
        }
    };

    // Return graph type (random8, envelope, ...)
    this.type = function () {
        return type;
    };

    // Color the next node according to algorithm
    this.stepColor = function (algo, order) {
        var v = order[colored_nodes];

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
        colored_nodes++;

        return colored_nodes < size;
    }

    // Color the next node of the RLF algorithm
    function RLFStepColor() {
        var i;

        if (colored_nodes === 0) {
            next = Math.floor(Math.random() * size);
        }
        if (colored_nodes < size) {
            if (E[next] < 0 || colored_nodes === 0) {
                for (i = 0; i < size; i++) {
                    if (F[i] > F[next]) {
                        next = i;
                    }
                    E[i] = F[i];
                }
                used_colors++;

                if (skip_on_new_color) {
                    skip_on_new_color = false;
                    return true;
                }
            }
            skip_on_new_color = true;
            color[next] = used_colors - 1;
            updateEandF(next);
            next = findNextInU1(next);
        }
        colored_nodes++;

        return colored_nodes <= size;
    }

    // Initialize state variables for RLF (arrays E and F)
    function RLFinit() {
        var i;

        E = [size];
        F = [size];

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

    // Update array D according to node v (delete procedure)
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
    function findNextInU1(next) {
        var i = 0;

        while (i < size && E[i] < 0) {
            i++;
        }
        if (i < size) {
            next = i;

            for (i = i + 1; i < size; i++) {
                if (E[i] >= 0) {
                    if (F[i] - E[i] > F[next] - E[next]) {
                        next = i;
                    } else if (F[i] - E[i] === F[next] - E[next]) {
                        if (E[i] < E[next]) {
                            next = i;
                        }
                    }
                }
            }
        }
        return next;
    }

    // Add undirected edge between v and w
    function addEdge(v, w) {
        edges[v].push(w);
        edges[w].push(v);
    }

    // Degree of node v
    function degree(v) {
        return edges[v].length;
    }

    // Order nodes randomly
    function randomOrder(order) {
        order.sort(function () {
            return 0.5 - Math.random();
        });
    }

    // Sort nodes in SL order
    function SLsort(order) {
        var sl_degree = new Array(size);
        var v, w;
        var i, j;

        for (i = 0; i < size; i++) {
            sl_degree[i] = degree(i);
        }
        swapSL(order, sl_degree, size - 1);

        for (i = size - 1; i > 0; i--) {
            v = order[i];

            for (j = 0; j < degree(v); j++) {
                w = edges[v][j];
                sl_degree[w]--;
            }
            swapSL(order, sl_degree, i - 1);
        }
    }

    // Swap the nodes with smallest degree to index l in order
    function swapSL(order, sl_degree, l) {
        var min_index = Math.floor(Math.random() * (l + 1));
        var min = order[min_index];
        var i, v;
        var tmp;

        for (i = 0; i <= l; i++) {
            v = order[i];

            if (sl_degree[v] < sl_degree[min]) {
                min = v;
                min_index = i;
            }
        }
        tmp = order[l];
        order[l] = order[min_index];
        order[min_index] = tmp;
    }
}
