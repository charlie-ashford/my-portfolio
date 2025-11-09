let uploadedData = null;
let estimatedData = null;
let originalData = null;
let chartInstance = null;
let currentInterval = 'daily';

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const controlsContainer = document.getElementById('controlsContainer');
const estimateBtn = document.getElementById('estimateBtn');
const resultsContainer = document.getElementById('resultsContainer');
const statusMessage = document.getElementById('statusMessage');
const downloadBtn = document.getElementById('downloadBtn');
const smoothValue = document.getElementById('smoothValue');
const varianceValue = document.getElementById('varianceValue');
const thresholdValue = document.getElementById('thresholdValue');
const intervalValue = document.getElementById('intervalValue');
const modeValue = document.getElementById('modeValue');

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  setTimeout(() => {
    statusMessage.className = 'status-message';
  }, 4000);
}

function setLoading(isLoading) {
  if (isLoading) {
    estimateBtn.disabled = true;
    estimateBtn.innerHTML = `
      <i class="fas fa-spinner fa-spin"></i>
      <span>processing...</span>
    `;
  } else {
    estimateBtn.disabled = false;
    estimateBtn.innerHTML = `
      <span>generate estimate</span>
      <i class="fas fa-arrow-right"></i>
    `;
  }
}

function random(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function detectInterval(dates) {
  if (dates.length < 2) return 'daily';
  const diffs = [];
  for (let i = 1; i < Math.min(dates.length, 10); i++) {
    diffs.push(dates[i] - dates[i - 1]);
  }
  const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  return Math.abs(avg - 3600000) < Math.abs(avg - 86400000)
    ? 'hourly'
    : 'daily';
}

const estimationUtils = {
  isAbbreviate: count => {
    const digits = count.toString().length;
    const first3 = count.toString().slice(0, 3);
    return count === parseInt(first3) * 10 ** (digits - 3);
  },

  updateDiff: count => (count < 1000 ? 1 : 10 ** (count.toString().length - 3)),

  getAbbreviationRange: value => {
    const step = estimationUtils.updateDiff(value);
    const base = Math.floor(value / step) * step;
    return { min: base, max: base + step - 1 };
  },

  clampToAbbreviation: (value, originalValue) => {
    const range = estimationUtils.getAbbreviationRange(originalValue);
    return Math.max(range.min, Math.min(value, range.max));
  },
};

function calcCurrentStats(sincePublished, compareTime, compareData) {
  let compareSincePublished = [];
  for (let i = 0; i < compareTime.length; i++) {
    compareSincePublished[i] =
      new Date(compareTime[i]).getTime() - new Date(compareTime[0]).getTime();
  }

  let preTime = compareSincePublished
    .filter(c => c < sincePublished)
    .slice(-1)[0];
  let nextTime = compareSincePublished.filter(c => c >= sincePublished)[0];

  if (sincePublished > compareSincePublished.slice(-1)[0]) {
    preTime = compareSincePublished.slice(-2)[0];
    nextTime = compareSincePublished.slice(-1)[0];
  }

  let gapTime = nextTime - preTime;
  let progress = (sincePublished - preTime) / gapTime;

  let compareDataPre = compareData[compareSincePublished.indexOf(preTime)];
  let compareDataNext = compareData[compareSincePublished.indexOf(nextTime)];
  let compareDataPNgap = compareDataNext - compareDataPre;

  let compareCurCount = compareDataPre + compareDataPNgap * progress;

  return Math.floor(compareCurCount);
}

function getUniqueCounts(da) {
  let uniq = [];
  let indexs = [];

  da.forEach((d, index, arr) => {
    if (index > 0) {
      if (d !== arr[index - 1] && d !== null) {
        uniq.push(d);
        indexs.push(index);
      }
    } else {
      uniq.push(d);
      indexs.push(index);
    }
  });

  return {
    result: {
      uniq: [...uniq],
      indexs: [...indexs],
    },
  };
}

function formatTimestampToISO(timestamp) {
  return luxon.DateTime.fromMillis(timestamp, { zone: 'utc' }).toISO();
}

function estimateFlat(dataset, method) {
  dataset = dataset.sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );

  let dates = dataset.map(d => d[0]);
  let data = dataset.map(d => d[1]);

  let methodsValues = {
    daily: 86400000,
    hourly: 3600000,
  };

  let methodValue = methodsValues[method] || 86400000;
  let datesValues = dates.map(d => {
    return new Date(d + 'T00:00:00.000Z').getTime();
  });

  let startDate = Math.floor(datesValues[0] / methodValue) * methodValue;
  let endDate =
    Math.floor([...datesValues].reverse()[0] / methodValue) * methodValue;

  let extendedDates = [startDate];
  let currentDate = startDate;

  while (currentDate < endDate) {
    currentDate += methodValue;
    extendedDates.push(currentDate);
  }

  let uniqData = getUniqueCounts(data);
  let extendedData = [];

  for (let i = 0; i < extendedDates.length; i++) {
    extendedData[i] = calcCurrentStats(
      extendedDates[i] - extendedDates[0],
      uniqData.result.indexs.map(d => datesValues[d]),
      uniqData.result.uniq
    );
  }

  let formatDates = extendedDates.map(d => formatTimestampToISO(d));

  return [extendedData, formatDates];
}

