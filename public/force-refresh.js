// Force page refresh to ensure styles are properly applied
// This script can be added as a query parameter to the URL, e.g., ?refresh=true
(function() {
  if (!localStorage.getItem('page_refreshed')) {
    localStorage.setItem('page_refreshed', 'true');
    window.location.reload(true);
  } else {
    localStorage.removeItem('page_refreshed');
  }
})(); 