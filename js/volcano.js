class Volcano{
    constructor(volcano_data, globalApplicationState){

        //**********************************************************************************************
        //                                  CONSTANTS FOR CHART SIZE
        //**********************************************************************************************
        this.WIDTH = 500
        this.HEIGHT = 800
        this.MARGIN_BOTTOM = 25
        this.MARGIN_LEFT = 25
        this.MARGIN_RIGHT = 25
        this.MARGIN_TOP = 25
        this.DEFAULT_VOLCANO_OPACITY = .7
        this.DEFAULT_STROKE_WIDTH = .2
        this.ANIMATION_DURATION = 8
        this.NOT_HIGHLIGHTED_OPACITY = .01
        this.HIGHLIGHTED_OPACITY = 1

        this.NOT_HIGHLIGHTED_STROKE_WIDTH = .01
        this.HIGHLIGHTED_STROKE_WIDTH = 1


        //**********************************************************************************************
        //                                  GENERAL SET UP 
        //**********************************************************************************************

        this.globalApplicationState = globalApplicationState
        this.volcano_data = volcano_data

        this.volcano_div = d3.select("#volcano-div") 

        this.volcanoSvg = this.volcano_div.append("svg")
        .attr('id', 'volcano_svg')
        .attr('width', this.WIDTH)
        .attr('height', this.HEIGHT)
       

        // this.groupedData = d3.groups(data[0], (d) => d.category)
        // this.keys = this.groupedData.map((d,i) => {
        //     return {category: d[0], position: i}})

        // this.bubbleSvg = this.bubble_div.append("svg")
        //     .attr('id', 'bubble_svg')
        //     .attr('width', this.TOTAL_WIDTH)
        //     .attr('height', this.TOTAL_HEIGHT)

        // this.brushSvg = this.bubbleSvg.append("svg")
        //     .attr('id', 'brush_svg')
        //     .attr('height', this.TOTAL_HEIGHT)
        //     .attr('width', this.TOTAL_WIDTH)
        //     .style('position', 'absolute')

          

     
        //**********************************************************************************************
        //                                  GET MIN AND MAX
        //**********************************************************************************************

        //min max for source x and y
        this.max_p_val = d3.max(this.volcano_data.map(d => d.neg_log10_pval))

        this.max_fc = d3.max(this.volcano_data.map(d => d.logFC))
        this.min_fc = d3.min(this.volcano_data.map(d => d.logFC))

        //**********************************************************************************************
        //                                  SCALES
        //**********************************************************************************************

        //TODO should we make the x scale symetrical?
        this.x_scale = d3.scaleLinear()
        .domain([this.min_fc, this.max_fc]).nice()
        .range([this.MARGIN_LEFT, this.WIDTH - this.MARGIN_RIGHT])

        this.y_scale = d3.scaleLinear()
        .domain([0, this.max_p_val]).nice()
        .range([this.HEIGHT - this.MARGIN_BOTTOM, this.MARGIN_TOP])

        this.xAxis = g => g
        .attr("transform", `translate(0,${this.HEIGHT - this.MARGIN_BOTTOM })`)
        .call(d3.axisBottom(this.x_scale))

        this.yAxis = g => g
        .attr("transform", `translate(${this.MARGIN_LEFT},0)`)
        .call(d3.axisLeft(this.y_scale))


        this.x_axis = this.volcanoSvg.append('g').call(this.xAxis)
        this.y_axis = this.volcanoSvg.append('g').call(this.yAxis)
        this.points = this.volcanoSvg.append('g')


        this.scaleColor = d3.scaleOrdinal() 
        .domain(["Other Architectures", "Negative Control", "Highest Responding Architecture", "10","09","08","07","06","05","04","03","02","01"])
        .range(["#E4E4E4", //other
        "#919090" , //neg
        "#92FEF8",  //highest
        "#3cb44b",  //10
        "#808000",  //9
        "#800000",  //8
        "#9A6324",  //7
        "#bfef45",  //6
        "#911eb4",  //5
        "#f58231",  //4
        "#4363d8",  //3
        "#ffe119",  //2
        "#e6194B"]);    //1
        


        //**********************************************************************************************
        //                                      TEXT
        //**********************************************************************************************

        
        // let text = this.bubbleSvg
        //     .append('g')
        //     .attr('id', "text_g")
        
        // text.append("text")
        //     .attr("text-anchor", "middle")
        //     .attr("transform",
        //     "translate(0," + this.LABELS_MARGIN + ")")
        //     .attr("x", 75)
        //     .attr('y', 10)
        //     .text("Democratic Leaning")
        //     .style("font", "16px sans-serif")
        //     .style("font-weight", "bold")
        //     .attr('fill', "steelblue")

        // text.append("text")
        //     .attr("text-anchor", "middle")
        //     .attr("transform",
        //     "translate(0," + this.LABELS_MARGIN + ")")
        //     .attr("x", this.TOTAL_WIDTH - 85)
        //     .attr('y', 10)
        //     .text("Republican Leaning")
        //     .style("font", "16px sans-serif")
        //     .style("font-weight", "bold")
        //     .attr('fill', "firebrick")

        // //**********************************************************************************************
        // //                                      LEGEND
        // //**********************************************************************************************

        
        // let legend = this.bubbleSvg
        //     .append('g')
        //     .attr('id', "legend_g")
        //     .attr("transform",
        //     "translate(0," + this.LEGEND_MARGIN+ ")")

        // let legend_data = ['50', '40', '30', '20', '10','0', '10', '20', '30', '40','50']
        // let xAxisGenerator = d3.axisBottom(this.scale_percent);

        // xAxisGenerator.ticks(11);
        // xAxisGenerator.tickValues([-50, -40, -30, -20, -10,0, 10, 20, 30, 40,50])

        // let xAxis =  d3.select('#legend_g')
        //       .call(xAxisGenerator)
        //       .selectAll("text")
        //       .data(legend_data)
        //       .text((d)=>d)
        //       .attr("color", (d,i)=> {
        //         if (i <= 4){
        //             return('steelblue')
        //         }
        //         else if (i === 5){
        //             return('grey')
        //         }
        //         return('firebrick')
        //       })
           
        //     xAxis
        //     .data(legend_data)
        //     .text((d)=>d)
        //     .style("font", "16px sans-serif")

        //     d3.select('.domain').remove()

        // //**********************************************************************************************
        // //                                      DRAW BUBBLES FOR FIRST TIME
        // //**********************************************************************************************

        // var tooltip = d3.select("#bubble_div")
        //     .append("div")
        //     .style("opacity", 0)
        //     .style('position', 'absolute')
        //     .attr("id", 'tool_tip_div')
        //     .attr("class", "tooltip")
        //     .style("background-color", "black")
        //     .style("border-radius", "5px")
        //     // .style("padding", "10px")
        //     .style("color", "white")

        //     // var div = d3.select("body").append("div")	
        //     // .attr("class", "tooltip")				
        //     // .style("opacity", 0);
            
        // this.single_g = this.bubbleSvg
        // // this.single_g = tooltip
        //     .append('g')
        //     .attr("id", 'single_g')
        //     .attr("transform",
        //     "translate(0," + this.BUBBLE_MARGIN + ")")

        // this.single_g.append("line")
        //     .attr("y1", this.CENTER_LINE_TOP)
        //     .attr("y2", this.max_y + this.CENTER_LINE_BOTTOM )
        //     .attr("x1", this.scale_percent(0))
        //     .attr("x2", this.scale_percent(0))
        //     .attr( "stroke", "grey" )
        //     .attr( "stroke-width", "2" )
        //     .attr( "stroke-opacity", '.5')

        
        // //**********************************************************************************************
        // //                                     TOOL TIP
        // //**********************************************************************************************


        // const that = this
        // this.single_g
        //     .selectAll('circle')
        //     .data(this.data)
        //     .join('circle')
        //     .attr("cx", (d) => d.sourceX)
        //     .attr('cy', (d) => d.sourceY)
        //     .style("stroke", "black")
        //     .style("fill", (d) => this.scaleColor(d.category))
        //     .attr("r", (d) => this.scaleCircle(d.total))
        //     .on("mouseover", function(event, d) { 
               

        //         tooltip
        //         .transition()
        //         .duration(200)

        //         tooltip
        //         .style("opacity", 1)
        //         .html("Phrase: " +d.phrase + " <br>Percent of speeches: " + (d.total / 50))
        //         .style("left", (event.pageX + 30+ "px"))
        //         .style("top", ((event.pageY - 30) + "px"))
        //     })
        //     .on("mousemove", function(event, d) {
        //         tooltip
        //         .style("left", (event.pageX + 30 + "px"))
        //         .style("top", ((event.pageY - 30) + "px"))
        //      })
        //     .on("mouseleave", function(event, d) {
        //         tooltip
        //         .transition()
        //         .duration(200)
        //         .style("opacity", 0)
        //     })




        // //**********************************************************************************************
        // //                                     BRUSH
        // //**********************************************************************************************

        

        // this.brushSvg.selectAll('g')
        // .data(this.keys)
        // .join('g')
        // .attr('transform', (d,i) => 'translate(0,' + (this.BUBBLE_START + ((i) * this.GROUPED_WIDTH)) + ')')
        // .attr('class', 'oned-brushes')
        // .append('rect')
        // .attr('height', this.GROUPED_WIDTH)
        // .attr('width', this.TOTAL_WIDTH)
        // .attr('fill', 'none')
        // .attr('stroke', 'none')

        // this.brushGroups = this.brushSvg.selectAll('g')
        // this.updateBrush()
       
    }

    drawVolcano(){

        if (this.globalApplicationState.base != null && this.globalApplicationState.stimulated != null){

            let filtered_volcano = this.volcano_data.filter(d => d.basal == this.globalApplicationState.base && 
                d.stimulated == this.globalApplicationState.stimulated &&
                d.logFC != null &&
                d.neg_log10_pval != null)
            
            



            //Do we want to re draw the scales each time we render? If so un comment this and work with it
            // //TODO more efficient way to do this?
            // let max_p = d3.max(joined_data.map(d => d.neg_log10_pval))
            // let max_fc = d3.max(joined_data.map(d => d.logFC))
            // let min_fc = d3.min(joined_data.map(d => d.logFC))
            // this.x_scale = d3.scaleLinear()
            // .domain([this.min_fc, this.max_fc]).nice()
            // .range([this.MARGIN_LEFT, this.WIDTH - this.MARGIN_RIGHT])
            // this.y_scale = d3.scaleLinear()
            // .domain([0, this.max_p_val]).nice()
            // .range([this.HEIGHT - this.MARGIN_BOTTOM, this.MARGIN_TOP])
            // this.xAxis = g => g
            // .attr("transform", `translate(0,${this.HEIGHT - this.MARGIN_BOTTOM })`)
            // .call(d3.axisBottom(this.x_scale))
            // this.yAxis = g => g
            // .attr("transform", `translate(${this.MARGIN_LEFT},0)`)
            // .call(d3.axisLeft(this.y_scale))
            // this.x_axis = this.volcanoSvg.append('g').call(this.xAxis)
            // this.y_axis = this.volcanoSvg.append('g').call(this.yAxis)
            // this.points = this.volcanoSvg.append('g')
            // this.x_scale = d3.scaleLinear()
            // .domain([this.min, max]).nice()
            // .range([this.MARGIN_LEFT, this.WIDTH - this.MARGIN_RIGHT])
            // this.y_scale = d3.scaleLinear()
            // .domain([this.min, max]).nice()
            // .range([this.HEIGHT - this.MARGIN_BOTTOM, this.MARGIN_TOP])
            // this.x_axis.selectAll('g').remove()
            // this.y_axis.selectAll('g').remove()
            // this.x_axis = this.alphaSvg.append('g').call(this.xAxis)
            // this.y_axis = this.alphaSvg.append('g').call(this.yAxis)

  
            this.points
                .selectAll('circle')
                .data(filtered_volcano)
                .enter()
                .append('circle')
                .attr('cx', (d)=> this.x_scale(d.logFC))
                .attr('cy', (d)=> this.y_scale(d.neg_log10_pval))
                .attr('r', (d) =>{
                    if (d.s == 'small'){
                        return(2)
                    }
                    else{
                        return(4)
                    }
                })
                .style('fill', d => this.scaleColor(d.type))
                .style('stroke', 'black')
                .style('stroke-width', this.DEFAULT_STROKE_WIDTH)
                .style('opacity', this.DEFAULT_VOLCANO_OPACITY )

        }

        else{
            this.points
                .selectAll('circle')
                .remove()
        }


    }

    brushVolcano(brushed_data, brushing){
        if (brushing){
            this.points
            .selectAll("circle")
            .style("opacity", d => {
                if(brushed_data.includes(d.architecture)){
                    return(this.HIGHLIGHTED_OPACITY)
                }
                else{
                    return(this.NOT_HIGHLIGHTED_OPACITY)
                }
            })
            .style("stroke-width", d => {
                if(brushed_data.includes(d.architecture)){
                    return(this.HIGHLIGHTED_STROKE_WIDTH)
                }
                else{
                    return(this.NOT_HIGHLIGHTED_STROKE_WIDTH)
                }
            })
            .transition(this.ANIMATION_DURATION)
        }
        else{
            this.points
            .selectAll('circle')
            .style('opacity', this.DEFAULT_VOLCANO_OPACITY )
            .style('stroke-width', this.DEFAULT_STROKE_WIDTH )
            .transition(this.ANIMATION_DURATION)


        }

    }

    yHighAndLow(y){
        for (let i = 0; i < this.keys.length + 1; i ++){
            if ((y > (this.BUBBLE_START + ((i) * this.GROUPED_WIDTH))) &&  (y < (this.BUBBLE_START + ((i+1) * this.GROUPED_WIDTH)))){
                return [(this.BUBBLE_START + ((i) * this.GROUPED_WIDTH)), (this.BUBBLE_START + ((i+ 1) * this.GROUPED_WIDTH))]
            }
        }
    }

   


    
    updateBrush(){
        

        let activeBrush = null;
        let activeBrushNode = null;

   


        const that = this 

        // We loop through the g elements, and attach brush for each g
        this.brushGroups.each(function(){
           

            //d3.brush.remover() on button
            //look at observable, see if there is a way to remove 
            const selection = d3.select(this);
            const brush = d3.brushX()
            .extent([[0,0], [that.TOTAL_WIDTH, that.GROUPED_WIDTH]])
            .on('start brush end', function (s) {

                let phrases = []

                that.single_g
                .selectAll('circle')
                .style("fill", "grey")

                // if there is an active brush, and that is not on the current g
                if (activeBrush && selection !== activeBrushNode) {
                // we remove that brush on the other g element
                activeBrushNode.call(activeBrush.move, null);
                }
                activeBrush = brush;
                activeBrushNode = selection;

                if(s.selection != null){

                    let xlow = s.selection[0];
                    let xhigh = s.selection[1];
                    let y = s.sourceEvent.pageY
                    let ylow = that.yHighAndLow(y)[0]
                    let yhigh = that.yHighAndLow(y)[1]


                    if (that.grouped){
                        that.single_g
                        .selectAll('circle')
                        .style("fill", (d) => {
                            if (d.moveX > xlow && d.moveX < xhigh && (d.moveY + that.BUBBLE_MARGIN + that.GROUPED_WIDTH ) > ylow && (d.moveY + that.BUBBLE_MARGIN + that.GROUPED_WIDTH  )< yhigh){

                                let filtered_data = that.data.filter(d => d.moveX > xlow&& d.moveX < xhigh  && (d.moveY + that.BUBBLE_MARGIN + that.GROUPED_WIDTH ) > ylow && (d.moveY + that.BUBBLE_MARGIN + that.GROUPED_WIDTH  )< yhigh)
                                that.globalApplicationState.brushed_data = filtered_data
                                that.globalApplicationState.brushed = true
                                that.table.drawTable()
                                return(that.scaleColor(d.category))
                            }
                            else{
                                return('grey')
                            }
                        })

                        


                    }
                    else{
                        that.single_g
                        .selectAll('circle')
                        .style("fill", (d) => {
                            if (d.sourceX > xlow && d.sourceX < xhigh  ){
                                let filtered_data = that.data.filter(d => d.moveX > xlow&& d.moveX < xhigh )
                                that.globalApplicationState.brushed_data = filtered_data
                                that.globalApplicationState.brushed = true
                                that.table.drawTable()
                                return(that.scaleColor(d.category))
                            }
                            else{
                                return('grey')
                            }
                        })

                    }

                }

                else{

                that.globalApplicationState.brushed_data = []
                that.globalApplicationState.brushed = false
                that.table.drawTable()
                that.table.attachSortHandlers()
                that.single_g
                .selectAll('circle')
                .style("fill", (d) => that.scaleColor(d.category))

                }
            })

           
            selection.call(brush);
            return selection;
        })

    }

 
    //**********************************************************************************************
    //**********************************************************************************************
    //                                      SHIFT BUBBLES
    //**********************************************************************************************
    //**********************************************************************************************


    shiftBubbles(grouped){
        if (grouped){
            
         

            this.grouped = true

            this.single_g.selectAll("line")
            .transition(this.ANIMATION_DURATION)
            .attr("y2", this.max_move_y + this.CENTER_LINE_BOTTOM)

            this.single_g.selectAll("circle")  
            .transition(this.ANIMATION_DURATION)
            .attr("cx", (d) => d.moveX)
            .attr("cy", (d) => d.moveY)

            this.single_g.selectAll('text')
            .data(this.keys)
            .join('text')
            .transition(this.ANIMATION_DURATION)
            .attr("x", 0)
            .attr('y', (d,i) => -50 + this.GROUPED_WIDTH * i)
            .attr("fill", (d) => {
                return this.scaleColor(d.category)})
            .text((d) =>  d.category)
            .style("font", "18px sans-serif")
            .attr('stroke', 'black')
            .attr( "stroke-width", ".35" )

            

            this.updateBrush()


        }
        else{
          

            this.grouped = false




            this.single_g.selectAll("line")
            .transition(this.ANIMATION_DURATION)
            .attr("y2", this.max_y  + this.CENTER_LINE_BOTTOM)

            this.single_g.selectAll("circle")  
            .transition(this.ANIMATION_DURATION)
            .attr("cx", (d) => d.sourceX)
            .attr("cy", (d) => d.sourceY)

            this.single_g.selectAll('text')
            .transition(this.ANIMATION_DURATION)
            .attr('y', -50)
            .attr('fill', 'white')
            .attr('stroke', 'white')
            .remove()

            this.activeBrush = null;
            this.activeBrushNode = null;

            this.updateBrush()

            
            

        }        
    }
}