// Data Management

let allData = [];
let filteredData = [];

// Load CSV Data
async function loadData() {
    try {
        const response = await fetch('./data/BMW sales data (2010-2024).csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
            delimiter: ';',
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
            complete: function(results) {
                    console.log('CSV parse complete, rows:', results.data.length);
                    if (results.errors && results.errors.length) console.warn('CSV parse errors:', results.errors.slice(0,5));
                    console.log('Sample rows:', results.data.slice(0,3));
                    // Convert string values to appropriate types (robust to header name variations)
                allData = results.data.map((row, idx) => ({
                    id: Number(row.id || row.ID || row.Id) || (idx + 1),
                    model: row.Model || row.model || '',
                    year: Number(row.Year || row.year) || 0,
                    region: row.Region || row.region || '',
                    color: row.Color || row.color || '',
                    // provide both casings to avoid mismatches in other code
                    fuelType: row.Fuel_Type || row.fuelType || row.FuelType || '',
                    fueltype: row.Fuel_Type || row.fueltype || row.fuelType || '',
                    transmission: row.Transmission || row.transmission || '',
                    engineSize: parseFloat(row.Engine_Size_L || row.EngineSize_L || row.engine_size) || 0,
                    mileage: Number(row.Mileage_KM || row.Mileage || row.mileage) || 0,
                    price: Number(row.Price_USD || row.Price || row.price) || 0,
                    salesVolume: Number(row.Sales_Volume || row.Sales || row.salesVolume) || 0,
                    salesClassification: row.Sales_Classification || row.sales_classification || row.salesClassification || ''
                }));
                
                filteredData = [...allData];
                console.log('allData length after map:', allData.length);
                initializeDashboard();
            },
            error: function(error) {
                console.error('Error parsing CSV:', error);
            }
        });
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Filter Functions
function filterDataByYear(year) {
    if (!year) {
        filteredData = [...allData];
    } else {
        filteredData = allData.filter(item => item.year == year);
    }
    updateDashboard();
}

function searchData(query) {
    if (!query) {
        filteredData = [...allData];
    } else {
        const lowerQuery = query.toLowerCase();
        filteredData = allData.filter(item =>
            item.model.toLowerCase().includes(lowerQuery) ||
            item.region.toLowerCase().includes(lowerQuery) ||
            item.color.toLowerCase().includes(lowerQuery) ||
            item.fuelType.toLowerCase().includes(lowerQuery)
        );
    }
    updateDataTable();
}

// Statistics Functions
function getStatistics() {
    const data = filteredData;
    
    const totalSales = data.reduce((sum, item) => sum + item.salesVolume, 0);
    const totalRevenue = data.reduce((sum, item) => sum + (item.price * item.salesVolume), 0);
    const avgPrice = data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.price, 0) / data.length) : 0;
    
    // Find top model
    const modelSales = {};
    data.forEach(item => {
        modelSales[item.model] = (modelSales[item.model] || 0) + item.salesVolume;
    });
    const topModel = Object.keys(modelSales).reduce((a, b) => modelSales[a] > modelSales[b] ? a : b, 'N/A');
    
    const uniqueRegions = new Set(data.map(item => item.region)).size;
    const totalRecords = data.length;
    
    return {
        totalSales,
        totalRevenue,
        avgPrice,
        topModel,
        uniqueRegions,
        totalRecords
    };
}

// Data Aggregation Functions
function getDataByYear() {
    const yearData = {};
    filteredData.forEach(item => {
        if (!yearData[item.year]) {
            yearData[item.year] = 0;
        }
        yearData[item.year] += item.salesVolume;
    });
    return Object.keys(yearData).sort().map(year => ({
        year,
        sales: yearData[year]
    }));
}

function getTopModels(limit = 5) {
    const modelData = {};
    filteredData.forEach(item => {
        if (!modelData[item.model]) {
            modelData[item.model] = 0;
        }
        modelData[item.model] += item.salesVolume;
    });
    
    return Object.entries(modelData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([model, sales]) => ({ model, sales }));
}

function getDataByRegion() {
    const regionData = {};
    filteredData.forEach(item => {
        if (!regionData[item.region]) {
            regionData[item.region] = {
                sales: 0,
                revenue: 0,
                count: 0
            };
        }
        regionData[item.region].sales += item.salesVolume;
        regionData[item.region].revenue += item.price * item.salesVolume;
        regionData[item.region].count += 1;
    });
    
    return Object.entries(regionData).map(([region, data]) => ({
        region,
        ...data
    }));
}

