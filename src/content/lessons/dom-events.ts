import type { LessonInput } from "../schema";

type LessonFile = Omit<LessonInput, "alternatives">;

export const lesson: LessonFile = {
  id: "dom-events",
  title: "Responding to people: events and the DOM",
  skill: "dom-events",
  paths: ["web"],
  path: "web",
  minutes: 18,
  objective: "Find elements, listen for clicks, input and key presses, update the page from a single source of truth, and keep interactive controls usable by keyboard.",
  whyItMatters:
    "Your profile site becomes interactive in this milestone: a menu that opens, tabs, a form that responds. Every one of those is an event listener that changes the page.",
  prerequisites: ["html-structure", "functions"],
  sections: [
    {
      heading: "The DOM is the page as objects",
      body: [
        "The browser turns your HTML into a tree of objects (the DOM). JavaScript can find elements with document.querySelector, read them and change them: text, classes, attributes.",
        "Change textContent for text, classList for styling, and attributes like aria-expanded or hidden for state that assistive technology should know about.",
      ],
    },
    {
      heading: "Events: something happened",
      body: [
        "addEventListener(\"click\", handler) runs your function when the element is clicked. Other useful events: input (as someone types), submit (a form is sent), keydown (a key is pressed).",
        "The handler receives an event object: event.target is the element involved, event.key is the key pressed, and event.preventDefault() stops the browser's default action, like reloading the page on submit.",
      ],
      code: "const button = document.querySelector(\"#menu-button\");\nconst menu = document.querySelector(\"#menu\");\n\nbutton.addEventListener(\"click\", () => {\n  const open = button.getAttribute(\"aria-expanded\") === \"true\";\n  button.setAttribute(\"aria-expanded\", String(!open));\n  menu.hidden = open;\n});",
    },
    {
      heading: "Use real buttons",
      body: [
        "A <button> works with the keyboard (Tab, then Enter or Space) and is announced as a button by screen readers. A clickable <div> does neither unless you rebuild all of that yourself.",
        "So: buttons for actions, links for navigation, and attributes like aria-expanded or aria-selected to say what state a control is in.",
      ],
    },
  ],
  activities: [
    {
      kind: "choice",
      id: "predict-click",
      variant: "predict",
      prompt: "The button is clicked twice. What does the paragraph show?",
      code: "let count = 0;\nconst p = document.querySelector(\"p\");\ndocument.querySelector(\"button\").addEventListener(\"click\", () => {\n  count = count + 1;\n  p.textContent = \"Clicked \" + count + \" times\";\n});",
      options: [
        { id: "a", text: "Clicked 2 times", correct: true, why: "Right. The handler runs once per click, and count survives between clicks." },
        { id: "b", text: "Clicked 1 times", correct: false, why: "count is declared outside the handler, so it keeps its value between clicks.", misconception: "Thinks variables reset between event handler runs" },
        { id: "c", text: "Nothing changes until the page reloads", correct: false, why: "Changing textContent updates the page immediately." },
      ],
    },
    {
      kind: "choice",
      id: "div-button",
      variant: "bug",
      prompt: "Keyboard users can't open this menu. Why?",
      code: "<div class=\"menu-toggle\" onclick=\"toggleMenu()\">Menu</div>",
      options: [
        { id: "a", text: "A div can't receive keyboard focus or respond to Enter; it should be a <button>.", correct: true, why: "Right. A real button gives focus, keyboard activation and the right role for free." },
        { id: "b", text: "onclick only works on links.", correct: false, why: "onclick works on any element, but only for pointer clicks on a div." },
        { id: "c", text: "The class name is wrong.", correct: false, why: "Class names don't affect keyboard behavior." },
      ],
    },
    {
      kind: "fill",
      id: "fill-prevent",
      prompt: "Stop the form from reloading the page when it's submitted.",
      code: "form.addEventListener(\"submit\", (event) => {\n  event.___();\n  showThanks();\n});",
      accepted: ["preventDefault"],
      explanation: "preventDefault() cancels the browser's default action, here sending the form and reloading the page.",
      commonWrong: [{ answer: "stopPropagation", why: "stopPropagation stops the event reaching parent elements; the page would still reload." }],
    },
    {
      kind: "explain",
      id: "explain-state",
      prompt: "Your site will have tabs (About, Projects, Contact). Explain what should happen when someone clicks a tab, including what changes for screen reader users.",
      lookFor: ["The clicked tab becomes selected (aria-selected=\"true\"), others false", "Its panel is shown, others hidden", "Ideally arrow keys move between tabs", "One place in code decides which tab is active"],
    },
  ],
  review: [
    {
      kind: "choice",
      id: "review-target",
      variant: "concept",
      prompt: "One listener on a list handles clicks on any of its items. How does the handler know which item was clicked?",
      options: [
        { id: "a", text: "event.target (often with closest(\"li\")).", correct: true, why: "Right. One listener on the parent, then look at where the click came from: event delegation." },
        { id: "b", text: "this.index", correct: false, why: "There's no index property; the event object tells you." },
        { id: "c", text: "It can't: each item needs its own listener.", correct: false, why: "That works too, but delegation is simpler for long or changing lists." },
      ],
    },
    {
      kind: "choice",
      id: "review-expanded",
      variant: "concept",
      prompt: "A menu button opens a menu. Which attribute tells screen reader users whether it's open?",
      options: [
        { id: "a", text: "aria-expanded on the button", correct: true, why: "Right. It's announced as expanded or collapsed." },
        { id: "b", text: "A class named open", correct: false, why: "Classes are for styling; assistive technology ignores them." },
        { id: "c", text: "title=\"open\"", correct: false, why: "title isn't reliably announced and doesn't express state." },
      ],
    },
  ],
  misconceptions: [
    { myth: "Any element can be a button if it has a click handler.", reality: "Only real buttons work with the keyboard and screen readers without extra work." },
    { myth: "The handler runs once, when the page loads.", reality: "addEventListener registers it; it runs each time the event happens." },
  ],
  hints: ["Is count declared inside or outside the handler?", "Can you reach a div with the Tab key?", "Which method cancels the browser's default action?"],
  masteryRequirement: "Predict what a handler does, use real buttons with state attributes, and stop default actions, without hints.",
};
