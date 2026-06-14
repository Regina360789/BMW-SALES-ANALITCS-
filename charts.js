// Charts Management
const chartColors = {
    primary: '#12263f',
    accent: '#3b6bb5',
    success: '#1f6f8b',
    warning: '#8f95b2',
    danger: '#b45b4f',
    purple: '#5b5d7a',
    cyan: '#4d8fc1',
    gray: '#4a5568'
};

const chartColorPalette = [
    '#12263f',
    '#3b6bb5',
    '#7b8bb5',
    '#4d8fc1',
    '#9fa8c1',
    '#bcc6db',
    '#1f6f8b',
    '#6f7d9a'
];

let charts = {};

// Chart Options
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            labels: {
                font: {
                    size: 10,
                    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
                },
                padding: 8,
                color: '#666666'
            }
        }
    }
};

// Sales by Year Chart
function createSalesByYearChart() {
    const ctx = document.getElementById('salesByYearChart');
    if (!ctx) return;
    
    const data = getDataByYear();
    
    if (charts.salesByYear) {
        charts.salesByYear.destroy();
    }
    
    charts.salesByYear = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.year),
            datasets: [{
                label: 'Sales Volume',
                data: data.map(d => d.sales),
                borderColor: chartColors.primary,
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: chartColors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#666666',
                        font: { size: 11 }
                    },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    ticks: {
                        color: '#666666',
                        font: { size: 11 }
                    },
                    grid: { display: false }
                }
            }
        }
    });
}

// Sales by Year Chart (alternate / performance section)
function createSalesByYearChart2() {
    const ctx = document.getElementById('salesByYearChart2');
    if (!ctx) return;
    const data = getDataByYear();
    if (charts.salesByYear2) charts.salesByYear2.destroy();
    charts.salesByYear2 = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.year),
            datasets: [{
                label: 'Sales Volume',
                data: data.map(d => d.sales),
                borderColor: chartColors.primary,
                backgroundColor: 'rgba(59,107,181,0.08)',
                borderWidth: 3,
                fill: true,
                tension: 0.35,
                pointRadius: 4
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                y: { beginAtZero: true, ticks: { color: '#666666' }, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { ticks: { color: '#666666' }, grid: { display: false } }
            }
        }
    });
}

// Sales Classification Chart
function createSalesClassificationChart() {
    const ctx = document.getElementById('salesClassificationChart');
    if (!ctx) return;
    
    const data = getSalesClassification();
    
    if (charts.salesClassification) {
        charts.salesClassification.destroy();
    }
    
    charts.salesClassification = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.classification),
            datasets: [{
                data: data.map(d => d.sales),
                backgroundColor: [
                    chartColors.success,
                    chartColors.warning
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            ...chartOptions,
            aspectRatio: 1.2,
            plugins: {
                ...chartOptions.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed || 0;
                            return context.label + ': ' + (value || 0).toLocaleString();
                        }
                    }
                },
                legend: { position: 'bottom' }
            }
        }
    });
}

// Sales Classification Chart (alternate / performance section)
function createSalesClassificationChart2() {
    const ctx = document.getElementById('salesClassificationChart2');
    if (!ctx) return;
    const data = getSalesClassification();
    if (charts.salesClassification2) charts.salesClassification2.destroy();
    charts.salesClassification2 = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.classification),
            datasets: [{
                data: data.map(d => d.sales),
                backgroundColor: chartColorPalette.slice(0, data.length),
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            ...chartOptions,
            aspectRatio: 1.2,
            plugins: { ...chartOptions.plugins, legend: { position: 'bottom' } }
        }
    });
}

// Top Models Chart
function createTopModelsChart() {
    const ctx = document.getElementById('topModelsChart');
    if (!ctx) return;
    
    const data = getTopModels(5);
    
    if (charts.topModels) {
        charts.topModels.destroy();
    }
    
    charts.topModels = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.model),
            datasets: [{
                label: 'Sales Volume',
                data: data.map(d => d.sales),
                backgroundColor: chartColorPalette.slice(0, data.length),
                borderRadius: 5,
                borderSkipped: false
            }]
        },
        options: {
            ...chartOptions,
            indexAxis: 'x',
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#666666',
                        font: { size: 11 }
                    },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    ticks: {
                        color: '#666666',
                        font: { size: 11 }
                    },
                    grid: { display: false }
                }
            }
        }
    });
}

