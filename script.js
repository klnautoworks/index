/*
 * KLN AutoWorks JavaScript
 *
 * Handles interactive components across the site including
 * mobile navigation, booking modal, chat widget, and cookie
 * consent. This file should be loaded on all pages.
 */

document.addEventListener("DOMContentLoaded", () => {

  // Booking modal functionality
  const bookingButtons = document.querySelectorAll(".open-booking");
  const modalOverlay = document.querySelector(".modal-overlay");
  const modal = document.querySelector(".modal");
  const modalClose = document.querySelector(".modal .close");

  if (bookingButtons && modalOverlay && modal && modalClose) {
    bookingButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        modalOverlay.style.display = "flex";
      });
    });
    modalClose.addEventListener("click", () => {
      modalOverlay.style.display = "none";
    });
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.style.display = "none";
      }
    });
  }

  // Chat widget functionality
  const chatToggle = document.getElementById("chat-toggle");
  const chatBox = document.getElementById("chat-box");
  const chatMessages = document.getElementById("chat-messages");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input-field");

  if (chatToggle && chatBox) {
    chatToggle.addEventListener("click", () => {
      const isVisible = chatBox.style.display === "flex";
      chatBox.style.display = isVisible ? "none" : "flex";
    });
  }

  // Predefined FAQ responses
  const faqAnswers = {
    price:
      "Our services start at CAD $79 for basic diagnostics. Choose a service and vehicle in the booking form for an exact quote.",
    warranty:
      "We back our work with a 12 month/20,000 km warranty on parts and labour.",
    area: "We serve Winnipeg, Manitoba and surrounding suburbs within a 40‑km radius.",
    hours:
      "We operate 7 days a week, 8am–8pm. Emergency roadside assistance is available 24/7.",
  };

  function addChatMessage(text, sender = "bot") {
    const msg = document.createElement("div");
    msg.classList.add("message");
    msg.style.marginBottom = "0.5rem";
    // Display the sender name: use the brand name for bot responses
    msg.innerHTML = `<strong>${
      sender === "user" ? "You" : "KLN"
    }:</strong> ${text}`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const userMsg = chatInput.value.trim();
      if (!userMsg) return;
      addChatMessage(userMsg, "user");
      chatInput.value = "";
      // Determine response
      const key = Object.keys(faqAnswers).find((k) =>
        userMsg.toLowerCase().includes(k)
      );

      //Agregado para menu desplegable
      document.querySelectorAll(".nav-links a").forEach((a) => {
        a.addEventListener("click", () => {
          nav.classList.remove("mobile-active");
          burger.classList.remove("active");
          burger.setAttribute("aria-expanded", "false");
          collapseDropdowns();
        });
      });

      const response = key
        ? faqAnswers[key]
        : "Thanks for reaching out! Please leave your name and number and we’ll get back to you shortly, or use our booking form for immediate scheduling.";
      setTimeout(() => {
        addChatMessage(response, "bot");
      }, 500);
    });
  }

      // --- Navigation dropdown logic ---
  const collapseDropdowns = () => {
    document.querySelectorAll(".nav-item.has-dropdown").forEach((item) => {
      item.classList.remove("is-open");
      const toggle = item.querySelector(".dropdown-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  };

  document.querySelectorAll(".dropdown-toggle").forEach((button) => {
    const parentItem = button.closest(".nav-item.has-dropdown");
    if (!parentItem) return;

    button.addEventListener("click", (event) => {
      if (window.matchMedia("(min-width: 769px)").matches) return; // desktop usa hover
      event.preventDefault();
      event.stopPropagation();
      const isOpen = parentItem.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });

  const nav = document.querySelector(".nav");
  const burger = document.querySelector(".hamburger");
  const header = document.querySelector("header");
  const hero = document.querySelector(".hero");

  if (nav && burger) {
    const closeMenu = () => {
      nav.classList.remove("mobile-active");
      burger.classList.remove("active");
      burger.setAttribute("aria-expanded", "false");
      collapseDropdowns();
    };

    const toggleMenu = () => {
      const isOpen = nav.classList.toggle("mobile-active");
      burger.classList.toggle("active", isOpen);
      burger.setAttribute("aria-expanded", String(isOpen));
      if (!isOpen) collapseDropdowns();
    };

    burger.addEventListener("click", (event) => {
      event.preventDefault();
      toggleMenu();
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("mobile-active")) return;
      if (nav.contains(event.target) || burger.contains(event.target)) return;
      closeMenu();
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  if (header && hero) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > hero.offsetHeight) {
        header.classList.add("header-hidden");
      } else {
        header.classList.remove("header-hidden");
      }
    });
  }
});