class Volcano{
    constructor(all_data, globalApplicationState){

        //**********************************************************************************************
        //                                  CONSTANTS FOR CHART SIZE
        //**********************************************************************************************
        this.WIDTH = 650 //500
        this.HEIGHT = 800
        this.MARGIN = 55
        this.DEFAULT_VOLCANO_OPACITY = .7
        this.DEFAULT_STROKE_WIDTH = .2
        this.ANIMATION_DURATION = 8
        this.NOT_HIGHLIGHTED_OPACITY = .01
        this.HIGHLIGHTED_OPACITY = 1

        this.NOT_HIGHLIGHTED_STROKE_WIDTH = .01
        this.HIGHLIGHTED_STROKE_WIDTH = 1

        this.TOP_5_OPACITY = 1
        this.CONTROL_OPACITY = .5
        this.ALL_OTHER_OPACITY=.5
        this.BRUSH_ON_OPACITY=1
        this.BRUSH_OFF_OPACITY=.1
        this.TOP_5_RADIUS = 4
        this.ALL_OTHER_RADIUS = 2.5

        this.FDR_LINE_COLOR = "#e83f3f"
        this.CIRCLE_COLOR = "grey"
        this.CONTROL_CIRCLE_COLOR = "#4c4c4c"

        const that = this

        //**********************************************************************************************
        //                                  GENERAL SET UP 
        //**********************************************************************************************
        this.all_data = all_data
        this.globalApplicationState = globalApplicationState

        this.volcano_div = d3.select("#volcano-div") 
    
        this.volcanoSvg = this.volcano_div.append("svg")
        .attr('id', 'volcano_svg')
        .attr('width', this.WIDTH + 75)
        .attr('height', this.HEIGHT)
       

        //**********************************************************************************************
        //                                  GET MIN AND MAX
        //**********************************************************************************************

        this.max_p_val = 15
        this.max_fc = 2
        this.min_fc = -2

        //**********************************************************************************************
        //                                   LABELS
        //**********************************************************************************************

        this.volcanoSvg.append("text").attr("x",640).attr("y",700).text("FDR = .05").style("font-size", "15px").attr("alignment-baseline","middle")
        this.volcanoSvg
            .append('line')
            .style("stroke", this.FDR_LINE_COLOR)
            .style("stroke-width", 4)
            .attr("x1", 615)
            .attr("y1",700)
            .attr("x2", 635)
            .attr("y2", 700); 

        this.volcanoSvg
        .append("text")
        .attr("transform","translate(" + this.WIDTH / 2 + " ," + (this.HEIGHT - 10) + ")")
        .style("text-anchor", "middle")
        .text("Log 2 Fold Change");

        this.volcanoSvg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 15)
        .attr("x",-(this.HEIGHT/2))
        .style("text-anchor", "middle")
        .text("LRT Statistic");


        //**********************************************************************************************
        //                                  SCALES
        //**********************************************************************************************

        //TODO should we make the x scale symetrical?
        this.x_scale = d3.scaleLinear()
        .domain([this.min_fc, this.max_fc]).nice()
        .range([this.MARGIN, this.WIDTH - this.MARGIN])

        this.y_scale = d3.scaleLinear()
        .domain([0, this.max_p_val]).nice()
        .range([this.HEIGHT - this.MARGIN, this.MARGIN])

        this.xAxis = g => g
        .attr("transform", `translate(0,${this.HEIGHT - this.MARGIN })`)
        .call(d3.axisBottom(this.x_scale))

        this.yAxis = g => g
        .attr("transform", `translate(${this.MARGIN},0)`)
        .call(d3.axisLeft(this.y_scale))


        this.x_axis = this.volcanoSvg.append('g').call(this.xAxis)
        this.y_axis = this.volcanoSvg.append('g').call(this.yAxis)
        this.line = this.volcanoSvg.append('g')
        this.points = this.volcanoSvg.append('g')




