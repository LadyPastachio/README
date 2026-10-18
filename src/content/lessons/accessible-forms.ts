import type { LessonInput } from "../schema";

type LessonFile = Omit<LessonInput, "alternatives">;

export const lesson: LessonFile = {
  id: "accessible-forms",
  title: "Forms everyone can use",
  skill: "accessibility",
  paths: ["web"],
  path: "web",
  minutes: 18,
  objective: "Build a form with real labels, clear required fields, helpful error messages linked to their fields, and errors announced to screen readers.",
  whyItMatters:
    "A contact form is often the one thing a website must do. If someone using a keyboard or screen reader can't fill it in, or can't tell what went wrong, the site has failed them.",
  prerequisites: ["html-structure", "dom-events"],
  sections: [
    {
      heading: "Every field needs a label",
      body: [
        "<label for=\"email\"> linked to <input id=\"email\"> gives the field a name that's read aloud, and clicking the label focuses the field. Placeholder text is not a label: it disappears as you type and is often low contrast.",
        "Use the right input type (email, tel, number) so phones show the right keyboard, and autocomplete hints (autocomplete=\"email\") so browsers can fill it in.",
      ],
    },
    {
      heading: "Errors that help",
      body: [
        "Say what's wrong and how to fix it, next to the field: \"Enter an email address like name@example.com\", not \"Invalid input\". Don't rely on red color alone.",
        "Link the message to the field with aria-describedby and mark the field aria-invalid=\"true\", so a screen reader reads the problem when the field is focused.",
      ],
      code: "<label for=\"email\">Email</label>\n<input id=\"email\" type=\"email\" autocomplete=\"email\"\n       aria-describedby=\"email-error\" aria-invalid=\"true\">\n<p id=\"email-error\" class=\"error\">Enter an email address like name@example.com</p>",
    },
    {
      heading: "Announce what happened",
      body: [
        "After submitting, people need to know the result. A summary in a region with role=\"status\" or aria-live=\"polite\" is announced without moving focus. Moving focus to the first invalid field also helps.",
        "Validate in the browser for speed, and again on the server, because browser checks can be skipped.",
      ],
    },
  ],
  activities: [
    {
      kind: "choice",
      id: "placeholder-label",
      variant: "bug",
      prompt: "What is the accessibility problem here?",
      code: "<input type=\"text\" placeholder=\"Your name\">",
      options: [
        { id: "a", text: "There's no label: the placeholder disappears when typing and isn't a reliable accessible name.", correct: true, why: "Right. Add <label for> with a matching id." },
        { id: "b", text: "type should be name.", correct: false, why: "There's no input type called name; text is correct, maybe with autocomplete=\"name\"." },
        { id: "c", text: "Placeholders are not allowed in HTML.", correct: false, why: "They're allowed, just not as a replacement for labels." },
      ],
    },
    {
      kind: "choice",
      id: "best-error",
      variant: "concept",
      prompt: "Which error message is best?",
      options: [
        { id: "a", text: "Enter a phone number with 10 digits, like 555 010 2030", correct: true, why: "Right. It says what's wrong and shows how to fix it." },
        { id: "b", text: "Invalid input", correct: false, why: "It doesn't say which field or what's expected." },
        { id: "c", text: "The field turns red", correct: false, why: "Color alone is invisible to some people and to screen readers.", misconception: "Relies on color alone to communicate errors" },
      ],
    },
    {
      kind: "fill",
      id: "fill-describedby",
      prompt: "Link the error message to the field so it's read when the field is focused.",
      code: "<input id=\"email\" ___=\"email-error\">\n<p id=\"email-error\">Enter an email address</p>",
      accepted: ["aria-describedby"],
      explanation: "aria-describedby points to the id of the element that describes the field. Screen readers read it after the label.",
      commonWrong: [{ answer: "aria-label", why: "aria-label replaces the field's name; it doesn't link to the message element." }],
    },
    {
      kind: "order",
      id: "order-submit",
      prompt: "Order what should happen when someone submits a form with a mistake.",
      steps: ["Prevent the default submit", "Check each field", "Show a message next to each invalid field and set aria-invalid", "Announce a summary in a live region", "Move focus to the first invalid field"],
      feedback: { correct: "Yes. Stop, check, explain, announce, then help them get there.", incorrect: "You have to stop the submit and check the fields before you can show or announce anything." },
    },
    {
      kind: "explain",
      id: "explain-test-keyboard",
      prompt: "How would you test your contact form for accessibility without special tools?",
      lookFor: ["Use only the keyboard: Tab through every field and submit", "Click each label: does it focus its field?", "Submit with mistakes: are messages clear and next to fields?", "Zoom to 200% and use a narrow window"],
    },
  ],
  review: [
    {
      kind: "choice",
      id: "review-live",
      variant: "concept",
      prompt: "\"Thanks, your message was sent\" appears after submitting. How do screen reader users find out?",
      options: [
        { id: "a", text: "Put it in an element with role=\"status\" (or aria-live=\"polite\").", correct: true, why: "Right. Live regions are announced when their content changes." },
        { id: "b", text: "Make the text bold.", correct: false, why: "Visual styling isn't announced." },
        { id: "c", text: "Use alert() always.", correct: false, why: "It works but interrupts everyone; a live region is gentler." },
      ],
    },
    {
      kind: "choice",
      id: "review-server",
      variant: "concept",
      prompt: "The browser already checks the email format. Why check again on the server?",
      options: [
        { id: "a", text: "Browser checks can be skipped; the server must never trust incoming data.", correct: true, why: "Right. Browser validation is for convenience, server validation is for safety." },
        { id: "b", text: "Servers are better at regular expressions.", correct: false, why: "Same regex either side. The point is trust." },
        { id: "c", text: "You don't need to.", correct: false, why: "Anyone can send a request directly, without your form." },
      ],
    },
  ],
  misconceptions: [
    { myth: "Placeholder text is enough of a label.", reality: "It vanishes on typing and isn't a reliable name. Use a visible <label>." },
    { myth: "Red borders are enough to show errors.", reality: "Pair color with text, and link the text to the field." },
  ],
  hints: ["What does a screen reader announce for a field without a label?", "Does the message say how to fix it?", "Which attribute points to a describing element?"],
  masteryRequirement: "Label fields, write helpful errors linked to their fields and announce results, without hints.",
};
