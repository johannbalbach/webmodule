const canvas = document.getElementById('canvas');
const bottom = document.getElementById('bottom');
const clearbottom = document.getElementById('clearbottom')

window.onload = window.onresize = function() {
  canvas.width = window.innerWidth * 0.486;
  canvas.height = window.innerHeight * 0.486;
}

const ctx = canvas.getContext('2d');  

//////
const vertices = [];
const Ants = [];
const alpha = 3;
const beta = 2;
const gamma = 1;
const iterationsCount = 10000;
const pheromonesDelay = 0.5;
const mutationsCount = 10;
const populationSize = document.querySelector('#populationValue');
const generationsCount = document.querySelector('#generationValue')
let keepRunning = false;
let generation;
//////

// const populationRange = document.querySelector('#populationSlider');
// let popS = 15;
// let genS = 100;

// populationRange.addEventListener('input', (e) => {
//   popS = e.target.value
//   populationSize.value = e.target.value
// }, true)
// populationSize.addEventListener('input', (e) => {
//     popS = e.target.value
//     populationRange.value = e.target.value
// }, true)

// const generationRange = document.querySelector('#generationSlider')
// generationRange.addEventListener('input', (e) => {
//     genS = e.target.value
//     generationsCount.value = e.target.value
// }, true)
// generationsCount.addEventListener('input', (e) => {
//     genS = e.target.value
//     generationRange.value = e.target.value
// }, true)

////canvas
const lineWidth = 3;
const verticesSize = 10;
const lineColor = 'black';
const canvasColor = 'skyblue';
//////

//////
let istherelines = false;
let istherevertices = false;
//////

canvas.addEventListener('mousedown', function(e) {
    const x = e.clientX - canvas.offsetLeft;
    const y = e.clientY - canvas.offsetTop;
    let tempVertices = new vertice(x, y);
    vertices.push(tempVertices);
    ctx.beginPath();
    ctx.arc(x, y, verticesSize, 0, Math.PI*2);
    ctx.fill()
  });

class vertice{
    constructor(x,y)
    {
        this.x = x;
        this.y = y;
        this.pheromones = 0;
    }
}
class Ant{
    constructor(i)
    {
        this.tabuList = [];
        this.startVertices = vertices[i];
        this.currentVertices = vertices[i];
        this.tabuList.push(i);
    }
    iteration()
    {
        let chances = [];
        let chancesSum = 0;
        for (let i = 0; i<vertices.length; ++i)
        {
            if (!contains(this.tabuList, i))
            {
                let weight = getWeight(this.currentVertices.x, this.currentVertices.y, vertices[i].x, vertices[i].y);
                let pheromones = vertices[i].pheromones;
                let tempChances = Math.pow(pheromones, alpha) * Math.pow(weight, beta);
                if (pheromones == 0)
                    tempChances = Math.pow(weight, beta);
                chances.push(tempChances);
                chancesSum += tempChances;
            }
            else
            {
                chances.push(0);
            }
        }
        for (let i = 0; i<chances.length; ++i)
        {
            chances[i] = chances[i]/chancesSum;
        }
        let choosedIndex = randomWithProbability(chances);
        this.tabuList.push(choosedIndex);
        vertices[choosedIndex].pheromones += gamma/getWeight(this.currentVertices.x, this.currentVertices.y, vertices[choosedIndex].x, vertices[choosedIndex].y); 
        this.currentVertices = vertices[choosedIndex];
    }
    endIteration()
    {
        this.tabuList.length = 1;
        this.currentVertices = this.startVertices;
    }
};

function randomWithProbability(probabilities) 
{
    let random = Math.random();
  
    let acc = 0;
    for (let i = 0; i < probabilities.length; i++) {
      acc += probabilities[i];
      if (acc >= random) {
        return i;
      }
    }

    console.log('place doesnt choosed');
    return null;
}
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
function contains(arr, elem) {
    return arr.includes(elem)
  }
function getWeight(x,y,x1,y1)
{
    let dx = Math.abs(x - x1);
    let dy = Math.abs(y - y1);
    let distance = Math.sqrt(dx*dx + dy*dy)
    return distance;
}

function getArrayWeight(arr)
{
    let weight = 0;
    for (let i = 0; i< arr.length-1; i++)
    {
        let dx = Math.abs(vertices[arr[i]].x - vertices[arr[i+1]].x);
        let dy = Math.abs(vertices[arr[i]].y - vertices[arr[i+1]].y);
        let distance = Math.sqrt(dx*dx + dy*dy);

        weight+= distance;
    }
    //console.log("getarray", arr, weight);
    return weight;
}

