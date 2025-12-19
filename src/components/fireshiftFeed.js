// FireShift Development Feed Component
// Displays commit stories as cards on the FireShift project page

export function createFireshiftFeed() {
  const container = document.getElementById('fireshift-feed');
  if (!container) return;

  // Initial loading state
  container.innerHTML = `
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <span class="ml-3 text-gray-500">Loading updates...</span>
    </div>
  `;

  // Fetch and render stories
  fetchFireshiftStories(container);
}

async function fetchFireshiftStories(container) {
  try {
    const response = await fetch('/data/fireshift-updates.json');
    const data = await response.json();

    if (data.error) {
      renderError(container, data.error);
    } else {
      renderStories(container, data);
      updateStats(data);
    }
  } catch (error) {
    renderError(container, error.message);
  }
}

function updateStats(data) {
  const totalEl = document.getElementById('fireshift-total-updates');
  if (totalEl && data.stories) {
    totalEl.textContent = data.stories.length;
  }
}

function renderError(container, errorMessage) {
  container.innerHTML = `
    <div class="text-center py-12 text-gray-500">
      <p>Unable to load updates: ${errorMessage}</p>
    </div>
  `;
}

function renderStories(container, data) {
  const categoryColors = {
    'Mobile App': '#3b82f6',
    'Scheduling': '#f59e0b',
    'Tracking': '#10b981',
    'Dashboard': '#8b5cf6',
    'Infrastructure': '#6b7280',
  };

  const stories = data.stories || [];

  // Sort by date descending
  stories.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Build HTML
  let html = `
    <div class="text-sm text-gray-400 mb-6">
      Last updated: ${new Date(data.lastUpdated).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })}
    </div>
    <div class="grid md:grid-cols-2 gap-4">
  `;

  stories.forEach(story => {
    const categoryColor = categoryColors[story.category] || '#6b7280';
    const formattedDate = new Date(story.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    html += `
      <article class="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-medium px-2 py-1 rounded-full text-white" style="background: ${categoryColor}">${story.category}</span>
          <span class="text-xs text-gray-400">${formattedDate}</span>
        </div>
        ${story.title ? `<h4 class="font-semibold text-gray-900 mb-2">${story.title}</h4>` : ''}
        <p class="text-sm text-gray-600">${story.description}</p>
      </article>
    `;
  });

  html += '</div>';

  container.innerHTML = html;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFireshiftFeed);
} else {
  createFireshiftFeed();
}
