const sections = document.querySelectorAll("section[id], header[id]");
const navLinks = document.querySelectorAll(".navbar__link");

const options = {
  root: null,
  rootMargin: "-70% 0px -70% 0px", // Kích hoạt khi section nằm ở giữa màn hình
  threshold: 0
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute("id");
      
      // Xóa class active ở tất cả các link
      navLinks.forEach((link) => {
        link.classList.remove("navbar__link--active");
      });

      // Thêm class active vào link có href tương ứng
      const activeLink = document.querySelector(`.navbar__link[href="#${id}"]`);
      if (activeLink) {
        activeLink.classList.add("navbar__link--active");
      }
    }
  });
}, options);

sections.forEach((section) => {
  observer.observe(section);
});
const menuToggle = document.querySelector('.navbar__toggle');
const primaryNavigation = document.getElementById('primary-navigation');

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  primaryNavigation?.classList.toggle('is-open', !isOpen);
});

primaryNavigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    primaryNavigation.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
  });
});

document.getElementById('contactForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = `Portfolio inquiry: ${data.get('service')}`;
  const body = [
    `Name: ${data.get('name')}`,
    `Email: ${data.get('email')}`,
    `Phone: ${data.get('phone') || 'Not provided'}`,
    `Timeline: ${data.get('timeline') || 'Not provided'}`,
    '',
    'Project details:',
    data.get('details')
  ].join('\n');
  window.location.href = `mailto:hoducminh10@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
