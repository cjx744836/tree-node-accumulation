function findLeaf(tree) {
    var stack = [tree], leafs = [];
    while(stack.length) {
        var o = stack.shift();
        if(o.children) {
            o.children.forEach(d => {
                d.parent = o;
                stack.push(d);
            });
        } else {
            leafs.push(o);
        }
    }
    return leafs;
}

function calcNode(nodes) {
    var stack = nodes;
    while(stack.length) {
        var o = stack.shift();
        if(!o.calc) o.calc = o.value;
        if(o.parent) {
            if(!o.parent.calc) o.parent.calc = o.parent.value;
            o.parent.calc += o.calc;
            if(!o.parent.is_calc) {
                o.parent.is_calc = 1;
                stack.push(o.parent);
            }
        }
    }
}

function compareNode(tree) {
    tree.is_big = 1;
    delete tree.is_calc;
    delete tree.parent;
    var stack = [tree];
    while(stack.length) {
        var o = stack.shift();
        if(o.children) {
            var tmp = {calc: -9999999}, max = -9999999;
            o.children.forEach(d => {
                if(d.calc >= max) {
                    if(tmp.calc < d.calc) tmp.is_big = 0;
                    d.is_big = 1;
                    tmp = d;
                    max = d.calc;
                } else {
                    d.is_big = 0;
                }
                delete d.is_calc;
                delete d.parent;
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
    if((1 - Math.pow(node, deep)) / (1 - node) > 1000000) throw new Error('too large!!!');
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
    var tree, leafs, st, txt;

    st = Date.now();
    tree = genTree(e.data.deep, e.data.node, e.data.value);
    txt = '生成节点耗时：' + (Date.now() - st) / 1000 + 's';
    this.postMessage({txt: txt});

    st = Date.now();
    leafs = findLeaf(tree);
    calcNode(leafs);
    txt = '节点累加耗时：' + (Date.now() - st) / 1000 + 's';
    this.postMessage({txt: txt});

    st = Date.now();
    compareNode(tree);
    txt = '节点比较耗时：' + (Date.now() - st) / 1000 + 's';
    this.postMessage({txt: txt, tree: tree});
};