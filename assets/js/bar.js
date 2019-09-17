// jshint esversion : 6
function createBar(width, height) {
  let svg = d3
    .select('#bar')
    .attr('width', width)
    .attr('height', height)
    .style('color', 'black');

  svg
    .append('g')
    .attr('transform', 'translate(33,' + (height - padding) + ')')
    .classed('x-axis', true);

  svg
    .append('g')
    .attr('transform', 'translate(' + (padding + 23) + ',0)')
    .classed('y-axis', true);

  svg
    .append('text')
    .attr('transform', 'translate(' + width / 2 + ',20)')
    .attr('text-anchor', 'middle')
    .text('Click on a country to see annual trends.');

  svg
    .append('text')
    .attr('transform', 'translate(0,' + height / 2 + ')')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .attr('x', -110)
    .attr('y', 12)
    .text('CO2 emissions, thousand metric tons');
}

function barFocus(year) {
  d3.select('#bar')
    .selectAll('rect')
    .attr('fill', d => (d.year === year ? '#16a085' : '#1abc9c'));
}

function drawBar(data, emissionType, country) {
  let bar = d3.select('#bar');
  (chartType = 'bar'),
    (barPadding = 1),
    (width = +bar.attr('width')),
    (height = +bar.attr('height')),
    (countryData = data
      .filter(row => row.country === country)
      .sort((a, b) => a.year - b.year)),
    (xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([padding, width - padding])),
    (yScale = d3
      .scaleLinear()
      .domain([0, d3.max(countryData, d => d[emissionType])])
      .range([height - padding, padding])),
    (t = d3
      .transition()
      .duration(1000)
      .ease(d3.easeBounceOut));

  d3.select('.x-axis').call(d3.axisBottom(xScale).tickFormat(d3.format('.0f')));
  d3.select('.y-axis').call(d3.axisLeft(yScale));

  let bars = bar.selectAll('rect').data(countryData);

  bars.exit().remove();

  bars
    .enter()
    .append('rect')
    .on('mousemove', d => showTooltip(d, chartType, emissionType))
    .on('mouseout', hideTooltip)
    .merge(bars)
    .attr('y', height - padding)
    .attr('height', 0)
    .attr('x', d => (xScale(d.year) + xScale(d.year - 1) + padding + 20) / 2)
    .attr('width', d => xScale(d.year) - xScale(d.year - 1) - barPadding)
    .transition(t)
    .delay((d, i) => i * 100)
    .attr('y', d => yScale(d[emissionType]))
    .attr('height', d => height - padding - yScale(d[emissionType]));
}
