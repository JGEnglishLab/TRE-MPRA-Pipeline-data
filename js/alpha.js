class Alpha{
    constructor(all_data,globalApplicationState,volcano){

        //**********************************************************************************************
        //                                      CONSTANTS 
        //**********************************************************************************************
        this.WIDTH = 500 //550
        this.HEIGHT = 500
        this.MARGIN = 50
        this.DEFAULT_STROKE_WIDTH = .5
        this.TOP_5_OPACITY = 1
        this.CONTROL_OPACITY = .1
        this.ALL_OTHER_OPACITY=.5
        this.BRUSH_ON_OPACITY=1
        this.BRUSH_OFF_OPACITY=.1
        this.TOP_5_RADIUS = 4
        this.ALL_OTHER_RADIUS = 2.5


        this.CIRCLE_COLOR = "grey"
        this.CONTROL_CIRCLE_COLOR = "#4c4c4c"

        //**********************************************************************************************
        //                                  GENERAL SET UP 
        //**********************************************************************************************
        this.globalApplicationState = globalApplicationState
        
        this.all_data = all_data

        this.volcano = volcano
        this.alpha_div = d3.select("#alpha-div") 

        this.alphaSvg = this.alpha_div.append("svg")
        .attr('id', 'alpha_svg')
        .attr('width', this.WIDTH + 250)
        .attr('height', this.HEIGHT)

        this.selected_data = null

        this.alphaSvg.append("circle").attr("cx",510).attr("cy",130).attr("r", 6).attr("stroke", "black").style("fill", this.globalApplicationState.scaleColor(1))
        this.alphaSvg.append("circle").attr("cx",510).attr("cy",160).attr("r", 6).attr("stroke", "black").style("fill", this.globalApplicationState.scaleColor(2))
        this.alphaSvg.append("circle").attr("cx",510).attr("cy",190).attr("r", 6).attr("stroke", "black").style("fill", this.globalApplicationState.scaleColor(3))
        this.alphaSvg.append("circle").attr("cx",510).attr("cy",220).attr("r", 6).attr("stroke", "black").style("fill", this.globalApplicationState.scaleColor(4))
        this.alphaSvg.append("circle").attr("cx",510).attr("cy",250).attr("r", 6).attr("stroke", "black").style("fill", this.globalApplicationState.scaleColor(5))

        this.alphaSvg.append("text").attr("x",490).attr("y",90).text("Motif's with highest").style("font-size", "17px").attr("alignment-baseline","middle")
        this.alphaSvg.append("text").attr("x",490).attr("y",110).text("absolute Log2 FC").style("font-size", "17px").attr("alignment-baseline","middle")

        this.alphaSvg.append("text").attr("x",530).attr("y",130).text("1").style("font-size", "15px").attr("alignment-baseline","middle")
        this.alphaSvg.append("text").attr("x",530).attr("y",160).text("2").style("font-size", "15px").attr("alignment-baseline","middle")
        this.alphaSvg.append("text").attr("x",530).attr("y",190).text("3").style("font-size", "15px").attr("alignment-baseline","middle")
        this.alphaSvg.append("text").attr("x",530).attr("y",220).text("4").style("font-size", "15px").attr("alignment-baseline","middle")
        this.alphaSvg.append("text").attr("x",530).attr("y",250).text("5").style("font-size", "15px").attr("alignment-baseline","middle")


        this.searchBarStim = document.getElementById("searchBarStim");
        this.datalistStim = document.createElement("datalist");
        this.datalistStim.id = "searchOptionsStim";

        this.searchBarBase = document.getElementById("searchBarBase");
        this.datalistBase = document.createElement("datalist");
        this.datalistBase.id = "searchOptionsBase";


        //**********************************************************************************************
        //                                 SELECTORS
        //**********************************************************************************************

      


        //For getting unique values for base a stimulated
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        
        this.baseMap = new Map();
        this.stimMap = new Map();

        this.bases = []
        this.stims = []
        let counter = 0 

        for (let i = 0; i < this.globalApplicationState.base_treatments.length; i++) {
            counter = counter + 1
            let curBase = this.globalApplicationState.base_treatments[i] + "\t(" + this.globalApplicationState.base_runs[i] + ")"
            let curStim = this.globalApplicationState.stim_treatments[i] + "\t(" + this.globalApplicationState.stim_runs[i] + ")"
            this.stims.push(curStim)
            this.bases.push(curBase)

            // If its already in map just push it
            if (this.baseMap.get(curBase) != undefined){
                this.baseMap.get(curBase).push(curStim)
            }else{
                this.baseMap.set(curBase, [curStim])
            }

            if (this.stimMap.get(curStim) != undefined){
                this.stimMap.get(curStim).push(curBase)
            }else{
                this.stimMap.set(curStim, [curBase])
            }
        }


        this.bases = this.bases.filter(onlyUnique)
        this.stims = this.stims.filter(onlyUnique)

        this.updateSearchOptions(this.bases, "base")
        this.updateSearchOptions(this.stims, "stim")

        
        //*************************************** 
        // Add listeners
        //***************************************

        const that = this
          

        document.getElementById('control_check').addEventListener('change', function(){

        const isChecked = d3.select(this).property("checked");
        if (isChecked) {
            d3.select("#top_check").property('checked', false)
            that.drawAlphaScatter()
            that.points.selectAll("circle")
                .style("opacity", d => (d.controls === "True" ? 1 : 0))
                .filter(d => d.controls !== "True")
                .remove();
        } 
        else {
            that.drawAlphaScatter()
        }
      });



      document.getElementById('number_selector').addEventListener('change', function(){
        let n = d3.select('#number_selector').property("value") === "" ? 5 : d3.select('#number_selector').property("value")
        const isChecked = d3.select("#top_check").property("checked");
        if (isChecked) {
            d3.select("#control_check").property('checked', false)
            that.drawAlphaScatter()
            that.points.selectAll("circle")
                // .style("opacity", d => (+d[that.max_rank_name] <= 5) )
                .filter(d => +d[that.max_rank_name] > n | d[that.max_rank_name] == "")
                .remove();
        } 
        else {
            that.drawAlphaScatter()
        }
      });


      document.getElementById('top_check').addEventListener('change', function(){
        let n = d3.select('#number_selector').property("value") === "" ? 5 : d3.select('#number_selector').property("value")
        const isChecked = d3.select(this).property("checked");
        if (isChecked) {
            d3.select("#control_check").property('checked', false)
            that.drawAlphaScatter()
            that.points.selectAll("circle")
                // .style("opacity", d => (+d[that.max_rank_name] <= 5) )
                .filter(d => +d[that.max_rank_name] > n | d[that.max_rank_name] == "")
                .remove();
        } 
        else {
            that.drawAlphaScatter()
        }
      });


        // d3.select("#searchBarStim").on("change", function(d) {
        document.getElementById('searchBarStim').addEventListener('change', function(){

            var selectedOption = d3.select(this).property("value")
   
            if (!that.stims.includes(selectedOption)){
                that.globalApplicationState.stimulated = null
            }
            else{
                that.globalApplicationState.stimulated = selectedOption
            }
            that.drawAlphaScatter()
            that.volcano.drawVolcano()
            that.filter_options(that.globalApplicationState.stimulated, "stim")
            that.info.updateSearchOptions()
            d3.select("#control_check").property('checked', false)
            d3.select("#top_check").property('checked', false)


        })

        // d3.select("#searchBarBase").on("change", function(d) {
        document.getElementById('searchBarBase').addEventListener('change', function(){

            var selectedOption = d3.select(this).property("value")
            if (!that.bases.includes(selectedOption)){
                that.globalApplicationState.base = null
            }
            else{
                that.globalApplicationState.base = selectedOption
            }
            that.drawAlphaScatter()
            that.volcano.drawVolcano()
            that.filter_options(that.globalApplicationState.base, "base")
            that.info.updateSearchOptions()
            d3.select("#control_check").property('checked', false)
            d3.select("#top_check").property('checked', false)


        })

       
        //**********************************************************************************************
        //                                      INITIAL SCATTER
        //**********************************************************************************************

        //*************************************** 
        // Get inititial min and max for scales (Will change upon selection)
        //***************************************

        this.min =  0
        this.max =  5

        this.x_scale = d3.scaleLinear()
        .domain([this.min, this.max]).nice()
        .range([this.MARGIN, this.WIDTH - this.MARGIN])
        this.y_scale = d3.scaleLinear()
        .domain([this.min, this.max]).nice()
        .range([this.HEIGHT - this.MARGIN, this.MARGIN])

        this.xAxis = g => g
        .attr("transform", `translate(0,${this.HEIGHT- this.MARGIN })`)
        .call(d3.axisBottom(this.x_scale))
        this.yAxis = g => g
        .attr("transform", `translate(${this.MARGIN },0)`)
        .call(d3.axisLeft(this.y_scale))

        this.x_axis = this.alphaSvg.append('g').call(this.xAxis)
        this.y_axis = this.alphaSvg.append('g').call(this.yAxis)


        this.alphaSvg
        .append("text")
        .attr("id", "base_text")
        .attr("transform","translate(" + this.WIDTH / 2 + " ," + (this.HEIGHT - 10) + ")")
        .style("text-anchor", "middle")
        .text("Basal Alpha");

        this.alphaSvg
        .append("text")
        .attr("id", "stim_text")
        .attr("transform", "rotate(-90)")
        .attr("y", 15)
        .attr("x",-(this.HEIGHT/2))
        .style("text-anchor", "middle")
        .text("Stimulated Alpha");

        this.points = this.alphaSvg.append('g')

    }


    updateSearchOptions(options, selector) {
        const that = this

        if (selector === "stim"){
            // Clear existing options
            while (this.datalistStim.firstChild) {
                this.datalistStim.removeChild(this.datalistStim.firstChild);
            }
        
            // Add new options
            options.forEach(function(option) {
                const optionElement = document.createElement("option");            
                optionElement.value = option;
                that.datalistStim.appendChild(optionElement);
            });
            this.searchBarStim.appendChild(this.datalistStim);  
        }

        else if (selector === "base"){
            while (this.datalistBase.firstChild) {
                this.datalistBase.removeChild(this.datalistBase.firstChild);
            }
        
            // Add new options
            options.forEach(function(option) {
                const optionElement = document.createElement("option");            
                optionElement.value = option;
                that.datalistBase.appendChild(optionElement);
            });
            this.searchBarBase.appendChild(this.datalistBase);  
        }
    
        

        
    
    }
    
    drawAlphaScatter(selected_motif = ""){

        if (this.globalApplicationState.base != null && this.globalApplicationState.stimulated != null){


            //Remove everything before drawing again
            this.points
                .selectAll('circle')
                .remove()

            let base_run = this.globalApplicationState.base.split("\t(")[1].replace(")", "")
            let base_treatment = this.globalApplicationState.base.split("\t(")[0]

            let stim_run = this.globalApplicationState.stimulated.split("\t(")[1].replace(")", "")
            let stim_treatment = this.globalApplicationState.stimulated.split("\t(")[0]

            this.stim_name = "alpha__"+stim_treatment+"__"+stim_run
            this.base_name = "alpha__"+base_treatment+"__"+base_run
            this.max_rank_name = "maxRank__" +base_treatment+"__"+base_run+"_vs_"+stim_treatment+"__"+stim_run
            let max_name = "max__" +base_treatment+"__"+base_run+"_vs_"+stim_treatment+"__"+stim_run
            let logFC_col = "logFC__"+this.globalApplicationState.selected_comparison
            let pval_col = "statistic__"+this.globalApplicationState.selected_comparison


            d3.select("#base_text").text("Basal Alpha "+base_treatment + " ("+ base_run +")")
            d3.select("#stim_text").text("Stimulated Alpha "+stim_treatment + " ("+ stim_run +")")

            this.globalApplicationState.selected_comparison = base_treatment+"__"+base_run+"_vs_"+stim_treatment+"__"+stim_run

            const that = this
            let selected_data = this.all_data.filter(function(d){return d[that.base_name]!= "";})
            selected_data = selected_data.filter(function(d){return d[that.stim_name] != "";})
            selected_data = selected_data.filter(function(d){return d[that.max_rank_name] != "";})

        
            //Filter the same way we filter volcano data so all points are in each 
            selected_data = selected_data.filter(function(d){return d[pval_col]!= "";})
            selected_data = selected_data.filter(function(d){return d[logFC_col] != "";})

            this.globalApplicationState.motifs = [...new Set(selected_data.map((item) => item.motif))];

            if (selected_motif != ""){
                selected_data = selected_data.filter(function(d){return d.motif == selected_motif})
            }
            console.log("selected_data yo", selected_data)
            
    
            let max_base =  d3.max(selected_data.map(d => +d[this.base_name]))
            let max_stim =  d3.max(selected_data.map(d => +d[this.stim_name]))

            let max = d3.max([max_base, max_stim])        
            this.x_scale = d3.scaleLinear()
            .domain([this.min, max]).nice()
            .range([this.MARGIN, this.WIDTH - this.MARGIN])

            this.y_scale = d3.scaleLinear()
            .domain([this.min, max]).nice()
            .range([this.HEIGHT - this.MARGIN , this.MARGIN])

            this.x_axis.selectAll('g').remove()
            this.y_axis.selectAll('g').remove()

            this.x_axis = this.alphaSvg.append('g').call(this.xAxis)
            this.y_axis = this.alphaSvg.append('g').call(this.yAxis)


            this.points
                .selectAll('circle')
                .data(selected_data)
                .enter()
                .append('circle')
                .attr('cx', (d)=> this.x_scale(d[this.base_name]))
                .attr('cy', (d)=> this.y_scale(d[this.stim_name]))
                .attr('r', (d) =>{
                    if (selected_motif==""){
                        if (+d[that.max_rank_name] <= 5){
                            return(this.TOP_5_RADIUS)
                        }
                        else{
                            return(this.ALL_OTHER_RADIUS )
                        }
                    }
                    else{
                        return(this.TOP_5_RADIUS)
                    }
                })
                .style('fill', (d)=>{
                    if (selected_motif==""){
                        if(+d[that.max_rank_name] <= 5 & d[that.max_rank_name]!= ""){
                            return that.globalApplicationState.scaleColor(+d[that.max_rank_name])
                        }
                        else if (d["controls"] === "True"){
                            return this.CONTROL_CIRCLE_COLOR
                        }
                        else{
                            return this.CIRCLE_COLOR
                        }
                    }
                    else{
                        if(+d[that.max_rank_name] <= 5 & d[that.max_rank_name]!= ""){
                            return that.globalApplicationState.scaleColor(+d[that.max_rank_name])
                        }
                        return this.CIRCLE_COLOR
                    }
                })
                .style('stroke', 'black')
                .style('stroke-width', this.DEFAULT_STROKE_WIDTH)
                .style('opacity', (d)=>{
                    if (selected_motif==""){
                        if(+d[that.max_rank_name] <= 5 & d[that.max_rank_name]!= ""){
                            return that.TOP_5_OPACITY
                        }
                        else if (d["controls"] === "True"){
                            return that.CONTROL_OPACITY
                        }
                        else{
                            return that.ALL_OTHER_OPACITY
                        }
                    }
                    else{
                        return that.TOP_5_OPACITY
                    }
                })
                .on("mouseover", (event, d) => {
                    d3.select(".tooltip")
                      .style("opacity", 1)
                      .html("Architecture Name: " + d.architecture)
                      .style("left", `${event.pageX + 30}px`)
                      .style("top", `${event.pageY - 10}px`)
                  })
                  .on("mousemove", (event, d) => {
                    d3.select(".tooltip")
                      .style("left", `${event.pageX + 30}px`)
                      .style("top", `${event.pageY - 10}px`)
                  })
                  .on("mouseleave", (event, d) => {
                    d3.select(".tooltip")
                    .style("opacity", 0)
                    .style("left", "-30px")
                    .style("top", "-30px")
                  })
                  .on("click", (event, d) => {
                    that.info.click(d)
                  })


        

            
        }

        else{
            this.globalApplicationState.selected_comparison = "none"
            this.points
                .selectAll('circle')
                .remove()
            d3.select("#base_text").text("Basal Alpha")
            d3.select("#stim_text").text("Stimulated Alpha")
            this.info.clear()
        }



    }

    filter_options(option, selected_searchbar){
        const that = this

        // If they cleared a selection. Restore all options
        if (option === null && selected_searchbar === "base"){
            that.updateSearchOptions(that.stims, "stim")
        }
        else if (option === null && selected_searchbar === "stim"){
            that.updateSearchOptions(that.bases, "base")
        }

        else if (option != null && selected_searchbar === "stim"){
            that.updateSearchOptions(that.stimMap.get(option), "base")
        }
        else if (option != null && selected_searchbar === "base"){
            that.updateSearchOptions(that.baseMap.get(option), "stim")
        }


    }

    set_info(info){
        this.info = info
    }
       
   
}