function estimateLinearVariance(dataset, method, varianceRange) {
  dataset = dataset.sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );

  let dates = dataset.map(d => d[0]);
  let data = dataset.map(d => d[1]);

  let methodsValues = {
    daily: 86400000,
    hourly: 3600000,
  };

  let methodValue = methodsValues[method] || 86400000;
  let datesValues = dates.map(d => {
    return new Date(d + 'T00:00:00.000Z').getTime();
  });

  let startDate = Math.floor(datesValues[0] / methodValue) * methodValue;
  let endDate =
    Math.floor([...datesValues].reverse()[0] / methodValue) * methodValue;

  let extendedDates = [startDate];
  let currentDate = startDate;

  while (currentDate < endDate) {
    currentDate += methodValue;
    extendedDates.push(currentDate);
  }

  let uniqData = getUniqueCounts(data);

  let anchorIndices = new Set();
  let anchorMap = new Map();

  uniqData.result.indexs.forEach(idx => {
    const timestamp = datesValues[idx];
    const snappedTime = Math.floor(timestamp / methodValue) * methodValue;
    const extendedIdx = extendedDates.indexOf(snappedTime);
    if (extendedIdx !== -1) {
      anchorIndices.add(extendedIdx);
      anchorMap.set(extendedIdx, data[idx]);
    }
  });

  let adjustedAnchors = new Map(anchorMap);
  let anchorArray = Array.from(anchorIndices).sort((a, b) => a - b);

  for (let i = 0; i < anchorArray.length; i++) {
    const idx = anchorArray[i];
    const originalValue = anchorMap.get(idx);

    if (i === 0) {
      adjustedAnchors.set(idx, originalValue);
    } else {
      const variance = random(0, varianceRange);
      const adjustedValue = originalValue + variance;
      adjustedAnchors.set(
        idx,
        estimationUtils.clampToAbbreviation(adjustedValue, originalValue)
      );
    }
  }

  let extendedData = [];

  for (let i = 0; i < extendedDates.length; i++) {
    if (anchorIndices.has(i)) {
      extendedData[i] = adjustedAnchors.get(i);
    } else {
      let prevAnchor = -1;
      let nextAnchor = -1;

      for (const anchor of anchorArray) {
        if (anchor < i) prevAnchor = anchor;
        if (anchor > i && nextAnchor === -1) nextAnchor = anchor;
      }

      if (prevAnchor !== -1 && nextAnchor !== -1) {
        const progress = (i - prevAnchor) / (nextAnchor - prevAnchor);
        const prevValue = adjustedAnchors.get(prevAnchor);
        const nextValue = adjustedAnchors.get(nextAnchor);
        const interpolated = prevValue + (nextValue - prevValue) * progress;

        const variance = random(-varianceRange / 2, varianceRange / 2);
        extendedData[i] = Math.round(interpolated + variance);
      } else {
        extendedData[i] = calcCurrentStats(
          extendedDates[i] - extendedDates[0],
          uniqData.result.indexs.map(d => datesValues[d]),
          uniqData.result.uniq
        );
      }
    }
  }

  let formatDates = extendedDates.map(d => formatTimestampToISO(d));

  return [extendedData, formatDates];
}

