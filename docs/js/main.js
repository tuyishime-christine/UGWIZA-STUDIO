document.addEventListener('DOMContentLoaded', () => {
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    fetch('components/navbar.html')
      .then(res => res.text())
      .then(html => navbarPlaceholder.innerHTML = html)
      .catch(err => console.error('Failed to load navbar:', err));
  }

  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    fetch('components/footer.html')
      .then(res => res.text())
      .then(html => footerPlaceholder.innerHTML = html)
      .catch(err => console.error('Failed to load footer:', err));
  }
});