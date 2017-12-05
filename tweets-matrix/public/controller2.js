var searchKeyword = document.getElementById('dataset').value;
var selected_nodes = 20;
var selected_order = document.getElementById('order').value;
var selected_group = document.getElementById('group').value;
var relationvaluefrom = document.getElementById('similarity_value_from').value;
var relationvalueto = document.getElementById('similarity_value_to').value;
var startDate = document.getElementById('dateFrom').value;
var endDate = document.getElementById('dateTo').value;
var wordType = document.getElementById('wordtypeList').value;
var keyWords = [];
var root = true;

function setTab(evt) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    evt.currentTarget.className += " active";
}

d3.select('#static').on('click', function () {
$('#svg_matrix').show();
$('#svg_matrix2').hide();
setTab(event);
})

d3.select('#evolution').on('click', function () {
    setTab(event);
    $('#svg_matrix2').show();
    $('#svg_matrix').hide();
    if (root)
    {
        createSVGs(6);
        myfunction(1,"2016-07-01T00:00:00", "2016-07-02T00:00:00");
        myfunction(2,"2016-07-02T00:00:00","2016-07-03T00:00:00");
        myfunction(3,"2016-07-03T00:00:00","2016-07-04T00:00:00");
        myfunction(4,"2016-07-04T00:00:00","2016-07-05T00:00:00");
        myfunction(5,"2016-07-05T00:00:00","2016-07-06T00:00:00");
        myfunction(6,"2016-07-06T00:00:00","2016-07-07T00:00:00");
        root = false;
    }
    })
    

