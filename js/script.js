
var totalChartWidth = 1400
var bubbleWith = 900
var chartHeaderHeight = 250
var bubbleAndTableHeight = 900

const globalApplicationState = {
    brushed_data: [],
    brushed: false,
    base: null,
    stimulated: null
  };




//Find a way to loop through whole dir and combine
volcano_data = d3.json('./data/volcano_data/pcDNA3.1_vs_GPR162_high_.json');
alpha_data = d3.json('./data/19919_alphas.json');


Promise.all([volcano_data, alpha_data]).then( data =>
    {

        console.log("alpha data", data[1])
        console.log("volcano data", data[0])

        volcano = new Volcano(data[0], globalApplicationState)
        alpha = new Alpha(data[1], data[0], globalApplicationState, volcano)

    });


