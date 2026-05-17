(function () {
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function createShowEntry(show) {
    const displayOrder = Array.isArray(show.bands) ? [...show.bands].reverse() : [];
    const summaryText = `${formatDate(show.date)} - ${show.name ? `${show.name} - ` : ''}${displayOrder.join(', ')} - ${show.venue} - ${show.location}`;

    const li = document.createElement('li');
    li.className = 'show-entry';

    const summary = document.createElement('div');
    summary.className = 'show-summary';
    summary.textContent = summaryText;

    const details = document.createElement('div');
    details.className = 'show-details';
    details.innerHTML = `
      <strong>Date:</strong> ${formatDate(show.date)}<br>
      <strong>Venue:</strong> ${show.venue}<br>
      <strong>Location:</strong> ${show.location}<br>
      <strong>Lineup:</strong>
      <ol>${(show.bands || []).map((band) => `<li>${band}</li>`).join('')}</ol>
    `;

    if (Array.isArray(show.links) && show.links.length > 0) {
      details.innerHTML += `
        <strong>Links:</strong>
        <ol>${show.links.map((link) => `<li><a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a></li>`).join('')}</ol>
      `;
    }

    if (show.info) {
      details.innerHTML += `<p>${show.info}</p>`;
    }

    li.addEventListener('click', function () {
      details.style.display = details.style.display === 'block' ? 'none' : 'block';
    });

    li.appendChild(summary);
    li.appendChild(details);
    return li;
  }

  window.initializeShowsPage = function initializeShowsPage() {
    const dataEl = document.getElementById('show-data');
    const upcomingHeading = document.getElementById('upcoming');
    const pastHeading = document.getElementById('past');
    const upcomingList = document.getElementById('upcoming-shows');
    const pastContainer = document.getElementById('past-shows');

    if (!dataEl || !upcomingHeading || !pastHeading || !upcomingList || !pastContainer) return;

    upcomingList.innerHTML = '';
    pastContainer.innerHTML = '';

    const shows = JSON.parse(dataEl.textContent);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    shows.sort((a, b) => new Date(b.date) - new Date(a.date));
    const upcoming = shows.filter((show) => new Date(show.date) >= todayStart).reverse();
    const past = shows.filter((show) => new Date(show.date) < todayStart);

    upcomingHeading.textContent = `Upcoming Shows (${upcoming.length})`;
    pastHeading.textContent = `Past Shows (${past.length})`;

    upcoming.forEach((show) => {
      upcomingList.appendChild(createShowEntry(show));
    });

    const pastShowsByYear = past.reduce((groups, show) => {
      const year = new Date(show.date).getFullYear();
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(show);
      return groups;
    }, {});

    Object.keys(pastShowsByYear)
      .sort((a, b) => Number(b) - Number(a))
      .forEach((year) => {
        const yearSection = document.createElement('details');
        yearSection.className = 'past-year-group';

        const yearSummary = document.createElement('summary');
        yearSummary.className = 'past-year-summary';
        yearSummary.textContent = `${year} (${pastShowsByYear[year].length})`;

        const yearList = document.createElement('ul');
        yearList.className = 'past-year-list';
        pastShowsByYear[year].forEach((show) => {
          yearList.appendChild(createShowEntry(show));
        });

        yearSection.appendChild(yearSummary);
        yearSection.appendChild(yearList);
        pastContainer.appendChild(yearSection);
      });
  };

  document.addEventListener('DOMContentLoaded', window.initializeShowsPage);
})();
