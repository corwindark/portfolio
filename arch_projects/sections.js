let dataset, dataset2, svg
let salarySizeScale, salaryXScale, categoryColorScale
let simulation, nodes
let categoryLegend, salaryLegend




const a = Math.pow(3, 0.25);
// Given an area, compute the side length of a hexagon with that area.
function sideLength(area) {
  return a * Math.sqrt(2 * (area / 9));
}

// Generate the 6 vertices of a unit hexagon.
const basePoints = d3
  .range(6)
  .map(p => (Math.PI / 3) * p)
  .map(p => ({
    x: Math.cos(p),
    y: Math.sin(p)
  }));

const hexagonSymbol = {
  draw: function (context, size) {
    // Scale the unit hexagon's vertices by the desired size of the hexagon.
    const len = sideLength(size);
    const points = basePoints.map(({x, y}) => ({
      x: x * len,
      y: y * len
    }));

    // Move to the first vertex of the hexagon.
    let {x, y} = points[0];
    context.moveTo(x, y);
    // Line-to the remaining vertices of the hexagon.
    for (let p = 1; p < points.length; p++) {
      let {x, y} = points[p];
      context.lineTo(x, y);
    }
    // Close the path to connect the last vertex back to the first.
    context.closePath();
  }
};



const categories = ['Engineering', 'Business', 'Physical Sciences', 'Law & Public Policy', 'Computers & Mathematics', 'Agriculture & Natural Resources',
'Industrial Arts & Consumer Services','Arts', 'Health','Social Science', 'Biology & Life Science','Education','Humanities & Liberal Arts',
'Psychology & Social Work','Communications & Journalism','Interdisciplinary']

const categoriesXY = {'Engineering': [0, 400, 57382, 23.9],
                        'Business': [0, 600, 43538, 48.3],
                        'Physical Sciences': [0, 800, 41890, 50.9],
                        'Law & Public Policy': [0, 200, 42200, 48.3],
                        'Computers & Mathematics': [200, 400, 42745, 31.2],
                        'Agriculture & Natural Resources': [200, 600, 36900, 40.5],
                        'Industrial Arts & Consumer Services': [200, 800, 36342, 35.0],
                        'Arts': [200, 200, 33062, 60.4],
                        'Health': [400, 400, 36825, 79.5],
                        'Social Science': [400, 600, 37344, 55.4],
                        'Biology & Life Science': [400, 800, 36421, 58.7],
                        'Education': [400, 200, 32350, 74.9],
                        'Humanities & Liberal Arts': [600, 400, 31913, 63.2],
                        'Psychology & Social Work': [600, 600, 30100, 79.4],
                        'Communications & Journalism': [600, 800, 34500, 65.9],
                        'Interdisciplinary': [600, 200, 35000, 77.1]}

const margin = {left: 25, top: 150, bottom: 25, right: 30}
const width = 800 - margin.left - margin.right
const height = 800 - margin.top - margin.bottom

//Read Data, convert numerical categories into floats
//Create the initial visualisation


d3.csv('data/recent-grads.csv', function(d){
    return {
        Major: d.Major,
        Total: +d.Total,
        Men: +d.Men,
        Women: +d.Women,
        Median: +d.Median,
        Unemployment: +d.Unemployment_rate,
        Category: d.Major_category,
        ShareWomen: +d.ShareWomen, 
        HistCol: +d.Histogram_column,
        Midpoint: +d.midpoint
    };
}).then(data => {
    dataset = data
    //console.log(dataset)
    createScales()
    //setTimeout(drawInitial(), 100)
})



d3.csv('data/location_table_complete.csv', function(d){
    return {
        geo_loc: d.id,
        lat: +d.lat,
        long: +d.long,
        hexlat: +d.hex_lat,
        hexlong: +d.hex_long,
        shrubs: +d.shrubland,
        trees: +d.treecover,
        bare: +d.barren,
        dry80: +d.dry1980,
        dry18: +d.dry2018,
        frost80: +d.frost1980,
        frost18: +d.frost2018
    };
}).then(data => {
    dataset2 = data
    console.log(dataset2)
    createScales2()
    setTimeout(drawInitial(), 100)
})


