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
        const forms = document.querySelectorAll("form[name='Contact Form'], form[name='Rental Form']");
        forms.forEach(attachSpamFilter);
    });
})();
