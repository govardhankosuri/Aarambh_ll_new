const menu = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav-links");

if (menu && nav) {
  menu.addEventListener("click", () => {
    nav.classList.toggle("active");
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("active");
    });
  });
}
// Counter Animation

const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            const counter = entry.target;
            const target = +counter.dataset.target;

            let count = 0;
            const speed = target / 100;

            const updateCounter = ()=>{

                count += speed;

                if(count < target){

                    counter.innerText = Math.ceil(count);

                    requestAnimationFrame(updateCounter);

                }else{

                    counter.innerText = target;

                }

            }

            updateCounter();

            counterObserver.unobserve(counter);

        }

    });

},{
    threshold:0.5
});

counters.forEach(counter=>{
    counterObserver.observe(counter);
});

/* gallery */

    const galleryImages = document.querySelectorAll(".gallery-item img");

const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalClose = document.getElementById("modalClose");

/*
  Open the image in a larger preview
  when the user clicks a gallery image.
*/
galleryImages.forEach(function (image) {
  image.addEventListener("click", function () {
    modalImage.src = image.src;
    modalImage.alt = image.alt;

    imageModal.classList.add("show");

    document.body.style.overflow = "hidden";
  });
});

/*
  Close the image preview.
*/
function closeImageModal() {
  imageModal.classList.remove("show");

  modalImage.src = "";

  document.body.style.overflow = "auto";
}

modalClose.addEventListener("click", closeImageModal);

/*
  Close when clicking outside the image.
*/
imageModal.addEventListener("click", function (event) {
  if (event.target === imageModal) {
    closeImageModal();
  }
});

/*
  Close when pressing the Escape key.
*/
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeImageModal();
  }
});

/* publications */

const modal = document.querySelector(".publication-modal");

const publicationModalImage = modal.querySelector(".modal-image");

const close = document.querySelector(".close");

document.querySelectorAll(".view-btn").forEach((button)=>{

    button.addEventListener("click",()=>{

        const image =
        button.closest(".publication-card")
        .querySelector("img");

        modal.style.display="flex";

        publicationModalImage.src=image.src;

    });

});

close.onclick=()=>{

    modal.style.display="none";

}

modal.onclick=(e)=>{

    if(e.target===modal){

        modal.style.display="none";

    }

}

/* course */

const viewButtons = document.querySelectorAll(".view-button");
const buyButtons = document.querySelectorAll(".buy-button");

const courseModal = document.getElementById("courseModal");
const closeModalButton = document.getElementById("closeModal");

const modalCourseTitle = document.getElementById("modalCourseTitle");
const modalCoursePrice = document.getElementById("modalCoursePrice");
const modalCourseDescription = document.getElementById(
  "modalCourseDescription"
);

const modalBuyButton = document.getElementById("modalBuyButton");

let selectedCourse = "";
let selectedPrice = "";

/*
  Opens the course details popup when the
  user clicks the View Course button.
*/
viewButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    selectedCourse = button.dataset.title;
    selectedPrice = button.dataset.price;
    const description = button.dataset.description;

    modalCourseTitle.textContent = selectedCourse;
    modalCoursePrice.textContent = selectedPrice;
    modalCourseDescription.textContent = description;

    courseModal.classList.add("show");
    document.body.style.overflow = "hidden";
  });
});

/*
  Navigates directly to the payment details
  when the user clicks Buy Plan.
*/
buyButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const courseName = button.dataset.course;
    const coursePrice = button.dataset.price;

    navigateToPayment(courseName, coursePrice);
  });
});

/*
  Buy button displayed inside the
  View Course popup.
*/
modalBuyButton.addEventListener("click", function () {
  const numericPrice = selectedPrice.replace(/[₹,]/g, "");

  navigateToPayment(selectedCourse, numericPrice);
});

/*
  Navigates directly to the payment page
  when the user clicks Buy Plan.
*/
function navigateToPayment(courseName, coursePrice) {
  const paymentUrl =
    "payment.html?course=" +
    encodeURIComponent(courseName) +
    "&price=" +
    encodeURIComponent(coursePrice);

  window.location.href = paymentUrl;
}

function closeCourseModal() {
  courseModal.classList.remove("show");
  document.body.style.overflow = "auto";
}

closeModalButton.addEventListener("click", closeCourseModal);

courseModal.addEventListener("click", function (event) {
  if (event.target === courseModal) {
    closeCourseModal();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeCourseModal();
  }
});