function getDataByFuelType() {
    const fuelData = {};
    filteredData.forEach(item => {
        if (!fuelData[item.fuelType]) {
            fuelData[item.fuelType] = {
                count: 0,
                sales: 0,
                avgPrice: 0,
                totalPrice: 0
            };
        }
        fuelData[item.fuelType].count += 1;
        fuelData[item.fuelType].sales += item.salesVolume;
        fuelData[item.fuelType].totalPrice += item.price;
    });
    
    Object.keys(fuelData).forEach(fuel => {
        fuelData[fuel].avgPrice = Math.round(fuelData[fuel].totalPrice / fuelData[fuel].count);
    });
    
    return Object.entries(fuelData).map(([fuel, data]) => ({
        fuel,
        ...data
    }));
}

function getDataByColor() {
    const colorData = {};
    filteredData.forEach(item => {
        if (!colorData[item.color]) {
            colorData[item.color] = 0;
        }
        colorData[item.color] += item.salesVolume;
    });
    
    return Object.entries(colorData)
        .sort((a, b) => b[1] - a[1])
        .map(([color, sales]) => ({ color, sales }));
}

function getDataByTransmission() {
    const transmissionData = {};
    filteredData.forEach(item => {
        if (!transmissionData[item.transmission]) {
            transmissionData[item.transmission] = 0;
        }
        transmissionData[item.transmission] += item.salesVolume;
    });
    
    return Object.entries(transmissionData).map(([transmission, sales]) => ({ transmission, sales }));
}

function getSalesClassification() {
    const classData = {};
    filteredData.forEach(item => {
        const key = item.salesClassification && String(item.salesClassification).trim() ? item.salesClassification : 'Unclassified';
        if (!classData[key]) {
            classData[key] = 0;
        }
        classData[key] += item.salesVolume;
    });
    
    return Object.entries(classData).map(([classification, sales]) => ({ classification, sales }));
}

function getModelDetails() {
    const modelData = {};
    filteredData.forEach(item => {
        if (!modelData[item.model]) {
            modelData[item.model] = {
                sales: 0,
                revenue: 0,
                avgPrice: 0,
                count: 0,
                totalPrice: 0
            };
        }
        modelData[item.model].sales += item.salesVolume;
        modelData[item.model].revenue += item.price * item.salesVolume;
        modelData[item.model].count += 1;
        modelData[item.model].totalPrice += item.price;
    });
    
    Object.keys(modelData).forEach(model => {
        modelData[model].avgPrice = Math.round(modelData[model].totalPrice / modelData[model].count);
    });
    
    return Object.entries(modelData)
        .map(([model, data]) => ({
            model,
            ...data
        }))
        .sort((a, b) => b.sales - a.sales);
}

function getPriceVsSales() {
    const modelData = {};
    filteredData.forEach(item => {
        if (!modelData[item.model]) {
            modelData[item.model] = {
                sales: 0,
                totalPrice: 0,
                count: 0
            };
        }
        modelData[item.model].sales += item.salesVolume;
        modelData[item.model].totalPrice += item.price;
        modelData[item.model].count += 1;
    });
    
    return Object.entries(modelData)
        .map(([model, values]) => ({
            model,
            sales: values.sales,
            avgPrice: Math.round(values.totalPrice / values.count)
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10);
}

// Export to CSV
function exportToCSV() {
    if (filteredData.length === 0) {
        alert('No data to export!');
        return;
    }
    
    const headers = ['ID', 'Model', 'Year', 'Region', 'Color', 'Fuel Type', 'Transmission', 'Engine Size', 'Mileage (KM)', 'Price (USD)', 'Sales Volume', 'Classification'];
    const rows = filteredData.map(item => [
        item.id,
        item.model,
        item.year,
        item.region,
        item.color,
        item.fuelType,
        item.transmission,
        item.engineSize,
        item.mileage,
        item.price,
        item.salesVolume,
        item.salesClassification
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BMW_Sales_Data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize year filter
function initializeYearFilter() {
    const yearFilters = document.querySelectorAll('.year-filter, #yearFilter');
    if (!yearFilters.length) return;
    
    const yearSet = new Set(allData.map(item => item.year));
    const years = Array.from(yearSet).sort();
    
    yearFilters.forEach(yearFilter => {
        while (yearFilter.options.length > 1) {
            yearFilter.remove(1);
        }
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    });
}