function estimate(dataset, method, offset, times) {
  dataset = dataset.sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );

  let dates = dataset.map(d => d[0]);
  let data = dataset.map(d => d[1]);

  let methodsValues = {
    daily: 86400000,
    hourly: 3600000,
  };

  method = method ?? 'daily';
  offset = offset ?? 8;
  times = times ?? 3;
  times = Math.max(times, 1);

  let methodValue = methodsValues[method] || 86400000;
  let datesValues = dates.map(d => {
    return new Date(d + 'T00:00:00.000Z').getTime();
  });

  let startDate = Math.floor(datesValues[0] / methodValue) * methodValue;
  let startStartDate = startDate;
  let endDate =
    Math.floor([...datesValues].reverse()[0] / methodValue) * methodValue;

  let estimatedData = [];
  let fullyEstimatedData = [];

  let extendedDates = [startDate];
  let extendedData = [];

  while (startStartDate < endDate) {
    startStartDate += methodValue;
    extendedDates.push(startStartDate);
  }

  let uniqData = getUniqueCounts(data);

  let originalValueMap = new Map();
  uniqData.result.indexs.forEach((idx, i) => {
    const timestamp = datesValues[idx];
    const snappedTime = Math.floor(timestamp / methodValue) * methodValue;
    originalValueMap.set(snappedTime, uniqData.result.uniq[i]);
  });

  for (let i = 0; i < extendedDates.length; i++) {
    extendedData[i] = calcCurrentStats(
      extendedDates[i] - extendedDates[0],
      uniqData.result.indexs.map(d => datesValues[d]),
      uniqData.result.uniq
    );
  }

  for (let i = 0; i < extendedData.length; i++) {
    let avg =
      extendedData[i + 1] == null
        ? extendedData[extendedData.length - 1] -
          extendedData[extendedData.length - 2]
        : extendedData[i + 1] - extendedData[i];

    estimatedData[i] = random(
      extendedData[i] - avg / offset,
      extendedData[i] + avg / offset
    );
  }

  for (let time = 0; time < times; time++) {
    if (time == 0) {
      for (let i = 0; i < estimatedData.length; i++) {
        if (i < 2 || i == estimatedData.length - 1) {
          fullyEstimatedData[i] = estimatedData[i];
        } else {
          fullyEstimatedData[i] =
            ((estimatedData[i + 1] + estimatedData[i - 1]) / 2) * 1.000001;
        }
      }
    } else {
      for (let i = 0; i < fullyEstimatedData.length; i++) {
        if (i < 2 || i == fullyEstimatedData.length - 1) {
          fullyEstimatedData[i] = fullyEstimatedData[i];
        } else {
          fullyEstimatedData[i] =
            ((fullyEstimatedData[i + 1] + fullyEstimatedData[i - 1]) / 2) *
            1.000001;
        }

        fullyEstimatedData[i] = Math.round(fullyEstimatedData[i]);
      }
    }
  }

  fullyEstimatedData[0] = data[0];
  let formatDates = extendedDates.map(d => formatTimestampToISO(d));
  return [fullyEstimatedData, formatDates];
}

document.getElementById('smoothPasses').addEventListener('input', e => {
  smoothValue.textContent = e.target.value;
});

document.getElementById('offsetDiv').addEventListener('input', e => {
  varianceValue.textContent = e.target.value;
});

document.getElementById('minCount').addEventListener('input', e => {
  thresholdValue.textContent = parseInt(e.target.value).toLocaleString();
});

document.getElementById('interval').addEventListener('change', e => {
  const value = e.target.value;
  intervalValue.textContent = value === 'auto' ? 'auto' : value.toLowerCase();
});

