//从根结点遍历
function sumNodeRoot(tree) {
    sumNode(tree);
    function sumNode(tree) {
        var stack = [tree];
        while(stack.length) {
            var o = stack.shift();
            o._h = calcNode(o);
            if(o.children) {
                o.children.forEach(d => {
                    stack.push(d);
                });
            }
        }
    }

    function calcNode(node) {
        var stack = [node], sum = 0;
        while(stack.length) {
            var o = stack.shift();
            sum += o.value;
            if(o.children) {
                o.children.forEach(d => {
                    stack.push(d);
                });
            }
        }
        return sum;
    }
}

//从叶子结点遍历
function sumNodeLeafs(tree) {
    var map_parent = {};

    calcNode(findLeaf(tree));
    function findLeaf(tree) {
        var stack = [tree], leafs = [];
        tree._deep = 1;
        while(stack.length) {
            var o = stack.shift();
            if(o.children && o.children.length) {
                o.children.forEach(d => {
                    map_parent[d.id] = o;
                    d._deep = o._deep + 1;
                    stack.push(d);
                });
            } else {
                leafs.push(o);
            }
        }
        return leafs;
    }

    function calcNode(nodes) {
        var stack = nodes, tmp = [], map = {}, is_same_deep = false;
        if(nodes[0]._deep === nodes[nodes.length - 1]._deep) {
            is_same_deep = true;
        }
        while(stack.length) {
            if(is_same_deep) {
                stack.forEach(function(o) {
                    if(!o._h) o._h = o.value;
                    if(map_parent[o.id]) {
                        if(!map_parent[o.id]._h) map_parent[o.id]._h = map_parent[o.id].value;
                        map_parent[o.id]._h += o._h;
                        if(!map[o.pid]) {
                            map[o.pid] = 1;
                            tmp.push(map_parent[o.id]);
                        }
                    }
                });
                stack = tmp;
                tmp = [];
                map = {};
            } else {
                var h = [];
                stack.forEach(d => h.push(d._deep));
                var o = stack.pop();
                if(!o._h) o._h = o.value;
                if(map_parent[o.id]) {
                    if(!map_parent[o.id]._h) map_parent[o.id]._h = map_parent[o.id].value;
                    map_parent[o.id]._h += o._h;
                    if(!map[o.pid]) {
                        map[o.pid] = 1;
                        if(stack[0]._deep === map_parent[o.id]._deep) {
                            stack.unshift(map_parent[o.id]);
                        } else {
                            stack.push(map_parent[o.id]);
                            stack.sort(function(a, b) {
                                return a._deep - b._deep;
                            });
                        }
                        is_same_deep = stack[0]._deep === stack[stack.length - 1]._deep;
                    }
                }
            }
        }
    }
}

function compareNode(tree) {
    tree.is_big = 1;
    var stack = [tree];
    while(stack.length) {
        var o = stack.shift();
        if(o.children) {
            var tmp = {_h: -9999999}, max = -9999999;
            o.children.forEach(d => {
                if(d._h >= max) {
                    if(tmp._h < d._h) tmp.is_big = 0;
                    d.is_big = 1;
                    tmp = d;
                    max = d._h;
                } else {
                    d.is_big = 0;
                }
                stack.push(d);
            });
        }
    }
}

function genTree(deep, node, value) {
    var c = {}, n = 0, p;
    var id = 0;
    if(value === 1) randValue = function() {return 1};
    node = (node || 3) | 0;
    if(node < 1) node = 3;
    while(n++ < deep) {
        var m = Math.pow(node, n - 1);
        if(m === 1) {
            c.value = randValue();
            c.id = ++id;
            c.deep = n;
            c.pid = 0;
        } else {
            if(!c.children) {
                p = [c];
            }
            var o = [];
            p.forEach(d => {
                d.children = [];
                for(var i = 0; i < node; i++) {
                    d.children.push({
                        value: randValue(),
                        id: ++id,
                        deep: d.deep + 1,
                        pid: d.id
                    })
                }
                o = o.concat(d.children);
            });
            p = o;
        }
    }
    return c;
}

function randValue() {
    return (Math.random() * 1000).toFixed(0) | 0;
}

this.onmessage = function(e) {
    var tree1, tree2, st, txt;

    if(e.data.tree) {
        tree1 = JSON.parse(JSON.stringify(e.data.tree));
        tree2 = JSON.parse(JSON.stringify(e.data.tree));
        st = Date.now();
        sumNodeRoot(tree1);
        txt = '根节点累加算法耗时：' + (Date.now() - st) / 1000 + 's';
        this.postMessage({txt: txt});

        st = Date.now();
        compareNode(tree1);
        txt = '节点比较耗时：' + (Date.now() - st) / 1000 + 's';
        this.postMessage({txt: txt, tree: tree1, s: 1});

        st = Date.now();
        sumNodeLeafs(tree2);
        txt = '叶子节点累加算法耗时：' + (Date.now() - st) / 1000 + 's';
        this.postMessage({txt: txt});

        st = Date.now();
        compareNode(tree2);
        txt = '节点比较耗时：' + (Date.now() - st) / 1000 + 's';
        this.postMessage({txt: txt, tree: tree2, s: 2});
    } else {
        if((1 - Math.pow(e.data.node, e.data.deep)) / (1 - e.data.node) > 300000) return this.postMessage('注意：超过15万节点，性能严重下降，不计算');
        st = Date.now();
        var tree = genTree(e.data.deep, e.data.node, e.data.value);
        tree1 = JSON.parse(JSON.stringify(tree));
        tree2 = JSON.parse(JSON.stringify(tree));
        txt = '生成节点耗时：' + (Date.now() - st) / 1000 + 's';
        this.postMessage({txt: txt});

        st = Date.now();
        sumNodeRoot(tree1);
        txt = '根节点累加算法耗时：' + (Date.now() - st) / 1000 + 's';
        this.postMessage({txt: txt});

        st = Date.now();
        compareNode(tree1);
        txt = '节点比较耗时：' + (Date.now() - st) / 1000 + 's';
        this.postMessage({txt: txt, tree: tree1, s: 1});

        st = Date.now();
        sumNodeLeafs(tree2);
        txt = '叶子节点累加算法耗时：' + (Date.now() - st) / 1000 + 's';
        this.postMessage({txt: txt});

        st = Date.now();
        compareNode(tree2);
        txt = '节点比较耗时：' + (Date.now() - st) / 1000 + 's';
        this.postMessage({txt: txt, tree: tree2, s: 2});
    }
};