// Fuel Type Chart
function createFuelTypeChart() {
    const ctx = document.getElementById('fuelTypeChart');
    if (!ctx) return;
    
    const data = getDataByFuelType();
    
    if (charts.fuelType) {
        charts.fuelType.destroy();
    }
    
    charts.fuelType = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => d.fuel),
            datasets: [{
                data: data.map(d => d.sales),
                backgroundColor: chartColorPalette,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            ...chartOptions,
            aspectRatio: 1.2,
            plugins: {
                ...chartOptions.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed || 0;
                            return context.label + ': ' + (value || 0).toLocaleString();
                        }
                    }
                },
                legend: { position: 'bottom' }
            }
        }
    });
}

// Fuel Type Chart (alternate / performance section)
function createFuelTypeChart2() {
    const ctx = document.getElementById('fuelTypeChart2');
    if (!ctx) return;
    const data = getDataByFuelType();
    if (charts.fuelType2) charts.fuelType2.destroy();
    charts.fuelType2 = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => d.fuel),
            datasets: [{
                data: data.map(d => d.sales),
                backgroundColor: chartColorPalette,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            ...chartOptions,
            aspectRatio: 1.2,
            plugins: { ...chartOptions.plugins, legend: { position: 'bottom' } }
        }
    });
}

// Sales by Region Chart
function createSalesByRegionChart() {
    const ctx = document.getElementById('salesByRegionChart');
    if (!ctx) return;
    
    const data = getDataByRegion().sort((a, b) => b.sales - a.sales);
    
    if (charts.salesByRegion) {
        charts.salesByRegion.destroy();
    }
    
    charts.salesByRegion = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.region),
            datasets: [{
                label: 'Sales Volume',
                data: data.map(d => d.sales),
                backgroundColor: chartColors.primary,
                borderRadius: 5,
                borderSkipped: false
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#666666',
                        font: { size: 11 }
                    },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    ticks: {
                        color: '#666666',
                        font: { size: 11 }
                    },
                    grid: { display: false }
                }
            }
        }
    });
}

