// jshint esversion : 6
function createMap(width, height) {
  let svg = d3
    .select('#map')
    .attr('width', width)
    .attr('height', height);
  svg
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + 150 + ')')
    .classed('countries', true);

  svg
    .append('text')
    .attr('transform', 'translate(' + width / 2 + ',20)')
    .attr('text-anchor', 'middle')
    .classed('mapHint', true);
}
function drawMap(array, year, emissionType) {
  let chartType = 'map',
    csvData = array[0],
    geoData = topojson.feature(array[1], array[1].objects.countries).features,
    colors = ['#f1c40f', '#e67e22', '#e74c3c', '#c0392b'],
    domains = {
      emissions: [0, 2.5e5, 1e6, 5e6],
      emissionsPerCapita: [0, 0.5, 2, 10]
    },
    mapColorScale = d3
      .scaleLinear()
      .domain(domains[emissionType])
      .range(colors),
    projection = d3
      .geoMercator()
      .scale(100)
      .translate([0, 165]),
    path = d3.geoPath().projection(projection);

  geoData.forEach(val => {
    let countries = csvData.filter(row => row.countryCode === val.id);
    var name = '';
    if (countries.length > 0) name = countries[0].country;
    val.properties = countries.find(c => c.year === year) || {
      country: name,
      [emissionType]: 'No Data Avilable',
      year: year
    };
  });

  d3.select('.mapHint').text(`Carbon dioxide emissions, ${year}`);

  let map = d3
    .select('.countries')
    .selectAll('.country')
    .data(geoData);
  map.exit().remove();

  map
    .enter()
    .append('path')
    .classed('country', true)
    .merge(map)
    .style('cursor', 'pointer')
    .attr('d', path)
    .attr('fill', d => {
      let val = d.properties[emissionType];
      return val !== 'No Data Avilable' ? mapColorScale(val) : '#ccc';
    })
    .attr('country', d => d.properties.country)
    .on('click', function(d) {
      let country = d3.select(this);
      setActiveCountry(country);
      drawBar(csvData, emissionType, d.properties.country);
      barFocus(year);
    })
    .on('mousemove', d => showTooltip(d, chartType, emissionType))
    .on('mouseout', hideTooltip);
}
function setActiveCountry(country) {
  let countries = d3.selectAll('.country');

  countries.classed('active', false);
  countries.classed('inactive', true);

  let isActive = country.classed('active', true).classed('inactive', false);

  d3.select('.active')
    .attr('stroke', 'black')
    .attr('stroke-width', 2);
  d3.selectAll('.inactive').attr('stroke-width', 0);
}
