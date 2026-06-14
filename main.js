// Short number formatter: 1,234 -> 1.2K, 1,234,567 -> 1.2M
function formatShortNumber(num) {
    if (num === null || num === undefined) return '0';
    const abs = Math.abs(num);
    let formatted;
    if (abs >= 1e9) {
        formatted = (num / 1e9).toFixed(1) + 'B';
    } else if (abs >= 1e6) {
        formatted = (num / 1e6).toFixed(1) + 'M';
    } else if (abs >= 1e3) {
        formatted = (num / 1e3).toFixed(1) + 'K';
    } else {
        return num.toLocaleString();
    }
    return formatted.replace(/\.0([KMB])$/, '$1');
}

// Main Application Logic - Modern Version

// Initialize Dashboard on Page Load
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Navigation Links (Sidebar nav-link and navbar nav-item)
    document.querySelectorAll('.nav-link[data-section], .nav-item[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;

            if (!section) return;

            // Update active nav and sidebar links
            document.querySelectorAll('.nav-link[data-section], .nav-item[data-section]').forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            switchSection(section);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Year Filter - Setup for all sections
    setupYearFilters();

    // Search Inputs - Setup for all sections
    setupSearchInputs();

    // Data Filters
    setupDataFilters();

    // Export Button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportToCSV();
        });
    }

    // Reset Filters Button
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            resetAllFilters();
        });
    }

    // Add Data Button
    const addDataBtn = document.getElementById('addDataBtn');
    if (addDataBtn) {
        addDataBtn.addEventListener('click', function() {
            showAddDataModal();
        });
    }

    // Gallery Model Filter
    const galleryFilter = document.getElementById('galleryModelFilter');
    if (galleryFilter) {
        galleryFilter.addEventListener('change', function() {
            populateGallery(this.value);
        });
    }

    // Gallery Search (fallback)
    const gallerySearch = document.getElementById('gallerySearch');
    if (gallerySearch) {
        gallerySearch.addEventListener('input', function() {
            filterGallery(this.value);
        });
    }
}

// Switch Section Function
function switchSection(section) {
    // Update active link
    document.querySelectorAll('[data-section]').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
    
    // Update active section
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(section)?.classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Initialize section content
    setTimeout(() => {
        if (section === 'overview') {
            updateDashboard();
        } else if (section === 'models') {
            updateModelsSection();
        } else if (section === 'regions') {
            updateRegionsSection();
        } else if (section === 'performance') {
            updatePerformanceSection();
        } else if (section === 'data') {
            updateDataSection();
        } else if (section === 'gallery') {
            populateGallery();
        }
    }, 100);
}

// Setup Year Filters for all sections
function setupYearFilters() {
    document.querySelectorAll('.year-filter, #yearFilter').forEach(select => {
        select.addEventListener('change', function() {
            filterDataByYear(this.value);
            // Re-render current section
            const activeSection = document.querySelector('.content-section.active')?.id;
            if (activeSection) switchSection(activeSection);
        });
    });
}

// Setup Search Inputs for all sections
function setupSearchInputs() {
    document.querySelectorAll('.search-box, .search-input').forEach(input => {
        input.addEventListener('input', function() {
            if (this.id === 'dataSearch' || this.id === 'searchInput') {
                searchData(this.value);
                updateDataTable();
            }
        });
    });
}

// Initialize Dashboard
function initializeDashboard() {
    initializeYearFilter();
    // Ensure filters are populated after data load
    try { setupDataFilters(); } catch (e) { /* ignore if not available yet */ }
    updateStatistics();
    updateHeroStats();
    initializeAllCharts();
    populateModelsGrid();
    populateRegionsGrid();
    // Ensure overview background image prefers images/bmw.jpg but falls back if missing
    try { ensureOverviewImage(); } catch (e) {}
    updateDataTable();
}

// Try to set overview background to preferred filenames in order
function ensureOverviewImage() {
    const hero = document.querySelector('.dashboard-hero');
    if (!hero) return;
    const candidates = ['images/bmw.jpg', 'images/Bmw.jpg', 'images/bmw.ilustrasi.jpg'];
    let set = false;

    function tryNext(i) {
        if (i >= candidates.length) return;
        const img = new Image();
        img.onload = function() {
            hero.style.backgroundImage = `url('${candidates[i]}')`;
            hero.style.backgroundSize = 'cover';
            hero.style.backgroundPosition = 'right center';
            set = true;
        };
        img.onerror = function() {
            tryNext(i+1);
        };
        img.src = candidates[i];
    }

    tryNext(0);
    // If none loaded after short delay, add a visible <img> fallback inside hero
    setTimeout(() => {
        if (!set) {
            const existing = hero.querySelector('.hero-img-fallback');
            if (!existing) {
                const fb = document.createElement('img');
                fb.className = 'hero-img-fallback';
                // prefer first candidate that exists (synchronous check via Image)
                for (let i = 0; i < candidates.length; i++) {
                    const test = new Image();
                    test.onload = function() {
                        fb.src = candidates[i];
                        return;
                    };
                    test.onerror = function() {};
                    test.src = candidates[i];
                }
                hero.insertBefore(fb, hero.firstChild);
            }
        }
    }, 300);

    return set;
}