const colors = ['#ffcc00', '#ff6666', '#cc0066', '#66cccc', '#f688bb', '#65587f', '#baf1a1', '#333333', '#75b79e',  '#66cccc', '#9de3d0', '#f1935c', '#0c7b93', '#eab0d9', '#baf1a1', '#9399ff']

//Create all the scales and save to global variables

function createScales2() {
    console.log('createScales2')
    //console.log(dataset2)

    parkXScale = d3.scaleLinear(d3.extent(dataset2, d => d.long), [margin.left, margin.left + width] )
    parkYScale = d3.scaleLinear(d3.extent(dataset2, d => d.lat), [margin.top + height, margin.top] )
    
    parkHexXScale = d3.scaleLinear(d3.extent(dataset2, d => d.hexlong), [margin.left, margin.left + width] )
    parkHexYScale = d3.scaleLinear(d3.extent(dataset2, d => d.hexlat), [margin.top + height, margin.top] )
    
    shrubScale = d3.scaleLinear().domain([0,100]).range(["white", "blue"])

    console.log('createScales2fin')

}


function createScales(){
    console.log('createScales1')

    salarySizeScale = d3.scaleLinear(d3.extent(dataset, d => d.Median), [5, 35])
    salaryXScale = d3.scaleLinear(d3.extent(dataset, d => d.Median), [margin.left, margin.left + width+250])
    salaryYScale = d3.scaleLinear([20000, 110000], [margin.top + height, margin.top])
    categoryColorScale = d3.scaleOrdinal(categories, colors)
    shareWomenXScale = d3.scaleLinear(d3.extent(dataset, d => d.ShareWomen), [margin.left, margin.left + width])
    enrollmentScale = d3.scaleLinear(d3.extent(dataset, d => d.Total), [margin.left + 120, margin.left + width - 50])
    enrollmentSizeScale = d3.scaleLinear(d3.extent(dataset, d=> d.Total), [10,60])
    histXScale = d3.scaleLinear(d3.extent(dataset, d => d.Midpoint), [margin.left, margin.left + width])
    histYScale = d3.scaleLinear(d3.extent(dataset, d => d.HistCol), [margin.top + height, margin.top])
}

function createLegend(x, y){
    let svg = d3.select('#legend')

    svg.append('g')
        .attr('class', 'categoryLegend')
        .attr('transform', `translate(${x},${y})`)

    categoryLegend = d3.legendColor()
                            .shape('path', d3.symbol().type(d3.symbolCircle).size(150)())
                            .shapePadding(10)
                            .scale(categoryColorScale)
    
    d3.select('.categoryLegend')
        .call(categoryLegend)
}

function createSizeLegend(){
    let svg = d3.select('#legend2')
    svg.append('g')
        .attr('class', 'sizeLegend')
        .attr('transform', `translate(100,50)`)

    sizeLegend2 = d3.legendSize()
        .scale(salarySizeScale)
        .shape('circle')
        .shapePadding(15)
        .title('Salary Scale')
        .labelFormat(d3.format("$,.2r"))
        .cells(7)

    d3.select('.sizeLegend')
        .call(sizeLegend2)
}

function createSizeLegend2(){
    let svg = d3.select('#legend3')
    svg.append('g')
        .attr('class', 'sizeLegend2')
        .attr('transform', `translate(50,100)`)

    sizeLegend2 = d3.legendSize()
        .scale(enrollmentSizeScale)
        .shape('circle')
        .shapePadding(55)
        .orient('horizontal')
        .title('Enrolment Scale')
        .labels(['1000', '200000', '400000'])
        .labelOffset(30)
        .cells(3)

    d3.select('.sizeLegend2')
        .call(sizeLegend2)
}

// All the initial elements should be create in the drawInitial function
// As they are required, their attributes can be modified
// They can be shown or hidden using their 'opacity' attribute
// Each element should also have an associated class name for easy reference