        document.getElementById('control_check').addEventListener('change', function(){
            const isChecked = d3.select(this).property("checked");
            if (isChecked) {
                d3.select("#top_check").property('checked', false)
                that.drawVolcano()
                that.points.selectAll("circle")
                    .style("opacity", d => (d.controls === "True" ? 1 : 0))
                    .filter(d => d.controls !== "True")
                    .remove();
            } 
            else {
                that.drawVolcano()
            }
          });

          document.getElementById('number_selector').addEventListener('change', function(){
            let n = d3.select('#number_selector').property("value") === "" ? 5 : d3.select('#number_selector').property("value")
            const isChecked = d3.select("#top_check").property("checked");
            if (isChecked) {
                d3.select("#control_check").property('checked', false)
                that.drawVolcano()
                that.points.selectAll("circle")
                    // .style("opacity", d => (+d[that.max_rank_name] <= 5) )
                    .filter(d => +d[that.max_rank_name] > n | d[that.max_rank_name] == "")
                    .remove();
            } 
            else {
                that.drawVolcano()
            }
          });


          document.getElementById('top_check').addEventListener('change', function(){
            const isChecked = d3.select(this).property("checked");

            let n = d3.select('#number_selector').property("value") === "" ? 5 : d3.select('#number_selector').property("value")

            if (isChecked) {
                d3.select("#control_check").property('checked', false)
                that.drawVolcano()
                that.points.selectAll("circle")
                    .filter(d => +d[that.max_rank_name] > n | d[that.max_rank_name] == "")
                    .remove();
            } 
            else {
                that.drawVolcano()
            }
          });

      

      
       
    }

    drawVolcano(selected_motif = ""){
        const that = this
        if (this.globalApplicationState.selected_comparison != "none"){

            this.points
                .selectAll('circle')
                .remove()

            this.line
                .selectAll('line')
                .remove()

            let stim_name = "alpha__"+stim_treatment+"__"+stim_run
            let base_name = "alpha__"+base_treatment+"__"+base_run
            let logFC_col = "logFC__"+this.globalApplicationState.selected_comparison
            let statistic_name = "statistic__"+this.globalApplicationState.selected_comparison
            this.max_rank_name = "maxRank__" +this.globalApplicationState.selected_comparison
            let fdr_name = "fdr__" +this.globalApplicationState.selected_comparison

            let selected_data = this.all_data.filter(function(d){return d[statistic_name]!= "";})
            selected_data = selected_data.filter(function(d){return d[logFC_col] != "";})
            //filter the same way we filter alpha so all points are in each
            selected_data = selected_data.filter(function(d){return d[that.max_rank_name] != "";})
            selected_data = selected_data.filter(function(d){return d[base_name]!= "";})
            selected_data = selected_data.filter(function(d){return d[stim_name] != "";})

            let test = selected_data.map(d => +d[fdr_name] - .05)
            let below = d3.max(test.filter(function(d){return d<0}))
            let above = d3.min(test.filter(function(d){return d>0}))
            let match = test.filter(function(d){return d===0})
            let fdr_threshold = null

            if (match.length != 0){
                let exact_match = selected_data.filter(function(d){
                    return +d[fdr_name] - .05 === 0;
                })
                fdr_threshold = d3.mean(exact_match.map(d => d[statistic_name] ))
            }
            else{
                let above_and_below = selected_data.filter(function(d){
                    return +d[fdr_name] - .05 === above || +d[fdr_name] - .05 === below;
                })
                fdr_threshold = d3.mean(above_and_below.map(d => d[statistic_name] ))

            }



   
            let log_fold_changes = selected_data.map(d => d[logFC_col]).filter((a) =>  a != "")
            let max_fc = d3.max(log_fold_changes.map(d=> Number(d)))
            let min_fc = d3.min(log_fold_changes.map(d=> Number(d)))
            this.max_abs_fc = d3.max([max_fc, -1*min_fc])


            let max_pval = d3.max(selected_data.map(d => +d[statistic_name]))
            let min_pval = d3.min(selected_data.map(d => +d[statistic_name]))



            console.log("max_pval", max_pval)
            console.log("min_pval", min_pval)
            console.log("-(.8*max_pval)", -(.8*max_pval))

            if (min_pval >= 0){
                min_pval = 0
            }
            else{ //Get the lower quartile
                min_pval = d3.max([-(.2*max_pval), min_pval])
            }




            

            


            //Cut off anything that will dip below the min pval
            selected_data = this.all_data.filter(function(d){return d[statistic_name]>=min_pval;})

            if (selected_motif != ""){
                selected_data = selected_data.filter(function(d){return d.motif == selected_motif})
            }

            
            this.x_scale = d3.scaleLinear()
            .domain([-1*this.max_abs_fc, this.max_abs_fc])
            .range([this.MARGIN, this.WIDTH - this.MARGIN])

            this.y_scale = d3.scaleLinear()
            .domain([min_pval, max_pval])
            .range([this.HEIGHT - this.MARGIN, this.MARGIN])

            this.x_axis.selectAll('g').remove()
            this.y_axis.selectAll('g').remove()

            this.x_axis = this.volcanoSvg.append('g').call(this.xAxis)
            this.y_axis = this.volcanoSvg.append('g').call(this.yAxis)


            this.line
            .append('line')
            .style("stroke", this.FDR_LINE_COLOR)
            .style("stroke-width", 2)
            .attr("x1", this.x_scale(-1*this.max_abs_fc))
            .attr("y1", this.y_scale(fdr_threshold))
            .attr("x2", this.x_scale(this.max_abs_fc))
            .attr("y2", this.y_scale(fdr_threshold)); 

            this.points
                .selectAll('circle')
                .data(selected_data)
                .enter()
                .append('circle')
                .attr('cx', (d)=> this.x_scale(d[logFC_col]))
                .attr('cy', (d)=> this.y_scale(d[statistic_name]))
           

                .style('fill', (d)=>{
                    if (selected_motif==""){
                        if(+d[this.max_rank_name] <= 5 & d[this.max_rank_name]!= ""){
                            return that.globalApplicationState.scaleColor(+d[this.max_rank_name])
                        }
                        else if (d["controls"] === "True"){
                            return this.CONTROL_CIRCLE_COLOR
                        }
                        else{
                            return this.CIRCLE_COLOR
                        }
                    }
                    else{
                        if(+d[this.max_rank_name] <= 5 & d[this.max_rank_name]!= ""){
                            return that.globalApplicationState.scaleColor(+d[this.max_rank_name])
                        }
                        return this.CIRCLE_COLOR
                    }
                })
              
                .attr('r', (d) =>{
                    if (selected_motif==""){
                        if (+d[this.max_rank_name] <= 5 & d[this.max_rank_name]!= ""){
                            return(this.TOP_5_RADIUS )
                        }
                        else{
                            return( this.ALL_OTHER_RADIUS )
                        }
                    }
                    else{
                        return(this.TOP_5_RADIUS)
                    }
                })
                .style('stroke', 'black')
                .style('stroke-width', this.DEFAULT_STROKE_WIDTH)
            

                .style('opacity', (d)=>{
                    if (selected_motif==""){
                        if(+d[this.max_rank_name] <= 5 & d[this.max_rank_name]!= ""){
                            return 1
                        }
                        else if (d["controls"] === "True"){
                            return .1
                        }
                        else{
                            return .5
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
                    d3.select(".tooltip").style("opacity", 0)
                    .style("left", "-30px")
                    .style("top", "-30px")
                  })
                  .on("click", (event, d) => {
                    that.info.click(d)
                  })

       

        }

        else{
            this.points
                .selectAll('circle')
                .remove()

            this.line
                .selectAll('line')
                .remove()
        }


    }

   
    set_info(info){
        this.info = info
    }

    set_alpha(alpha){
        this.alpha = alpha
    }

 
   
}