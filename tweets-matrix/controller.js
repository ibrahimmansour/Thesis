var selected_nodes = 20;
var selected_order = document.getElementById('order').value;
var selected_group = document.getElementById('group').value;
var relationvaluefrom = document.getElementById('similarity_value_from').value;
var relationvalueto = document.getElementById('similarity_value_to').value;

var margin = {top: 80, right: 0, bottom: 10, left: 80}, width = 720,
    height = 720;

var x = d3.scale.ordinal().rangeBands([0, width]),
    barscale = d3.scale.ordinal().rangeBands([10, 70]),
    z = d3.scale.linear().domain([0, 1]).clamp(true),
    c = d3.scale.category10().domain(d3.range(10));

var relscale;

function myfunction() {

  getTopWords(selected_nodes , function(tweets){
      console.log(tweets);
    var svg =
        d3.select('body')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .style('margin-left', -margin.left + 'px')
            .append('g')
            .attr(
                'transform', 'translate(' + margin.left + ',' + margin.top + ')');


    var div = d3.select('body')
                    .append('div')
                    .attr('class', 'tooltip')
                    .style('opacity', 0);

    var matrix = tweets.matrix, nodes = tweets.nodes, mincount = tweets.mincount,
     maxcount = tweets.maxcount, n = nodes.length,
     invertedindex = tweets.invertedindex, maxrelcount = tweets.maxrelcount
     orders = tweets.orders;

    barscale.domain(d3.range(mincount, maxcount + 1));

    relscale =
        d3.scale.ordinal().domain(d3.range((maxrelcount + 1))).rangePoints([
          0, 1
        ]);

    // The default sort order.
    x.domain(orders[selected_order]);

    svg.append('rect')
        .attr('class', 'background')
        .attr('width', width)
        .attr('height', height);

    function rowgen() {
      var row = svg.selectAll('.row')
                    .data(matrix)
                    .enter()
                    .append('g')
                    .attr('class', 'row')
                    .attr(
                        'transform',
                        function(d, i) {
                          return 'translate(0,' + x(i) + ')';
                        })
                    .each(row_f);

      row.append('line')
          .attr('stroke-width', 2)
          .attr('stroke', 'black')
          .attr('x2', width);

      row.append('text')
          .attr('x', -6)
          .attr('y', x.rangeBand() / 4)
          .attr('dy', '.32em')
          .attr('text-anchor', 'end')
          .text(function(d, i) {
            return nodes[i].name;
          })
          .on('mouseover', rtextmouseover)
          .on('mouseout', rtextmouseout);

      row.append('rect', 'text')
          .attr(
              'x',
              function(d, i) {
                return -barscale(nodes[i].count) - 3;
              })
          .attr('y', x.rangeBand() / 2)
          .attr(
              'width',
              function(d, i) {
                return barscale(nodes[i].count);
              })
          .attr('height', '12px')
          .attr('rx', 5)  // rounded corners
          .attr('ry', 5)
          .style(
              'fill',
              function(d, i) {
                return 'red';
              })
          .style('stroke', 'black')
          .style('stroke-width', '0.15');

      row.append('rect', 'text')
          .attr(
              'x',
              function(d, i) {
                return -(barscale(nodes[i].count) *
                         (nodes[i].semCountPo / nodes[i].count)) -
                    3;
              })
          .attr('y', x.rangeBand() / 2)
          .attr(
              'width',
              function(d, i) {
                return barscale(nodes[i].count) *
                    (nodes[i].semCountPo / nodes[i].count);
              })
          .attr('height', '12')
          .style('fill', 'green');

      row.append('rect', 'text')
          .attr(
              'x',
              function(d, i) {
                return -(barscale(nodes[i].count) *
                         (nodes[i].semCountNe / nodes[i].count)) -
                    (barscale(nodes[i].count) *
                     (nodes[i].semCountPo / nodes[i].count)) -
                    3;
              })
          .attr('y', x.rangeBand() / 2)
          .attr(
              'width',
              function(d, i) {
                return barscale(nodes[i].count) *
                    (nodes[i].semCountNe / nodes[i].count);
              })
          .attr('height', '12')
          .style('fill', 'blue');
    }

    rowgen();
    function colgen() {
      var column = svg.selectAll('.column')
                       .data(matrix)
                       .enter()
                       .append('g')
                       .attr('class', 'column')
                       .attr('transform', function(d, i) {
                         return 'translate(' + x(i) + ')rotate(-90)';
                       });

      column.append('line').attr('stroke-width', 3).attr('x1', -width);

      column.append('text')
          .attr('x', 6)
          .attr('y', x.rangeBand() / 4)
          .attr('dy', '.32em')
          .attr('text-anchor', 'start')
          .text(function(d, i) {
            return nodes[i].name;
          })
          .on('mouseover', rtextmouseover)
          .on('mouseout', rtextmouseout);

      if (selected_nodes <= 20) {
        column.insert('rect', 'text')
            .attr('x', 4)
            .attr('y', x.rangeBand() / 2)
            .attr(
                'width',
                function(d, i) {
                  return barscale(nodes[i].count);
                })
            .attr('height', '12')
            .attr('rx', 5)  // rounded corners
            .attr('ry', 5)
            .style('fill', 'transparent')
            .style('stroke', 'black')
            .style('stroke-width', '0.15')
            .style('fill', 'red');

        column.append('rect', 'text')
            .attr('x', 4)
            .attr('y', x.rangeBand() / 2)
            .attr(
                'width',
                function(d, i) {
                  return (nodes[i].semCountPo * barscale(nodes[i].count)) /
                      nodes[i].count;
                })
            .attr('height', '12')
            .style('fill', 'green');

        column.append('rect', 'text')
            .attr(
                'x',
                function(d, i) {
                  return (
                      4 +
                      (nodes[i].semCountPo * barscale(nodes[i].count)) /
                          nodes[i].count);
                })
            .attr('y', x.rangeBand() / 2)
            .attr(
                'width',
                function(d, i) {
                  return (nodes[i].semCountNe * barscale(nodes[i].count)) /
                      nodes[i].count;
                })
            .attr('height', '12')
            .style('fill', 'blue');
      }
    }
    colgen();
    function row_f(row) {
      var cell = d3.select(this)
                     .selectAll('.cell')
                     .data(row.filter(function(d) {
                       return (selected_group == 'similarity') ?
                           ((d.similarity * 100 > relationvaluefrom) &&
                            (d.similarity * 100 <= relationvalueto)) :
                           ((d.cooccurence * 100 > relationvaluefrom) &&
                            (d.cooccurence * 100 <= relationvalueto));
                     }))
                     .enter()
                     .append('rect')
                     .attr(
                         'x',
                         function(d) {
                           return x(d.x);
                         })
                     .attr('width', x.rangeBand())
                     .attr('height', x.rangeBand())
                     .attr('rx', 10)  // rounded corners
                     .attr('ry', 10)
                     .on('mouseover', mouseover)
                     .on('mouseout', mouseout);

      cell.style('opacity', 0.0)
          .transition()
          .duration(1500)
          .style('opacity', function(d) {
            return selected_group == 'similarity' ?
                z(d.similarity) :
                relscale(d.cooccurencecount);
          })
      cell.style('fill', function(d) {
        return selected_group == 'similarity' ?
            c(Math.round(nodes[d.y].similaritycount)) :
            '#34495E';
      })
      }

    function rtextmouseover() {
      var txt = d3.select(this)[0][0].textContent;
      div.transition().duration(200).style('opacity', .9);
      console.log(tweets.invertedindex[txt]);
      div.html(nodes[invertedindex[txt]].count + ' tweets contain ' + txt)
          .style('left', d3.event.pageX - 200 + 'px')
          .style('top', d3.event.pageY + 'px');
      }
    function rtextmouseout(rtext) {
      div.transition().duration(500).style('opacity', 0);
      }

    function mouseover(p) {
      d3.selectAll('.row text').classed('active', function(d, i) {
        return i == p.y;
      });
      d3.selectAll('.column text').style('fill', function(d, i) {
        return (i == p.x) ? 'red' : 'black';
      });
      var tweetscount = '(' + Math.round(nodes[p.y].count * (p.cooccurence)) +
          ' tweets) have both \'' + nodes[p.y].name + '\' and \'' +
          nodes[p.x].name + '\'';
      var tweetspercentage = Math.round(p.cooccurence * 100) + '% of ' +
          nodes[p.y].name + '\'s Total (' + nodes[p.y].count + ' tweets)';
      var tweetcooccurencecount =
          Math.round(relscale(p.cooccurencecount) * 100) +
          '% of the maximum cooccurence count (' + maxrelcount + ' tweets)';
      var nodesimilarity = '\'' + nodes[p.y].name + '\' and \'' +
          nodes[p.x].name + '\' are ' + Math.round(p.similarity * 100) +
          '% similar';
      var msg = tweetscount + '</br>' +
          ((selected_group == 'similarity') ?
               nodesimilarity :
               (tweetcooccurencecount + '</br>' + tweetspercentage));

      div.transition().duration(200).style('opacity', .9);
      div.html(msg)
          .style('left', d3.event.pageX - 200 + 'px')
          .style('top', d3.event.pageY + 12 + 'px');
      }
    function mouseout() {
      d3.selectAll('.row text').classed('active', false);
      d3.selectAll('.column text').style('fill', 'black');
      div.transition().duration(500).style('opacity', 0);
    }
    d3.select('#order').on('change', function() {

      selected_order = this.value;

      svg.selectAll('.row').remove();
      x.domain(orders[selected_order]);
      // svg.selectAll(".row").transition().each(row_f);
      rowgen();
      order(this.value);
      // svg.selectAll(".row").remove();
      // svg.selectAll(".column").remove();
      // rowgen();
      // colgen();
    });

    d3.select('#group').on('change', function() {
      selected_group = this.value;
      svg.selectAll('.row').remove();
      svg.selectAll('.column').remove();
      rowgen();
      colgen();
    });

    d3.select('#nodescount').on('change', function() {
      selected_nodes = this.value;
      d3.select('body').select('svg').remove();
      myfunction();
    });

    d3.select('#relationsSettingApplyBtn').on('click', function() {
      d3.select('body').select('svg').remove();
      relationvaluefrom =
          document.getElementById('similarity_value_from').value;
      relationvalueto = document.getElementById('similarity_value_to').value;
      myfunction();
    });

    function order(value) {
      var t = svg.transition().duration(2500);
      x.domain(orders[value]);
      t.selectAll('.row')
          .delay(function(d, i) {
            return x(i) * 4;
          })
          .attr(
              'transform',
              function(d, i) {
                return 'translate(0,' + x(i) + ')';
              })
          .selectAll('.cell')
          .delay(function(d) {
            return x(d.x) * 4;
          })
          .attr('x', function(d) {
            return x(d.x);
          });

      t.selectAll('.column')
          .delay(function(d, i) {
            return x(i) * 4;
          })
          .attr('transform', function(d, i) {
            return 'translate(' + x(i) + ')rotate(-90)';
          });
    }
  });
  }
myfunction();


function getTweetsRelations(nodes, func) {
    $.ajax({
        type: "POST",
        url: '/getTweetsRelations',
        dataType:'json',
        data: {
            nodes:nodes
        },
        success: func
    });
}

function getTopWords(nodes, func) {
    $.ajax({
        type: "POST",
        url: '/getTopWords',
        dataType:'json',
        data: {
            numnodes:nodes,
            searchkeyword : "Brexit",
            startdate : "2016-07-01",
            enddate : "2016-07-10",
            wordtype : [6,9,18,34]
        },
        success: func
    });
}