// Update Dashboard Overview
function updateDashboard() {
    updateStatistics();
    updateHeroStats();
    createSalesByYearChart();
    createSalesClassificationChart();
    createTopModelsChart();
    createFuelTypeChart();
    populateModelsGrid();
    populateRegionsGrid();
    updateDataTable('dashboardTableBody');
}

// Update Models Section
function updateModelsSection() {
    updateModelsStats();
    createModelDetailsChart();
    populateModelsGrid();
    updateModelsTable();
    generateModelInsights();
    initializeYearFilter();
}

// Update Models Stats
function updateModelsStats() {
    const models = getModelDetails();
    const stats = getStatistics();
    
    const el1 = document.getElementById('modelsCount');
    const el2 = document.getElementById('topModel');
    const el3 = document.getElementById('modelsAvgPrice');
    const el4 = document.getElementById('modelsTotalSales');
    
    if (el1) el1.textContent = new Set(filteredData.map(d => d.model)).size;
    if (el2) el2.textContent = stats.topModel;
    if (el3) el3.textContent = '$' + Math.round(stats.avgPrice).toLocaleString();
    if (el4) el4.textContent = models.reduce((sum, m) => sum + m.sales, 0).toLocaleString();
}

// Update Models Table
function updateModelsTable() {
    const tbody = document.getElementById('modelsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const models = getModelDetails();
    models.forEach(model => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${model.model}</strong></td>
            <td>${model.sales.toLocaleString()}</td>
            <td>$${(model.revenue / 1000000).toFixed(2)}M</td>
            <td>$${model.avgPrice.toLocaleString()}</td>
            <td>${model.count}</td>
            <td>${Math.round(model.count > 0 ? filteredData.filter(d => d.model === model.model).reduce((sum, d) => sum + d.mileage, 0) / model.count : 0).toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });
}

// Update Regions Section
function updateRegionsSection() {
    updateRegionsStats();
    createSalesByRegionChart();
    initializeAnalyticsMap();
    populateRegionsGrid();
    updateRegionsTable();
    generateRegionInsights();
    initializeYearFilter();
}

// Update Regions Stats
function updateRegionsStats() {
    const regions = getDataByRegion();
    const stats = getStatistics();
    
    const el1 = document.getElementById('regionsCount');
    const el2 = document.getElementById('topRegionText');
    const el3 = document.getElementById('regionsRevenue');
    const el4 = document.getElementById('regionsAvgSales');
    
    if (el1) el1.textContent = regions.length;
    if (el2) el2.textContent = regions.length > 0 ? regions.sort((a, b) => b.sales - a.sales)[0].region : '-';
    if (el3) el3.textContent = '$' + (stats.totalRevenue / 1000000).toFixed(2) + 'M';
    if (el4) el4.textContent = regions.length > 0 ? Math.round(stats.totalSales / regions.length).toLocaleString() : '0';
}

// Update Regions Table
function updateRegionsTable() {
    const tbody = document.getElementById('regionsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const regions = getDataByRegion();
    const stats = getStatistics();
    
    regions.forEach(region => {
        const marketShare = ((region.sales / stats.totalSales) * 100).toFixed(1);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${region.region}</strong></td>
            <td>${region.sales.toLocaleString()}</td>
            <td>$${(region.revenue / 1000000).toFixed(2)}M</td>
            <td>${region.count}</td>
            <td>$${Math.round(region.revenue / region.count).toLocaleString()}</td>
            <td>${marketShare}%</td>
        `;
        tbody.appendChild(row);
    });
}

// Update Performance Section
function updatePerformanceSection() {
    updatePerformanceStats();
    createSalesByYearChart2();
    createSalesClassificationChart2();
    createFuelTypeChart2();
    createTransmissionChart();
    createPriceVsSalesChart();
    initializeYearFilter();
}

// Update Performance Stats
function updatePerformanceStats() {
    const fuelTypes = getDataByFuelType();
    const transmission = getDataByTransmission();
    
    const avgEngine = filteredData.length > 0 ? (filteredData.reduce((sum, d) => sum + d.engineSize, 0) / filteredData.length).toFixed(2) : '0';
    const avgMileage = filteredData.length > 0 ? Math.round(filteredData.reduce((sum, d) => sum + d.mileage, 0) / filteredData.length) : '0';
    
    const el1 = document.getElementById('avgEngine');
    const el2 = document.getElementById('primaryFuel');
    const el3 = document.getElementById('primaryTrans');
    const el4 = document.getElementById('avgMileage');
    
    if (el1) el1.textContent = avgEngine + 'L';
    if (el2) el2.textContent = fuelTypes.length > 0 ? fuelTypes[0].fuel : '-';
    if (el3) el3.textContent = transmission.length > 0 ? transmission[0].transmission : '-';
    if (el4) el4.textContent = avgMileage.toLocaleString() + ' KM';
}

// Update Data Section
function updateDataSection() {
    updateDataStats();
    updateDataTable('tableBody');
    initializeYearFilter();
}

// Update Data Stats
function updateDataStats() {
    const stats = getStatistics();
    
    const el1 = document.getElementById('totalRecords');
    const el2 = document.getElementById('totalValue');
    const el3 = document.getElementById('avgPrice');
    const el4 = document.getElementById('dbTotalRecords');
    
    if (el1) el1.textContent = filteredData.length.toLocaleString();
    if (el2) el2.textContent = '$' + (stats.totalRevenue / 1000000).toFixed(2) + 'M';
    if (el3) el3.textContent = '$' + Math.round(stats.avgPrice).toLocaleString();
    if (el4) el4.textContent = allData.length.toLocaleString();
}

// Update Hero Statistics
function updateHeroStats() {
    const stats = getStatistics();
    
    document.getElementById('heroSales').textContent = stats.totalSales.toLocaleString();
    document.getElementById('heroRevenue').textContent = '$' + formatShortNumber(stats.totalRevenue);
    document.getElementById('heroModels').textContent = filteredData.length > 0 
        ? new Set(filteredData.map(d => d.model)).size 
        : 0;
}
function updateHeroStats() {
    const stats = getStatistics();
    
    document.getElementById('heroSales').textContent = stats.totalSales.toLocaleString();
    document.getElementById('heroRevenue').textContent = '$' + (stats.totalRevenue / 1000000).toFixed(1) + 'M';
    document.getElementById('heroModels').textContent = filteredData.length > 0 
        ? new Set(filteredData.map(d => d.model)).size 
        : 0;
}

// Update Statistics
function updateStatistics() {
    const stats = getStatistics();
    
    const totalSalesEl = document.getElementById('totalSales');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const topModelEl = document.getElementById('topModel');
    const totalRegionsEl = document.getElementById('totalRegions');
    
    if (totalSalesEl) totalSalesEl.textContent = stats.totalSales.toLocaleString();
    if (totalRevenueEl) totalRevenueEl.textContent = '$' + formatShortNumber(stats.totalRevenue);
    if (topModelEl) topModelEl.textContent = stats.topModel;
    if (totalRegionsEl) totalRegionsEl.textContent = stats.uniqueRegions;
}

// Populate Models Grid
function populateModelsGrid() {
    const container = document.getElementById('modelsGrid') || document.getElementById('modelsDetailGrid');
    if (!container) return;
    container.innerHTML = '';
    
    const models = getModelDetails();
    
    if (models.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏎️</div><p>No data available</p></div>';
        return;
    }
    
    models.forEach((model, index) => {
        const card = document.createElement('div');
        card.className = 'model-card';
        card.style.animationDelay = `${index * 0.05}s`;
        card.innerHTML = `
            <h4>${model.model}</h4>
            <div class="detail-item">
                <span class="detail-label">Sales Volume</span>
                <span class="detail-value">${model.sales.toLocaleString()}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Revenue</span>
                <span class="detail-value">$${(model.revenue / 1000000).toFixed(2)}M</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Avg Price</span>
                <span class="detail-value">$${model.avgPrice.toLocaleString()}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Count</span>
                <span class="detail-value">${model.count}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// Populate Regions Grid
function populateRegionsGrid() {
    // prefer the Regions section detail grid so the map appears in the Regions page
    const container = document.getElementById('regionsDetailGrid') || document.getElementById('regionsGrid');
    if (!container) return;
    container.innerHTML = '';
    
    const regions = getDataByRegion().sort((a, b) => b.sales - a.sales);
    
    if (regions.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🗺️</div><p>No data available</p></div>';
        return;
    }

    regions.forEach((region, index) => {
        const card = document.createElement('div');
        card.className = 'region-card';
        card.style.animationDelay = `${index * 0.05}s`;
        card.innerHTML = `
            <h4>${region.region}</h4>
            <div class="detail-item">
                <span class="detail-label">Sales Volume</span>
                <span class="detail-value">${region.sales.toLocaleString()}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Revenue</span>
                <span class="detail-value">$${(region.revenue / 1000000).toFixed(2)}M</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Records</span>
                <span class="detail-value">${region.count}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Avg/Record</span>
                <span class="detail-value">$${Math.round(region.revenue / region.count).toLocaleString()}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function initializeAnalyticsMap() {
    const mapEl = document.getElementById('regionsMap');
    const legendEl = document.getElementById('regionsMapLegend');
    if (!mapEl || !legendEl || !window.L) return;

    const regions = getDataByRegion().sort((a, b) => b.sales - a.sales);
    const regionCoords = {
        'north america': [37.0902, -95.7129],
        'usa': [37.0902, -95.7129],
        'united states': [37.0902, -95.7129],
        'europe': [54.5260, 15.2551],
        'asia': [34.0479, 100.6197],
        'oceania': [-25.2744, 133.7751],
        'australia': [-25.2744, 133.7751],
        'south america': [-8.7832, -55.4915],
        'latin america': [-8.7832, -55.4915],
        'africa': [1.6508, 17.6791],
        'middle east': [29.0, 45.0]
    };

    function coordsFor(regionName) {
        if (!regionName) return null;
        const n = regionName.toLowerCase();
        for (const key of Object.keys(regionCoords)) {
            if (n.includes(key)) return regionCoords[key];
        }
        if (n.includes('canada')) return [56.1304, -106.3468];
        if (n.includes('china')) return [35.8617, 104.1954];
        if (n.includes('india')) return [20.5937, 78.9629];
        if (n.includes('germany')) return [51.1657, 10.4515];
        return null;
    }

    const customRegionColors = {
        'north america': '#1f77b4',
        'usa': '#1f77b4',
        'united states': '#1f77b4',
        'canada': '#2ca02c',
        'europe': '#9467bd',
        'germany': '#8c564b',
        'france': '#e377c2',
        'asia': '#ff7f0e',
        'china': '#d62728',
        'india': '#bcbd22',
        'south america': '#17becf',
        'brazil': '#7f7f7f',
        'africa': '#aec7e8',
        'middle east': '#ffbb78',
        'australia': '#98df8a',
        'oceania': '#c49c94'
    };

    const palette = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#e11d48','#14b8a6','#0ea5e9','#a78bfa','#f43f5e'];
    const regionColorMap = {};

    function colorForIndex(i) {
        return palette[i % palette.length];
    }

    function colorForRegion(region) {
        const key = region.toLowerCase();
        for (const customKey of Object.keys(customRegionColors)) {
            if (key.includes(customKey)) return customRegionColors[customKey];
        }
        return regionColorMap[region] || colorForIndex(Object.keys(regionColorMap).length);
    }

    setTimeout(() => {
        try {
            const map = L.map('regionsMap', { scrollWheelZoom: false }).setView([20, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

            const controlsEl = document.createElement('div');
            controlsEl.style.display = 'flex';
            controlsEl.style.justifyContent = 'flex-end';
            controlsEl.style.gap = '6px';
            controlsEl.style.marginBottom = '6px';

            const btnSales = document.createElement('button');
            btnSales.className = 'metric-btn active';
            btnSales.setAttribute('data-metric', 'sales');
            btnSales.textContent = 'Units';
            btnSales.style.padding = '6px 8px';
            btnSales.style.borderRadius = '6px';
            btnSales.style.border = 'none';
            btnSales.style.cursor = 'pointer';
            btnSales.style.background = '#3b82f6';
            btnSales.style.color = '#fff';

            const btnRevenue = document.createElement('button');
            btnRevenue.className = 'metric-btn';
            btnRevenue.setAttribute('data-metric', 'revenue');
            btnRevenue.textContent = 'Revenue';
            btnRevenue.style.padding = '6px 8px';
            btnRevenue.style.borderRadius = '6px';
            btnRevenue.style.border = '1px solid rgba(0,0,0,0.06)';
            btnRevenue.style.cursor = 'pointer';

            mapEl.parentNode.insertBefore(controlsEl, mapEl);
            controlsEl.appendChild(btnSales);
            controlsEl.appendChild(btnRevenue);

            const markersLayer = L.layerGroup().addTo(map);

            function getMetricValue(obj, metric) {
                if (metric === 'revenue') return Math.round(obj.revenue) || 0;
                return obj.sales || 0;
            }

            function createRadius(value, maxValue) {
                if (!maxValue || maxValue <= 0) return 6;
                const ratio = Math.min(1, value / maxValue);
                return 6 + Math.round(ratio * 24);
            }

            function renderMarkers(metric = 'sales') {
                markersLayer.clearLayers();
                const values = regions.map(r => getMetricValue(r, metric));
                const maxVal = Math.max(...values, 0);

                regions.forEach(r => {
                    if (!regionColorMap[r.region]) regionColorMap[r.region] = colorForRegion(r.region);
                });

                regions.forEach(r => {
                    const c = coordsFor(r.region);
                    if (!c) return;
                    const color = regionColorMap[r.region];
                    const val = getMetricValue(r, metric);
                    const radius = createRadius(val, maxVal);
                    const circle = L.circleMarker(c, {
                        radius,
                        fillColor: color,
                        color: '#fff',
                        weight: 1,
                        fillOpacity: 0.9
                    }).addTo(markersLayer);
                    circle.bindPopup(`<strong>${r.region}</strong><br/>${metric === 'revenue' ? 'Revenue' : 'Units'}: ${val.toLocaleString()}<br/>Records: ${r.count}`);
                });

                const rows = regions.map(r => {
                    const color = regionColorMap[r.region];
                    const val = getMetricValue(r, metric);
                    return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;min-width:180px;"><span style="width:14px;height:14px;border-radius:3px;background:${color};display:inline-block;border:1px solid rgba(0,0,0,0.06);"></span><span style="font-weight:600;color:var(--text-primary);">${r.region}</span><span style="margin-left:auto;color:var(--text-secondary);">${val.toLocaleString()}</span></div>`;
                }).join('');

                legendEl.innerHTML = `<strong>Regions</strong><div style="display:flex;flex-direction:column;gap:4px;margin-top:8px;">${rows}</div>`;
            }

            btnSales.addEventListener('click', () => {
                btnSales.classList.add('active'); btnSales.style.background = '#3b82f6'; btnSales.style.color = '#fff';
                btnRevenue.classList.remove('active'); btnRevenue.style.background = 'transparent'; btnRevenue.style.color = '#222';
                renderMarkers('sales');
            });
            btnRevenue.addEventListener('click', () => {
                btnRevenue.classList.add('active'); btnRevenue.style.background = '#10b981'; btnRevenue.style.color = '#fff';
                btnSales.classList.remove('active'); btnSales.style.background = 'transparent'; btnSales.style.color = '#222';
                renderMarkers('revenue');
            });

            renderMarkers('sales');
        } catch (e) {
            console.warn('Failed to initialize analytics region map', e);
        }
    }, 120);
}

// Update Data Table
function updateDataTable(tbodyId = 'tableBody') {
    let tbody = document.getElementById(tbodyId);
    if (!tbody) {
        tbody = document.getElementById('dashboardTableBody') || document.getElementById('tableBody') || document.getElementById('dataTableBody');
    }
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No data found</td></tr>';
        return;
    }
    
    const maxRows = tbodyId === 'dashboardTableBody' ? 10 : 100;
    filteredData.slice(0, maxRows).forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td><strong>${item.model}</strong></td>
            <td>${item.year}</td>
            <td>${item.region}</td>
            <td>
                <span style="display: inline-block; width: 14px; height: 14px; border-radius: 3px; background-color: ${getColorCode(item.color)}; margin-right: 5px; vertical-align: middle;"></span>
                ${item.color}
            </td>
            <td>${item.fuelType}</td>
            <td class="price-highlight">$${item.price.toLocaleString()}</td>
            <td><strong>${item.salesVolume.toLocaleString()}</strong></td>
        `;
        tbody.appendChild(row);
    });
}

// Get Color Code
function getColorCode(colorName) {
    const colorMap = {
        'Red': '#ef4444',
        'Blue': '#0066cc',
        'Black': '#1a1a1a',
        'White': '#e0e0e0',
        'Silver': '#c0c0c0',
        'Green': '#10b981',
        'Yellow': '#f59e0b',
        'Orange': '#ff8c00',
        'Purple': '#9333ea',
        'Cyan': '#06b6d4'
    };
    return colorMap[colorName] || '#808080';
}

// Show/Hide Loading State
function showLoading(show = true) {
    const content = document.querySelector('.main-content');
    if (show) {
        content.classList.add('loading');
    } else {
        content.classList.remove('loading');
    }
}

// Utility Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

function formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(value);
}

function formatPercent(value, total) {
    return ((value / total) * 100).toFixed(1) + '%';
}

// ============= GALLERY FUNCTIONS =============

// Populate Gallery
function populateGallery(filterModel = '') {
    const models = getModelDetails();
    const stats = getStatistics();
    const container = document.getElementById('galleryGrid');
    
    if (!container) return;

    // Populate filter dropdown (once)
    const filterSelect = document.getElementById('galleryModelFilter');
    if (filterSelect && filterSelect.children.length === 1) {
        const uniqueModels = [...new Set(models.map(m => m.model))].sort();
        uniqueModels.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            filterSelect.appendChild(opt);
        });
    }

    // Filter models if specified
    let displayModels = models;
    if (filterModel) {
        displayModels = models.filter(m => m.model === filterModel);
    }
    
    container.innerHTML = '';
    
    if (displayModels.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏎️</div><p>No models available</p></div>';
        return;
    }
    
    displayModels.forEach((model, index) => {
        const card = document.createElement('div');
        card.className = 'gallery-item';
        card.style.animationDelay = `${index * 0.05}s`;
        card.innerHTML = `
            <div class="gallery-item-image">
                <img src="images/bmw.ilustrasi.jpg" alt="${model.model}" />
            </div>
            <div class="gallery-item-content">
                <h3>${model.model}</h3>
                <div class="gallery-stat">
                    <span class="gallery-stat-label">Sales</span>
                    <span class="gallery-stat-value">${model.sales.toLocaleString()}</span>
                </div>
                <div class="gallery-stat">
                    <span class="gallery-stat-label">Revenue</span>
                    <span class="gallery-stat-value">$${(model.revenue / 1000000).toFixed(1)}M</span>
                </div>
                <div class="gallery-stat">
                    <span class="gallery-stat-label">Avg Price</span>
                    <span class="gallery-stat-value">$${model.avgPrice.toLocaleString()}</span>
                </div>
                <div class="gallery-stat">
                    <span class="gallery-stat-label">Units</span>
                    <span class="gallery-stat-value">${model.count}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Update Gallery Stats
    updateGalleryStats(displayModels, stats);
    
    // Attach click handlers for modal
    attachGalleryClickHandlers();
}

