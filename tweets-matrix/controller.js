  var selected_nodes = 20;
  var selected_group = d3.select("#group").value;
  var relationvaluefrom = document.getElementById("similarity_value_from").value;
  var relationvalueto =  document.getElementById("similarity_value_to").value;

  function myfunction() {
    var margin = { top: 80, right: 0, bottom: 10, left: 80 },
      width = 720,
      height = 720;

    var x = d3.scale.ordinal().rangeBands([0, width]),
      z = d3.scale.linear().domain([0, 1]).clamp(true),
      c = d3.scale.category10().domain(d3.range(10));

    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("margin-left", -margin.left + "px")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var el = document.createElement("div");
    function tempAlert(msg, location) {
      el.setAttribute("style", "position:absolute;top:" + (x(location.y) + 85) + "px;left:" + x(location.x) + "px;background-color:LightGray;");
      el.innerHTML = msg;
      document.body.appendChild(el);
    }
    d3.json("tweets_" + selected_nodes +".json", function (tweets) {
      var matrix = [],
        nodes = tweets.nodes,
        n = nodes.length;
      var invertedindex = [];
      // Compute index per node.
      nodes.forEach(function (node, i) {
        node.index = i;
        node.count = 0;
        node.cooccurencecount = 0;
        node.similaritycount = 0;
        invertedindex[node.name] = i;
        matrix[i] = d3.range(n).map(function (j) { return { x: j, y: i, z: 0 }; });
      });

      // Convert links to matrix; count character occurrences.
      tweets.links.forEach(function (tweet) {
        matrix[invertedindex[tweet.word1]][invertedindex[tweet.word2]].z += tweet.portion1;
        matrix[invertedindex[tweet.word1]][invertedindex[tweet.word2]].similarity = tweet.portion2;
        nodes[invertedindex[tweet.word1]].count = tweet.countTotal;
        nodes[invertedindex[tweet.word1]].cooccurencecount += tweet.portion1;
        nodes[invertedindex[tweet.word1]].similaritycount += tweet.portion2;
      });

      // Precompute the orders.
      var orders = {
        name: d3.range(n).sort(function (a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
        count: d3.range(n).sort(function (a, b) { return nodes[b].count - nodes[a].count; }),
        cooccurence: d3.range(n).sort(function (a, b) { return nodes[b].cooccurencecount - nodes[a].cooccurencecount; }),
        similarity: d3.range(n).sort(function (a, b) { return nodes[b].similaritycount - nodes[a].similaritycount; })
      };

      // The default sort order.
      x.domain(orders.name);

      svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);

      function rowgen() {
        var row = svg.selectAll(".row")
          .data(matrix)
          .enter().append("g")
          .attr("class", "row")
          .attr("transform", function (d, i) { return "translate(0," + x(i) + ")"; })
          .each(row_f);

        row.append("line")
          .attr("stroke-width", 2)
          .attr("stroke", "black")
          .attr("x2", width);

        row.append("text")
          .attr("x", -6)
          .attr("y", x.rangeBand() / 2)
          .attr("dy", ".32em")
          .attr("text-anchor", "end")
          .text(function (d, i) { return nodes[i].name; });
      }

      rowgen();
      function colgen() {
        var column = svg.selectAll(".column")
          .data(matrix)
          .enter().append("g")
          .attr("class", "column")
          .attr("transform", function (d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

        column.append("line")
          .attr("stroke-width", 3)
          .attr("x1", -width);

        column.append("text")
          .attr("x", 6)
          .attr("y", x.rangeBand() / 2)
          .attr("dy", ".32em")
          .attr("text-anchor", "start")
          .text(function (d, i) { return nodes[i].name; });
      }
      colgen();
      function row_f(row) {
        var cell = d3.select(this).selectAll(".cell")
          .data(row.filter(function (d) { 
          return selected_group == "similarity" 
          ? ((d.similarity * 100 > relationvaluefrom) && (d.similarity * 100 < relationvalueto)) 
          : ((d.z * 100 > relationvaluefrom) && (d.z * 100 < relationvalueto)) ; 
        }))
          .enter().append("rect")
          .attr("class", "cell")
          .attr("x", function (d) { return x(d.x); })
          .attr("width", x.rangeBand())
          .attr("height", x.rangeBand())
          .on("mouseover", mouseover)
          .on("mouseout", mouseout);

        cell.style("opacity", 0.0).transition().duration(1000).style("opacity", function (d) { return selected_group == "similarity" ? z(d.similarity) : z(d.z); })
        cell.style("fill", function (d) { return selected_group == "similarity" ? c( Math.round( nodes[d.y].similaritycount)) : c(Math.round( nodes[d.y].cooccurencecount)) ; })
      }

      function mouseover(p) {
        d3.selectAll(".row text").classed("active", function (d, i) { return i == p.y; });
        d3.selectAll(".column text").classed("active", function (d, i) { return i == p.x; });
        var tweetscount = "(" + Math.round(nodes[p.y].count * (p.z)) + " tweets) have both '" + nodes[p.y].name + "' and '" + nodes[p.x].name + "'";
        var tweetspercentage = Math.round(p.z * 100) + "% of " + nodes[p.y].name + "'s Total (" + nodes[p.y].count + " tweets)";
        var nodesimilarity = "'" + nodes[p.y].name + "' and '" + nodes[p.x].name + "' are " + Math.round(p.similarity * 100) + "% similar";
        var msg = tweetscount + "</br>" + tweetspercentage + "</br>" + nodesimilarity + "</br>" + Math.round (nodes[p.y].similaritycount) + " cooc:" + nodes[p.y].cooccurencecount;
        tempAlert(msg, p);
      }
      function mouseout() {
        d3.selectAll("text").classed("active", false);
        el.parentNode.removeChild(el);
      }

      d3.select("#order").on("change", function () {
        order(this.value);
      });

      d3.select("#group").on("change", function () {
        selected_group = this.value;
        svg.selectAll(".row").remove();
        svg.selectAll(".column").remove();
        rowgen();
        colgen();
      });

      d3.select("#nodescount").on("change", function () {
        selected_nodes = this.value;
        d3.select("body").select("svg").remove();
        myfunction();
      });

      d3.select("#relationsSettingApplyBtn").on("click", function () {
        d3.select("body").select("svg").remove();
        relationvaluefrom = document.getElementById("similarity_value_from").value;
        relationvalueto = document.getElementById("similarity_value_to").value;
        myfunction();
      });

      function order(value) {
        x.domain(orders[value]);

        var t = svg.transition().duration(2500);

        t.selectAll(".row")
          .delay(function (d, i) { return x(i) * 4; })
          .attr("transform", function (d, i) { return "translate(0," + x(i) + ")"; })
          .selectAll(".cell")
          .delay(function (d) { return x(d.x) * 4; })
          .attr("x", function (d) { return x(d.x); });

        t.selectAll(".column")
          .delay(function (d, i) { return x(i) * 4; })
          .attr("transform", function (d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
      }
    });
  }
  myfunction();