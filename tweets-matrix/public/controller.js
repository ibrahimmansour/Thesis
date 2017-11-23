let params = (new URL(document.location)).searchParams;
let name = params.get("name");
//console.log(name);
var searchKeyword = "Brexit";
var selected_nodes = 10;
var selected_order = "name";
var selected_group = "cooccurence";
var relationvaluefrom = "0";
var relationvalueto = "100";
var startDate = "2016-07-01T00:00:00";
var endDate = "2016-07-10T23:59";
//console.log(startDate);
var wordType = "nouns";

var margin = { top: 100 , right: 0, bottom: 0, left: 210 }, width = 160,
    height = 160, svgz0oom = 1;

var x = d3.scaleBand().range([0, width]),
    barscale = d3.scaleBand().range([4, 30]),
    z = d3.scaleLinear().domain([0, 1]).clamp(true),
    c = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(10));

var ordersmap = {};
var matrixmap = {};
var nodesmap = [];

var relscale;
var svgcounter=0;


function createSVGs(svgnum) {
    var i;
    for (i = 1; i <= svgnum; i++) {

        d3.select('#svg_matrix')
        .append('div')
        .attr('id', 'container' + i)
        .style('display', 'initial');

        d3.select('#container'+i)
            .append('svg')
            .attr('id', 'svg' + i)
            .attr('width', 390 + 'px')
            .attr('height', 310 + 'px')
            //.style('border-right' , '0.3px solid black')
            //.style('border-bottom' , '0.3px solid black')
            .append('g')
            .attr('id', 'myg' + i)
            .attr(
            'transform', 'translate(' + margin.left + ',' + margin.top + ')');

            d3.select('#container'+i)
            .append('a')
            .attr('id', 'svgtxt' + i)
            .style('position','absolute')
            .style('margin-left', -150 + 'px')
            .style('margin-top', 270  + 'px' )
            .text(startDate);
            
        d3.select('#svg_matrix')
            .append('img')
            .attr('id', 'loader' + i)
            .attr('class', 'loader')
            .attr('src', 'Imgs/ajax-loader.gif')
            .style('margin-left', -130 + 'px')
            .style('margin-top', 155 + 'px' );

    }
}
createSVGs(6);

