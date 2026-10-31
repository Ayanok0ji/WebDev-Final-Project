const topButton = document.createElement("button");

topButton.className = "back-to-top";
topButton.innerHTML = "↑";
topButton.title = "Back to top";

document.body.appendChild(topButton);

window.addEventListener("scroll", () => {
  if (window.scrollY > 400) {
    topButton.classList.add("show");
  } else {
    topButton.classList.remove("show");
  }
});

topButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

const sections = document.querySelectorAll(
  ".terms-container section[id]"
);

const contentsLinks = document.querySelectorAll(
  ".contents a"
);

const observer = new IntersectionObserver((entries) => {

  entries.forEach(entry => {

    if (entry.isIntersecting) {

      contentsLinks.forEach(link => {
        link.classList.remove("active");
      });

      const activeLink = document.querySelector(
        `.contents a[href="#${entry.target.id}"]`
      );

      if (activeLink) {
        activeLink.classList.add("active");
      }
    }

  });

}, {
  rootMargin: "-15% 0px -70% 0px"
});

sections.forEach(section => {
  observer.observe(section);
});


contentsLinks.forEach(link => {

  link.addEventListener("click", (event) => {

    event.preventDefault();

    const target = document.querySelector(
      link.getAttribute("href")
    );

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

  });

});