// Update Gallery Stats
function updateGalleryStats(models, stats) {
    document.getElementById('galleryModelCount').textContent = models.length;
    document.getElementById('galleryRecordCount').textContent = filteredData.length.toLocaleString();
    document.getElementById('galleryAvgPrice').textContent = '$' + Math.round(stats.avgPrice).toLocaleString();
    document.getElementById('galleryPopular').textContent = stats.topModel;
}

// Filter Gallery
function filterGallery(query) {
    const query_lower = query.toLowerCase();
    document.querySelectorAll('.gallery-item').forEach(item => {
        const modelName = item.querySelector('h3').textContent.toLowerCase();
        item.style.display = modelName.includes(query_lower) ? 'block' : 'none';
    });
}

// Setup Data Filters
function setupDataFilters() {
    const filterModel = document.getElementById('filterModel');
    const filterYear = document.getElementById('filterYear');
    const filterRegion = document.getElementById('filterRegion');
    const filterFuel = document.getElementById('filterFuel');
    const filterColor = document.getElementById('filterColor');
    const dataSearch = document.getElementById('dataSearch');
    
    if (!filterModel) return;
    
    // Populate filter dropdowns with unique non-empty values
    const models = [...new Set(allData.map(d => d.model).filter(Boolean))].sort();
    const years = [...new Set(allData.map(d => d.year).filter(Boolean))].sort((a, b) => b - a);
    const regions = [...new Set(allData.map(d => d.region).filter(Boolean))].sort();
    const fuels = [...new Set(allData.map(d => d.fueltype).filter(Boolean))].sort();
    const colors = [...new Set(allData.map(d => d.color).filter(Boolean))].sort();
    
    // clear existing appended options (keep first 'All' option)
    if (filterModel.options.length > 1) {
        while (filterModel.options.length > 1) filterModel.remove(1);
    }
    if (filterYear.options.length > 1) {
        while (filterYear.options.length > 1) filterYear.remove(1);
    }
    if (filterRegion.options.length > 1) {
        while (filterRegion.options.length > 1) filterRegion.remove(1);
    }
    if (filterFuel.options.length > 1) {
        while (filterFuel.options.length > 1) filterFuel.remove(1);
    }
    if (filterColor.options.length > 1) {
        while (filterColor.options.length > 1) filterColor.remove(1);
    }

    models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        filterModel.appendChild(opt);
    });
    
    years.forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        filterYear.appendChild(opt);
    });
    
    regions.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        filterRegion.appendChild(opt);
    });
    
    fuels.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f;
        opt.textContent = f;
        filterFuel.appendChild(opt);
    });
    
    colors.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        filterColor.appendChild(opt);
    });
    
    // Add change listeners for all filters
    [filterModel, filterYear, filterRegion, filterFuel, filterColor].forEach(filter => {
        filter.addEventListener('change', function() {
            applyDataFilters();
        });
    });
    
    if (dataSearch) {
        dataSearch.addEventListener('input', function() {
            applyDataFilters();
        });
    }
}

