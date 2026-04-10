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