// back to top button
const topButton = document.createElement("button");

topButton.className = "back-to-top";
topButton.innerHTML = "↑";
topButton.title = "Back to top";
topButton.type = "button";

document.body.appendChild(topButton);

// show button when scrolled down
window.addEventListener("scroll", function() {
    if (window.scrollY > 400) {
        topButton.classList.add("show");
    } else {
        topButton.classList.remove("show");
    }
});

// scroll smoothly to top
topButton.addEventListener("click", function() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// active table of contents tracking
const sections = document.querySelectorAll(".privacy-container section[id]");
const contentsLinks = document.querySelectorAll(".contents a");

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            contentsLinks.forEach(function(link) {
                link.classList.remove("active");
            });

            const activeLink = document.querySelector(
                '.contents a[href="#' + entry.target.id + '"]'
            );

            if (activeLink) {
                activeLink.classList.add("active");
            }
        }
    });
}, {
    rootMargin: "-15% 0px -70% 0px"
});

sections.forEach(function(section) {
    observer.observe(section);
});

// smooth scroll for table of contents links
contentsLinks.forEach(function(link) {
    link.addEventListener("click", function(event) {
        const href = link.getAttribute("href");

        if (href && href.startsWith("#")) {
            const target = document.querySelector(href);

            if (target) {
                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }
    });
});