function createStaticVis() {
    var margin = { top: 140, right: 0, bottom: 0, left: 210 }, width = 450,
        height = 450, svgzoom = 1;
    var x = d3.scaleBand().range([0, width]),
        barscale = d3.scaleBand().range([10, 80]),
        z = d3.scaleLinear().domain([0, 1]).clamp(true),
        c = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(10));
    var textfontmap = {};
    textfontmap[5] = 15;
    textfontmap[10] = 12;
    textfontmap[20] = 10;
    textfontmap[50] = 7;
    textfontmap[100] = 4;    
    var relscale;

    $('#svgloader').show();
    $('#tweetsloader').show();
    getTopWords(searchKeyword, keyWords, selected_nodes, startDate, endDate, wordType, function (tweets) {
        console.log(JSON.stringify(tweets.matrix));
        var matrix = tweets.matrix, nodes = tweets.nodes, mincount = tweets.mincount,
            maxcount = tweets.maxcount, n = nodes.length,
            invertedindex = tweets.invertedindex, maxrelcount = tweets.maxrelcount,
            orders = tweets.orders, textlength = tweets.textlength, tweetscounter = 0;

        barscale.domain(d3.range(mincount, maxcount + 1));

        relscale =
            d3.scalePoint().domain(d3.range((maxrelcount + 1))).range([
                0, 1
            ]);

        // The default sort order.
        x.domain(orders[selected_order]);
        var tweet_list_words = "\"" + searchKeyword + "\"";
        for (var i = 0; i < keyWords.length; i++) {
            tweet_list_words += ",\"" + keyWords[i] + "\"";
        }
        $
        $("#tweets_panel_title").text("Tweets (" + (tweetscounter+1) + "-" + (tweetscounter + 50) + ") of " + tweets.textlength );
        $("#tweet_list_words").val(tweet_list_words);
        var tweetsdiv = d3.select("#panel_contents")
            .selectAll()
            .data(tweets.tweets)
            .enter()
            .append('li')
            .attr('class', 'tweets_contents')
            .html(function (d) { tweetscounter++; return "<b>Tweet " + tweetscounter + "</b> : </br>" + d.Text; })
            .on("mouseover", mouserovertweet)
            .on("mouseout", mouseout);

        if (tweetscounter < textlength) {
            d3.select('#nextBtn').attr('disabled', null);
        }

        var zoom = d3.zoom()
            .scaleExtent([1, 10])
            .on("zoom", zoomed);
        var drag_behavior = d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged);

        var svg =
            d3.select('#svg_matrix')
                .append('svg')
                .attr('width', 800)
                .attr('height', 620)
                .call(d3.zoom().scaleExtent([0.2, 10]).on("zoom", function () {
                    $('#dropDownMenu').hide();
                    d3.select('#myg').attr('transform', 'translate(' + (margin.left + d3.zoomTransform(this).x) + ',' + (margin.top + d3.zoomTransform(this).y) + ') scale(' + d3.zoomTransform(this).k + ')');
                }))
                .append('g')
                .attr('id', 'myg')
                .attr(
                'transform', 'translate(' + margin.left + ',' + margin.top + ')');
        //.call(d3.drag().on("start", ()=>{return null;}));

        function dragstarted() {
            d3.select(this).raise();
        }

        function dragged(shape) {
            var dx = d3.event.sourceEvent.offsetX,
                dy = d3.event.sourceEvent.offsetY;

            d3.select(this)
                .attr("transform", shape => "translate(" + (dx - margin.left) + "," + (dy - margin.top) + ")");
        }

        function zoomed() {
            container.attr("transform", d3.event.transform);
        }

        var div = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

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
                    return -barscale(nodes[i].count) - 7;
                })
                .attr('y', x.bandwidth() / 3)
                .attr('dy', '.32em')
                .attr('text-anchor', 'end')
                .style('font-size', textfontmap[selected_nodes] + 'pt')
                .style('cursor', 'pointer')
                .text(function (d, i) {
                    return nodes[i].name;
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

        function colgen() {
            var column = svg.selectAll('.column')
                .data(matrix)
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
                .style('font-size', textfontmap[selected_nodes] + 'pt')
                .text(function (d, i) {
                    return nodes[i].name;
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
                        ((relscale(Math.round(d.cooccurencecount)) * 100 > relationvaluefrom) &&
                            (relscale(Math.round(d.cooccurencecount)) * 100 <= relationvalueto));
                }))
                .enter()
                .append('rect')
                .attr('id' ,
                function (d) {
                    return nodes[d.y].name + "" + nodes[d.x].name;
                })
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
                .style('stroke', 'black')
                .style('stroke-width', '1px')
                .on('mouseover', mouseover)
                .on('mouseout', mouseout)
                .on('click', showdropdown);

            cell.style('opacity', 0.0)
                .transition()
                .duration(1000)
                .style('opacity', function (d) {
                    return selected_group == 'similarity' ?
                        d.similarity :
                        relscale(Math.round(d.cooccurencecount));
                })
                .style('fill', '#34495E')
        }

        function refillsvg() {
            svg.selectAll('.row').remove();
            svg.selectAll('.column').remove();
            rowgen();
            colgen();
        }

        refillsvg();

        function rectmouseover(d, i) {
            console.log(d3.select(this));
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
                .style('left', d3.event.pageX - 365 + 'px')
                .style('top', d3.event.pageY - 50 + 'px');
            $('#dropDownMenu').show();
            d3.select('#showTweets').on('click', (e) => { getWordTweets(d, i); });
            d3.select('#navigate').on('click', (e) => {
                var word1;
                var word2;
                keyWords = document.getElementById('keywordTxtbox').value.split(",").filter(x => x);
                if (typeof (d.x) !== "undefined") {
                     word1 = nodes[d.y].name; 
                     word2 = nodes[d.x].name; 
                     keyWords.push(word1);
                     keyWords.push(word2);
                    }
                else { 
                    word1 = nodes[i].name;
                    word2 = nodes[i].name;
                    keyWords.push(word1);
                }
                searchKeyword = document.getElementById('dataset').value;
                selected_nodes = document.getElementById('nodescount').value;
                startDate = document.getElementById('dateFrom').value;
                endDate = document.getElementById('dateTo').value;
                wordType = document.getElementById('wordtypeList').value;
                tweetsdiv.remove();
                d3.select('#svg_matrix').select('svg').remove();
                createStaticVis();             
            });
        }

        $(document).mouseup(function (e) {
            if (!$('#dropDownMenu').is(e.target) || $('#dropDownMenu').has(e.target).length === 0) {
                $('#dropDownMenu').hide();
            }
        });

        function rectmouseout(d) {
            div.transition().duration(500).style('opacity', 0);
            d3.selectAll('.row text').classed('active', false);
            d3.selectAll('.column text').style('fill', 'black');
        }

        function getWordTweets(d, i) {
            tweetsdiv.remove();
            tweetscounter = 0;
            var word1;
            var word2;
            if (typeof (d.x) !== "undefined") { word1 = nodes[d.y].name; word2 = nodes[d.x].name; tweets.textlength = (Math.round(nodes[d.y].count * (d.cooccurence)));}
            else { word1 = nodes[i].name; word2 = nodes[i].name; tweets.textlength = nodes[i].count;}
            getWordsTweets(searchKeyword, keyWords, word1, word2, startDate, endDate, wordType, (results) => {
                console.log("word1: " + word1 + " word2: " + word2);
                var tweetscounterto = tweetscounter + 50;
                if (tweetscounterto >= tweets.textlength)
                {
                    tweetscounterto = tweets.textlength;
                    d3.select("#nextBtn").attr('disabled', 'disabled');
                }
                else
                {
                    d3.select("#nextBtn").attr('disabled', null);
                }
                $("#tweets_panel_title").text("Tweets (" + (tweetscounter+1) + "-" + (tweetscounterto) + ") of " + tweets.textlength);
                tweetsdiv = d3.select("#panel_contents")
                    .selectAll()
                    .data(results)
                    .enter()
                    .append('li')
                    .attr('class', 'tweets_contents')
                    .html(function (d) { tweetscounter++; return "<b>Tweet " + tweetscounter + "</b> : </br>" + d.Text; })
                    .on("mouseover", mouserovertweet)
                    .on("mouseout", mouseout);
                var tweet_list_words = "\"" + searchKeyword + "\"";
                for (var i = 0; i < keyWords.length; i++) {
                    tweet_list_words += ",\"" + keyWords[i] + "\"";
                }

                if (word1 == word2) {
                    tweet_list_words += ",\"" + word1 + "\"";
                }
                else {
                    tweet_list_words += ",\"" + word1 + "\"" + ",\"" + word2 + "\"";
                }
                $("#tweet_list_words").val(tweet_list_words);
                $('#tweetsloader').hide();
                $('#dropDownMenu').hide();
            });
        }

        d3.select('#chartBtn').on('click', function () {
            $('.textrect').toggle();
            $('.charttext').toggle();
            $('.plaintext').toggle();
        });

        d3.select('#zoomIn').on('click', function () {
            svgzoom += 0.025;
            svg.attr("transform", 'translate(' + margin.left + ',' + margin.top + ') scale(' + svgzoom + ')');
        });

        d3.select('#zoomOut').on('click', function () {
            svgzoom -= 0.025;
            svg.attr("transform", 'translate(' + margin.left + ',' + margin.top + ') scale(' + svgzoom + ')');
        });

        d3.select('#zoomOff').on('click', function () {
            svgzoom = 1;
            d3.select('#myg').attr("transform", 'translate(' + margin.left + ',' + margin.top + ') scale(' + svgzoom + ')');
        });

        d3.select('#relationsSettingApplyBtn').on('click', function () {
            d3.selectAll('.cells').transition().duration(2000).style('opacity', 0.0);
            selected_order = document.getElementById('order').value;
            selected_group = document.getElementById('group').value;
            relationvaluefrom =
                document.getElementById('similarity_value_from').value;
            relationvalueto = document.getElementById('similarity_value_to').value;
            order(selected_order);
            setTimeout(refillsvg, 3500);

            myfunction(1,"2016-07-01T00:00:00", "2016-07-02T00:00:00");
            myfunction(2,"2016-07-02T00:00:00","2016-07-03T00:00:00");
            myfunction(3,"2016-07-03T00:00:00","2016-07-04T00:00:00");
            myfunction(4,"2016-07-04T00:00:00","2016-07-05T00:00:00");
            myfunction(5,"2016-07-05T00:00:00","2016-07-06T00:00:00");
            myfunction(6,"2016-07-06T00:00:00","2016-07-07T00:00:00");
        });

        d3.select('#filterApplyBtn').on('click', function () {
            searchKeyword = document.getElementById('dataset').value;
            keyWords = document.getElementById('keywordTxtbox').value.trim().split(",").filter(x => x);
            selected_nodes = document.getElementById('nodescount').value;
            startDate = document.getElementById('dateFrom').value;
            endDate = document.getElementById('dateTo').value;
            wordType = document.getElementById('wordtypeList').value;
            tweetsdiv.remove();
            d3.select('body').select('svg').remove();
            createStaticVis();
        });

        d3.select('#dataset').on('change', function () {
            searchKeyword = document.getElementById('dataset').value;
            selected_nodes = document.getElementById('nodescount').value;
            startDate = document.getElementById('dateFrom').value;
            endDate = document.getElementById('dateTo').value;
            wordType = document.getElementById('wordtypeList').value;
            tweetsdiv.remove();
            d3.select('body').select('svg').remove();
            createStaticVis();
        });

        d3.select('#nextBtn').on('click', function () {
            tweetsdiv.remove();
            getMoreTweets(tweetscounter, function (tweetstexts) {
                console.log(tweetstexts);
                var tweetscounterto = tweetscounter + 50;
                if (tweetscounterto >= tweets.textlength)
                {
                    tweetscounterto = tweets.textlength;
                    d3.select("#nextBtn").attr('disabled', 'disabled');
                }
                else
                {
                    d3.select("#nextBtn").attr('disabled', null);
                }
                $("#tweets_panel_title").text("Tweets (" + (tweetscounter+1) + "-" + (tweetscounterto) + ") of " + tweets.textlength );
                tweetsdiv = d3.select("#panel_contents")
                    .selectAll()
                    .data(tweetstexts)
                    .enter()
                    .append('li')
                    .attr('class', 'tweets_contents')
                    .html(function (d) { tweetscounter++; return "<b>Tweet " + tweetscounter + "</b> : </br>" + d.Text; })
                    .on("mouseover", mouserovertweet)
                    .on("mouseout", mouseout);
                if (tweetscounter >= 50) {
                    d3.select("#prevBtn").attr('disabled', null);
                }
                $('#tweetsloader').hide();
            });
        });

        d3.select('#prevBtn').on('click', function () {
            d3.select("#nextBtn").attr('disabled', null);
            if (tweetscounter <= 100)
            {
                tweetscounter = 0;
                d3.select("#prevBtn").attr('disabled', 'disabled');
            }
            else
            {
                tweetscounter -=100;
                tweetscounter = Math.round(tweetscounter / 50)*50;
            }
            $("#tweets_panel_title").text("Tweets (" + (tweetscounter+1) + "-" + (tweetscounter + 50) + ") of " + tweets.textlength );
            tweetsdiv.remove();
            getMoreTweets(tweetscounter, function (tweetstexts) {
                console.log(tweetstexts);
                tweetsdiv = d3.select("#panel_contents")
                    .selectAll()
                    .data(tweetstexts)
                    .enter()
                    .append('li')
                    .attr('class', 'tweets_contents')
                    .html(function (d) { tweetscounter++; return "<b>Tweet " + tweetscounter + "</b> : </br>" + d.Text; })
                    .on("mouseover", mouserovertweet)
                    .on("mouseout", mouseout);
                /*
                    if (tweetscounter < textlength) {
                    d3.select("#nextBtn").attr('disabled', null);
                }
                if (tweetscounter <= 50) {
                    d3.select("#prevBtn").attr('disabled', 'disabled');
                }
                */
                $('#tweetsloader').hide();
            });
        });


        function rtextmouseover(d, i) {

            div.transition().duration(200).style('opacity', .9);
            div.html(nodes[i].count + ' tweets contain ' + nodes[i].name)
                //.attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
                .style('left', d3.event.pageX - 200 + 'px')
                .style('top', d3.event.pageY + 'px');
            d3.selectAll('.row text').classed('active', function (d, ind) {
                return ind == i;
            });
            d3.selectAll('.column text').style('fill', function (d, ind) {
                return (ind == i) ? 'red' : 'black';
            });
        }
        function rtextmouseout(rtext) {
            div.transition().duration(500).style('opacity', 0);
            d3.selectAll('.row text').classed('active', false);
            d3.selectAll('.column text').style('fill', 'black');
        }
        function mouseover(p) {
            console.log(p.similarity);
            d3.select('#' + nodes[p.y].name + nodes[p.x].name)
            .style('fill', 'green');

            d3.selectAll('.row text').classed('active', function (d, i) {
                return i == p.y;
            });
            d3.selectAll('.column text').style('fill', function (d, i) {
                return (i == p.x) ? 'red' : 'black';
            });
            console.log(d3.event.pageX + " x " + x(p.x));
            nodes[p.x].name + '\'';

            var tweetscount = '(' + p.commontweetsnum +
            ' tweets) have both \'' + nodes[p.y].name + '\' and \'' +
            nodes[p.x].name + '\'';
            var tweetspercentage = Math.round(p.cooccurence * 100) + '% of ' +
                nodes[p.y].name + '\'s Total (' + nodes[p.y].count + ' tweets)';
            //console.log(Math.round(p.cooccurencecount));
            var tweetcooccurencecount =
                Math.round(relscale(Math.round(p.cooccurencecount)) * 100) +
                '% of the maximum cooccurence count (' + maxrelcount + ' tweets)';
            var nodesimilarity = '\'' + nodes[p.y].name + '\' and \'' +
                nodes[p.x].name + '\' are ' + Math.round(p.similarity * 100) +
                '% similar';
            var msg = 
                ((selected_group == 'similarity') ?
                    nodesimilarity :
                    (tweetscount + '</br>' + tweetcooccurencecount + '</br>' + tweetspercentage));

            div.transition().duration(200).style('opacity', .9);
            div.html(msg)
                .style('left', x(p.x) + 320 + 'px')
                .style('top', x(p.y) + 100 + 'px');
        }
        function mouseout(p) {
            d3.selectAll('.cells')
            .style('fill', '#34495E');
            d3.selectAll('.row text').classed('active', false);
            d3.selectAll('.column text').style('fill', 'black');
            div.transition().duration(500).style('opacity', 0);
        }

        function mouserovertweet(d, i) {
            console.log(d.Text.toLowerCase());
            d3.select('#svg_matrix').selectAll('.row text').classed('active', function (dt, ind) {
                return d.Text.toLowerCase().indexOf(nodes[ind].name.toLowerCase()) !== -1;
            });
            d3.select('#svg_matrix').selectAll('.column text').style('fill', function (dt, ind) {
                return (d.Text.toLowerCase().indexOf(nodes[ind].name.toLowerCase()) !== -1) ? "red" : "black";
            });
        }

        function order(value) {
            var t = svg.transition().duration(1000);
            x.domain(orders[value]);
            //console.log(orders[value]);
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
        $('.loader').hide();
        $('.plaintext').hide();
    });
}
createStaticVis();