function drawInitial(){
    console.log('Draw Initial')

    createSizeLegend()
    createSizeLegend2()

    let svg = d3.select("#vis")
                    .append('svg')
                    .attr('width', 800)
                    .attr('height', 800)
                    .attr('opacity', 1)

    let xAxis = d3.axisBottom(salaryXScale)
                    .ticks(0)
                    .tickSize(height + 80)

    let xAxisGroup = svg.append('g')
        .attr('class', 'first-axis')
        .attr('transform', 'translate(0, 0)')
        .call(xAxis)
        .call(g => g.select('.domain')
            .remove())
        .call(g => g.selectAll('.tick line'))
            .attr('stroke-opacity', 0.2)
            .attr('stroke-dasharray', 2.5)


    

    var points = []
    




    dataset2.map(function(d) {
        points.push([parseFloat(d.hexlong), parseFloat(d.hexlat)]);
    })



    svg.append('image')
        .attr('class', 'page1')
        .attr('xlink:href', 'https://images.ctfassets.net/0wjmk6wgfops/32egdGHuHDNCoOxJTRENDG/cbd19fb971914ff8dce5187d88e92917/AdobeStock_169698261.jpeg?w=1200&h=630&f=center&fit=fill')
        .attr('width', 500)
        .attr('height', 500)
        .attr('x', 100)
        .attr('y', 150)
        .attr('transform', 'rotate(-3)')
    
    svg.append('image')
        .attr('class', 'page1')
        .attr('xlink:href', 'https://campsitephotos.com/wp/wp-content/uploads/2018/03/Natural-Bridges-National-Monument_scenic.png')
        .attr('width', 300)
        .attr('height', 300)
        .attr('x', 300)
        .attr('y', 350)

    svg.append('image')
        .attr('class', 'page1')
        .attr('xlink:href', 'https://bigvista.com/cdn/shop/products/NATURALBRIDGESPOSTER_600x.jpg?v=1665432632')
        .attr('width', 300)
        .attr('height', 300)
        .attr('x', 100)
        .attr('y', 400)
        .attr('transform', 'rotate(10)')

    
    svg.append('image')
        .attr('class', 'page2')
        .attr('xlink:href', 'https://raw.githubusercontent.com/corwindark/arches_climate/main/outline2.jpg')
        .attr('width', 800)
        .attr('height', 900)
        .attr('x', 0)
        .attr('y',20)
        .attr('opacity', 0)
    //https://npmaps.com/wp-content/uploads/natural-bridges-trail-map.gif
    //https://bigvista.com/cdn/shop/products/NATURALBRIDGESPOSTER_600x.jpg?v=1665432632  
    //https://images.ctfassets.net/0wjmk6wgfops/32egdGHuHDNCoOxJTRENDG/cbd19fb971914ff8dce5187d88e92917/AdobeStock_169698261.jpeg?w=1200&h=630&f=center&fit=fill

    var symbolGenerator = d3.symbol()
        //.type(hexagonSymbol)
        .type(d3.symbolDiamond2)
        .size(900)
    
    var pathData = symbolGenerator()
    


    svg.selectAll("path")
        .data(dataset2)
        .enter().append("path")
        .attr("class", "hexmarks")
        .attr("d", pathData)
        .attr("opacity", 0)
        .attr("transform", (d,i) => "translate(" + parkHexXScale(d.hexlong) + "," + parkHexYScale(d.hexlat) + ")rotate(90)" )    

  


    // Instantiates the force simulation
    // Has no forces. Actual forces are added and removed as required

    simulation = d3.forceSimulation(dataset)

     // Define each tick of simulation
    simulation.on('tick', () => {
        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
    })

    // Stop the simulation until later
    simulation.stop()

    console.log('Nodes 1')
    // Selection of all the circles 
    nodes = svg
        .selectAll('circle')
        .data(dataset2)
        .enter()
        .append('circle')
            .attr('fill', 'black')
            .attr('r', 4)
            .attr('cx', (d, i) => parkXScale(d.long))
            .attr('cy', (d, i) => parkYScale(d.lat))
            .attr('opacity', 0)

    console.log('HELLO')
    //console.log(nodes)
    
    // Add mouseover and mouseout events for all circles
    // Changes opacity and adds border
    svg.selectAll('circle')
        .filter('asdf')
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)

    function mouseOver(d, i){

        console.log('hi')
        d3.select(this)
            .transition('mouseover').duration(100)
            .attr('opacity', 1)
            .attr('stroke-width', 5)
            .attr('stroke', 'black')
        
        console.log(d.long)

        d3.select('#tooltip')
            .style('left', (d3.event.pageX + 10)+ 'px')
            .style('top', (d3.event.pageY - 25) + 'px')
            .style('display', 'inline-block')
            .html(`<strong>Latitude:</strong> ${d.lat} 
                <br> <strong>Longitude:</strong> ${d.long}`)

        console.log('hi3')

    }
    
    function mouseOut(d, i){
        d3.select('#tooltip')
            .style('display', 'none')

        d3.select(this)
            .transition('mouseout').duration(100)
            .attr('opacity', 0.8)
            .attr('stroke-width', 0)
    }

    /*
    //Small text label for first graph
    svg.selectAll('.small-text')
        .data(dataset)
        .enter()
        .append('text')
            .text((d, i) => d.Major.toLowerCase())
            .attr('class', 'small-text')
            .attr('x', margin.left)
            .attr('y', (d, i) => i * 5.2 + 30)
            .attr('font-size', 7)
            .attr('text-anchor', 'end')
    
    //All the required components for the small multiples charts
    //Initialises the text and rectangles, and sets opacity to 0 
    svg.selectAll('.cat-rect')
        .data(categories).enter()
        .append('rect')
            .attr('class', 'cat-rect')
            .attr('x', d => categoriesXY[d][0] + 120 + 1000)
            .attr('y', d => categoriesXY[d][1] + 30)
            .attr('width', 160)
            .attr('height', 30)
            .attr('opacity', 0)
            .attr('fill', 'grey')


    svg.selectAll('.lab-text')
        .data(categories).enter()
        .append('text')
        .attr('class', 'lab-text')
        .attr('opacity', 0)
        .raise()

    svg.selectAll('.lab-text')
        .text(d => `Average: $${d3.format(",.2r")(categoriesXY[d][2])}`)
        .attr('x', d => categoriesXY[d][0] + 200 + 1000)
        .attr('y', d => categoriesXY[d][1] - 500)
        .attr('font-family', 'Domine')
        .attr('font-size', '12px')
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')       

    svg.selectAll('.lab-text')
            .on('mouseover', function(d, i){
                d3.select(this)
                    .text(d)
            })
            .on('mouseout', function(d, i){
                d3.select(this)
                    .text(d => `Average: $${d3.format(",.2r")(categoriesXY[d][2])}`)
            })


    // Best fit line for gender scatter plot

    const bestFitLine = [{x: 0, y: 56093}, {x: 1, y: 25423}]
    const lineFunction = d3.line()
                            .x(d => shareWomenXScale(d.x))
                            .y(d => salaryYScale(d.y))

    // Axes for Scatter Plot
    svg.append('path')
        .transition('best-fit-line').duration(430)
            .attr('class', 'best-fit')
            .attr('d', lineFunction(bestFitLine))
            .attr('stroke', 'grey')
            .attr('stroke-dasharray', 6.2)
            .attr('opacity', 0)
            .attr('stroke-width', 3)

    let scatterxAxis = d3.axisBottom(shareWomenXScale)
    let scatteryAxis = d3.axisLeft(salaryYScale).tickSize([width])

    svg.append('g')
        .call(scatterxAxis)
        .attr('class', 'scatter-x')
        .attr('opacity', 0)
        .attr('transform', `translate(0, ${height + margin.top})`)
        .call(g => g.select('.domain')
            .remove())
    
    svg.append('g')
        .call(scatteryAxis)
        .attr('class', 'scatter-y')
        .attr('opacity', 0)
        .attr('transform', `translate(${margin.left - 20 + width}, 0)`)
        .call(g => g.select('.domain')
            .remove())
        .call(g => g.selectAll('.tick line'))
            .attr('stroke-opacity', 0.2)
            .attr('stroke-dasharray', 2.5)

    // Axes for Histogram 

    let histxAxis = d3.axisBottom(enrollmentScale)

    svg.append('g')
        .attr('class', 'enrolment-axis')
        .attr('transform', 'translate(0, 700)')
        .attr('opacity', 0)
        .call(histxAxis)
    
    */
    
}