function myfunction(svgcount, startdate, enddate) {
    startDate = startdate;
    endDate = enddate;
    $('#svgloader').show();
    getTopWords(searchKeyword, selected_nodes, startDate, endDate, wordType, function (tweets) {
        var matrix = tweets.matrix, nodes = tweets.nodes, mincount = tweets.mincount,
            maxcount = tweets.maxcount, n = nodes.length,
            invertedindex = tweets.invertedindex, maxrelcount = tweets.maxrelcount,
            orders = tweets.orders, textlength = tweets.textlength, tweetscounter = 0;
        
            ordersmap[svgcount] = orders;
            matrixmap[svgcount] = matrix;
            nodesmap[svgcount] = nodes;
        barscale.domain(d3.range(mincount, maxcount + 1));

        relscale =
            d3.scalePoint().domain(d3.range((maxrelcount + 1))).range([
                0, 1
            ]);

        // The default sort order.
        x.domain(orders[selected_order]);

        if (tweetscounter < textlength) {
            d3.select('#nextBtn').attr('disabled', null);
        }

        var svg =
            d3.select('#myg'+svgcount);

            /*
            svg.append('text')
                .attr("text-anchor", "end")
                .attr("fill", "red")
                .text(function(d) { return startdate; });
            */
            d3.select('#svgtxt' + svgcount)
            .text(function(d) { return startdate.slice(0,10); });

        var div = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        svg.append('rect')
            .attr('class', 'background')
            .attr('width', width)
            .attr('height', height);

        function rowgen(svgnum) {
            //nodes = nodesmap[svgnum];
            var row = d3.select('#myg' + svgnum)
                .selectAll('.row')
                .data(matrixmap[svgnum])
                .enter()
                .append('g')
                .attr('class', 'row')
                .attr(
                'transform',
                function (d, i) {
                    return 'translate(0,' + x(i) + ')';
                })
                .each(row_f);

            row.append('line')
                .attr('stroke-width', 1)
                .attr('stroke', 'black')
                .attr('x2', width);

            row.append('text')
                .attr('x',
                function (d, i) {
                    return -barscale((nodesmap[svgnum])[i].count) - 7;
                })
                .attr('y', x.bandwidth() / 3)
                .attr('dy', '.32em')
                .attr('text-anchor', 'end')
                .style('font-size', '8pt')
                .style('cursor', 'pointer')
                .text(function (d, i) {
                    return (nodesmap[svgnum])[i].name;
                })
                .on('mouseover', rtextmouseover)
                .on('mouseout', rtextmouseout)
                .on('click', showdropdown);

        if (selected_nodes <= 120) {
            row.append('rect', 'text')
                .attr(
                'x',
                function (d, i) {
                    return -barscale(nodes[i].count) - 3;
                })
                .attr('y', x.bandwidth() / 5)
                .attr(
                'width',
                function (d, i) {
                    return barscale(nodes[i].count);
                })
                .attr('height', x.bandwidth() / 2)
                .attr('rx', 5)  // rounded corners
                .attr('ry', 5)
                .style(
                'fill',
                function (d, i) {
                    return 'red';
                })
                .on('mouseover', rectmouseover)
                .on('mouseout', rectmouseout)
                ;

            row.append('rect', 'text')
                .attr(
                'x',
                function (d, i) {
                    return -(barscale(nodes[i].count) *
                        (nodes[i].semCountPo / nodes[i].count)) -
                        3;
                })
                .attr('y', x.bandwidth() / 5)
                .attr(
                'width',
                function (d, i) {
                    return barscale(nodes[i].count) *
                        (nodes[i].semCountPo / nodes[i].count);
                })
                .attr('height', x.bandwidth() / 2)
                .style('fill',
                function (d, i) {
                    return 'green';
                })
                .on('mouseover', rectmouseover)
                .on('mouseout', rectmouseout)
                ;

            row.append('rect', 'text')
                .attr(
                'x',
                function (d, i) {
                    return -(barscale(nodes[i].count) *
                        (nodes[i].semCountNe / nodes[i].count)) -
                        (barscale(nodes[i].count) *
                            (nodes[i].semCountPo / nodes[i].count)) -
                        3;
                })
                .attr('y', x.bandwidth() / 5)
                .attr(
                'width',
                function (d, i) {
                    return barscale(nodes[i].count) *
                        (nodes[i].semCountNe / nodes[i].count);
                })
                .attr('height', x.bandwidth() / 2)
                .style('fill',
                function (d, i) {
                    return 'blue';
                })
                .on('mouseover', rectmouseover)
                .on('mouseout', rectmouseout)
                ;
        
            }
        }
        
        function colgen(svgnum) {
            //nodes = nodesmap[svgnum];
            var column = d3.select('#myg' + svgnum)
                .selectAll('.column')
                .data(matrixmap[svgnum])
                .enter()
                .append('g')
                .attr('class', 'column')
                .attr('transform', function (d, i) {
                    return 'translate(' + x(i) + ')rotate(-90)';
                });

            column.append('line').attr('stroke-width', 1).attr('x1', -width);

            column.append('text')
                .attr('x',
                function (d, i) {
                    return barscale(nodes[i].count) + 8;
                })
                .attr('y', x.bandwidth() / 3)
                .attr('dy', '.42em')
                .attr('text-anchor', 'start')
                .attr('class', 'charttext')
                .style('cursor', 'pointer')
                .style('font-size', '8pt')
                .text(function (d, i) {
                    return (nodesmap[svgnum])[i].name;
                })
                .on('mouseover', rtextmouseover)
                .on('mouseout', rtextmouseout)
                .on('click', showdropdown);

            if (selected_nodes <= 120) {
                column.insert('rect')
                    .attr('x', 4)
                    .attr('y', x.bandwidth() / 5)
                    .attr(
                    'width',
                    function (d, i) {
                        return barscale(nodes[i].count);
                    })
                    .attr('height', x.bandwidth() / 2)
                    .attr('rx', 5)  // rounded corners
                    .attr('ry', 5)
                    .attr('class', 'textrect')
                    .style('fill', 'transparent')
                    .style('stroke', 'black')
                    .style('stroke-width', '0.15')
                    .style('fill', 'red')
                    .on('mouseover', rectmouseover)
                    .on('mouseout', rectmouseout);

                column.append('rect', 'text')
                    .attr('x', 4)
                    .attr('y', x.bandwidth() / 5)
                    .attr(
                    'width',
                    function (d, i) {
                        return (nodes[i].semCountPo * barscale(nodes[i].count)) /
                            nodes[i].count;
                    })
                    .attr('height', x.bandwidth() / 2)
                    .attr('class', 'textrect')
                    .style('fill', 'green')
                    .on('mouseover', rectmouseover)
                    .on('mouseout', rectmouseout);

                column.append('rect', 'text')
                    .attr(
                    'x',
                    function (d, i) {
                        return (
                            4 +
                            (nodes[i].semCountPo * barscale(nodes[i].count)) /
                            nodes[i].count);
                    })
                    .attr('y', x.bandwidth() / 5)
                    .attr(
                    'width',
                    function (d, i) {
                        return (nodes[i].semCountNe * barscale(nodes[i].count)) /
                            nodes[i].count;
                    })
                    .attr('height', x.bandwidth() / 2)
                    .attr('class', 'textrect')
                    .style('fill', 'blue')
                    .on('mouseover', rectmouseover)
                    .on('mouseout', rectmouseout);
            }
        }
        function row_f(row) {
            var cell = d3.select(this)
                .selectAll('.cell')
                .data(row.filter(function (d) {
                    return (selected_group == 'similarity') ?
                        ((d.similarity * 100 > relationvaluefrom) &&
                            (d.similarity * 100 <= relationvalueto)) :
                        ((d.cooccurence * 100 > relationvaluefrom) &&
                            (d.cooccurence * 100 <= relationvalueto));
                }))
                .enter()
                .append('rect')
                .attr('class', 'cells')
                .attr(
                'x',
                function (d) {
                    return x(d.x);
                })
                .attr('width', x.bandwidth())
                .attr('height', x.bandwidth())
                .attr('rx', 10)  // rounded corners
                .attr('ry', 10)
                .on('mouseover', mouseover)
                .on('mouseout', mouseout)

            cell.style('opacity', 0.0)
                .transition()
                .duration(1000)
                .style('opacity', function (d) {
                    return selected_group == 'similarity' ?
                        z(d.similarity) :
                        relscale(Math.round(d.cooccurencecount));
                })
                .style('fill', function (d) {
                    return selected_group == 'similarity' ?
                        c(Math.round(nodes[d.y].similaritycount)) :
                        '#34495E';
                })
        }

        function refillsvg(svgnum) {
            d3.select('#myg' + svgnum).selectAll('.row').remove();
            d3.select('#myg' + svgnum).selectAll('.column').remove();
            rowgen(svgnum);
            colgen(svgnum);
        }

        refillsvg(svgcount);

        function rectmouseover(d, i) {
            //console.log(d3.select(this));
            var color = d3.select(this)._groups[0][0].attributes["style"].nodeValue;

            var polcount = 0;
            var polconfidence = 0;
            var polarity = "";
            if (color.indexOf('red') != -1) { polarity = "Negative"; polcount = nodes[i].semCountNt; polconfidence = nodes[i].semConfValNt; }
            else if (color.indexOf('green') != -1) { polarity = "Positive"; polcount = nodes[i].semCountPo; polconfidence = nodes[i].semConfValPo; }
            else if (color.indexOf('blue') != -1) { polarity = "Neutral"; polcount = nodes[i].semCountNe; polconfidence = nodes[i].semConfValNe; }
            var polpercentage = (polcount / nodes[i].count) * 100;
            var msg = polcount + " Tweets have " + polarity + " polarity </br>"
                + " (" + Math.round(polpercentage) + " % of " + nodes[i].count + " Tweets) </br>"
                + " Polarity Confidence = (" + Math.round(polconfidence * 100) / 100 + ")";
            div.html(msg)
                .style('left', d3.event.pageX - 200 + 'px')
                .style('top', d3.event.pageY + 'px');
            div.transition().duration(200).style('opacity', .9);
            d3.selectAll('.row text').classed('active', function (d, ind) {
                return ind == i;
            });
            d3.selectAll('.column text').style('fill', function (d, ind) {
                return (ind == i) ? 'red' : 'black';
            });
        }

        function showdropdown(d, i) {
            d3.select('#dropDownMenu')
                .style('left', d3.event.pageX - 400 + 'px')
                .style('top', d3.event.pageY - 50 + 'px');
            $('#dropDownMenu').show();
            d3.select('#showTweets').on('click', (e) => { getWordTweets(d, i); });
        }

        function rectmouseout(d) {
            div.transition().duration(500).style('opacity', 0);
            d3.selectAll('.row text').classed('active', false);
            d3.selectAll('.column text').style('fill', 'black');
        }

        function rtextmouseover(d, i) {
            div.transition().duration(200).style('opacity', .9);
            div.html(nodes[i].count + ' tweets contain ' + nodes[i].name)
                //.attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
                .style('left', d3.event.pageX - 200 + 'px')
                .style('top', d3.event.pageY + 'px');
            d3.select('#myg' + svgcount).selectAll('.row text').classed('active', function (d, ind) {
                return ind == i;
            });
            d3.select('#myg' + svgcount).selectAll('.column text').style('fill', function (d, ind) {
                return (ind == i) ? 'red' : 'black';
            });
        }
        function rtextmouseout(rtext) {
            div.transition().duration(500).style('opacity', 0);
            d3.selectAll('.row text').classed('active', false);
            d3.selectAll('.column text').style('fill', 'black');
        }
        function mouseover(p) {
            console.log(d3.select(this));
            d3.select('#myg' + svgcount).selectAll('.row text').classed('active', function (d, i) {
                return i == p.y;
            });
            d3.select('#myg' + svgcount).selectAll('.column text').style('fill', function (d, i) {
                return (i == p.x) ? 'red' : 'black';
            });
            var tweetcount = Math.round(nodes[p.y].count * (p.cooccurence));
            var tweetscount = '(' + Math.round(nodes[p.y].count * (p.cooccurence)) +
                ' tweets) have both \'' + nodes[p.y].name + '\' and \'' +
                nodes[p.x].name + '\'';
            var tweetspercentage = Math.round(p.cooccurence * 100) + '% of ' +
                nodes[p.y].name + '\'s Total (' + nodes[p.y].count + ' tweets)';

            var tweetcooccurencecount =
                Math.round(Math.round(tweetcount/maxrelcount * 100)) +
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

        d3.select('#svg' + svgcount)
        .call(d3.zoom().scaleExtent([0.2, 10]).on("zoom", function () {
            $('#dropDownMenu').hide();
            d3.select('#myg' + svgcount).attr('transform', 'translate(' + (margin.left + d3.zoomTransform(this).x) + ',' + (margin.top + d3.zoomTransform(this).y) + ') scale(' + d3.zoomTransform(this).k + ')');
        }));

        d3.select('#relationsSettingApplyBtn').on('click', function () {

            selected_order = document.getElementById('order').value;
            selected_group = document.getElementById('group').value;
            relationvaluefrom =
                document.getElementById('similarity_value_from').value;
            relationvalueto = document.getElementById('similarity_value_to').value;
            d3.selectAll('.row').remove();
            d3.selectAll('.column').remove();

            myfunction(1,"2016-07-01T00:00:00", "2016-07-02T00:00:00");
            myfunction(2,"2016-07-02T00:00:00","2016-07-03T00:00:00");
            myfunction(3,"2016-07-03T00:00:00","2016-07-04T00:00:00");
            myfunction(4,"2016-07-04T00:00:00","2016-07-05T00:00:00");
            myfunction(5,"2016-07-05T00:00:00","2016-07-06T00:00:00");
            myfunction(6,"2016-07-06T00:00:00","2016-07-07T00:00:00");

        });

        function order(value) {
            var i;
            for (i=1;i<=6;i++)
            {
                var t = d3.select('#myg' + i).transition().duration(1000);
                x.domain((ordersmap[i])[value]);
                t.selectAll('.row')
                    .delay(function (d, i) {
                        return x(i) * 4;
                    })
                    .attr(
                    'transform',
                    function (d, i) {   
                        return 'translate(0,' + x(i) + ')';
                    })
                    .selectAll('.cell')
                    .delay(function (d) {
                        return x(d.x) * 4;
                    })
                    .attr('x', function (d) {
                        return x(d.x);
                    });
    
                t.selectAll('.column')
                    .delay(function (d, i) {
                        return x(i) * 4;
                    })
                    .attr('transform', function (d, i) {
                        return 'translate(' + x(i) + ')rotate(-90)';
                    });
            }           
        }
        $('#loader' + svgcount).hide();
        $('.plaintext').hide();
    });
}


myfunction(1,"2016-07-01T00:00:00", "2016-07-02T00:00:00");
myfunction(2,"2016-07-02T00:00:00","2016-07-03T00:00:00");
myfunction(3,"2016-07-03T00:00:00","2016-07-04T00:00:00");
myfunction(4,"2016-07-04T00:00:00","2016-07-05T00:00:00");
myfunction(5,"2016-07-05T00:00:00","2016-07-06T00:00:00");
myfunction(6,"2016-07-06T00:00:00","2016-07-07T00:00:00");
   

function getTopWords(searchKeyword, numNodes, startDate, endDate, wordType, func) {
    $('#tweetsloader').show();
    $.ajax({
        type: "POST",
        url: '/getTopWords',
        dataType: 'json',
        data: {
            numnodes: numNodes,
            searchkeyword: searchKeyword,
            startdate: startDate,
            enddate: endDate,
            wordtype: wordType
        },
        success: func
    });

}