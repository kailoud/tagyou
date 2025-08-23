// Show Supabase Data
// This script displays Supabase data in a table format

async function showSupabaseData() {
  console.log('📊 Loading Supabase Data...');
  console.log('============================');

  try {
    // Import Supabase services
    const {
      FoodStallsService,
      ArtistsService,
      FloatTrucksService,
      setSupabaseInstance
    } = await import('./supabase-service.js');

    const { supabase } = await import('./supabase-config.js');
    setSupabaseInstance(supabase);

    // Load all data
    console.log('\n🍽️ Loading Food Stalls...');
    const foodStalls = await FoodStallsService.getAllFoodStalls();
    console.log('✅ Food Stalls loaded:', foodStalls.length);

    console.log('\n🎵 Loading Artists...');
    const artists = await ArtistsService.getAllArtists();
    console.log('✅ Artists loaded:', artists.length);

    console.log('\n🚛 Loading Float Trucks...');
    const floatTrucks = await FloatTrucksService.getAllFloatTrucks();
    console.log('✅ Float Trucks loaded:', floatTrucks.length);

    // Display data summary
    console.log('\n📊 Data Summary:');
    console.log('================');
    console.log(`Food Stalls: ${foodStalls.length}`);
    console.log(`Artists: ${artists.length}`);
    console.log(`Float Trucks: ${floatTrucks.length}`);

    // Show sample data
    if (foodStalls.length > 0) {
      console.log('\n🍽️ Sample Food Stall:');
      console.log(foodStalls[0]);
    }

    if (artists.length > 0) {
      console.log('\n🎵 Sample Artist:');
      console.log(artists[0]);
    }

    if (floatTrucks.length > 0) {
      console.log('\n🚛 Sample Float Truck:');
      console.log(floatTrucks[0]);
    }

    // Create data table in the DOM
    createDataTable(foodStalls, artists, floatTrucks);

  } catch (error) {
    console.error('❌ Error loading Supabase data:', error);
  }
}

function createDataTable(foodStalls, artists, floatTrucks) {
  // Remove existing table if it exists
  const existingTable = document.getElementById('supabase-data-table');
  if (existingTable) {
    existingTable.remove();
  }

  // Create table container
  const container = document.createElement('div');
  container.id = 'supabase-data-table';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 400px;
    max-height: 80vh;
    background: white;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    padding: 20px;
    overflow-y: auto;
    z-index: 10000;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  `;

  // Create header
  const header = document.createElement('h3');
  header.textContent = '📊 Supabase Data';
  header.style.cssText = 'margin: 0 0 20px 0; color: #3b82f6; font-size: 18px;';
  container.appendChild(header);

  // Create summary
  const summary = document.createElement('div');
  summary.innerHTML = `
    <div style="margin-bottom: 20px; padding: 10px; background: #f3f4f6; border-radius: 4px;">
      <strong>Data Summary:</strong><br>
      🍽️ Food Stalls: ${foodStalls.length}<br>
      🎵 Artists: ${artists.length}<br>
      🚛 Float Trucks: ${floatTrucks.length}
    </div>
  `;
  container.appendChild(summary);

  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕ Close';
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 12px;
  `;
  closeBtn.onclick = () => container.remove();
  container.appendChild(closeBtn);

  // Add tables for each data type
  if (foodStalls.length > 0) {
    container.appendChild(createDataSection('🍽️ Food Stalls', foodStalls));
  }

  if (artists.length > 0) {
    container.appendChild(createDataSection('🎵 Artists', artists));
  }

  if (floatTrucks.length > 0) {
    container.appendChild(createDataSection('🚛 Float Trucks', floatTrucks));
  }

  // Add to page
  document.body.appendChild(container);
}

function createDataSection(title, data) {
  const section = document.createElement('div');
  section.style.cssText = 'margin-bottom: 20px;';

  const sectionTitle = document.createElement('h4');
  sectionTitle.textContent = title;
  sectionTitle.style.cssText = 'margin: 0 0 10px 0; color: #374151; font-size: 16px;';
  section.appendChild(sectionTitle);

  const table = document.createElement('table');
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  `;

  // Create header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headers = Object.keys(data[0] || {});

  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    th.style.cssText = `
      padding: 8px;
      text-align: left;
      background: #f9fafb;
      border: 1px solid #d1d5db;
      font-weight: bold;
    `;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create body
  const tbody = document.createElement('tbody');
  data.slice(0, 5).forEach(item => { // Show first 5 items
    const row = document.createElement('tr');
    headers.forEach(header => {
      const td = document.createElement('td');
      const value = item[header];
      td.textContent = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
      td.style.cssText = `
        padding: 6px 8px;
        border: 1px solid #d1d5db;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      `;
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  section.appendChild(table);

  if (data.length > 5) {
    const moreText = document.createElement('div');
    moreText.textContent = `... and ${data.length - 5} more items`;
    moreText.style.cssText = 'font-size: 11px; color: #6b7280; margin-top: 5px;';
    section.appendChild(moreText);
  }

  return section;
}

// Export for manual use
export default showSupabaseData;

// Auto-run disabled - only run when explicitly called
// if (typeof window !== 'undefined') {
//   // Wait a bit for everything to load
//   setTimeout(() => {
//     showSupabaseData();
//   }, 2000);
// }