//Cleaning Function
//Will hide all the elements which are not necessary for a given chart type 

function clean(chartType){
    let svg = d3.select('#vis').select('svg')
    if (chartType !== "isScatter") {
        svg.select('.scatter-x').transition().attr('opacity', 0)
        svg.select('.scatter-y').transition().attr('opacity', 0)
        svg.select('.best-fit').transition().duration(200).attr('opacity', 0)
    }
    if (chartType !== "isMultiples"){
        svg.selectAll('.lab-text').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.cat-rect').transition().attr('opacity', 0)
            .attr('x', 1800)
    }
    if (chartType !== "isFirst"){
        svg.select('.first-axis').transition().attr('opacity', 0)
        svg.selectAll('.small-text').transition().attr('opacity', 0)
            .attr('x', -200)
    }
    if (chartType !== "isHist"){
        svg.selectAll('.hist-axis').transition().attr('opacity', 0)
    }
    if (chartType !== "isBubble"){
        svg.select('.enrolment-axis').transition().attr('opacity', 0)
    }

    if (chartType !== "shading" && chartType !== "Draw c") {
        svg.selectAll("path").filter(".hexmarks").attr('opacity', 0)
    }
    if (chartType !== "image2" && chartType !== "move3" && chartType !== "Draw c" && chartType !== "shading") {
        svg.selectAll("image").filter(".page2").attr('opacity', 0)

    }
    if (chartType !== "image2" && chartType !== "move3") {
        svg.selectAll("circle").attr('opacity', 0)
    }
}