document.getElementById('estimationMode').addEventListener('change', e => {
  const labels = {
    auto: 'auto',
    flat: 'flat',
  };
  modeValue.textContent = labels[e.target.value];
});

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', e => {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', e => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  if (e.dataTransfer.files.length) {
    handleFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener('change', e => {
  if (e.target.files.length) {
    handleFile(e.target.files[0]);
  }
});

function handleFile(file) {
  if (!file.name.endsWith('.csv')) {
    showStatus('please upload a valid csv file', 'error');
    return;
  }

  Papa.parse(file, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
    complete: results => {
      uploadedData = results.data;
      controlsContainer.classList.add('show');
      uploadArea.classList.add('active');
      uploadArea.querySelector('i').className = 'fas fa-check-circle';
      uploadArea.querySelector('h3').textContent = file.name;
      uploadArea.querySelector(
        'p'
      ).textContent = `${results.data.length.toLocaleString()} rows loaded`;
      showStatus('csv loaded successfully!', 'success');
    },
    error: err => {
      showStatus(`error parsing csv: ${err.message}`, 'error');
    },
  });
}

estimateBtn.addEventListener('click', () => {
  if (!uploadedData || !uploadedData.length) return;

  setLoading(true);

  setTimeout(() => {
    try {
      const offset = parseInt(document.getElementById('offsetDiv').value) || 8;
      const smoothPasses =
        parseInt(document.getElementById('smoothPasses').value) || 3;
      const startDateInput = document.getElementById('abbrevStart').value;
      const startDate = startDateInput ? new Date(startDateInput) : new Date(0);
      const estimationMode =
        document.getElementById('estimationMode')?.value || 'auto';

      const keys = Object.keys(uploadedData[0]);
      const dateKey = keys[0];
      const valKey = keys[1];

      let dataPoints = uploadedData
        .map(r => {
          const dateStr = r[dateKey].replace(/['"]+/g, '');
          const value = parseFloat(r[valKey].replace(/['"]+/g, ''));
          return {
            date: new Date(dateStr),
            dateStr: dateStr,
            value: value,
          };
        })
        .filter(d => !isNaN(d.date) && !isNaN(d.value))
        .sort((a, b) => a.date - b.date);

      if (!dataPoints.length) {
        showStatus('no valid data found', 'error');
        setLoading(false);
        return;
      }

      const minThreshold =
        parseInt(document.getElementById('minCount').value) || 0;
      dataPoints = dataPoints.filter(d => d.value >= minThreshold);

      if (!dataPoints.length) {
        showStatus('no data points above threshold', 'error');
        setLoading(false);
        return;
      }

      dataPoints = dataPoints.filter(d => d.date >= startDate);

      if (!dataPoints.length) {
        showStatus('no data after start date', 'error');
        setLoading(false);
        return;
      }

      let intervalType =
        document.getElementById('interval').value === 'auto'
          ? detectInterval(dataPoints.map(d => d.date.getTime()))
          : document.getElementById('interval').value;

      currentInterval = intervalType;

      const dataset = dataPoints.map(d => [d.dateStr, d.value]);

      let estimatedValues, estimatedDates;

      switch (estimationMode) {
        case 'flat':
          [estimatedValues, estimatedDates] = estimateFlat(
            dataset,
            intervalType
          );
          break;
        case 'auto':
        default:
          [estimatedValues, estimatedDates] = estimate(
            dataset,
            intervalType,
            offset,
            smoothPasses
          );
          break;
      }

      originalData = dataPoints;

      estimatedData = estimatedDates.map((dateStr, i) => ({
        date: new Date(dateStr),
        value: estimatedValues[i],
      }));

      displayResults(estimatedData, originalData);
      showStatus('estimation complete!', 'success');
      setLoading(false);
    } catch (error) {
      console.error('Estimation error:', error);
      showStatus('error during estimation. please try again', 'error');
      setLoading(false);
    }
  }, 100);
});

function displayResults(estimated, original) {
  const start = estimated[0].date;
  const end = estimated[estimated.length - 1].date;
  const days = Math.round((end - start) / 86400000);

  document.getElementById(
    'resultsDesc'
  ).textContent = `${estimated.length.toLocaleString()} data points spanning ${days.toLocaleString()} ${
    days === 1 ? 'day' : 'days'
  }`;

  renderChart(estimated, original);
  resultsContainer.classList.add('show');
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderChart(estimated, original) {
  if (chartInstance) chartInstance.destroy();

  const origData = original.map(d => [d.date.getTime(), d.value]);
  const estData = estimated.map(d => [d.date.getTime(), Math.round(d.value)]);

  const dateFormat =
    currentInterval === 'hourly' ? '%b %e, %H:%M' : '%b %e, %Y';

  chartInstance = Highcharts.chart('chart', {
    chart: {
      backgroundColor: 'transparent',
      type: 'line',
      style: {
        fontFamily: 'Inter, sans-serif',
      },
    },
    title: { text: '' },
    xAxis: {
      type: 'datetime',
      lineColor: '#2a2a2a',
      gridLineColor: '#1a1a1a',
      tickColor: '#2a2a2a',
      labels: {
        style: { color: '#666', fontSize: '11px' },
      },
    },
    yAxis: {
      title: { text: '' },
      gridLineColor: '#1a1a1a',
      labels: {
        style: { color: '#666', fontSize: '11px' },
        formatter: function () {
          if (this.value >= 1e6) return (this.value / 1e6).toFixed(1) + 'm';
          if (this.value >= 1e3) return (this.value / 1e3).toFixed(0) + 'k';
          return this.value;
        },
      },
    },
    tooltip: {
      shared: true,
      backgroundColor: '#1a1a1a',
      borderColor: '#2a2a2a',
      borderRadius: 12,
      padding: 12,
      style: {
        color: '#f5f5f5',
        fontSize: '13px',
      },
      formatter: function () {
        let html = `<div style="margin-bottom: 8px; font-weight: 500;">${Highcharts.dateFormat(
          dateFormat,
          this.x
        )}</div>`;

        this.points.forEach(point => {
          const color = point.series.name === 'original' ? '#9a9a9a' : '#fff';
          html += `<div style="margin: 4px 0;"><span style="color:${color}; margin-right: 6px;">●</span>${
            point.series.name
          }: <b>${point.y.toLocaleString()}</b></div>`;
        });

        return html;
      },
      useHTML: true,
    },
    legend: {
      align: 'left',
      verticalAlign: 'top',
      itemStyle: {
        color: '#888',
        fontSize: '13px',
        fontWeight: '400',
      },
      itemHoverStyle: { color: '#f5f5f5' },
      itemMarginBottom: 8,
    },
    credits: { enabled: false },
    plotOptions: {
      series: {
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: true,
              radius: 4,
            },
          },
        },
        states: {
          hover: {
            lineWidthPlus: 1,
          },
        },
      },
    },
    series: [
      {
        name: 'original',
        data: origData,
        color: '#9a9a9a',
        lineWidth: 2,
        zIndex: 1,
      },
      {
        name: 'estimated',
        data: estData,
        color: '#ffffff',
        lineWidth: 2.5,
        zIndex: 2,
      },
    ],
  });
}

downloadBtn.addEventListener('click', () => {
  if (!estimatedData) return;

  const formatDate = date => {
    const dt = luxon.DateTime.fromJSDate(date, { zone: 'utc' });

    if (currentInterval === 'hourly') {
      return dt.toFormat('yyyy-MM-dd HH:mm:ss');
    } else {
      return dt.toFormat('yyyy-MM-dd');
    }
  };

  let csv = 'date,estimated value\n';
  estimatedData.forEach(p => {
    csv += `${formatDate(p.date)},${Math.round(p.value)}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `estimated_data_${currentInterval}_${luxon.DateTime.now().toFormat(
    'yyyyMMdd_HHmmss'
  )}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  showStatus('csv exported successfully!', 'success');
});