function createSVGs(svgnum) {
    var margin = { top: 110 , right: 0, bottom: 0, left: 110 }, width = 150,
    height = 150, svgz0oom = 1;
    var i;
    for (i = 1; i <= svgnum; i++) {

        d3.select('#svg_matrix2')
        .append('div')
        .attr('id', 'container' + i)
        .style('display', 'initial');

        d3.select('#container'+i)
            .append('svg')
            .attr('id', 'svg' + i)
            .attr('width', 260 + 'px')
            .attr('height', 260 + 'px')
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
            .style('margin-left', -130 + 'px')
            .style('margin-top', 270  + 'px' );
            
        d3.select('#svg_matrix2')
            .append('img')
            .attr('id', 'loader' + i)
            .attr('class', 'loader')
            .attr('src', 'Imgs/ajax-loader.gif')
            .style('margin-left', -100 + 'px')
            .style('margin-top', 150 + 'px' );

    }
}

function myfunction(svgcount, startdate, enddate) {
    var margin = { top: 110 , right: 0, bottom: 0, left: 110 }, width = 150,
    height = 150, svgz0oom = 1;
    var x = d3.scaleBand().range([0, width]),
        barscale = d3.scaleBand().range([4, 30]),
        z = d3.scaleLinear().domain([0, 1]).clamp(true),
        c = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(10));
    var ordersmap = {};
    var matrixmap = {};
    var nodesmap = [];
    
    var relscale;
    var svgcounter=0;
    var selectedrow;
    var selectedcol;

    startDate = startdate;
    endDate = enddate;
    $('#loader'+ svgcount).show();
    getTopWords(searchKeyword, keyWords, selected_nodes, startDate, endDate, wordType, function (tweets) {
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
                .on('mouseout', rtextmouseout);

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
                .on('mouseout', rtextmouseout);

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
                        ((relscale(Math.round(d.cooccurencecount)) * 100 > relationvaluefrom) &&
                            (relscale(Math.round(d.cooccurencecount)) * 100 <= relationvalueto));
                }))
                .enter()
                .append('rect')
                .attr('class',
                function (d) {
                    return nodes[d.y].name + "" + nodes[d.x].name;
                })
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
            d3.selectAll('.' + nodes[p.y].name + nodes[p.x].name)
            .style('fill', 'green');

            d3.select('#myg' + svgcount).selectAll('.row text').classed('active', function (d, i) {
                selectedrow = nodes[p.y].name;
                return nodes[i].name == selectedrow;
            });
            d3.select('#myg' + 1).selectAll('.row text').classed('active', function (d, i) {
                return nodes[i].name == selectedrow;
            });
            d3.select('#myg' + 2).selectAll('.row text').classed('active', function (d, i) {
                return nodes[i].name == selectedrow;
            });
            d3.select('#myg' + 3).selectAll('.row text').classed('active', function (d, i) {
                return nodes[i].name == selectedrow;
            });
            d3.select('#myg' + 4).selectAll('.row text').classed('active', function (d, i) {
                return nodes[i].name == selectedrow;
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
            console.log(d3.event.pageX + " x " + p.x);
        }

        function mouseout(p) {
            d3.selectAll('.' + nodes[p.y].name + nodes[p.x].name)
            .style('fill', '#34495E');
            d3.selectAll('.row text').classed('active', false);
            d3.selectAll('.column text').style('fill', 'black');
            div.transition().duration(500).style('opacity', 0);
        }

        d3.select('#svg' + svgcount)
        .call(d3.zoom().scaleExtent([0.2, 10]).on("zoom", function () {
            d3.select('#myg' + svgcount).attr('transform', 'translate(' + (margin.left + d3.zoomTransform(this).x) + ',' + (margin.top + d3.zoomTransform(this).y) + ') scale(' + d3.zoomTransform(this).k + ')');
        }));
/*
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
*/
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



function getTopWords(searchKeyword, keyWords, numNodes, startDate, endDate, wordType, func) {
   //$('#tweetsloader').show();
    $.ajax({
        type: "POST",
        url: '/getTopWords',
        dataType: 'json',
        data: {
            numnodes: numNodes,
            keywords: keyWords,
            searchkeyword: searchKeyword,
            startdate: startDate,
            enddate: endDate,
            wordtype: wordType
        },
        success: func
    });

}

function getWordsTweets(searchKeyword, keyWords, word1, word2, startDate, endDate, wordType, func) {
    $('#tweetsloader').show();
    $.ajax({
        type: "POST",
        url: '/getWordsTweets',
        dataType: 'json',
        data: {
            searchkeyword: searchKeyword,
            keywords: keyWords,
            word1: word1,
            word2: word2,
            startdate: startDate,
            enddate: endDate,
            wordtype: wordType
        },
        success: func
    });
}

function getMoreTweets(index, func) {
    $('#tweetsloader').show();
    $.ajax({
        type: "POST",
        url: '/getMoreText',
        dataType: 'json',
        data: {
            index: index
        },
        success: func
    });
}