//First draw function

function drawa(){
    clean('image1')
    console.log("Draw a")
    let svg = d3.select("#vis").select('svg')

    svg.selectAll('image')
        .filter(".page1")
        .transition().duration(10).delay((d, i) => i * 100)
        .attr('opacity', 1)

}

function drawb(){
    clean('image2')

    console.log("Draw b")
    
    let svg = d3.select("#vis").select('svg')

    svg.selectAll('image')
        .filter(".page1")
        .transition().duration(1000).delay((d, i) => i * 100)
        .attr('opacity', 0)
    
    
    svg.selectAll('image')
        .filter(".page2")
        .transition().duration(1000).delay((d, i) => i * 100)
        .attr('opacity', 1)

    svg.selectAll('image')
        .filter(".page2")
        .transition().duration(1000).delay((d, i) => i * 100)
        .attr('opacity', 1)
        
    svg.selectAll('circle')
        .transition().duration(500).delay((d, i) => i * 10)
        .attr('fill', 'black')
        .attr('r', 5)
        .attr('cx', (d, i) => parkXScale(d.long))
        .attr('cy', (d, i) => parkYScale(d.lat))
        .attr('opacity', 1)
}

function drawc(){
    console.log("Draw c")

    clean('move3')

    let svg = d3.select("#vis").select('svg')

    /*
    svg.selectAll('image')
        .filter(".page2")
        .transition().duration(10000).delay((d, i) => i * 100)
        .attr('opacity', 0)
    */

    svg.selectAll('circle')
        .transition().duration(300).delay((d, i) => i * 5)
        .attr('r',5)
        .attr('opacity',1)
        .attr('cx', d => parkHexXScale(d.hexlong))
        .attr('cy', d => parkHexYScale(d.hexlat))
        //.attr('r', d => salarySizeScale(d.Median) * 1.2)
        //.attr('fill', d => categoryColorScale(d.Category))

    svg.selectAll('path')
        .transition().duration(300).delay((d, i) => (i * 5) + 1000)
        .filter(".hexmarks")
        .attr('fill-opacity', 1)
        .attr('fill', 'black')
        .attr('size', 50)
        .attr('opacity', 1)
    
    svg.selectAll('image')
        .filter(".page2")
        .transition().duration(1000).delay((d, i) => i * 100)
        .attr('opacity', 1)


}

function draw1(){
    // tree cover
    console.log("shading")
    //Stop simulation
    let svg = d3.select("#vis").select('svg')

    clean('shading')
    
    svg.selectAll('path')
        .transition().duration(1000)
        .filter(".hexmarks")
        .attr('opacity', 1)
        .attr('fill-opacity', d => (d.trees)/25)
        .attr('fill', "#627663ff")

    svg.selectAll('image')
        .filter(".page2")
        .transition().duration(1000).delay((d, i) => i * 100)
        .attr('opacity', 1)
}


function draw2(){
    // shrubland
    console.log("shading")

    clean('shading')

    let svg = d3.select("#vis").select('svg')
    
    svg.selectAll('path')
        .transition().duration(1000)
        .filter(".hexmarks")
        .attr('opacity', 1)
        .attr('fill-opacity', d => (d.shrubs)/50)
        .attr('fill', "#606899ff")

    svg.selectAll('image')
        .filter(".page2")
        .transition().duration(1000).delay((d, i) => i * 100)
        .attr('opacity', 1)
}

