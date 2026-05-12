// Smooth scroll behavior for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements with fade-in class
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.about-card, .research-item, .news-item, .team-card, .research-area-card, .tool-card, .opportunity-card, .pub-highlight');
    
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Load team members if on team page
    if (document.getElementById('team-container')) {
        loadTeamMembers();
    }
    
    // Load publications if on publications page
    if (document.getElementById('publications-container')) {
        loadPublications();
    }
    
    // Load person if on person page
    if (document.getElementById('person-container')) {
        loadPerson();
    }
    
    // Load selected publications (research highlights) if on research page
    if (document.getElementById('selected-publications-container')) {
        loadSelectedPublications();
    }
    
    // Bold "JB Kinney" in research page author lists (for any already in DOM)
    document.querySelectorAll('.pub-authors').forEach(el => {
        el.innerHTML = el.innerHTML.replace(/JB Kinney/g, '<strong>JB Kinney</strong>');
        el.innerHTML = el.innerHTML.replace(/Justin B Kinney/g, '<strong>Justin B Kinney</strong>');
    });
});

// ===== TEAM PAGE DYNAMIC LOADING =====

// SVG icons for social links
const githubIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`;

const scholarIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>`;

// Parse CSV text into array of objects
function parseCSV(csvText) {
    // Handle Windows line endings
    const lines = csvText.replace(/\r/g, '').trim().split('\n');
    if (lines.length < 2) return [];
    
    // Parse header row
    const headers = parseCSVLine(lines[0]).map(h => h.trim());
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parseCSVLine(line);
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim() : '';
        });
        data.push(row);
    }
    return data;
}

// Parse a single CSV line (handles commas in quoted fields)
function parseCSVLine(line) {
    return parseDelimitedLine(line, ',');
}

// Parse a single line with given delimiter (handles quoted fields)
function parseDelimitedLine(line, delimiter) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// Normalize path to be absolute
function normalizePath(path) {
    if (!path) return '';
    if (path.startsWith('/') || path.startsWith('http')) return path;
    return '/' + path;
}

// Create HTML for a team member
function createTeamMemberHTML(member) {
    const name = member['Name'] || '';
    const position = member['Position'] || '';
    const photo = normalizePath(member['Photo'] || '');
    const email = (member['Email'] || '').trim();
    
    // Create photo HTML
    let photoHTML;
    if (photo) {
        photoHTML = `<img src="${photo}" alt="${name}">`;
    } else {
        photoHTML = `<div class="photo-placeholder">👤</div>`;
    }
    
    // All photos link to person page
    const personUrl = `/person/?name=${encodeURIComponent(name)}`;
    const photoSection = `<a href="${personUrl}" class="member-photo-link"><div class="member-photo">${photoHTML}</div></a>`;
    
    const emailHTML = email
        ? `<p class="member-email"><a href="mailto:${email}">${email}</a></p>`
        : '';
    
    return `
        <div class="team-member">
            ${photoSection}
            <h3 class="member-name">${name}</h3>
            <p class="member-role">${position}</p>
            ${emailHTML}
        </div>
    `;
}

// Render team members from data array (single grid, no section headers)
function renderTeamMembers(people) {
    const container = document.getElementById('team-members-container');
    if (!container) return;
    const membersHTML = people.map(m => createTeamMemberHTML(m)).join('');
    container.innerHTML = '<div class="team-grid members-grid">' + membersHTML + '</div>';
}

// Load and display team members
async function loadTeamMembers() {
    const container = document.getElementById('team-container');
    if (!container) return;
    
    
    
    const response = await fetch('/backend/people.csv');
    if (!response.ok) {
        throw new Error('Failed to load CSV');
    }
    
    const csvText = await response.text();
    const people = parseCSV(csvText);
    
    if (people.length > 0) {
        renderTeamMembers(people);
        return;
    }
} 


// ===== RESEARCH HIGHLIGHTS (SELECTED PUBLICATIONS) =====