let bestpath = [];
function simulation()
{
    let counter = 0;
    while (counter < iterationsCount)
    {
        for (let i = 0; i<vertices.length; ++i)
        {
            let tempAnt = new Ant(i);
            Ants.push(tempAnt);
            bestpath.push(i);
        }
        counter++;
        for (let i = 0; i<vertices.length-1; ++i)
        {
            for (let j = 0; j<Ants.length; ++j)
            {
                Ants[j].iteration();
            }
        }
        for (let i = 0; i<vertices.length; ++i)
        {
            if (getArrayWeight(bestpath) > getArrayWeight(Ants[i].tabuList))
            {
                let temp = Ants[i].tabuList;
                bestpath = temp;
            }
            vertices[i].pheromones = vertices[i].pheromones * pheromonesDelay;
        }
        if (counter <= iterationsCount - 1)
        {
            Ants.length = 0;
        }
    }
    console.log(bestpath, vertices, Ants, Ants[0].tabuList);
    DrawLines(bestpath);
} 

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
    currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}


function drawLine(x1, y1, x2, y2, width, color) 
{
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    // ctx.strokeStyle = `rgba(0, 0, 0, ${1 - distance/300})`;
    ctx.stroke();
}

function DrawLines(inputvertices) 
{
    //console.log(inputvertices);
    for (let i = 0; i < vertices.length - 1; i++) 
    {
        drawLine(vertices[inputvertices[i]].x, vertices[inputvertices[i]].y,
            vertices[inputvertices[i + 1]].x, vertices[inputvertices[i + 1]].y, lineWidth, lineColor);
    }
    drawLine(vertices[inputvertices[inputvertices.length - 1]].x, vertices[inputvertices[inputvertices.length - 1]].y,
        vertices[inputvertices[0]].x, vertices[inputvertices[0]].y, lineWidth, lineColor);
    istherelines = true;
} 

function ClearLines(inputvertices) 
{
  for (let i = 0; i < inputvertices.length - 1; i++) 
  {
      drawLine(vertices[inputvertices[i]].x, vertices[inputvertices[i]].y,
         vertices[inputvertices[i + 1]].x, vertices[inputvertices[i + 1]].y, lineWidth+2, canvasColor);
  }
  drawLine(vertices[inputvertices[inputvertices.length - 1]].x, vertices[inputvertices[inputvertices.length - 1]].y,
     vertices[inputvertices[0]].x, vertices[inputvertices[0]].y, lineWidth+2, canvasColor);

  for (let i = 0; i < vertices.length; i++)
  {
    ctx.beginPath();  
    ctx.arc(vertices[i].x, vertices[i].y, verticesSize, 0, Math.PI*2);
    ctx.fill();
  }
  istherelines = false;
  bestpath.length = 0;
  Ants.length = 0;
} 

function clear()
{
  ctx.fillStyle = canvasColor;
  ctx.fillRect(0,0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.fillStyle = 'black';
  vertices.length = 0; 
  bestpath.length = 0;
}
function StartBottom() 
{
  console.log('started');
  if(istherelines)
  {
      ClearLines(bestpath);
  }
  simulation();
}
function ClearBottom()
{
  if (!istherelines)
  {
    clear();
  }
  else if (bestpath != null)
    ClearLines(bestpath);
}


// <!DOCTYPE html>
// <html lang="en"></html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <title>genetic Algorithm</title>
//     <link rel="stylesheet" href="antbasic.css">
//     <script src="antbasic.js" defer></script>
// </head>
// <body>
//     <div class = "box">
//         <button id="start" class="btn" type="button" onclick="StartBottom()">START</button>
//         <button id="clear" class="btn" type="button" onclick="ClearBottom()">CLEAR</button>
        // <div id="alpha" class="titler">alpha value</div>
        // <div id="alphaS" class="slider-container">
        //     <input id="alphaSlider" class="slider" type="range" min="1" max="10" value="1" autocomplete="off">
        //     <input id="alphaValue" class="value" type="text" value="1" autocomplete="off">
        // </div>
        // <div id="beta" class="titler">beta value</div>
        // <div id="betaS" class="slider-container">
        //     <input id="betaSlider" class="slider" type="range" min="1" max="10" value="1" autocomplete="off">
        //     <input id="betaValue" class="value" type="text" value="1" autocomplete="off">
        // </div>
        // <div id="gamma" class="titler">gamma value</div>
        // <div id="gammaS" class="slider-container">
        //     <input id="gammaSlider" class="slider" type="range" min="1" max="10" value="1" autocomplete="off">
        //     <input id="gammaValue" class="value" type="text" value="1" autocomplete="off">
        // </div>
        // <div id="iterations" class="titler">iterations count</div>
        // <div id="iterationsS" class="slider-container">
        //     <input id="iterationsSlider" class="slider" type="range" min="100" max="10000" value="100" autocomplete="off">
        //     <input id="iterationsValue" class="value" type="text" value="100" autocomplete="off">
        // </div>
        // <div id="pheromones" class="titler">pheromones delay</div>
        // <div id="pheromonesS" class="slider-container">
        //     <input id="pheromonesSlider" class="slider" type="range" min="1" max="100" value="1" autocomplete="off">
        //     <input id="pheromonesValue" class="value" type="text" value="1" autocomplete="off">
        // </div>
//     </div>
    // <div class="parent">
    //     <div class="canvas_block" id="canv">
    //         <canvas id="canvas"></canvas>
    //     </div>
    // </div>
// </body>
// </html>