// Apply Data Filters
function applyDataFilters() {
    const filterModel = document.getElementById('filterModel')?.value;
    const filterYear = document.getElementById('filterYear')?.value;
    const filterRegion = document.getElementById('filterRegion')?.value;
    const filterFuel = document.getElementById('filterFuel')?.value;
    const filterColor = document.getElementById('filterColor')?.value;
    const dataSearch = document.getElementById('dataSearch')?.value;
    
    filteredData = allData.filter(d => {
        const matchModel = !filterModel || d.model === filterModel;
        const matchYear = !filterYear || d.year == filterYear;
        const matchRegion = !filterRegion || d.region === filterRegion;
        const matchFuel = !filterFuel || d.fueltype === filterFuel;
        const matchColor = !filterColor || d.color === filterColor;
        const matchSearch = !dataSearch || d.model.toLowerCase().includes(dataSearch.toLowerCase()) || d.region.toLowerCase().includes(dataSearch.toLowerCase());
        return matchModel && matchYear && matchRegion && matchFuel && matchColor && matchSearch;
    });
    
    updateDataTable('tableBody');
    updateDataStats();
}

// Reset All Filters
function resetAllFilters() {
    document.getElementById('filterModel').value = '';
    document.getElementById('filterYear').value = '';
    document.getElementById('filterRegion').value = '';
    document.getElementById('filterFuel').value = '';
    document.getElementById('filterColor').value = '';
    document.getElementById('dataSearch').value = '';
    
    filteredData = [...allData];
    updateDataTable('tableBody');
    updateDataStats();
}