// Price vs Sales Chart
function createPriceVsSalesChart() {
    const ctx = document.getElementById('priceVsSalesChart');
    if (!ctx) return;
    
    const data = getPriceVsSales();
    
    if (charts.priceVsSales) {
        charts.priceVsSales.destroy();
    }
    
    charts.priceVsSales = new Chart(ctx, {
        data: {
            labels: data.map(d => d.model),
            datasets: [
                {
                    type: 'bar',
                    label: 'Sales Volume',
                    data: data.map(d => d.sales),
                    backgroundColor: chartColors.primary,
                    borderRadius: 6,
                    borderSkipped: false,
                    yAxisID: 'y'
                },
                {
                    type: 'line',
                    label: 'Average Price',
                    data: data.map(d => d.avgPrice),
                    borderColor: chartColors.accent,
                    backgroundColor: 'rgba(59, 107, 181, 0.12)',
                    borderWidth: 3,
                    tension: 0.35,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...chartOptions,
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    ticks: { color: '#666666', font: { size: 11 } },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    title: { display: true, text: 'Sales Volume' }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    ticks: { color: '#666666', font: { size: 11 } },
                    grid: { display: false },
                    title: { display: true, text: 'Avg Price (USD)' }
                },
                x: {
                    ticks: { color: '#666666', font: { size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}

// Transmission Chart
function createTransmissionChart() {
    const ctx = document.getElementById('transmissionChart');
    if (!ctx) return;
    
    const data = getDataByTransmission();
    
    if (charts.transmission) {
        charts.transmission.destroy();
    }
    
    charts.transmission = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.transmission),
            datasets: [{
                data: data.map(d => d.sales),
                backgroundColor: chartColorPalette.slice(0, data.length),
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            ...chartOptions,
            plugins: {
                ...chartOptions.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed || 0;
                            return context.label + ': ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Color Popularity Chart
function createColorChart() {
    const ctx = document.getElementById('colorChart');
    if (!ctx) return;
    
    const data = getDataByColor().slice(0, 8);
    
    if (charts.color) {
        charts.color.destroy();
    }
    
    charts.color = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.color),
            datasets: [{
                label: 'Sales Volume',
                data: data.map(d => d.sales),
                backgroundColor: data.map(d => {
                    const colorMap = {
                        'Red': '#ef4444',
                        'Blue': '#0066cc',
                        'Black': '#1a1a1a',
                        'White': '#c0c0c0',
                        'Silver': '#a9a9a9',
                        'Green': '#10b981',
                        'Yellow': '#f59e0b',
                        'Orange': '#ff8c00'
                    };
                    return colorMap[d.color] || chartColors.primary;
                }),
                borderRadius: 5,
                borderSkipped: false
            }]
        },
        options: {
            ...chartOptions,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { color: '#666666', font: { size: 11 } },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                y: {
                    ticks: { color: '#666666', font: { size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}

// Model Details Chart
function createModelDetailsChart() {
    const ctx = document.getElementById('modelDetailsChart');
    if (!ctx) return;
    
    const data = getTopModels(11);
    
    if (charts.modelDetails) {
        charts.modelDetails.destroy();
    }
    
    charts.modelDetails = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.model),
            datasets: [{
                label: 'Sales Volume',
                data: data.map(d => d.sales),
                backgroundColor: chartColorPalette,
                borderRadius: 5,
                borderSkipped: false
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#666666', font: { size: 11 } },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    ticks: { color: '#666666', font: { size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}

// Region Comparison Chart
function createRegionComparisonChart() {
    const ctx = document.getElementById('regionComparisonChart');
    if (!ctx) return;
    
    const data = getDataByRegion().sort((a, b) => b.revenue - a.revenue);
    
    if (charts.regionComparison) {
        charts.regionComparison.destroy();
    }
    
    charts.regionComparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.region),
            datasets: [
                {
                    label: 'Sales Volume',
                    data: data.map(d => d.sales),
                    backgroundColor: chartColors.primary,
                    borderRadius: 5,
                    borderSkipped: false,
                    yAxisID: 'y'
                },
                {
                    label: 'Revenue ($)',
                    data: data.map(d => d.revenue / 1000),
                    backgroundColor: chartColors.accent,
                    borderRadius: 5,
                    borderSkipped: false,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...chartOptions,
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    ticks: { color: '#666666', font: { size: 11 } },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    title: { display: true, text: 'Sales Volume' }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    ticks: { color: '#666666', font: { size: 11 } },
                    grid: { display: false },
                    title: { display: true, text: 'Revenue (Thousands $)' }
                },
                x: {
                    ticks: { color: '#666666', font: { size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}

// Fuel Trend Chart
function createFuelTrendChart() {
    const ctx = document.getElementById('fuelTrendChart');
    if (!ctx) return;
    
    const allFuelData = [];
    allData.forEach(item => {
        const existing = allFuelData.find(d => d.year === item.year && d.fuel === item.fuelType);
        if (existing) {
            existing.sales += item.salesVolume;
        } else {
            allFuelData.push({
                year: item.year,
                fuel: item.fuelType,
                sales: item.salesVolume
            });
        }
    });
    
    const fuels = [...new Set(allFuelData.map(d => d.fuel))];
    const years = [...new Set(allFuelData.map(d => d.year))].sort();
    
    const datasets = fuels.map((fuel, index) => ({
        label: fuel,
        data: years.map(year => {
            const item = allFuelData.find(d => d.year === year && d.fuel === fuel);
            return item ? item.sales : 0;
        }),
        borderColor: chartColorPalette[index % chartColorPalette.length],
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        fill: false
    }));
    
    if (charts.fuelTrend) {
        charts.fuelTrend.destroy();
    }
    
    charts.fuelTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: datasets
        },
        options: {
            ...chartOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#666666', font: { size: 11 } },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    ticks: { color: '#666666', font: { size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}

// Initialize all charts
function initializeAllCharts() {
    createSalesByYearChart();
    createSalesClassificationChart();
    createTopModelsChart();
    createFuelTypeChart();
    createSalesByRegionChart();
    createPriceVsSalesChart();
    createTransmissionChart();
    createColorChart();
    createModelDetailsChart();
    createRegionComparisonChart();
    createFuelTrendChart();
    // performance section charts
    createSalesByYearChart2();
    createSalesClassificationChart2();
    createFuelTypeChart2();
}
