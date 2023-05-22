class Alpha{
    constructor(alpha_data,volcano_data,globalApplicationState,volcano){

        //**********************************************************************************************
        //                                  CONSTANTS FOR CHART SIZE
        //**********************************************************************************************
        this.WIDTH = 500
        this.HEIGHT = 500
        this.MARGIN = 5
        this.HEADER_AXIS_HEIGHT = 30
        this.SMALL_VIZ_HEIGHT = 30
        this.SMALL_VIZ_WIDTH = 150
        this.MARGIN_BOTTOM = 25
        this.MARGIN_LEFT = 25
        this.MARGIN_RIGHT = 25
        this.MARGIN_TOP = 25
        
        //**********************************************************************************************
        //                                  GENERAL SET UP 
        //**********************************************************************************************
        this.globalApplicationState = globalApplicationState
    
        this.alpha_data = alpha_data
        this.volcano_data = volcano_data
        this.volcano = volcano

        this.groupedData = d3.groups(alpha_data, (d) => d.name)
        
        this.treatments = this.groupedData.map((d,i) => {
            return {name: d[0], position: i}})

        this.alpha_div = d3.select("#alpha-div") 

        this.alphaSvg = this.alpha_div.append("svg")
        .attr('id', 'alpha_svg')
        .attr('width', this.WIDTH)
        .attr('height', this.HEIGHT)


        //**********************************************************************************************
        //                                 SELECTORS
        //**********************************************************************************************


        //*************************************** 
        // Add "(select option)"
        //***************************************

        d3.select("#select-base")
        .selectAll('myOptions')
        .data(["(Select treatment)"])
        .enter()
        .append('option')
        .text(function (d) { return d; }) 
        .attr("value", function (d) { return d; }) 
        // Stimulated
        d3.select("#select-stimulated")
        .selectAll('myOptions')
        .data(["(Select treatment)"])
        .enter()
        .append('option')
        .text(function (d) { return d; }) 
        .attr("value", function (d) { return d; }) 


        //*************************************** 
        // Add all other 
        //***************************************

        //For getting unique values for base a stimulated
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
          
        this.bases = this.volcano_data.map(d => d.basal).filter(onlyUnique)
        this.stims = this.volcano_data.map(d => d.stimulated).filter(onlyUnique)

        // Select Base
        d3.select("#select-base")
            .selectAll('myOptions')
            .data(this.bases)
            .enter()
            .append('option')
            .text(function (d) { return d; }) 
            .attr("value", function (d) { return d; }) 

        // Select Stimulated
        d3.select("#select-stimulated")
            .selectAll('myOptions')
            .data(this.stims)
            .enter()
            .append('option')
            .text(function (d) { return d; }) 
            .attr("value", function (d) { return d; }) 

        
        //*************************************** 
        // Add listeners
        //***************************************

        const that = this

        d3.select("#select-stimulated").on("change", function(d) {
            var selectedOption = d3.select(this).property("value")
            if (selectedOption === "(Select treatment)"){
                that.globalApplicationState.stimulated = null
            }
            else{
                that.globalApplicationState.stimulated = selectedOption
            }
            that.updateOptions(selectedOption, "stimulated")
            that.drawAlphaScatter()
            that.volcano.drawVolcano()
        })

        d3.select("#select-base").on("change", function(d) {
            
            var selectedOption = d3.select(this).property("value")
            console.log("HERE", selectedOption)
            if (selectedOption === "(Select treatment)"){
                that.globalApplicationState.base = null
            }
            else{
                that.globalApplicationState.base = selectedOption
            }
            that.updateOptions(selectedOption, "base")
            that.drawAlphaScatter()
            that.volcano.drawVolcano()
        })

        //**********************************************************************************************
        //                                      INITIAL SCATTER
        //**********************************************************************************************

        //*************************************** 
        // Get inititial min and max for scales (Will change upon selection)
        //***************************************

        this.min =  0
        this.max =  d3.max(this.alpha_data.map(d => d.value))

        this.x_scale = d3.scaleLinear()
        .domain([this.min, this.max]).nice()
        .range([this.MARGIN_LEFT, this.WIDTH - this.MARGIN_RIGHT])

        this.y_scale = d3.scaleLinear()
        .domain([this.min, this.max]).nice()
        .range([this.HEIGHT - this.MARGIN_BOTTOM, this.MARGIN_TOP])

        this.xAxis = g => g
        .attr("transform", `translate(0,${this.HEIGHT - this.MARGIN_BOTTOM })`)
        .call(d3.axisBottom(this.x_scale))

        this.yAxis = g => g
        .attr("transform", `translate(${this.MARGIN_LEFT},0)`)
        .call(d3.axisLeft(this.y_scale))


        this.x_axis = this.alphaSvg.append('g').call(this.xAxis)
        this.y_axis = this.alphaSvg.append('g').call(this.yAxis)
        this.points = this.alphaSvg.append('g')

        this.alphaSvg.append('g')
        .attr('id','brush-layer')
        .call(d3.brush().on("start brush end", brushed))

        function brushed({selection}){
            if(selection){
                const [[x0, y0], [x1, y1]] = selection;
                let brushed_data = that.points.selectAll('circle').filter(d => 
                    x0 <= that.x_scale(d.base_value) 
                    && that.x_scale(d.base_value) < x1 
                    && y0 <= that.y_scale(d.stim_value) 
                    && that.y_scale(d.stim_value) < y1)
                .data()
                .map(d => d.architecture)

                that.volcano.brushVolcano(brushed_data, true)

              
                
                that.points.selectAll('circle')
                .style('fill', d => {
                    if ( x0 <= that.x_scale(d.base_value) 
                    && that.x_scale(d.base_value) < x1 
                    && y0 <= that.y_scale(d.stim_value) 
                    && that.y_scale(d.stim_value) < y1){
                        return("red")
                    }
                    else{
                        return('grey')
                    }
                })
              
            }
            else{
                that.volcano.brushVolcano(null, false)

                that.points.selectAll('circle')
                .style('fill','grey')
            }
            
        }




     



  
        

    //     this.max_x_freq = d3.max(this.data.map(d => d.total).map(Number)) / 50
    //     this.scale_freq = d3.scaleLinear()
    //     .domain([0, this.max_x_freq])
    //     .range([0, this.SMALL_VIZ_WIDTH]);

    //     this.scale_percent = d3.scaleLinear()
    //     .domain([-105, 105])
    //     .range([0, this.SMALL_VIZ_WIDTH]);

       
    //     this.scaleColor = d3.scaleOrdinal() 
    //     .domain([this.keys.map(d => d.category)])
    //     .range(["#11C67A", "#FFC60D" , "#076CFD", "#FDB9CB", "#F87D1F", "#EA3636"]);

    //     this.headerData = [
    //         {
    //             sorted: false,
    //             ascending: false,
    //             key: 'phrase'
    //         },
    //         {
    //             sorted: false,
    //             ascending: false,
    //             key: 'frequency'
    //         },
    //         {
    //             sorted: false,
    //             ascending: false,
    //             key: 'percentage'
    //         },
    //         {
    //             sorted: false,
    //             ascending: false,
    //             key: 'total'
    //         }
    //     ]
  
    //     //**********************************************************************************************
    //     //                                  MAKE HEADERS
    //     //**********************************************************************************************
    //     let thead = this.table.append("thead")
        
        
    //     // let table = document.getElementById("the_table");

    //     // let header = table.createTHead()
    //     // header.id = "header"
    //     let header_row = thead.append('tr').attr('id', 'column_headers')
    //     // let row2 = header.insertRow(1); 

    //     // row.id = "header_row"
      
    //     let headerNames = ["Phrase", "Frequency", "Percentages", "Total"]

    //     for (let i = 0; i < headerNames.length; i++) {
    //         let cur_header = header_row.append('th')
    //         .text(headerNames[i])
    //         .style('text-align', 'left')
    //         .style('background', 'Gainsboro')
    //         .attr('class', 'sortable')
    //     }

    //     //Should I put my content row in the header or tbody?
    //     this.content_row = thead.append('tr')

    //     let col_type1 = this.content_row.append('td')
    //     let col_type2 = this.content_row.append('td')
    //     let col_type3 = this.content_row.append('td')
    //     let col_type4 = this.content_row.append('td')

        
    //     col_type2.append('svg')
    //     .attr('id', 'freq_axis')
    //     .style('height', this.HEADER_AXIS_HEIGHT)
    //     .style('width', this.SMALL_VIZ_WIDTH + this.MARGIN)
    //     // .style('padding', '5px')

    //     col_type3.append('svg')
    //     .attr('id', 'percent_axis')
    //     .style('height', this.HEADER_AXIS_HEIGHT)
    //     .style('width', this.SMALL_VIZ_WIDTH + this.MARGIN)
    //     // .style('margin', '5px')

    //     // //**********************************************************************************************
    //     // //                                  SET LEGEND FREQUENCY
    //     // //**********************************************************************************************

    //     // let legend_data = ['0', '0.5', '1']
    //     // let xAxisGenerator = d3.axisBottom(this.scale_freq);

    //     // xAxisGenerator.ticks(3);
    //     // xAxisGenerator.tickValues([0, .5, 1])
    //     // xAxisGenerator.tickSize()

    //     // let xAxis =  d3.select('#freq_axis')
    //     //       .call(xAxisGenerator)
    //     //       .selectAll("text")
    //     //       .text((d)=>d)
    //     //       .attr("color", 'grey')
           
    //     //     xAxis
    //     //     .data(legend_data)
    //     //     .text((d)=>d)
    //     //     .style("font", "12px sans-serif")

    //     //     d3.select('.domain').remove()

    //     //     d3.select("#freq_axis")
    //     //     .attr('height', this.headHeight)


    //     // //**********************************************************************************************
    //     // //                                  SET LEGEND PERCENTAGE
    //     // //**********************************************************************************************

    //     // let legend_data_per = ['100', '50', '0', '50', '100']
    //     // let xAxisGenerator_per = d3.axisBottom(this.scale_percent);

    //     // xAxisGenerator_per.ticks(5);
    //     // xAxisGenerator_per.tickValues([-100, -50, 0, 50, 100])
    //     // xAxisGenerator_per.tickSize()

    //     // let xAxis_per =  d3.select('#percent_axis')
    //     //       .call(xAxisGenerator)
    //     //       .selectAll("text")
    //     //       .text((d)=>d)
    //     //       .attr("color", 'grey')
           
    //     //     xAxis_per
    //     //     .data(legend_data_per)
    //     //     .text((d)=>d)
    //     //     .style("font", "12px sans-serif")

    //     //     d3.select('.domain').remove()

    //     //     d3.select("#percent_axis")
    //     //     .attr('height', this.headHeight)




    //     //**********************************************************************************************
    //     //                                  MAKE BODY
    //     //**********************************************************************************************

    //     this.tbody = this.table.append('tbody').attr('id', 'table_body')

    //     this.attachSortHandlers();
        
    // }

    

    // drawTable() {
    //     let tableData = this.data

    //     if (this.globalApplicationState.brushed){
    //         tableData = this.globalApplicationState.brushed_data
    //     }

        
    //     let rowSelection = d3.select('#table_body')
    //         .selectAll('tr')
    //         .data(tableData)
    //         .join('tr');

        
    //     let forecastSelection = rowSelection.selectAll('td')
    //         .data(this.rowToCellDataTransform)
    //         .join('td')
    //         .attr('class', d => d.class);


         
    
    //     //Add Text
    //     let textSelection = forecastSelection.filter(d => d.type === 'text')
    //         .text(d => d.value)


    //     //Add frequencies
    //     let vizSelection_freq = forecastSelection.filter(d => d.type === 'freq_viz');
    //     let svgSelect_freq = vizSelection_freq.selectAll('svg')
    //         .data(d => [d])
    //         .join('svg')
    //         .attr('width', this.SMALL_VIZ_WIDTH)
    //         .attr('height', this.SMALL_VIZ_HEIGHT);
    //     let grouperSelect_freq = svgSelect_freq.selectAll('g')
    //         .data(d => [d, d])  //Maybe keep second d if you want to add grid lines
    //         .join('g');
    //     this.addFrequencyRectangles(grouperSelect_freq.filter((d,i) => i === 1));


    //     //Add Percents
    //     let vizSelection_per = forecastSelection.filter(d => d.type === 'percent_viz');
    //     let svgSelect_per = vizSelection_per.selectAll('svg')
    //         .data(d => [d])
    //         .join('svg')
    //         .attr('width', this.SMALL_VIZ_WIDTH)
    //         .attr('height', this.SMALL_VIZ_HEIGHT);
    //     let grouperSelect_per = svgSelect_per.selectAll('g')
    //         .data(d => [d, d])  //Maybe keep second d if you want to add grid lines
    //         .join('g');
    //     // this.addGridlines(grouperSelect.filter((d,i) => i === 0), [-75, -50, -25, 0, 25, 50, 75]);
    //     this.addPercentRectangles(grouperSelect_per.filter((d,i) => i === 1));

    //     this.drawHeaders()



    }

    drawAlphaScatter(){

        if (this.globalApplicationState.base != null && this.globalApplicationState.stimulated != null){
            let base_data  = this.alpha_data.filter(d => d.name == this.globalApplicationState.base)
            let stim_data = this.alpha_data.filter(d => d.name == this.globalApplicationState.stimulated)
            
            let joined_data = []
            for(let i = 0; i < base_data.length; i++){


                let base_row_value = base_data[i].value
                let stim_row_value = stim_data.filter(d=> d.architecture == base_data[i].architecture)[0].value

                let cur_row = {
                    architecture: base_data[i].architecture,
                    base_value: base_row_value,
                    stim_value: stim_row_value
                }
                joined_data.push(cur_row)
            }


            joined_data = joined_data.filter(d => d.base_value != null && d.stim_value != null)

            //TODO more efficient way to do this?
            let max_base =  d3.max(joined_data.map(d => d.base_value))
            let max_stim =  d3.max(joined_data.map(d => d.stim_value))

            let max = d3.max([max_base, max_stim])

            this.x_scale = d3.scaleLinear()
            .domain([this.min, max]).nice()
            .range([this.MARGIN_LEFT, this.WIDTH - this.MARGIN_RIGHT])

            this.y_scale = d3.scaleLinear()
            .domain([this.min, max]).nice()
            .range([this.HEIGHT - this.MARGIN_BOTTOM, this.MARGIN_TOP])

            this.x_axis.selectAll('g').remove()
            this.y_axis.selectAll('g').remove()


            this.x_axis = this.alphaSvg.append('g').call(this.xAxis)
            this.y_axis = this.alphaSvg.append('g').call(this.yAxis)

  
            this.points
                .selectAll('circle')
                .data(joined_data)
                .enter()
                .append('circle')
                .attr('cx', (d)=> this.x_scale(d.base_value))
                .attr('cy', (d)=> this.y_scale(d.stim_value))
                .attr('r', 2)
                .style('fill', 'grey')
                .style('stroke', 'black')
                .style('stroke-width', .2)
                .style('opacity', .5)

        }

        else{
            this.points
                .selectAll('circle')
                .remove()
        }

    }

    updateOptions(option, selected_column){
        let allTreatment =  this.treatments.map(d => d.name)

        if (selected_column == "base"){
            console.log("ok")
        }
    }
       
    // drawHeaders(){
    //     //**********************************************************************************************
    //     //                                  SET LEGEND FREQUENCY
    //     //**********************************************************************************************

    //     let legend_data = ['0', '0.5', '1']
    //     let xAxisGenerator = d3.axisBottom(this.scale_freq);

    //     xAxisGenerator.ticks(3);
    //     xAxisGenerator.tickValues([0, .5, 1])
    //     xAxisGenerator.tickSize()

    //     let xAxis =  d3.select('#freq_axis')
    //           .call(xAxisGenerator)
    //           .selectAll("text")
    //           .text((d)=>d)
    //           .attr("color", 'grey')
           
    //         xAxis
    //         .data(legend_data)
    //         .text((d)=>d)
    //         .style("font", "12px sans-serif")

    //         d3.select('.domain').remove()

    //         d3.select("#freq_axis")
    //         .attr('height', this.headHeight)


    //     //**********************************************************************************************
    //     //                                  SET LEGEND PERCENTAGE
    //     //**********************************************************************************************

    //     let legend_data_per = ['100', '50', '0', '50', '100']
    //     let xAxisGenerator_per = d3.axisBottom(this.scale_percent);

    //     xAxisGenerator_per.ticks(5);
    //     xAxisGenerator_per.tickValues([-100, -50, 0, 50, 100])
    //     xAxisGenerator_per.tickSize()

    //     let xAxis_per =  d3.select('#percent_axis')
    //           .call(xAxisGenerator)
    //           .selectAll("text")
    //           .text((d)=>d)
    //           .attr("color", 'grey')
           
    //         xAxis_per
    //         .data(legend_data_per)
    //         .text((d)=>d)
    //         .style("font", "12px sans-serif")

    //         d3.select('.domain').remove()

    //         d3.select("#percent_axis")
    //         .attr('height', this.headHeight)

    // }




    // //**********************************************************************************************
    // //**********************************************************************************************
    // //                                      addRectangles For frequency
    // //**********************************************************************************************
    // //**********************************************************************************************
    // addFrequencyRectangles(containerSelect) {

    //     let rect_group = containerSelect
    //     .selectAll('rect')
    //     .data((d) => [d])
    //     .enter()
    //     .append('g')

    //     rect_group.append('rect')
    //     .attr("height", 20)
    //     .attr("y", 5)
    //     .attr('x', this.scale_freq(0))
    //     .attr('width', (d) => this.scale_freq(d.value.frequency))
    //     .attr("fill",  (d) => this.scaleColor(d.value.category))
    //     .attr('opacity', .75)
    // }


    // //**********************************************************************************************
    // //**********************************************************************************************
    // //                                      addRectangles For Percent
    // //**********************************************************************************************
    // //**********************************************************************************************

    // addPercentRectangles(containerSelect) {

        
 

    //     let rect_group = containerSelect
    //     .selectAll('rect')
    //     .data((d) => {return [d,d];})
    //     .enter()
    //     .append('g')

    //     //add rect left of center
    //     rect_group.append('rect')
    //     .attr("height", 20)
    //     .attr("y", 5)
    //     .attr("x", (d) => {
    
    //         if (d.value.dem_percent > 0){ 
    //             return(this.scale_percent(d.value.dem_percent * -1))
    //         }
    //         else {
    //             return(0)
    //         }
    //     })
    //     .attr("width", (d) => {
    //         //If low and high are left of 0
    //         if (d.value.dem_percent > 0){
    //             return(this.scale_percent(d.value.dem_percent)- this.scale_percent(0))
    //         }
    //         else {
    //             return(0)
    //         }})
    //     .attr("fill",  "steelblue")
    //     .attr('opacity', .75)

    //     //add rect right of center
    //     rect_group.append('rect')
    //     .attr("height", 20)
    //     .attr("y", 5)
    //     .attr("x", this.scale_percent(0))
    //     .attr("width", (d) => {
   
    //         if (d.value.rep_percent > 0){
    //             // return(5)
    //             return(this.scale_percent(d.value.rep_percent) - this.scale_percent(0))
    //         }
    //         else {
    //             return(0)
    //         }})
    //     .attr("fill",  "firebrick")
    //     .attr('opacity', .75)

    // }

    // attachSortHandlers() {
    //     ////////////
    //     // PART 6 // 
    //     ////////////



    //     let c_header = this.table.select("#column_headers")
    //     let headers = c_header.selectAll('th')

    //     let sort_data = this.data
    //     if (this.globalApplicationState.brushed){
    //         sort_data = this.globalApplicationState.brushed_data
    //     }
    //     headers.on("click", (d) => {



    //         //************************* 
    //         //SORT PHRASE
    //         //*************************
    //         if (d.path[0].innerText.includes("Phrase")){
                

    //             if (!this.headerData[0].ascending){
                
    //                 sort_data.sort((a,b) => {
    //                     return a.phrase < b.phrase ? -1 : 1
    //                 });
                    
    //                 this.table.selectAll('g').remove()

    //                 let rows = this.table.selectAll('td')
    //                 let svg_rows = rows.selectAll('svg')
    //                 let cur_row_g = svg_rows.selectAll('g')
    //                 cur_row_g.remove()

    //                 this.headerData[0].sorted = true
    //                 this.headerData[1].sorted = false
    //                 this.headerData[2].sorted = false
    //                 this.headerData[3].sorted = false
                    
    //                 this.drawTable()

    //                 this.headerData[0].ascending = true
    //                 this.headerData[1].ascending = false
    //                 this.headerData[2].ascending = false
    //                 this.headerData[3].ascending = false

    //             }

    //             else{
    //                 sort_data.sort((a,b) => {
    //                     return a.phrase > b.phrase ? -1 : 1
    //                 });
                    
    //                 this.table.selectAll('g').remove()

    //                 let rows = this.table.selectAll('td')
    //                 let svg_rows = rows.selectAll('svg')
    //                 let cur_row_g = svg_rows.selectAll('g')
    //                 cur_row_g.remove()

    //                 this.headerData[0].sorted = true
    //                 this.headerData[1].sorted = false
    //                 this.headerData[2].sorted = false
    //                 this.headerData[3].sorted = false

    //                 this.drawTable()

    //                 this.headerData[0].ascending = false 
    //                 this.headerData[1].ascending = false
    //                 this.headerData[2].ascending = false
    //                 this.headerData[3].ascending = false
    //             }
    //         }

    //         //************************* 
    //         //SORT total
    //         //*************************

    //         else if (d.path[0].innerText.includes("Total")){
                
    //             if (!this.headerData[3].ascending){
                
    //                 sort_data.sort((a,b) => {
    //                     return Number(a.total) < Number(b.total) ? -1 : 1
    //                 });
                    
    //                 this.table.selectAll('g').remove()

    //                 let rows = this.table.selectAll('td')
    //                 let svg_rows = rows.selectAll('svg')
    //                 let cur_row_g = svg_rows.selectAll('g')
    //                 cur_row_g.remove()

    //                 this.headerData[0].sorted = false
    //                 this.headerData[1].sorted = false
    //                 this.headerData[2].sorted = false
    //                 this.headerData[3].sorted = true
                    
    //                 this.drawTable()

    //                 this.headerData[0].ascending = false
    //                 this.headerData[1].ascending = false
    //                 this.headerData[2].ascending = false
    //                 this.headerData[3].ascending = true

    //             }

    //             else{
    //                 sort_data.sort((a,b) => {
    //                     return Number(a.total) > Number(b.total) ? -1 : 1
    //                 });
                    
    //                 this.table.selectAll('g').remove()

    //                 let rows = this.table.selectAll('td')
    //                 let svg_rows = rows.selectAll('svg')
    //                 let cur_row_g = svg_rows.selectAll('g')
    //                 cur_row_g.remove()

    //                 this.headerData[0].sorted = false
    //                 this.headerData[1].sorted = false
    //                 this.headerData[2].sorted = false
    //                 this.headerData[3].sorted = true

    //                 this.drawTable()

    //                 this.headerData[0].ascending = false
    //                 this.headerData[1].ascending = false
    //                 this.headerData[2].ascending = false
    //                 this.headerData[3].ascending = false
    //             }
    //         }

    //         //************************* 
    //         //SORT FREQUENCY
    //         //*************************

    //         else if (d.path[0].innerText.includes("Frequency")){
                
    //             if (!this.headerData[1].ascending){
                
    //                 sort_data.sort((a,b) => {
    //                     return Number(a.total) < Number(b.total) ? -1 : 1
    //                 });
                    
    //                 this.table.selectAll('g').remove()

    //                 let rows = this.table.selectAll('td')
    //                 let svg_rows = rows.selectAll('svg')
    //                 let cur_row_g = svg_rows.selectAll('g')
    //                 cur_row_g.remove()

    //                 this.headerData[0].sorted = false
    //                 this.headerData[1].sorted = true
    //                 this.headerData[2].sorted = false
    //                 this.headerData[3].sorted = false
                    
    //                 this.drawTable()

    //                 this.headerData[0].ascending = false
    //                 this.headerData[1].ascending = true
    //                 this.headerData[2].ascending = false
    //                 this.headerData[3].ascending = false

    //             }

    //             else{
    //                 sort_data.sort((a,b) => {
    //                     return Number(a.total) > Number(b.total) ? -1 : 1
    //                 });
                    
    //                 this.table.selectAll('g').remove()

    //                 let rows = this.table.selectAll('td')
    //                 let svg_rows = rows.selectAll('svg')
    //                 let cur_row_g = svg_rows.selectAll('g')
    //                 cur_row_g.remove()

    //                 this.headerData[0].sorted = false
    //                 this.headerData[1].sorted = true
    //                 this.headerData[2].sorted = false
    //                 this.headerData[3].sorted = false

    //                 this.drawTable()

    //                 this.headerData[0].ascending = false
    //                 this.headerData[1].ascending = false
    //                 this.headerData[2].ascending = false
    //                 this.headerData[3].ascending = false
    //             }
    //         }


    //         //************************* 
    //         //SORT PERCENTAGES
    //         //*************************

    //         else if (d.path[0].innerText.includes("Percentages")){
                
    //             if (!this.headerData[2].ascending){
                
    //                 sort_data.sort((a,b) => {
    //                     return Number(a.percent_of_d_speeches) >  Number(b.percent_of_r_speeches) ? -1 : 1

    //                 });
                    
    //                 this.table.selectAll('g').remove()

    //                 let rows = this.table.selectAll('td')
    //                 let svg_rows = rows.selectAll('svg')
    //                 let cur_row_g = svg_rows.selectAll('g')
    //                 cur_row_g.remove()

    //                 this.headerData[0].sorted = false
    //                 this.headerData[1].sorted = false
    //                 this.headerData[2].sorted = true
    //                 this.headerData[3].sorted = false
                    
    //                 this.drawTable()

    //                 this.headerData[0].ascending = false
    //                 this.headerData[1].ascending = false
    //                 this.headerData[2].ascending = true
    //                 this.headerData[3].ascending = false

    //             }

    //             else{
    //                 sort_data.sort((a,b) => {
    //                     return Number(a.percent_of_d_speeches) < Number(b.percent_of_r_speeches) ? -1 : 1
    //                 });
                    
    //                 this.table.selectAll('g').remove()

    //                 let rows = this.table.selectAll('td')
    //                 let svg_rows = rows.selectAll('svg')
    //                 let cur_row_g = svg_rows.selectAll('g')
    //                 cur_row_g.remove()

    //                 this.headerData[0].sorted = false
    //                 this.headerData[1].sorted = false
    //                 this.headerData[2].sorted = true
    //                 this.headerData[3].sorted = false

    //                 this.drawTable()

    //                 this.headerData[0].ascending = false
    //                 this.headerData[1].ascending = false
    //                 this.headerData[2].ascending = false
    //                 this.headerData[3].ascending = false
    //             }
    //         }


    //     })
    // }



   
}