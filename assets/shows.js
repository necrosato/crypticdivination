(function () {
  function createShowEntry(show) {
    const li = document.createElement('li');
    li.className = 'show-entry';

    const head = document.createElement('p');
    head.className = 'show-headline';
    const date = new Date(show.date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    head.textContent = `${date} — ${show.venue} (${show.location})`;
    li.appendChild(head);

    const bands = document.createElement('p');
    bands.textContent = show.bands.join(' • ');
    li.appendChild(bands);

    if (show.name) {
      const name = document.createElement('p');
      name.textContent = show.name;
      li.appendChild(name);
    }

    if (show.info) {
      const info = document.createElement('p');
      info.textContent = show.info;
      li.appendChild(info);
    }

    if (Array.isArray(show.links) && show.links.length > 0) {
      const links = document.createElement('p');
      links.innerHTML = show.links.map((link) => `<a href="${link}" target="_blank" rel="noopener noreferrer">Ticket link</a>`).join(' ');
      li.appendChild(links);
    }

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

    upcoming.forEach((show) => upcomingList.appendChild(createShowEntry(show)));

    const pastShowsByYear = past.reduce((groups, show) => {
      const year = new Date(show.date).getFullYear();
      groups[year] = groups[year] || [];
      groups[year].push(show);
      return groups;
    }, {});

    Object.keys(pastShowsByYear)
      .sort((a, b) => Number(b) - Number(a))
      .forEach((year) => {
        const sectionHeading = document.createElement('h3');
        sectionHeading.textContent = year;
        pastContainer.appendChild(sectionHeading);

        const list = document.createElement('ul');
        pastShowsByYear[year].forEach((show) => list.appendChild(createShowEntry(show)));
        pastContainer.appendChild(list);
      });
  };

  document.addEventListener('DOMContentLoaded', window.initializeShowsPage);
})();