function draw3(){
    // barren
    console.log("shading")

    clean('shading')

    let svg = d3.select("#vis").select('svg')
    
    svg.selectAll('path')
        .transition().duration(1000)
        .filter(".hexmarks")
        .attr('opacity', 1)
        .attr('fill-opacity', d => (d.bare)/100)
        .attr('fill', "#f17e23ff")

    svg.selectAll('image')
        .filter(".page2")
        .transition().duration(1000).delay((d, i) => i * 100)
        .attr('opacity', 1)
}

function draw4(){
    // barren
    console.log("shading")

    clean('shading')

    let svg = d3.select("#vis").select('svg')
    
    svg.selectAll('path')
        .transition().duration(1000)
        .filter(".hexmarks")
        .attr('fill-opacity', d => (d.dry80)/ (d.dry80+1))
        .attr('fill', "#812d01ff")

    svg.selectAll('image')
        .filter(".page2")
        .transition().duration(1000).delay((d, i) => i * 100)
        .attr('opacity', 1)

}

function draw5(){
    console.log("shading5")

    clean('shading')

    let svg = d3.select("#vis").select('svg')
    
    svg.selectAll('path')
        .transition().duration(1000)
        .filter(".hexmarks")
        .attr('opacity', 1)
        .attr('fill-opacity', d => (d.dry18)/ (d.dry18+1))
        .attr('fill', "#812d01ff")

    svg.selectAll('image')
        .filter(".page2")
        .transition().duration(1000).delay((d, i) => i * 100)
        .attr('opacity', 1)

}

function draw6(){
    console.log("shading6")

    clean('shading')

    let svg = d3.select("#vis").select('svg')
    
    svg.selectAll('path')
        .transition().duration(1000)
        .filter(".hexmarks")
        .attr('opacity', 1)
        .attr('fill-opacity', d => (d.frost80 - 69)/ 14)
        .attr('fill', "#6cb6d1ff")


    svg.selectAll('image')
        .filter(".page2")
        .transition().duration(1000).delay((d, i) => i * 100)
        .attr('opacity', 1)
}

function draw7(){
    console.log("shading7")

    clean('shading')

    let svg = d3.select("#vis").select('svg')
    
    svg.selectAll('path')
        .transition().duration(1000)
        .filter(".hexmarks")
        .attr('opacity', 1)
        .attr('fill-opacity', d => (d.frost18 - 69)/ 14)
        .attr('fill', "#6cb6d1ff")


    svg.selectAll('image')
        .filter(".page2")
        .transition().duration(1000).delay((d, i) => i * 100)
        .attr('opacity', 1)
}

function draw8(){
    console.log("shading7")

    clean('all')

}

function colorByGender(d, i){
    if (d.ShareWomen < 0.4){
        return 'blue'
    } else if (d.ShareWomen > 0.6) {
        return 'red'
    } else {
        return 'grey'
    }
}





//Array of all the graph functions
//Will be called from the scroller functionality

let activationFunctions = [
    drawa,
    drawb,
    drawc,    
    draw1,
    draw2,
    draw3,
    draw4,
    draw5, 
    draw6,
    draw7,
    draw8
]

//All the scrolling function
//Will draw a new graph based on the index provided by the scroll


let scroll = scroller()
    .container(d3.select('#graphic'))
scroll()

let lastIndex, activeIndex = 0

scroll.on('active', function(index){
    d3.selectAll('.step')
        .transition().duration(500)
        .style('opacity', function (d, i) {return i === index ? 1 : 0.1;});
    
    activeIndex = index
    let sign = (activeIndex - lastIndex) < 0 ? -1 : 1; 
    let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(i => {
        activationFunctions[i]();
    })
    lastIndex = activeIndex;

})

scroll.on('progress', function(index, progress){
    if (index == 2 & progress > 0.7){

    }
})


// https://gist.github.com/captainhead/b542212d5f11e50f2ccaa47a71deb6c7
// https://github.com/YaleDHLab/pointgrid?fbclid=IwAR1z8b9er8_cMrAQEICVgf9QGPusUEq-gXE--v51ZWH3eyAitAlHDeV4n0I
