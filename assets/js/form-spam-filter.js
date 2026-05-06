"use strict";

(function () {
    const blockedPhrases = [
        "I currently own several rental units across Arizona and am looking for a dependable property manager who can oversee these properties effectively. As I work toward expanding my real estate portfolio, managing everything on my own has become increasingly demanding, and I'm reaching the point where I need dedicated support to ensure everything continues to run smoothly."
    ];

    function normalizeText(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/[’]/g, "'")
            .replace(/\s+/g, " ")
            .trim();
    }

    const blockedNormalized = blockedPhrases.map(normalizeText);

    function showFormFeedback() {
        const url = new URL(window.location.href);
        const submitted = url.searchParams.get("submitted") === "1";
        if (!submitted) {
            return;
        }

        const targetForm = document.querySelector("form[name='Contact Form'], form[name='Rental Form']");
        if (!targetForm) {
            return;
        }

        const message = document.createElement("p");
        message.setAttribute("role", "status");
        message.textContent = "Thank you. Your form was submitted successfully.";
        message.style.backgroundColor = "#e9f8ef";
        message.style.color = "#14532d";
        message.style.border = "1px solid #86efac";
        message.style.padding = "0.75rem 1rem";
        message.style.borderRadius = "0.5rem";
        message.style.marginBottom = "1rem";

        targetForm.parentNode.insertBefore(message, targetForm);

        url.searchParams.delete("submitted");
        const cleanedQuery = url.searchParams.toString();
        const cleanedUrl = `${url.pathname}${cleanedQuery ? `?${cleanedQuery}` : ""}${url.hash}`;
        window.history.replaceState({}, "", cleanedUrl);
    }

    function shouldBlockSubmission(form) {
        const submittedText = normalizeText(
            Array.from(form.elements)
                .map((element) => element && "value" in element ? element.value : "")
                .join(" ")
        );

        return blockedNormalized.some((phrase) => submittedText.includes(phrase));
    }

    function attachSpamFilter(form) {
        form.addEventListener("submit", (event) => {
            if (!shouldBlockSubmission(form)) {
                return;
            }

            event.preventDefault();
            window.alert("Your message could not be submitted. Please rephrase and try again.");
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        showFormFeedback();
        const forms = document.querySelectorAll("form[name='Contact Form'], form[name='Rental Form']");
        forms.forEach(attachSpamFilter);
    });
})();
