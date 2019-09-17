// jshint esversion : 6
function createPie(width, height) {
  let svg = d3
    .select('#pie')
    .attr('width', width)
    .attr('height', height);

  svg
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + 150 + ')')
    .classed('chart', true);

  svg
    .append('text')
    .attr('transform', 'translate(' + width / 2 + ',20)')
    .attr('text-anchor', 'middle')
    .classed('pieHint', true);
}

function drawPie(data, year, emissionType) {
  let chartType = 'pie',
    yearData = data.filter(d => d.year === year),
    arcs = d3.pie().value(d => d[emissionType])(yearData),
    path = d3
      .arc()
      .innerRadius(0)
      .outerRadius(100)
      .padAngle(0.002),
    continents = [];
  totalEmission = yearData.reduce((acc, next) => ({
    [emissionType]: acc[emissionType] + next[emissionType]
  }));

  for (var i = 0; i < yearData.length; i++) {
    var continent = yearData[i].continent;
    if (!continents.includes(continent)) {
      continents.push(continent);
    }
  }

  let fScale = d3
    .scaleOrdinal()
    .domain(continents)
    .range(['#ab47bc', '#7e57c2', '#26a69a', '#42a5f5', '#78909c']);

  d3.select('p > span').text(year);
  d3.select('.pieHint').text(
    `Total emissions by continent and region, ${year}`
  );

  let pie = d3
    .select('.chart')
    .selectAll('.arc')
    .data(arcs);
  pie.exit().remove();

  pie
    .enter()
    .append('path')
    .classed('arc', true)
    .attr('stroke', '#dff1ff')
    .attr('stroke-width', '0.25px')
    .merge(pie)
    .attr('fill', d => fScale(d.data.continent))
    .attr('d', path)
    .on('mousemove', d => showTooltip(d, chartType, emissionType))
    .on('mouseout', hideTooltip);
}