// Update Data Stats
function updateDataStats() {
    const records = filteredData.length;
    const totalValue = filteredData.reduce((sum, d) => sum + (d.price || 0), 0);
    const avgPrice = records > 0 ? totalValue / records : 0;
    
    const dataRecords = document.getElementById('dataRecords');
    const dataValue = document.getElementById('dataValue');
    const dataAvgPrice = document.getElementById('dataAvgPrice');
    
    if (dataRecords) dataRecords.textContent = records.toLocaleString();
    if (dataValue) dataValue.textContent = '$' + (totalValue / 1000000).toFixed(1) + 'M';
    if (dataAvgPrice) dataAvgPrice.textContent = '$' + Math.round(avgPrice).toLocaleString();
}

// Show Add Data Modal
function showAddDataModal() {
    // Create modal if not present
    let backdrop = document.getElementById('addDataBackdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'addDataBackdrop';
        backdrop.className = 'modal-backdrop';
        backdrop.innerHTML = `
            <div class="modal-card">
                <h3>Add New Data <small style="color:#666;font-weight:500;">(required fields marked *)</small></h3>
                <div class="modal-grid">
                    <div>
                        <label>Model <span class="modal-required">*</span></label>
                        <input id="add_model" class="modal-input" />
                    </div>
                    <div>
                        <label>Year <span class="modal-required">*</span></label>
                        <input id="add_year" type="number" class="modal-input" />
                    </div>
                    <div>
                        <label>Region <span class="modal-required">*</span></label>
                        <input id="add_region" class="modal-input" />
                    </div>
                    <div>
                        <label>Color</label>
                        <input id="add_color" class="modal-input" />
                    </div>
                    <div>
                        <label>Fuel Type</label>
                        <input id="add_fuel" class="modal-input" />
                    </div>
                    <div>
                        <label>Transmission</label>
                        <input id="add_transmission" class="modal-input" />
                    </div>
                    <div>
                        <label>Engine Size (L)</label>
                        <input id="add_engine" type="number" step="0.1" class="modal-input" />
                    </div>
                    <div>
                        <label>Mileage (KM)</label>
                        <input id="add_mileage" type="number" class="modal-input" />
                    </div>
                    <div>
                        <label>Price (USD) <span class="modal-required">*</span></label>
                        <input id="add_price" type="number" step="0.01" class="modal-input" />
                    </div>
                    <div>
                        <label>Sales Volume <span class="modal-required">*</span></label>
                        <input id="add_sales" type="number" class="modal-input" />
                    </div>
                    <div>
                        <label>Classification</label>
                        <input id="add_class" class="modal-input" />
                    </div>
                </div>
                <div class="modal-actions">
                    <button id="cancelAddData" class="btn btn-secondary">Cancel</button>
                    <button id="submitAddData" class="btn btn-primary">Add Data</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        // Wire up buttons
        document.getElementById('cancelAddData').addEventListener('click', closeAddDataModal);
        document.getElementById('submitAddData').addEventListener('click', handleAddDataSubmit);
    }

    backdrop.classList.add('active');
}

function closeAddDataModal() {
    const backdrop = document.getElementById('addDataBackdrop');
    if (backdrop) backdrop.classList.remove('active');
}

function handleAddDataSubmit() {
    // Read values and validate required fields
    const model = document.getElementById('add_model').value.trim();
    const year = Number(document.getElementById('add_year').value) || 0;
    const region = document.getElementById('add_region').value.trim();
    const color = document.getElementById('add_color').value.trim();
    const fuel = document.getElementById('add_fuel').value.trim();
    const transmission = document.getElementById('add_transmission').value.trim();
    const engine = parseFloat(document.getElementById('add_engine').value) || 0;
    const mileage = Number(document.getElementById('add_mileage').value) || 0;
    const price = parseFloat(document.getElementById('add_price').value) || 0;
    const sales = Number(document.getElementById('add_sales').value) || 0;
    const classification = document.getElementById('add_class').value.trim();

    if (!model || !year || !region || !price || !sales) {
        alert('Please fill required fields: Model, Year, Region, Price, Sales Volume');
        return;
    }

    const newId = allData.length > 0 ? Math.max(...allData.map(d => d.id || 0)) + 1 : 1;
    const newRecord = {
        id: newId,
        model,
        year,
        region,
        color,
        fuelType: fuel,
        fueltype: fuel,
        transmission,
        engineSize: engine,
        mileage,
        price,
        salesVolume: sales,
        salesClassification: classification || 'Unclassified'
    };

    allData.push(newRecord);
    filteredData.push(newRecord);

    // Refresh UI
    try { setupDataFilters(); } catch (e) {}
    updateDataTable('tableBody');
    updateDataStats();
    updateStatistics();
    updateHeroStats();
    populateModelsGrid();
    populateRegionsGrid();

    closeAddDataModal();
}


// Generate Model Insights
function generateModelInsights() {
    const topModels = getTopModels(5);
    const stats = getStatistics();
    
    if (topModels.length === 0) {
        document.getElementById('modelInsights').innerHTML = '<p>No data available</p>';
        const rankingEl = document.getElementById('topModelRanking');
        if (rankingEl) rankingEl.innerHTML = '';
        return;
    }
    
    const top1 = topModels[0];
    const top2 = topModels[1];
    const top3 = topModels[2];
    
    const top1Pct = stats.totalSales > 0 ? ((top1.sales / stats.totalSales) * 100).toFixed(1) : '0.0';
    const top2Pct = stats.totalSales > 0 && top2 ? ((top2.sales / stats.totalSales) * 100).toFixed(1) : '0.0';
    const modelsCount = new Set(filteredData.map(d => d.model)).size;

    const html = `
        <strong style='font-size: 1.05rem;'>${top1.model}</strong> leads the market with <strong>${top1.sales.toLocaleString()}</strong> units sold, representing <strong>${top1Pct}%</strong> of total sales.<br><br>

        <strong>${top2 ? top2.model : '-'}</strong> follows with <strong>${top2 ? top2.sales.toLocaleString() : '-'}</strong> units, capturing <strong>${top2 ? top2Pct + '%' : '-'}</strong> market share.<br><br>

        Our diverse model lineup spans <strong>${modelsCount}</strong> distinct models, with strong regional performance across <strong>${stats.uniqueRegions}</strong> markets.
    `;

    const el = document.getElementById('modelInsights');
    if (el) el.innerHTML = html;

    const rankingEl = document.getElementById('topModelRanking');
    if (rankingEl) {
        rankingEl.innerHTML = topModels.map((item, index) => `
            <li style="margin-bottom: 0.55rem;">
                <strong>${item.model}</strong> — ${item.sales.toLocaleString()} units
            </li>
        `).join('');
    }
}


// Gallery Modal Functions
function closeModelModal() {
    document.getElementById('modelDetailModal').style.display = 'none';
}

function showModelDetail(modelName) {
    const modal = document.getElementById('modelDetailModal');
    const details = getModelDetails().find(m => m.model === modelName);
    
    if (!details) return;
    
    document.getElementById('modalTitle').textContent = details.model;

    const stats = getStatistics();
    const marketShare = stats.totalSales > 0 ? ((details.sales / stats.totalSales) * 100).toFixed(1) : '0.0';
    const avgMileage = details.count > 0 ? Math.round(filteredData.filter(d => d.model === details.model).reduce((sum, d) => sum + (d.mileage || 0), 0) / details.count) : 0;

    const html = `
        <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;'>
            <div style='padding: 1.5rem; background: #f8f9fa; border-radius: 8px;'>
                <h4 style='margin-top: 0; color: #12263f;'>Performance Metrics</h4>
                <p><strong>Total Sales:</strong> ${details.sales.toLocaleString()}</p>
                <p><strong>Revenue:</strong> $${(details.revenue).toLocaleString()}</p>
                <p><strong>Average Price:</strong> $${(details.avgPrice).toLocaleString()}</p>
                <p><strong>Total Records:</strong> ${details.count}</p>
            </div>
            <div style='padding: 1.5rem; background: #f8f9fa; border-radius: 8px;'>
                <h4 style='margin-top: 0; color: #12263f;'>Market Position</h4>
                <p><strong>Market Share:</strong> ${marketShare}%</p>
                <p><strong>Avg Mileage:</strong> ${avgMileage.toLocaleString()} km</p>
                <p><strong>Popular Colors:</strong> Varies by region</p>
                <p><strong>Status:</strong> Active</p>
            </div>
        </div>
    `;

    document.getElementById('modalContent').innerHTML = html;
    modal.style.display = 'flex';
}

// Add click handler untuk gallery items
function attachGalleryClickHandlers() {
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', function() {
            const modelName = this.querySelector('h3').textContent;
            showModelDetail(modelName);
        });
    });
}


// Generate Region Insights
function generateRegionInsights() {
    const regions = getDataByRegion();
    const stats = getStatistics();
    
    if (!regions || regions.length === 0) {
        document.getElementById('regionInsights').innerHTML = '<p>No data available</p>';
        return;
    }
    
    // Sort by sales and get top regions
    const sorted = regions.sort((a, b) => b.sales - a.sales);
    const top1 = sorted[0];
    const top2 = sorted[1];
    
    const top1Pct = stats.totalSales > 0 ? ((top1.sales / stats.totalSales) * 100).toFixed(1) : '0.0';
    const top2Pct = stats.totalSales > 0 && top2 ? ((top2.sales / stats.totalSales) * 100).toFixed(1) : '0.0';

    const html = `
        <strong style='font-size: 1.05rem;'>${top1.region}</strong> is our strongest market with <strong>${top1.sales.toLocaleString()}</strong> units sold and <strong>$${(top1.revenue || 0).toLocaleString()}</strong> revenue, representing <strong>${top1Pct}%</strong> of global sales.<br><br>

        <strong>${top2 ? top2.region : '-'}</strong> follows with <strong>${top2 ? top2.sales.toLocaleString() : '-'}</strong> units and <strong>$${top2 ? (top2.revenue || 0).toLocaleString() : '-'}</strong> revenue, capturing <strong>${top2 ? top2Pct + '%' : '-'}</strong> market share.<br><br>

        We maintain strong presence across <strong>${stats.uniqueRegions}</strong> key regions with consistent performance and growth opportunities.
    `;

    const el = document.getElementById('regionInsights');
    if (el) el.innerHTML = html;
}