/* payment */
  const urlParameters = new URLSearchParams(window.location.search);

    const courseName =
      urlParameters.get("course") || "Select a course-plan";

    const coursePrice =
      urlParameters.get("price") || "0";

    const selectedCourseName =
      document.getElementById("selectedCourseName");

    const selectedCoursePrice =
      document.getElementById("selectedCoursePrice");

    const payButton =
      document.getElementById("payButton");

    const paymentForm =
      document.getElementById("paymentForm");

    const paymentMessage =
      document.getElementById("paymentMessage");

    const cardNumber =
      document.getElementById("cardNumber");

    const expiryDate =
      document.getElementById("expiryDate");

    if (
      selectedCourseName &&
      selectedCoursePrice &&
      payButton &&
      paymentForm &&
      paymentMessage &&
      cardNumber &&
      expiryDate
    ) {
      function formatPrice(price) {
        return "₹" + Number(price).toLocaleString("en-IN");
      }

      function updatePaymentDetails(courseName, coursePrice) {
        selectedCourseName.textContent = courseName;

        selectedCoursePrice.textContent = formatPrice(coursePrice);

        payButton.textContent = "Pay " + formatPrice(coursePrice);

        paymentMessage.textContent = "";
      }

      updatePaymentDetails(courseName, coursePrice);

    /*
      Adds a space after every four card numbers.
      Example: 1234 5678 9012 3456
    */
    cardNumber.addEventListener("input", function () {
      let value = cardNumber.value.replace(/\D/g, "");

      value = value.substring(0, 16);

      cardNumber.value = value.replace(/(.{4})/g, "$1 ").trim();
    });

    /*
      Formats the expiry date as MM/YY.
    */
    expiryDate.addEventListener("input", function () {
      let value = expiryDate.value.replace(/\D/g, "");

      if (value.length >= 3) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4);
      }

      expiryDate.value = value;
    });

    /*
      Demonstration-only payment submission.
    */
    paymentForm.addEventListener("submit", function (event) {
      event.preventDefault();

      paymentMessage.textContent =
        "Payment request submitted successfully for " +
        courseName +
        ".";

      paymentForm.reset();
    });
    }

    /* testimonials*/
    const testimonials = [
  {
    name: "Vishal",
    role: "Research Scholar",
    avatar: "V",
    review:
      "The Paper Publication Course gave me a clear understanding of research writing. The guidance was practical, structured, and helped me confidently prepare my paper."
  },
  {
    name: "Varun",
    role: "Assistant Professor",
    avatar: "V",
    review:
      "The mentors explained every step in a simple and professional way. I especially liked the support provided for journal selection, formatting, and submission."
  },
  {
    name: "Anusha",
    role: "College Lecturer",
    avatar: "A",
    review:
      "The AI for Teachers course completely changed the way I prepare lessons and assignments. I now create classroom activities faster and with better ideas."
  },
  {
    name: "Shreya",
    role: "PhD Student",
    avatar: "S",
    review:
      "The sessions were interactive and easy to understand. The feedback on my research paper helped me improve the quality and clarity of my work."
  },
  {
    name: "Riya",
    role: "School Teacher",
    avatar: "R",
    review:
      "I was new to AI tools, but the course explained everything from the basics. I can now prepare quizzes, lesson plans, and student feedback more efficiently."
  }
];

const testimonialCard = document.getElementById("testimonialCard");
const reviewText = document.getElementById("reviewText");
const studentName = document.getElementById("studentName");
const studentRole = document.getElementById("studentRole");
const studentAvatar = document.getElementById("studentAvatar");

const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const sliderDots = document.getElementById("sliderDots");

let currentIndex = 0;
let automaticSlide;
let isAnimating = false;

/*
  Creates one navigation dot for every testimonial.
*/
function createDots() {
  testimonials.forEach(function (_, index) {
    const dot = document.createElement("button");

    dot.classList.add("slider-dot");
    dot.setAttribute(
      "aria-label",
      "View testimonial " + (index + 1)
    );

    dot.addEventListener("click", function () {
      if (index === currentIndex || isAnimating) {
        return;
      }

      const direction = index > currentIndex ? "next" : "previous";

      showTestimonial(index, direction);
      restartAutomaticSlide();
    });

    sliderDots.appendChild(dot);
  });
}

/*
  Updates the active navigation dot.
*/
function updateDots() {
  const dots = document.querySelectorAll(".slider-dot");

  dots.forEach(function (dot, index) {
    dot.classList.toggle("active", index === currentIndex);
  });
}

/*
  Updates the testimonial content.
*/
function updateTestimonialContent(index) {
  const testimonial = testimonials[index];

  reviewText.textContent = `"${testimonial.review}"`;
  studentName.textContent = testimonial.name;
  studentRole.textContent = testimonial.role;
  studentAvatar.textContent = testimonial.avatar;
}