function createSelectedPubHTML(row) {
    const raw = (key) => (row[key] || '').trim();
    const title = raw('Title');
    const authors = raw('Authors');
    const journal = raw('Journal');
    const year = raw('Year');
    const link = raw('Link');
    const figure = raw('Figure');
    const description = raw('Description');
    
    if (!title) return '';
    
    const figureSrc = figure ? normalizePath(figure) : '';
    const figureHTML = figureSrc
        ? `<div class="pub-figure"><img src="${escapeHtml(figureSrc)}" alt="Figure from publication"></div>`
        : '<div class="pub-figure pub-figure-empty"></div>';
    
    const metaHTML = (authors || journal || year)
        ? `<p class="pub-meta"><span class="pub-authors">${escapeHtml(authors)}</span>${authors && (journal || year) ? ' · ' : ''}${journal ? `<span class="pub-journal">${escapeHtml(journal)}</span>` : ''}${year ? ` (${escapeHtml(year)})` : ''}</p>`
        : '';
    
    const descHTML = description ? `<p class="pub-description">${escapeHtml(description)}</p>` : '';
    
    const linkHTML = link ? `<p class="pub-links"><a href="${escapeHtml(link)}" class="tool-link" target="_blank">Paper</a></p>` : '';
    
    return `
        <article class="pub-highlight">
            ${figureHTML}
            <div class="pub-body">
                <h3 class="pub-title">${escapeHtml(title)}</h3>
                ${metaHTML}
                ${descHTML}
                ${linkHTML}
            </div>
        </article>
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderSelectedPublications(rows) {
    const container = document.getElementById('selected-publications-container');
    if (!container) return;
    
    const filtered = rows.filter(r => (r['Title'] || '').trim());
    const html = filtered.map(r => createSelectedPubHTML(r)).join('');
    container.innerHTML = html || '<p class="loading-message">No selected publications found.</p>';
    
    document.querySelectorAll('.pub-authors').forEach(el => {
        el.innerHTML = el.innerHTML.replace(/JB Kinney/g, '<strong>JB Kinney</strong>');
    });
}

// Normalize selected-publications rows so keys are trimmed (e.g. "\tAuthors" -> "Authors")
function normalizeSelectedPubRows(rows) {
    return rows.map(row => {
        const out = {};
        for (const [key, value] of Object.entries(row)) {
            const k = (key || '').trim();
            out[k] = value != null ? String(value).trim() : '';
        }
        return out;
    });
}

async function loadSelectedPublications() {
    const container = document.getElementById('selected-publications-container');
    if (!container) return;
    // Use path relative to current page so it works on /research/ and when opened as file
    const backendBase = new URL('../backend/', document.location.href).href;
    const xlsxUrl = new URL('selected_publications.xlsx', backendBase).href;
    const csvUrl = new URL('selected_publications.csv', backendBase).href;

    async function tryXlsx() {
        if (typeof XLSX === 'undefined') return null;
        try {
            const response = await fetch(xlsxUrl);
            if (!response.ok) return null;
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
            return normalizeSelectedPubRows(rawRows);
        } catch (e) {
            return null;
        }
    }
    async function tryCsv() {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error('Failed to load selected publications');
        const text = await response.text();
        const rows = parseCSV(text);
        return normalizeSelectedPubRows(rows);
    }
    try {
        let rows = await tryXlsx();
        if (!rows || rows.length === 0) rows = await tryCsv();
        if (rows && rows.length > 0) {
            renderSelectedPublications(rows);
        } else {
            container.innerHTML = '<p class="loading-message">No selected publications found.</p>';
        }
    } catch (err) {
        console.warn('Selected publications load failed:', err);
        container.innerHTML = '<p class="error-message">Could not load selected publications.</p>';
    }
}

// ===== PUBLICATIONS PAGE DYNAMIC LOADING =====


// Format venue string to include DOI
function formatVenueWithDoi(venue, doi, date, status) {
    if (!venue) return venue;

    // Use full date when more precise than year alone
    const trailingDate = (date && date.length > 4) ? date : null;
    const isInPress = status === 'in_press';

    if (!doi) {
        if (!trailingDate) return venue;
        const ym = venue.match(/,\s*(\d{4})\s*$/);
        return ym
            ? venue.slice(0, venue.lastIndexOf(ym[0])) + ', ' + trailingDate
            : venue + ', ' + trailingDate;
    }

    const doiStr = 'doi:' + doi;

    if (isInPress) {
        return trailingDate ? venue + ', ' + doiStr + ', ' + trailingDate : venue + ', ' + doiStr;
    }

    // bioRxiv: replace the preprint number with DOI
    if (/^bioRxiv/i.test(venue)) {
        const ym = venue.match(/,\s*(\d{4})\s*$/);
        const tail = trailingDate || (ym && ym[1]);
        return tail ? 'bioRxiv, ' + doiStr + ', ' + tail : 'bioRxiv, ' + doiStr;
    }

    // arXiv: replace the arXiv identifier with DOI
    if (/^arXiv/i.test(venue)) {
        const ym = venue.match(/,\s*(\d{4})\s*$/);
        const tail = trailingDate || (ym && ym[1]);
        return tail ? 'arXiv, ' + doiStr + ', ' + tail : 'arXiv, ' + doiStr;
    }

    // Regular venue: insert DOI before the trailing year (or full date if more precise)
    const ym = venue.match(/,\s*(\d{4})\s*$/);
    if (ym) {
        const tail = trailingDate || ym[1];
        return venue.slice(0, venue.lastIndexOf(ym[0])) + ', ' + doiStr + ', ' + tail;
    }

    // No year at end: append DOI (and date if available)
    return trailingDate ? venue + ', ' + doiStr + ', ' + trailingDate : venue + ', ' + doiStr;
}

// Format authors to highlight Kinney
function formatAuthors(authorsStr) {
    if (!authorsStr) return '';
    
    // Split authors by comma and format
    const authors = authorsStr.split(',').map(a => a.trim()).filter(a => a);
    
    return authors.map(author => {
        if (author.toLowerCase().includes('kinney')) {
            return `<strong>${author}</strong>`;
        }
        return author;
    }).join(', ');
}

// Create HTML for a single publication
function createPublicationHTML(pub, number) {
    const title = pub.title || '';
    const authors = formatAuthors(pub.authors);
    const doi = (pub.doi || '').trim();
    const status = (pub.status || '').trim();
    const isInPress = status === 'in_press';
    const venue = formatVenueWithDoi(pub.venue || '', doi, pub.date || '', status);

    // Link: prefer paper URL, fall back to preprint
    const citationUrl = pub.paper || pub.preprint || '';
    const pubId = (pub.pub_id || '').trim();
    const isPreprint = pub.preprint && !pub.paper;

    // Build additional links
    const addLinks = [];
    if (pub.has_pdf === 'TRUE' && pub.has_si === 'TRUE' && pubId)
        addLinks.push(`<a href="/publications/files/${pubId}/${pubId}_all.pdf" class="pub-link" target="_blank">Main+SI PDF</a>`);
    if (pub.has_pdf === 'TRUE' && pubId)
        addLinks.push(`<a href="/publications/files/${pubId}/${pubId}_main.pdf" class="pub-link" target="_blank">Main PDF</a>`);
    if (pub.has_si === 'TRUE' && pubId)
        addLinks.push(`<a href="/publications/files/${pubId}/${pubId}_si.pdf" class="pub-link" target="_blank">SI PDF</a>`);
    if (pub.github)
        addLinks.push(`<a href="${pub.github}" class="pub-link" target="_blank">GitHub</a>`);
    if (pub.readthedocs)
        addLinks.push(`<a href="${pub.readthedocs}" class="pub-link" target="_blank">ReadTheDocs</a>`);
    const additionalLinksHTML = addLinks.length > 0
        ? `<div class="pub-additional-links">${addLinks.join(' | ')}</div>`
        : '';
    let itemClass = 'pub-item';
    itemClass += pub.led_by_kinney === 'TRUE' ? ' pub-item-led' : ' pub-item-collab';
    if (isInPress) itemClass += ' pub-item-inpress';
    else if (isPreprint) itemClass += ' pub-item-preprint';

    const citationInner = `
                <h3 class="pub-title">${title}</h3>
                <p class="pub-authors">${authors}</p>
                <p class="pub-journal"><em>${venue}</em></p>`;

    const citationHTML = citationUrl
        ? `<a href="${citationUrl}" class="pub-citation-link" target="_blank">${citationInner}</a>`
        : `<div>${citationInner}</div>`;

    return `
        <div class="${itemClass}">
            <span class="pub-number">${number}.</span>
            <div class="pub-body">
                ${citationHTML}
                ${additionalLinksHTML}
            </div>
        </div>
    `;
}

// Create HTML for a year section
function createYearSectionHTML(year, numberedPubs) {
    const pubsHTML = numberedPubs.map(({pub, number}) => createPublicationHTML(pub, number)).join('');

    return `
        <div class="pub-year">
            <h2>${year}</h2>
            <div class="pub-list">
                ${pubsHTML}
            </div>
        </div>
    `;
}

// Render publications grouped by year (years descending, publications in CSV order within each year)
function renderPublications(publications) {
    const container = document.getElementById('publications-container');
    if (!container) return;

    // Group by year while preserving CSV order within each year
    const byYear = {};

    publications.forEach(pub => {
        const year = (pub.date || '').slice(0, 4) || 'Unknown';
        if (!byYear[year]) {
            byYear[year] = [];
        }
        byYear[year].push(pub);
    });

    // Sort years descending (newest first)
    const sortedYears = Object.keys(byYear).sort((a, b) => parseInt(b) - parseInt(a));

    // Assign numbers: 1 = oldest, N = newest
    // Walk in display order (years descending) and count down from total
    let num = publications.length;
    sortedYears.forEach(year => {
        byYear[year].forEach(pub => { pub._number = num--; });
    });

    // Build HTML (years descending, publications within each year stay in CSV order)
    let html = '';
    sortedYears.forEach(year => {
        const numberedPubs = byYear[year].map(pub => ({pub, number: pub._number}));
        html += createYearSectionHTML(year, numberedPubs);
    });
    
    container.innerHTML = html;
}

// Load and display publications
async function loadPublications() {
    const container = document.getElementById('publications-container');
    if (!container) return;
    try {
        const response = await fetch('/backend/all_publications.csv');
        if (!response.ok) throw new Error('Failed to load CSV');
        const csvText = await response.text();
        const publications = parseCSV(csvText);
        if (publications.length > 0) {
            renderPublications(publications);
            return;
        }
    } catch (error) {
        // Fetch failed (e.g. local file://), use fallback
    }
    renderPublications(fallbackPublicationsData);
}

// ===== ALUMNI SECTION DYNAMIC LOADING =====

// Create HTML for an alumni table
function createAlumniTableHTML(sectionName, alumni) {
    const rows = alumni.map(person => `
        <tr>
            <td>${person['Name'] || ''}</td>
            <td>${person['Position'] || ''}</td>
            <td>${person['Program'] || ''}</td>
            <td>${person['Time in Lab'] || ''}</td>
            <td>${person['Current Position'] || ''}</td>
        </tr>
    `).join('');
    
    return `
        <div class="alumni-table-section">
            <h3>${sectionName}</h3>
            <table class="alumni-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Program</th>
                        <th>Time in Lab</th>
                        <th>Current Position</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

// Render alumni grouped by section
function renderAlumni(alumni) {
    const container = document.getElementById('alumni-container');
    if (!container) return;
    
    // Group by section
    const bySection = {};
    alumni.forEach(person => {
        const section = person['Section'] || 'Other';
        if (!bySection[section]) {
            bySection[section] = [];
        }
        bySection[section].push(person);
    });
    
    // Build HTML for each section
    let html = '';
    Object.keys(bySection).forEach(section => {
        html += createAlumniTableHTML(section, bySection[section]);
    });
    
    container.innerHTML = html;
}

// Load and display alumni
async function loadAlumni() {
    const container = document.getElementById('alumni-container');
    if (!container) return;
    
    try {
        const response = await fetch('/backend/alumni.csv');
        if (!response.ok) throw new Error('Failed to load alumni.csv');
        const csvText = await response.text();
        const alumni = parseCSV(csvText);
        if (alumni.length > 0) {
            renderAlumni(alumni);
        } else {
            container.innerHTML = '<p class="error-message">No alumni data found.</p>';
        }
    } catch (error) {
        container.innerHTML = '<p class="error-message">Unable to load alumni data.</p>';
    }
}

// ===== PERSON PAGE DYNAMIC LOADING =====

// Create HTML for person profile
function createPersonHTML(person) {
    const name = person['Name'] || '';
    const position = person['Position'] || '';
    const photo = normalizePath(person['Photo'] || '');
    const email = (person['Email'] || '').trim();
    const github = person['GitHub'] || '';
    const scholar = person['GoogleScholar'] || '';
    const bio = person['Bio'] || '';
    
    // Photo HTML
    let photoHTML;
    if (photo) {
        photoHTML = `<img src="${photo}" alt="${name}">`;
    } else {
        photoHTML = `<div class="photo-placeholder">👤</div>`;
    }
    
    // Build links
    let linksHTML = '';
    if (github || scholar) {
        linksHTML = '<div class="person-links">';
        if (github) {
            linksHTML += `<a href="${github}" class="person-link" target="_blank">
                ${githubIcon}
                <span>GitHub</span>
            </a>`;
        }
        if (scholar) {
            linksHTML += `<a href="${scholar}" class="person-link" target="_blank">
                ${scholarIcon}
                <span>Google Scholar</span>
            </a>`;
        }
        linksHTML += '</div>';
    }
    
    // Build bio section
    let bioHTML = '';
    if (bio) {
        bioHTML = `<div class="person-bio">${bio}</div>`;
    }
    
    const emailHTML = email ? `<p class="person-email"><a href="mailto:${email}">${email}</a></p>` : '';
    return `
        <div class="person-profile">
            <div class="person-photo">${photoHTML}</div>
            <h1 class="person-name">${name}</h1>
            <p class="person-position">${position}</p>
            ${emailHTML}
            ${linksHTML}
            ${bioHTML}
        </div>
    `;
}

// Load and display person
async function loadPerson() {
    const container = document.getElementById('person-container');
    if (!container) return;
    
    // Get person name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const personName = urlParams.get('name');
    
    if (!personName) {
        container.innerHTML = '<p class="error-message">No person specified.</p>';
        return;
    }
    
    // Update page title
    document.title = `${personName} | Kinney Lab`;
    
    try {
        const response = await fetch('/backend/people.csv');
        if (!response.ok) {
            throw new Error('Failed to load people.csv');
        }
        
        const csvText = await response.text();
        const people = parseCSV(csvText);
        
        // Find the person
        const person = people.find(p => p['Name'] === personName);
        
        if (person) {
            container.innerHTML = createPersonHTML(person);
        } else {
            // Try fallback data
            const fallbackPerson = fallbackTeamData.find(p => p['Name'] === personName);
            if (fallbackPerson) {
                container.innerHTML = createPersonHTML(fallbackPerson);
            } else {
                container.innerHTML = '<p class="error-message">Person not found.</p>';
            }
        }
    } catch (error) {
        // Try fallback data
        const fallbackPerson = fallbackTeamData.find(p => p['Name'] === personName);
        if (fallbackPerson) {
            container.innerHTML = createPersonHTML(fallbackPerson);
        } else {
            container.innerHTML = '<p class="error-message">Unable to load person data.</p>';
        }
    }
}
