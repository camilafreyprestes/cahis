(() => {
  "use strict";

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Abrir menu");
      });
    });
  }

  // Animações de entrada ao rolar a página, respeitando a preferência por movimento reduzido.
  const revealItems = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Botão flutuante de retorno ao topo.
  const backToTop = document.querySelector(".back-to-top");
  const updateBackToTop = () => {
    if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 420);
  };
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();


  // Web3Forms: envia sugestões e perguntas sem exigir identificação.
  // Nome e e-mail são opcionais; o e-mail permite responder quando fornecido.
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  const formSubmit = document.getElementById("form-submit");

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", async event => {
      event.preventDefault();

      if (!contactForm.reportValidity()) return;

      const originalButtonText = formSubmit ? formSubmit.innerHTML : "";
      if (formSubmit) {
        formSubmit.disabled = true;
        formSubmit.textContent = "Enviando...";
      }

      formStatus.classList.remove("is-error");
      formStatus.textContent = "Enviando sua mensagem...";

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Não foi possível enviar a mensagem.");
        }

        contactForm.reset();
        formStatus.textContent = "Mensagem enviada. Obrigado por participar! Se você informou um e-mail, poderemos entrar em contato.";
      } catch (error) {
        formStatus.classList.add("is-error");
        formStatus.textContent = "Não foi possível enviar agora. Verifique sua conexão e tente novamente.";
      } finally {
        if (formSubmit) {
          formSubmit.disabled = false;
          formSubmit.innerHTML = originalButtonText;
        }
      }
    });
  }

  // Slideshow: os nomes abaixo devem corresponder exatamente aos arquivos em assets/slide/.
  // Arquivos ausentes são removidos do DOM; o aviso só aparece quando nenhum slide foi encontrado.
  const track = document.getElementById("slide-track");
  const emptyGallery = document.getElementById("gallery-empty");
  const prev = document.getElementById("slide-prev");
  const next = document.getElementById("slide-next");
  let slideIndex = 0;

  if (track) {
    const slides = Array.from(track.querySelectorAll(".slide"));
    const activeSlides = () => Array.from(track.querySelectorAll(".slide"));

    const moveSlides = () => {
      const current = activeSlides();
      if (!current.length) {
        track.style.transform = "translateX(0)";
        return;
      }
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 16;
      const width = current[0].getBoundingClientRect().width + gap;
      slideIndex = Math.max(0, Math.min(slideIndex, current.length - 1));
      track.style.transform = `translateX(${-slideIndex * width}px)`;
    };

    const refreshSlides = () => {
      const current = activeSlides();
      if (emptyGallery) emptyGallery.hidden = current.length > 0;
      if (prev) prev.disabled = current.length < 2;
      if (next) next.disabled = current.length < 2;
      slideIndex = Math.min(slideIndex, Math.max(0, current.length - 1));
      moveSlides();
    };

    slides.forEach(slide => {
      const image = slide.querySelector("img");
      if (!image) {
        slide.remove();
        return;
      }
      image.addEventListener("error", () => {
        slide.remove();
        refreshSlides();
      }, { once: true });
      if (image.complete && image.naturalWidth === 0) slide.remove();
    });

    if (prev) prev.addEventListener("click", () => {
      slideIndex = Math.max(0, slideIndex - 1);
      moveSlides();
    });
    if (next) next.addEventListener("click", () => {
      slideIndex = Math.min(activeSlides().length - 1, slideIndex + 1);
      moveSlides();
    });
    window.addEventListener("resize", moveSlides);
    refreshSlides();
  }
})();