/*
  Displays a testimonial using a sliding animation.
*/
function showTestimonial(newIndex, direction) {
  if (isAnimating) {
    return;
  }

  isAnimating = true;

  const slideOutClass =
    direction === "next"
      ? "slide-out-left"
      : "slide-out-right";

  const slideInClass =
    direction === "next"
      ? "slide-in-right"
      : "slide-in-left";

  testimonialCard.classList.add(slideOutClass);

  window.setTimeout(function () {
    testimonialCard.classList.remove(slideOutClass);

    currentIndex = newIndex;

    updateTestimonialContent(currentIndex);
    updateDots();

    testimonialCard.classList.add(slideInClass);

    window.setTimeout(function () {
      testimonialCard.classList.remove(slideInClass);
      isAnimating = false;
    }, 450);
  }, 350);
}

/*
  Displays the next testimonial.
*/
function showNextTestimonial() {
  const nextIndex =
    (currentIndex + 1) % testimonials.length;

  showTestimonial(nextIndex, "next");
}

/*
  Displays the previous testimonial.
*/
function showPreviousTestimonial() {
  const previousIndex =
    (currentIndex - 1 + testimonials.length) %
    testimonials.length;

  showTestimonial(previousIndex, "previous");
}

/*
  Starts automatic sliding.
*/
function startAutomaticSlide() {
  automaticSlide = window.setInterval(function () {
    showNextTestimonial();
  }, 5000);
}

/*
  Restarts automatic sliding after manual navigation.
*/
function restartAutomaticSlide() {
  window.clearInterval(automaticSlide);
  startAutomaticSlide();
}

nextButton.addEventListener("click", function () {
  showNextTestimonial();
  restartAutomaticSlide();
});

previousButton.addEventListener("click", function () {
  showPreviousTestimonial();
  restartAutomaticSlide();
});

/*
  Pause automatic sliding when the mouse
  is over the testimonial card.
*/
testimonialCard.addEventListener("mouseenter", function () {
  window.clearInterval(automaticSlide);
});

testimonialCard.addEventListener("mouseleave", function () {
  startAutomaticSlide();
});

/*
  Keyboard navigation.
*/
document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowRight") {
    showNextTestimonial();
    restartAutomaticSlide();
  }

  if (event.key === "ArrowLeft") {
    showPreviousTestimonial();
    restartAutomaticSlide();
  }
});

/*
  Touch swipe support for mobile devices.
*/
let touchStartX = 0;
let touchEndX = 0;

testimonialCard.addEventListener("touchstart", function (event) {
  touchStartX = event.changedTouches[0].screenX;
});

testimonialCard.addEventListener("touchend", function (event) {
  touchEndX = event.changedTouches[0].screenX;

  const swipeDistance = touchStartX - touchEndX;

  if (swipeDistance > 50) {
    showNextTestimonial();
    restartAutomaticSlide();
  }

  if (swipeDistance < -50) {
    showPreviousTestimonial();
    restartAutomaticSlide();
  }
});

/*
  Initial setup.
*/
createDots();
updateTestimonialContent(currentIndex);
updateDots();
startAutomaticSlide();

/* contact */

// =====================================
// CONTACT PAGE JAVASCRIPT
// =====================================

// Get Elements
const contactForm = document.getElementById("contactForm");
const whatsappBtn = document.getElementById("whatsappBtn");

// =====================================
// HAMBURGER BUTTON
// =====================================


// =====================================
// WHATSAPP FLOATING BUTTON
// =====================================

if (whatsappBtn) {
    whatsappBtn.addEventListener("click", function (e) {
        e.preventDefault();

        alert("WhatsApp support will be available soon.");
    });
}

// =====================================
// CONTACT FORM SUBMIT
// =====================================

if (contactForm) {

    contactForm.addEventListener("submit", function (e) {

        e.preventDefault();

        // Get Values
        const fullName = document.querySelector('input[placeholder="Your name"]').value.trim();
        const phone = document.querySelector('input[type="tel"]').value.trim();
        const email = document.querySelector('input[type="email"]').value.trim();

        // Name Validation
        if (fullName === "") {
            alert("Please enter your full name.");
            return;
        }

        // Phone Validation
        const phonePattern = /^[6-9]\d{9}$/;

        if (!phonePattern.test(phone)) {
            alert("Please enter a valid 10-digit mobile number.");
            return;
        }

        // Email Validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Success Popup
        alert(
`🎉 Thank You!

Your enquiry has been submitted successfully.

Our team will contact you soon.

Have a wonderful day! 😊`
        );

        // Reset Form
        contactForm.reset();

    });


/* footer */
const footerLinks = document.querySelectorAll(
  '.site-footer a[href^="#"]'
);

footerLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    const targetId = link.getAttribute("href");

    if (targetId === "#") {
      return;
    }

    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      event.preventDefault();

      targetSection.scrollIntoView({
        behavior: "smooth"
      });
    }
  });
});



}
