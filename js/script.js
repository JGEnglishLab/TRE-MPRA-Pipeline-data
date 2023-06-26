
// let scaleColor = d3.scaleOrdinal() 
//   .domain([1,2,3,4,5])
//   .range(["#845EC2",  
//   "#D65DB1",  
//   "#FF6F91", 
//   "#FF9671" ,
//   "#FFC75F" 
// ]);

// let scaleColor = d3.scaleOrdinal() 
//   .domain([1,2,3,4,5])
//   .range(["#ffffcc",  
//   "#a1dab4",  
//   "#41b6c4", 
//   "#2c7fb8" ,
//   "#253494" 
// ]);

// let scaleColor = d3.scaleOrdinal() 
//   .domain([1,2,3,4,5])
//   .range(["#1D2977",  
//   "#216390",  
//   "#3495A0", 
//   "#7EAD8D" ,
//   "#CECEA3" 
// ]);

let scaleColor = d3.scaleOrdinal() 
  .domain([5,4,3,2,1])
  .range(["#648FFF",  
  "#785EF0",  
  "#DC267F", 
  "#FE6100" ,
  "#FFB000" 
]);


// let scaleColor = d3.scaleOrdinal()  //Hokusai2
//   .domain([1,2,3,4,5])
//   .range(["#abc9c8",  
//   "#72aeb6",  
//   "#4692b0", 
//   "#2f70a1" ,
//   "#134b73" 
// ]);

// let scaleColor = d3.scaleOrdinal()  //Hiroshige
//   .domain([1,2,3,4,5])
//   .range(["#e76254",  
//   "#ef8a47",  
//   "#f7aa58", 
//   "#ffd06f" ,
//   "#ffe6b7" 
// ]);


const globalApplicationState = {
    brushed_data: [],
    brushed: false,
    base: null,
    stimulated: null,
    base_runs: [],
    base_treatments: [],
    stim_runs: [],
    stim_treatments: [],
    motifs: [],
    selected_comparison: "none",
    selected_motif: "none",
    scaleColor: scaleColor


  };

all_data = d3.csv("./new_data/current_runs.csv")
sequences = d3.csv("./new_data/sequences.csv")

let tooltip = d3.select("body")
  .attr("id", "tooltip")
  .append("div")
  .style("opacity", 0)
  .attr("id", "tool_tip_div")
  .attr("class", "tooltip")
  .style("position", "absolute")




Promise.all([all_data, sequences]).then( data =>
    {

      // console.log("t2", t)
        console.log("all data", data[0])
        let columns = Object.keys(data[0][0])


        let base_runs = []
        let base_treatments = []
        let stim_runs = []
        let stim_treatments = []
        for (let i = 0; i < columns.length; i++) {
          if (columns[i].startsWith("logFC__")){
            cur_comp = columns[i]
            console.log("CUR COMP", cur_comp)

            cur_comp = cur_comp.replace("logFC__", "")
            cur_comp = cur_comp.replace(".csv", "")

            base_treatment = cur_comp.split("_vs_")[0].split("__")[0]
            base_run = cur_comp.split("_vs_")[0].split("__")[1]

            stim_treatment = cur_comp.split("_vs_")[1].split("__")[0]
            stim_run = cur_comp.split("_vs_")[1].split("__")[1]

            base_runs.push(base_run)
            base_treatments.push(base_treatment)
            stim_runs.push(stim_run)
            stim_treatments.push(stim_treatment)

            globalApplicationState.base_runs.push(base_run)
            globalApplicationState.base_treatments.push(base_treatment)
            globalApplicationState.stim_runs.push(stim_run)
            globalApplicationState.stim_treatments.push(stim_treatment)
          }
        }


        volcano = new Volcano(data[0], globalApplicationState)
        alpha = new Alpha(data[0], globalApplicationState, volcano)
        info = new Info(data[0], data[1], globalApplicationState, volcano, alpha)

        volcano.set_info(info)
        volcano.set_alpha(alpha)

        alpha.set_info(info)


    });


