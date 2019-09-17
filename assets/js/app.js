// jshint esversion : 6
let tooltip = d3
    .select('body')
    .append('div')
    .classed('tooltip', true),
  option = d3.select('input[type=radio]:checked').node().value,
  totalEmission = 0,
  padding = 50;

Promise.all([
  d3.csv('./data/all_data.csv', function(row, i, header) {
    return {
      continent: row.Continent,
      country: row.Country,
      countryCode: row['Country Code'],
      emissions: +row.Emissions || 0,
      emissionsPerCapita: +row['Emissions Per Capita'] || 0,
      region: row.Region,
      year: +row.Year
    };
  }),
  d3.json('https://unpkg.com/world-atlas@1/world/110m.json')
])
  .then(array => {
    let data = array[0],
      mapData = array[1],
      range = d3.select('.range'),
      minYear = d3.min(data, d => d.year),
      maxYear = d3.max(data, d => d.year),
      option = d3.select('input[type=radio]:checked').node().value,
      height = 300,
      width = +d3.select('.chart-container').node().offsetWidth;

    createPie(width, height);
    createMap(width, (width * 4) / 5);
    createBar(width, height);
    drawPie(data, minYear, option);
    drawMap(array, minYear, option);
    drawBar(data, option, '');

    range
      .property('min', minYear)
      .property('max', maxYear)
      .property('value', minYear)
      .on('input', function(d) {
        let option = d3.select('input[type=radio]:checked').node().value,
          year = +d3.event.target.value;

        drawPie(data, year, option);
        drawMap(array, year, option);
        barFocus(year);
      });

    d3.selectAll('input[type=radio]').on('click', () => {
      let option = d3.select('input[type=radio]:checked').node().value,
        year = parseInt(d3.select('input[type=range]').node().value);
      d3.select('.active').data()[0]
        ? (activeCounrty = d3.select('.active').attr('country'))
        : (activeCounrty = '');
      drawPie(data, year, option);
      drawMap(array, year, option);
      drawBar(data, option, activeCounrty);
    });
  })
  .catch(err => console.log(err));

function showTooltip(d, chartType, emissionType) {
  let info = {};
  if (chartType == 'pie') {
    info.country = d.data.country;
    info.emissions = d.data[emissionType];
    info.year = d.data.year;
    info.PercentageOfEmission = (
      (d.data[emissionType] / totalEmission[emissionType]) *
      100
    ).toFixed(2);
  } else if (chartType === 'map') {
    info.country = d.properties.country;
    info.emissions = d.properties[emissionType];
    info.year = d.properties.year;
  } else if (chartType === 'bar') {
    info.country = d.country;
    info.emissions = d[emissionType];
    info.year = d.year;
  }
  tooltip
    .style('opacity', 1)
    .style('left', d3.event.pageX - tooltip.node().offsetWidth / 2 + 'px')
    .style('top', d3.event.pageY - tooltip.node().offsetHeight - 10 + 'px')
    .style('left', d3.event.pageX - tooltip.node().offsetWidth / 2 + 'px')
    .style('top', d3.event.pageY - tooltip.node().offsetHeight - 10 + 'px')
    .html(`
		<p>Country : ${info.country}</p>
		<p>${letterEdit(emissionType)}: ${info.emissions.toLocaleString()}</p>
		<p>Year : ${info.year}</p>
		<p>Percentage of emissions : ${info.PercentageOfEmission || ''}%</p>
		`);
  function letterEdit(string) {
    if (string)
      return (
        string.charAt(0).toUpperCase() +
        string
          .slice(1)
          .split(/(?=[A-Z])/)
          .join(' ')
          .toLowerCase()
      );
  }
}
function hideTooltip(d) {
  tooltip.style('opacity', 0);
}
