var width = 1000;
var height = 1000;
var color = ["#D2CDF7", "#BBA1F7", "#A790DE", "#8E7ABB", "#5A4E78"];

const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height);

d3.csv("data/dataset.csv").then(function(data) {
    //console.log(data);
    const hierarchy = buildHierarchy(data);
    const root = d3.pack()
        .size([width - 2, height - 2])
        .padding(3)
        (d3.hierarchy(hierarchy)
            .sum(d => d.Global_Sales));
    const node = svg.selectAll("g")
        .data(d3.group(root.descendants(), d => d.height))
        .join("g")
        .selectAll("g")
        .data(d => d[1])
        .join("g")
        .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);
    const tooltipHTML = document.getElementById('tooltip');
    node.append("circle")
        .attr("r", d => d.r)
        .attr("fill", d => color[d.height])
        .on("mouseover", (d, i) => {
            console.log("here");
            const[x, y] = [d.screenX, d.screenY];
            tooltipHTML.classList.add('show');
            tooltipHTML.style.transform = "translate(" + x + "px," + y + "px)";
            // tooltip.attr('transform', `translate(${x}, ${y})`);
            var nf = new Intl.NumberFormat();
            if(i.depth === 1) {
                tooltipHTML.innerHTML = `
                    <p><strong>Genre - </strong> ${i.data.name}</p>
                `;
            } else if (i.depth === 2) {
                tooltipHTML.innerHTML = `
                    <p><strong>Genre - </strong> ${i.parent.data.name}</p>
                    <p><strong>Publisher - </strong> ${i.data.name}</p>
                `;
            } else if (i.depth === 3) {
                tooltipHTML.innerHTML = `
                    <p><strong>Genre - </strong> ${i.parent.parent.data.name}</p>
                    <p><strong>Publisher - </strong> ${i.parent.data.name}</p>
                    <p><strong>Platform - </strong> ${i.data.name}</p>
                `;
            } else if (i.depth === 4){
                tooltipHTML.innerHTML = `
                    <p><strong>Genre - </strong> ${i.data.Genre}</p>
                    <p><strong>Publisher - </strong> ${i.data.Publisher}</p>
                    <p><strong>Platform - </strong> ${i.data.Platform}</p>
                    <p><strong>Name - </strong> ${i.data.Name}</p>
                    <p><strong>Global_Sales - </strong> $${nf.format(i.data.Global_Sales)}millions</p>
                `;
            }
        })
        .on('mouseleave', () => {
            tooltip.classList.remove('show');
        });
});

function buildHierarchy(csv) {
    var root = { name: "root", children: [], id: "ROOT" };
    var parents = ['Genre', 'Publisher', 'Platform', 'Name'];
    for (var i = 0; i < csv.length; i++) {
        var sequence = csv[i];
        var size = +csv[i].Global_Sales;
        // console.log(sequence);
        // console.log(size);
        if (isNaN(size)) {
            continue;
        }
        var currentNode = root;
        for (var j = 0; j < parents.length; j++) {
            var children = currentNode["children"];
            var nodeName = sequence[parents[j]];
            var childNode;
            if (j + 1 < parents.length) {
                var foundChild = false;
                for (var k = 0; k < children.length; k++) {
                    // console.log(k);
                    if (children[k]["name"] == nodeName) {
                        childNode = children[k];
                        foundChild = true;
                        break;
                    }
                }
                if (!foundChild) {
                    childNode = { name: nodeName, children: [] };
                    children.push(childNode);
                }
                currentNode = childNode;
            } else {
                childNode = { Name: nodeName, NA_Sales: +csv[i].NA_Sales,
                    EU_Sales: +csv[i].EU_Sales, JP_Sales: +csv[i].JP_Sales,
                    Other_Sales: +csv[i].Other_Sales, Global_Sales: size,
                    Platform: csv[i].Platform, Genre: csv[i].Genre, Publisher: csv[i].Publisher };
                children.push(childNode);
            }
        }
    }
    //console.log(root);
    return root;
}